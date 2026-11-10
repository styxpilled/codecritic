use super::html::jsx;
use super::ts;
use super::util::*;

pub(super) fn is_keyword(id: &[u8]) -> bool {
    matches!(
        id,
        b"as"
            | b"in"
            | b"of"
            | b"if"
            | b"for"
            | b"while"
            | b"finally"
            | b"var"
            | b"new"
            | b"function"
            | b"do"
            | b"return"
            | b"void"
            | b"else"
            | b"break"
            | b"catch"
            | b"instanceof"
            | b"with"
            | b"throw"
            | b"case"
            | b"default"
            | b"try"
            | b"switch"
            | b"continue"
            | b"typeof"
            | b"delete"
            | b"let"
            | b"yield"
            | b"const"
            | b"class"
            | b"debugger"
            | b"async"
            | b"await"
            | b"static"
            | b"import"
            | b"from"
            | b"export"
            | b"extends"
            | b"get"
            | b"set"
    )
}

fn is_ts_keyword(id: &[u8]) -> bool {
    matches!(
        id,
        b"type"
            | b"interface"
            | b"enum"
            | b"implements"
            | b"declare"
            | b"namespace"
            | b"abstract"
            | b"readonly"
            | b"keyof"
            | b"infer"
            | b"is"
            | b"satisfies"
            | b"private"
            | b"protected"
            | b"public"
            | b"module"
            | b"asserts"
            | b"unique"
            | b"override"
            | b"accessor"
    )
}

/// Keywords that name a method when a call follows, e.g. `map.get(`.
fn is_contextual(id: &[u8]) -> bool {
    matches!(
        id,
        b"get"
            | b"set"
            | b"type"
            | b"from"
            | b"of"
            | b"as"
            | b"is"
            | b"module"
            | b"namespace"
            | b"declare"
            | b"readonly"
            | b"abstract"
            | b"asserts"
            | b"unique"
            | b"satisfies"
            | b"infer"
            | b"keyof"
            | b"async"
            | b"static"
    )
}

fn is_literal(id: &[u8]) -> bool {
    matches!(
        id,
        b"true" | b"false" | b"null" | b"undefined" | b"NaN" | b"Infinity"
    )
}

fn is_ts_type(id: &[u8]) -> bool {
    matches!(
        id,
        b"any"
            | b"void"
            | b"number"
            | b"boolean"
            | b"string"
            | b"object"
            | b"never"
            | b"symbol"
            | b"bigint"
            | b"unknown"
    )
}

fn is_language_var(id: &[u8]) -> bool {
    matches!(
        id,
        b"this"
            | b"super"
            | b"window"
            | b"document"
            | b"localStorage"
            | b"sessionStorage"
            | b"module"
            | b"global"
            | b"console"
            | b"arguments"
    )
}

/// Globals that keep `built_in` even when called.
fn is_built_in_global(id: &[u8]) -> bool {
    matches!(
        id,
        b"setInterval"
            | b"setTimeout"
            | b"clearInterval"
            | b"clearTimeout"
            | b"require"
            | b"exports"
            | b"eval"
            | b"isFinite"
            | b"isNaN"
            | b"parseFloat"
            | b"parseInt"
            | b"decodeURI"
            | b"decodeURIComponent"
            | b"encodeURI"
            | b"encodeURIComponent"
            | b"escape"
            | b"unescape"
    )
}

fn is_built_in(id: &[u8]) -> bool {
    is_built_in_global(id)
        || matches!(
            id,
            b"Object"
                | b"Function"
                | b"Boolean"
                | b"Symbol"
                | b"Math"
                | b"Date"
                | b"Number"
                | b"BigInt"
                | b"String"
                | b"RegExp"
                | b"Array"
                | b"Float32Array"
                | b"Float64Array"
                | b"Int8Array"
                | b"Uint8Array"
                | b"Uint8ClampedArray"
                | b"Int16Array"
                | b"Int32Array"
                | b"Uint16Array"
                | b"Uint32Array"
                | b"BigInt64Array"
                | b"BigUint64Array"
                | b"Set"
                | b"Map"
                | b"WeakSet"
                | b"WeakMap"
                | b"ArrayBuffer"
                | b"SharedArrayBuffer"
                | b"Atomics"
                | b"DataView"
                | b"JSON"
                | b"Promise"
                | b"Generator"
                | b"GeneratorFunction"
                | b"AsyncFunction"
                | b"Reflect"
                | b"Proxy"
                | b"Intl"
                | b"WebAssembly"
                | b"Error"
                | b"EvalError"
                | b"InternalError"
                | b"RangeError"
                | b"ReferenceError"
                | b"SyntaxError"
                | b"TypeError"
                | b"URIError"
        )
}

pub(super) fn is_id_start(c: u8) -> bool {
    c.is_ascii_alphabetic() || c == b'_' || c == b'$' || c >= 0x80
}

fn is_id(c: u8) -> bool {
    is_word(c) || c == b'$' || c >= 0x80
}

/// `[A-Za-z_$ -￿][\w$ -￿]*`
pub(super) fn ident(b: &[u8], i: usize) -> Option<usize> {
    is_id_start(at(b, i)).then(|| run(b, i + 1, is_id))
}

/// `(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?)n?`
pub(super) fn number(b: &[u8], i: usize) -> usize {
    let digits = |c: u8| c.is_ascii_digit() || c == b'_';
    let radix = |f: fn(u8) -> bool| {
        let j = run(b, i + 2, |c| f(c) || c == b'_');
        (j > i + 2).then_some(j)
    };
    let prefixed = match (at(b, i), at(b, i + 1)) {
        (b'0', b'x' | b'X') => radix(|c| c.is_ascii_hexdigit()),
        (b'0', b'b' | b'B') => radix(|c| matches!(c, b'0' | b'1')),
        (b'0', b'o' | b'O') => radix(|c| matches!(c, b'0'..=b'7')),
        _ => None,
    };
    let mut j = prefixed.unwrap_or_else(|| {
        let mut j = run(b, i + 1, digits);
        if at(b, i) != b'.' && at(b, j) == b'.' {
            j = run(b, j + 1, digits);
        }
        if matches!(at(b, j), b'e' | b'E') {
            let k = if matches!(at(b, j + 1), b'+' | b'-') {
                j + 2
            } else {
                j + 1
            };
            if at(b, k).is_ascii_digit() {
                j = run(b, k, |c| c.is_ascii_digit());
            }
        }
        j
    });
    if at(b, j) == b'n' {
        j += 1;
    }
    j
}

/// `\/(?![*/])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\/[dgimsuyv]*`
fn regex(b: &[u8], i: usize) -> Option<usize> {
    if matches!(at(b, i + 1), b'*' | b'/') {
        return None;
    }
    // `\\.`: `.` is any character but a line terminator.
    let escape = |j: usize| {
        (at(b, j) == b'\\' && j + 1 < b.len() && !is_line_end(b, j + 1))
            .then(|| j + 1 + char_len(b[j + 1]))
    };
    let mut j = i + 1;
    loop {
        if let Some(e) = escape(j) {
            j = e;
        } else if at(b, j) == b'[' {
            let mut k = j + 1;
            loop {
                if let Some(e) = escape(k) {
                    k = e;
                } else if k < b.len() && !matches!(b[k], b']' | b'\\' | b'\n') {
                    k += 1;
                } else {
                    break;
                }
            }
            if at(b, k) != b']' {
                break;
            }
            j = k + 1;
        } else if j < b.len() && !matches!(b[j], b'/' | b'\\' | b'\n' | b'[') {
            j += 1;
        } else {
            break;
        }
    }
    (j > i + 1 && at(b, j) == b'/').then(|| run(b, j + 1, |c| b"dgimsuyv".contains(&c)))
}

/// Length of the operator at `i`, or 0. `?` before `:` is a TS optional
/// marker, and `?.` before a digit is `?` and a number.
fn operator(b: &[u8], i: usize) -> usize {
    const OPS: [&[u8]; 46] = [
        b">>>=", b"===", b"!==", b"**=", b"<<=", b">>=", b">>>", b"&&=", b"||=", b"??=", b"=>",
        b"==", b"!=", b"<=", b">=", b"&&", b"||", b"??", b"?.", b"++", b"--", b"+=", b"-=", b"*=",
        b"/=", b"%=", b"&=", b"|=", b"^=", b"**", b"<<", b">>", b"=", b"<", b">", b"+", b"-", b"*",
        b"/", b"%", b"&", b"|", b"^", b"!", b"~", b"?",
    ];
    if !b"=!<>&|?+-*/%^~".contains(&at(b, i)) {
        return 0;
    }
    let s = &b[i..];
    match (at(b, i), at(b, i + 1), at(b, i + 2)) {
        (b'?', b':', _) => 0,
        (b'?', b'.', d) if d.is_ascii_digit() => 1,
        _ => OPS.iter().find(|o| s.starts_with(o)).map_or(0, |o| o.len()),
    }
}

/// `\s*=>`
fn arrow(b: &[u8], i: usize) -> Option<usize> {
    let j = spaces(b, i);
    (at(b, j) == b'=' && at(b, j + 1) == b'>').then_some(j + 2)
}

/// End of the type arguments `<…>` that start at `i`, if they look like
/// type arguments (no `&&`, `||`, calls or statements).
fn type_args(b: &[u8], i: usize) -> Option<usize> {
    let mut depth = 0;
    for j in i..b.len().min(i + 200) {
        match b[j] {
            b'<' => depth += 1,
            b'>' => {
                depth -= 1;
                if depth == 0 {
                    return Some(j + 1);
                }
            }
            c @ (b'&' | b'|') if at(b, j + 1) == c => return None,
            c if is_id(c) || b" \t,.[]|&?'\"".contains(&c) => {}
            _ => return None,
        }
    }
    None
}

/// `\s*=\s*(?:async\s*)?(?:\([^()]*\)|[\w$]+)\s*=>`
fn arrow_ahead(b: &[u8], i: usize) -> bool {
    let j = spaces(b, i);
    if at(b, j) != b'=' {
        return false;
    }
    let j = spaces(b, j + 1);
    let rest = |j: usize| {
        let e = if at(b, j) == b'(' {
            let close = (j + 1..b.len()).find(|&k| matches!(b[k], b'(' | b')'))?;
            (b[close] == b')').then_some(close + 1)?
        } else {
            let e = run(b, j, |c| is_word(c) || c == b'$');
            (e > j).then_some(e)?
        };
        arrow(b, e)
    };
    (b[j.min(b.len())..].starts_with(b"async") && rest(spaces(b, j + 5)).is_some())
        || rest(j).is_some()
}

/// `[ \t]*:(?!:)`, or `[ \t]*[?!]?:(?!:)` in TS.
fn key_ahead(b: &[u8], i: usize, ts: bool) -> bool {
    let mut j = blanks(b, i);
    if ts && matches!(at(b, j), b'?' | b'!') {
        j += 1;
    }
    at(b, j) == b':' && at(b, j + 1) != b':'
}

/// `\s*(?::[^;{}=()]*)?\{`
fn method_body(b: &[u8], i: usize) -> bool {
    let mut j = spaces(b, i);
    if at(b, j) == b':' {
        j = run(b, j + 1, |c| !b";{}=()".contains(&c));
    }
    at(b, j) == b'{'
}

/// hljs CLASS_REFERENCE. It can match only a prefix of the name:
/// `JSON|[A-Z][a-z]+(?:[A-Z][a-z]*|\d)*|[A-Z]{2,}(?:[A-Z][a-z]+|\d)+(?:[A-Z][a-z]*)*|[A-Z]{2,}[a-z]+(?:[A-Z][a-z]+|\d)*(?:[A-Z][a-z]*)*`
fn class_ref(b: &[u8], i: usize) -> Option<usize> {
    let up = |j: usize| at(b, j).is_ascii_uppercase();
    let low = |j: usize| at(b, j).is_ascii_lowercase();
    let lows = |j: usize| run(b, j, |c| c.is_ascii_lowercase());
    // `(?:[A-Z][a-z]+|\d)*(?:[A-Z][a-z]*)*`
    let words = |mut j: usize| {
        loop {
            if up(j) && low(j + 1) {
                j = lows(j + 1);
            } else if at(b, j).is_ascii_digit() {
                j += 1;
            } else {
                break;
            }
        }
        while up(j) {
            j = lows(j + 1);
        }
        j
    };
    if b[i..].starts_with(b"JSON") {
        return Some(i + 4);
    }
    if up(i) && low(i + 1) {
        let mut j = lows(i + 1);
        loop {
            if up(j) {
                j = lows(j + 1);
            } else if at(b, j).is_ascii_digit() {
                j += 1;
            } else {
                return Some(j);
            }
        }
    }
    let caps = run(b, i, |c| c.is_ascii_uppercase());
    match caps - i {
        // `[A-Z]{2,}` then a digit.
        2.. if at(b, caps).is_ascii_digit() => Some(words(caps)),
        // `[A-Z]{2,}` backs off by one so that `[A-Z][a-z]+` follows.
        3.. if low(caps) => Some(words(caps - 1)),
        // `[A-Z]{2,}[a-z]+`
        2 if low(caps) => Some(words(lows(caps))),
        _ => None,
    }
}

/// `@[A-Za-z_$][\w$]*`
fn decorator(b: &[u8], i: usize) -> Option<usize> {
    let c = at(b, i + 1);
    (c.is_ascii_alphabetic() || c == b'_' || c == b'$')
        .then(|| run(b, i + 2, |c| is_word(c) || c == b'$'))
}

fn is_constant(id: &[u8]) -> bool {
    id.len() >= 2
        && id[0].is_ascii_uppercase()
        && id[1..]
            .iter()
            .all(|&c| c.is_ascii_uppercase() || c.is_ascii_digit() || c == b'_')
}

fn is_use_strict(s: &[u8]) -> bool {
    s.len() == 12
        && matches!(s[0], b'"' | b'\'')
        && matches!(s[11], b'"' | b'\'')
        && &s[1..11] == b"use strict"
}

/// Marks JSDoc tags, types and names in an escaped comment:
/// `(@[A-Za-z]+)(?:([ \t]*)\{((?:[^{}\n]|\{[^{}\n]*\})*)\}(?:([ \t]+)([\w$.]+)(?=[ \t]*-|[ \t]*$))?)?`
fn doc(out: &mut Out, e: &[u8]) {
    let mut i = 0;
    while i < e.len() {
        let tag_end = run(e, i + 1, |c| c.is_ascii_alphabetic());
        if e[i] != b'@' || tag_end == i + 1 {
            out.push(e[i]);
            i += 1;
            continue;
        }
        push(out, "<span class=\"hljs-doctag\">");
        out.extend_from_slice(&e[i..tag_end]);
        push(out, "</span>");
        i = tag_end;
        let open = blanks(e, i);
        if at(e, open) != b'{' {
            continue;
        }
        let mut k = open + 1;
        loop {
            match at(e, k) {
                b'{' => match (k + 1..e.len()).find(|&m| matches!(e[m], b'{' | b'}' | b'\n')) {
                    Some(m) if e[m] == b'}' => k = m + 1,
                    _ => break,
                },
                b'}' | b'\n' => break,
                _ if k < e.len() => k += 1,
                _ => break,
            }
        }
        if at(e, k) != b'}' {
            continue;
        }
        out.extend_from_slice(&e[i..open]);
        push(out, "{<span class=\"hljs-type\">");
        out.extend_from_slice(&e[open + 1..k]);
        push(out, "</span>}");
        i = k + 1;
        let name = blanks(e, i);
        let name_end = run(e, name, |c| is_word(c) || c == b'$' || c == b'.');
        let after = blanks(e, name_end);
        if name > i
            && name_end > name
            && (at(e, after) == b'-' || after == e.len() || is_line_end(e, after))
        {
            out.extend_from_slice(&e[i..name]);
            span(out, "variable", &e[name..name_end]);
            i = name_end;
        }
    }
}

pub(super) fn comment(out: &mut Out, body: &[u8]) {
    if !body.starts_with(b"/**") {
        return span(out, "comment", body);
    }
    let mut e = Out::new();
    esc(&mut e, body);
    push(out, "<span class=\"hljs-comment\">");
    doc(out, &e);
    push(out, "</span>");
}

/// Writes a `#!` line at the start as a comment. Returns its end.
pub fn shebang(out: &mut Out, b: &[u8]) -> usize {
    if !b.starts_with(b"#!") {
        return 0;
    }
    let e = find(b, b"\n", 0).unwrap_or(b.len());
    span(out, "comment", &b[..e]);
    e
}

/// A parameter list.
pub(super) fn params(cx: &Ctx, out: &mut Out, b: &[u8], ts: bool, open: usize, close: usize) {
    cx.bracket(out, b'(');
    let scope = if ts {
        Scope::TypedParams
    } else {
        Scope::Params
    };
    js(cx, out, &b[open + 1..close], ts, 0, false, scope);
    cx.bracket(out, b')');
}

/// The spaces and `=>` of an arrow function.
fn arrow_op(out: &mut Out, s: &[u8]) {
    esc(out, &s[..s.len() - 2]);
    span(out, "operator", b"=>");
}

#[derive(Clone, Copy, PartialEq)]
pub enum Scope {
    Code,
    /// Parameters: only keywords, literals, built-ins and names are marked.
    Params,
    /// TS parameters: marked as code, but keys are parameter names.
    TypedParams,
    /// A template substitution: only keywords, literals and built-ins.
    Subst,
}

/// Type parameters after a class name at `i`, or type arguments after a
/// class reference. Returns the end.
fn type_params(cx: &Ctx, out: &mut Out, b: &[u8], i: usize, before: &[u8]) -> usize {
    if at(b, i) != b'<' {
        return i;
    }
    if before == b"class" {
        let limit = b.len();
        return ts::generics_at(cx, out, b, i, limit).unwrap_or(i);
    }
    match type_args(b, i) {
        Some(_) => ts::args_at(cx, out, b, i).unwrap_or(i),
        None => i,
    }
}

/// Highlights JavaScript or TypeScript from `from` and returns the end. With
/// `in_braces`, stops at the `}` that closes an enclosing `{` (a template or
/// markup expression).
pub fn js(
    cx: &Ctx,
    out: &mut Out,
    b: &[u8],
    ts: bool,
    from: usize,
    in_braces: bool,
    scope: Scope,
) -> usize {
    if !cx.enter() {
        return b.len();
    }
    let end = scan(cx, out, b, ts, from, in_braces, scope);
    cx.leave();
    end
}

fn scan(
    cx: &Ctx,
    out: &mut Out,
    b: &[u8],
    ts: bool,
    from: usize,
    in_braces: bool,
    scope: Scope,
) -> usize {
    let full = matches!(scope, Scope::Code | Scope::TypedParams);
    let in_params = matches!(scope, Scope::Params | Scope::TypedParams);
    // A parameter name, unless it is a default value or a renamed key.
    let param = |before: &[u8]| in_params && !matches!(before, b"=" | b":" | b".");
    let n = b.len();
    let mut i = from;
    let mut regex_ok = true;
    let mut prev: &[u8] = b"";
    let mut line_start = true;
    let mut depth = 0i32;
    let mut decl_arrow = false;
    // In the bindings of an `import` or `export` clause.
    let mut in_import = false;
    // Bracket depth in the destructuring pattern of a declaration.
    let mut pattern = 0u32;
    // Bracket depth, and if a `=` default came after the last `,`, for
    // annotations in parameters.
    let mut nest = 0i32;
    let mut after_eq = false;
    // Brace depths (bits) that hold a class body.
    let mut class_body = 0u64;
    let mut class_head = false;

    while i < n {
        let c = b[i];

        if is_space(c) {
            let e = spaces(b, i);
            out.extend_from_slice(&b[i..e]);
            if b[i..e].contains(&b'\n') {
                line_start = true;
            }
            i = e;
            continue;
        }
        let at_line_start = line_start;
        line_start = false;

        if c == b'/' && matches!(at(b, i + 1), b'/' | b'*') {
            let e = if at(b, i + 1) == b'/' {
                find(b, b"\n", i).unwrap_or(n)
            } else {
                find(b, b"*/", i + 2).map_or(n, |e| e + 2)
            };
            comment(out, &b[i..e]);
            i = e;
            line_start = at_line_start;
            continue;
        }
        if c == b'"' || c == b'\'' {
            let e = quoted(b, i);
            let s = &b[i..e];
            span(
                out,
                if at_line_start && is_use_strict(s) {
                    "meta"
                } else {
                    "string"
                },
                s,
            );
            i = e;
            regex_ok = false;
            prev = b"\"";
            in_import = false;
            continue;
        }
        if c == b'`' {
            push(out, "<span class=\"hljs-string\">`");
            let mut j = i + 1;
            let mut start = j;
            while j < n && b[j] != b'`' {
                if b[j] == b'\\' {
                    j += 2;
                } else if b[j] == b'$' && at(b, j + 1) == b'{' {
                    esc(out, &b[start..j]);
                    push(out, "<span class=\"hljs-subst\">${");
                    let e = js(cx, out, b, ts, j + 2, true, Scope::Subst);
                    if at(b, e) == b'}' {
                        out.push(b'}');
                    }
                    push(out, "</span>");
                    j = e + 1;
                    start = j;
                } else {
                    j += 1;
                }
            }
            j = (j + 1).min(n);
            esc(out, slice(b, start, j));
            push(out, "</span>");
            i = j;
            regex_ok = false;
            prev = b"`";
            continue;
        }
        if c.is_ascii_digit() || (c == b'.' && at(b, i + 1).is_ascii_digit()) {
            let e = number(b, i);
            span(out, "number", &b[i..e]);
            i = e;
            regex_ok = false;
            prev = b"0";
            continue;
        }
        if c == b'/'
            && regex_ok
            && let Some(e) = regex(b, i)
        {
            span(out, "regexp", &b[i..e]);
            i = e;
            regex_ok = false;
            continue;
        }
        if b[i..].starts_with(b"...") {
            push(out, "...");
            i += 3;
            regex_ok = true;
            prev = b"...";
            continue;
        }
        if full
            && c == b'<'
            && regex_ok
            && let Some(e) = jsx(cx, out, b, i, ts)
        {
            i = e;
            regex_ok = false;
            prev = b">";
            continue;
        }
        if full
            && c == b'@'
            && let Some(e) = decorator(b, i)
        {
            span(out, "meta", &b[i..e]);
            i = e;
            continue;
        }
        if full && c == b'(' {
            let close = cx.close(b, i);
            // `(…): Type =>` in TS, with the type written to `typed`.
            let mut typed = Out::new();
            let mut ret_end = 0;
            let arrow_end = close.filter(|_| regex_ok).and_then(|close| {
                arrow(b, close + 1).or_else(|| {
                    if !ts {
                        return None;
                    }
                    ret_end = ts::ret(cx, &mut typed, b, close + 1);
                    (ret_end > close + 1).then(|| arrow(b, ret_end)).flatten()
                })
            });
            if let (Some(close), Some(e)) = (close, arrow_end) {
                params(cx, out, b, ts, i, close);
                let from = if ret_end > 0 {
                    out.extend_from_slice(&typed);
                    ret_end
                } else {
                    close + 1
                };
                arrow_op(out, &b[from..e]);
                decl_arrow = false;
                i = e;
                regex_ok = true;
                prev = b">";
                continue;
            }
            if let Some(close) = close.filter(|_| prev == b"function") {
                params(cx, out, b, ts, i, close);
                i = if ts {
                    ts::ret(cx, out, b, close + 1)
                } else {
                    close + 1
                };
                regex_ok = false;
                prev = b")";
                continue;
            }
        }
        if c == b':' && scope == Scope::TypedParams && nest == 0 && !after_eq {
            i = ts::annot(cx, out, b, i);
            regex_ok = false;
            prev = b"T";
            continue;
        }

        if let Some(e) = ident(b, i) {
            let id = &b[i..e];
            let before = prev;
            let start = i;
            i = e;
            prev = id;
            let decl = matches!(before, b"const" | b"let" | b"var");
            let keyword = (is_keyword(id) || (ts && is_ts_keyword(id)))
                && !(ts && is_ts_type(id))
                && !(is_contextual(id) && decl);
            if !full {
                if keyword {
                    span(out, "keyword", id);
                } else if is_literal(id) {
                    span(out, "literal", id);
                } else if is_language_var(id) {
                    span(out, "variable language_", id);
                } else if ts && is_ts_type(id) {
                    span(out, "type", id);
                } else if is_built_in(id) {
                    span(out, "built_in", id);
                } else if param(before) {
                    span(out, "params", id);
                } else {
                    esc(out, id);
                }
                regex_ok = keyword;
                continue;
            }
            let next = spaces(b, i);
            let generic = at(b, next) == b'<'
                && if ts && before == b"function" {
                    ts::angle_close(cx, b, next).map(|e| e + 1)
                } else {
                    type_args(b, next)
                }
                .is_some_and(|e| at(b, spaces(b, e)) == b'(');
            let call = at(b, next) == b'(' || generic;
            let open = if call { find(b, b"(", i) } else { None };
            let close = open.and_then(|o| cx.close(b, o));
            let class_member = ts
                && class_body >> (depth & 63) & 1 == 1
                && (at_line_start
                    || is_ts_keyword(before)
                    || matches!(
                        before,
                        b";" | b"{" | b"}" | b"static" | b"async" | b"get" | b"set"
                    ));
            let method =
                close.is_some_and(|c| method_body(b, c + 1)) || (class_member && close.is_some());
            let arrow_call = close.is_some_and(|c| arrow(b, c + 1).is_some());
            let mut fn_params = None;
            let arrow_end = if regex_ok { arrow(b, i) } else { None };
            if keyword && !in_import && matches!(id, b"import" | b"export") {
                let next = at(b, spaces(b, i));
                in_import = if id == b"import" {
                    !matches!(next, b'(' | b'.')
                } else {
                    matches!(next, b'{' | b'*')
                };
            } else if id == b"from" {
                in_import = false;
            }
            if ts
                && keyword
                && !in_import
                && matches!(id, b"type" | b"interface")
                && !matches!(before, b"." | b"import")
                && ident(b, blanks(b, i)).is_some()
            {
                i = if id == b"type" {
                    ts::alias(cx, out, b, start)
                } else {
                    ts::interface(cx, out, b, start)
                };
                regex_ok = false;
                prev = b"T";
                continue;
            }
            let class =
                if keyword || in_import || before == b"function" || (before == b"." && !call) {
                    None
                } else {
                    class_ref(b, start)
                };
            if let Some(ce) = class {
                span(out, "title class_", &b[start..ce]);
                esc(out, &b[ce..i]);
                if ts {
                    i = type_params(cx, out, b, i, before);
                }
                regex_ok = false;
                continue;
            }
            let cls = if before == b"." {
                if call { "title function_" } else { "property" }
            } else if in_import && !keyword {
                "variable"
            } else if decl && !keyword && !arrow_ahead(b, i) {
                "variable def_"
            } else if !in_params
                && operator(before, 0) == 0
                && before != b"case"
                && (ts || before == b"{" || before == b"," || at_line_start)
                && key_ahead(b, i, ts)
            {
                "attr"
            } else if pattern > 0 && !keyword && before != b"=" {
                "variable def_"
            } else if keyword
                && !(is_contextual(id) && (method || (call && !decl_arrow && !arrow_call)))
            {
                "keyword"
            } else if is_literal(id) {
                "literal"
            } else if is_language_var(id) {
                "variable language_"
            } else if before == b"class" || before == b"interface" {
                "title class_"
            } else if before == b"extends" || before == b"implements" {
                "title class_ inherited__"
            } else if before == b"function" {
                fn_params = close;
                "title function_"
            } else if let Some(ae) = arrow_end {
                span(out, "params", id);
                arrow_op(out, &b[i..ae]);
                i = ae;
                prev = b">";
                decl_arrow = false;
                regex_ok = true;
                continue;
            } else if decl && arrow_ahead(b, i) {
                decl_arrow = true;
                "title function_"
            } else if call && !is_built_in_global(id) {
                if method {
                    fn_params = close;
                }
                "title function_"
            } else if is_constant(id) {
                "variable constant_"
            } else if ts && is_ts_type(id) {
                "type"
            } else if is_built_in(id) {
                "built_in"
            } else if in_params {
                if param(before) { "params" } else { "" }
            } else {
                "variable"
            };
            if let (Some(close), Some(open)) = (fn_params, open) {
                span(out, cls, id);
                let g = spaces(b, i);
                let mut generics = Out::new();
                let from = match ts.then(|| ts::generics_at(cx, &mut generics, b, g, open)) {
                    Some(Some(e)) => {
                        esc(out, &b[i..g]);
                        out.extend_from_slice(&generics);
                        e
                    }
                    _ => i,
                };
                esc(out, &b[from..open]);
                params(cx, out, b, ts, open, close);
                i = if ts {
                    ts::ret(cx, out, b, close + 1)
                } else {
                    close + 1
                };
                regex_ok = false;
                prev = b")";
                continue;
            }
            if cls.is_empty() {
                esc(out, id);
            } else {
                span(out, cls, id);
            }
            regex_ok = cls == "keyword";
            if ts && cls.starts_with("title class_") {
                i = type_params(cx, out, b, i, before);
            } else if ts
                && generic
                && next == i
                && let Some(e) = ts::args_at(cx, out, b, i)
            {
                i = e;
            }
            if cls == "keyword" && id == b"class" {
                class_head = true;
            }
            if !ts {
                continue;
            }
            if cls == "keyword" && !in_import && matches!(id, b"as" | b"satisfies") {
                let k = ts::skip(out, b, i);
                i = ts::ty(cx, out, b, k).unwrap_or(k);
                regex_ok = false;
                prev = b"T";
                continue;
            }
            // `name: Type` of a declaration or class field.
            if (decl && cls == "variable def_") || (cls == "attr" && class_member) {
                let mut j = blanks(b, i);
                if matches!(at(b, j), b'?' | b'!') {
                    j += 1;
                }
                if at(b, j) == b':' && at(b, j + 1) != b':' {
                    esc(out, &b[i..j]);
                    i = ts::annot(cx, out, b, j);
                    regex_ok = false;
                    prev = b"T";
                }
            }
            continue;
        }

        // Generics of an arrow or anonymous function: `<T,>(…)`.
        if ts
            && c == b'<'
            && (regex_ok || matches!(prev, b"async" | b"function"))
            && let Some(close) = ts::angle_close(cx, b, i)
            && at(b, ts::gap_end(b, close + 1)) == b'('
        {
            ts::generics(cx, out, b, i, close);
            i = close + 1;
            regex_ok = true;
            continue;
        }
        let op = operator(b, i);
        if op > 0 {
            let tok = &b[i..i + op];
            span(out, "operator", tok);
            if tok == b"=" && nest == 0 {
                after_eq = true;
            }
            regex_ok = !matches!(tok, b"++" | b"--");
            prev = if tok == b"?." { b"." } else { tok };
            i += op;
            continue;
        }
        if c == b'{' {
            depth += 1;
            if class_head {
                class_body |= 1 << (depth & 63);
                class_head = false;
            }
        } else if c == b'}' {
            if depth == 0 && in_braces {
                return i;
            }
            class_body &= !(1 << (depth & 63));
            depth -= 1;
        }
        match c {
            b'(' | b'[' | b'{' => nest += 1,
            b')' | b']' | b'}' => nest -= 1,
            b'=' if nest == 0 => after_eq = true,
            b',' if nest == 0 => after_eq = false,
            _ => {}
        }
        match c {
            b'{' | b'[' if pattern > 0 || matches!(prev, b"const" | b"let" | b"var") => {
                pattern += 1;
            }
            b'}' | b']' if pattern > 0 => pattern -= 1,
            _ => {}
        }
        match c {
            b'(' | b')' | b'[' | b']' | b'{' | b'}' => cx.bracket(out, c),
            _ => esc(out, &b[i..i + 1]),
        }
        if matches!(c, b'}' | b';') {
            in_import = false;
        }
        regex_ok = !matches!(c, b')' | b']' | b'}');
        prev = &b[i..i + 1];
        i += 1;
    }
    i
}
