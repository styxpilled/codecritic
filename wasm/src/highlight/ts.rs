//! TypeScript types. Names in a type are marked `type`. What does not parse
//! as a type is left to the code scanner.
use super::js::{Scope, comment, ident, is_id_start, is_keyword, js, number, params};
use super::util::*;

/// End of the spaces and comments from `i`.
pub fn gap_end(b: &[u8], mut i: usize) -> usize {
    loop {
        let j = spaces(b, i);
        i = match (at(b, j), at(b, j + 1)) {
            (b'/', b'/') => find(b, b"\n", j).unwrap_or(b.len()),
            (b'/', b'*') => find(b, b"*/", j + 2).map_or(b.len(), |e| e + 2),
            _ => return j,
        };
    }
}

/// Writes the spaces and comments in `b[i..j]`.
fn gap(out: &mut Out, b: &[u8], mut i: usize, j: usize) {
    while i < j {
        let s = spaces(b, i).min(j);
        out.extend_from_slice(&b[i..s]);
        if s == j {
            return;
        }
        if at(b, s) != b'/' {
            return esc(out, &b[s..j]);
        }
        let e = if at(b, s + 1) == b'/' {
            find(b, b"\n", s).unwrap_or(j)
        } else {
            find(b, b"*/", s + 2).map_or(j, |e| e + 2)
        }
        .min(j);
        comment(out, &b[s..e]);
        i = e;
    }
}

/// Writes the spaces and comments from `i` and returns their end.
pub fn skip(out: &mut Out, b: &[u8], i: usize) -> usize {
    let j = gap_end(b, i);
    gap(out, b, i, j);
    j
}

/// If the word `w` is at `i`.
fn kw(b: &[u8], i: usize, w: &[u8]) -> bool {
    b[i.min(b.len())..].starts_with(w) && ident(b, i) == Some(i + w.len())
}

/// Highlights `b[from..]` as code.
fn code(cx: &Ctx, out: &mut Out, b: &[u8], from: usize) {
    if from < b.len() {
        js(cx, out, &b[from..], true, 0, false, Scope::Code);
    }
}

/// Index of the `>` that closes the `<` at `i`.
pub fn angle_close(cx: &Ctx, b: &[u8], i: usize) -> Option<usize> {
    let mut depth = 0;
    let mut j = i;
    while j < b.len() {
        match b[j] {
            b'<' => depth += 1,
            b'>' if j > 0 && b[j - 1] == b'=' => {}
            b'>' => {
                depth -= 1;
                if depth == 0 {
                    return Some(j);
                }
            }
            b'(' | b'[' | b'{' => j = cx.close(b, j)?,
            b'"' | b'\'' => j = quoted(b, j) - 1,
            b';' | b')' | b']' | b'}' => return None,
            _ => {}
        }
        j += 1;
    }
    None
}

/// `: Type` at `i` (the colon). Returns the end.
pub fn annot(cx: &Ctx, out: &mut Out, b: &[u8], i: usize) -> usize {
    out.push(b':');
    let j = skip(out, b, i + 1);
    ty(cx, out, b, j).unwrap_or(j)
}

/// An optional `: Type` after `i`, as after a parameter list.
pub fn ret(cx: &Ctx, out: &mut Out, b: &[u8], i: usize) -> usize {
    let j = gap_end(b, i);
    if at(b, j) != b':' || at(b, j + 1) == b':' {
        return i;
    }
    gap(out, b, i, j);
    annot(cx, out, b, j)
}

/// A type at `i`, or None if none starts there.
pub fn ty(cx: &Ctx, out: &mut Out, b: &[u8], i: usize) -> Option<usize> {
    if !cx.enter() {
        return None;
    }
    let e = conditional(cx, out, b, i);
    cx.leave();
    e
}

/// `A extends B ? C : D`, or a union.
fn conditional(cx: &Ctx, out: &mut Out, b: &[u8], i: usize) -> Option<usize> {
    let mut e = union(cx, out, b, i)?;
    let j = gap_end(b, e);
    if !kw(b, j, b"extends") {
        return Some(e);
    }
    gap(out, b, e, j);
    span(out, "keyword", b"extends");
    let k = skip(out, b, j + 7);
    e = union(cx, out, b, k).unwrap_or(k);
    for sep in *b"?:" {
        let j = gap_end(b, e);
        if at(b, j) != sep {
            return Some(e);
        }
        gap(out, b, e, j);
        if sep == b'?' {
            span(out, "operator", b"?");
        } else {
            out.push(sep);
        }
        let k = skip(out, b, j + 1);
        e = ty(cx, out, b, k).unwrap_or(k);
    }
    Some(e)
}

/// `A | B & C`, with an optional leading `|` or `&`.
fn union(cx: &Ctx, out: &mut Out, b: &[u8], from: usize) -> Option<usize> {
    let mut i = from;
    if matches!(at(b, i), b'|' | b'&') {
        span(out, "operator", &b[i..i + 1]);
        i = skip(out, b, i + 1);
    }
    loop {
        let Some(e) = postfix(cx, out, b, i) else {
            return (i > from).then_some(i);
        };
        let j = gap_end(b, e);
        let c = at(b, j);
        if !matches!(c, b'|' | b'&') || at(b, j + 1) == c || at(b, j + 1) == b'=' {
            return Some(e);
        }
        gap(out, b, e, j);
        span(out, "operator", &[c]);
        i = skip(out, b, j + 1);
    }
}

/// A type with `[]` and `[K]` suffixes.
fn postfix(cx: &Ctx, out: &mut Out, b: &[u8], i: usize) -> Option<usize> {
    let mut e = atom(cx, out, b, i)?;
    while at(b, e) == b'[' {
        let Some(close) = cx.close(b, e) else { break };
        cx.bracket(out, b'[');
        list(cx, out, &b[e + 1..close]);
        cx.bracket(out, b']');
        e = close + 1;
    }
    Some(e)
}

fn atom(cx: &Ctx, out: &mut Out, b: &[u8], i: usize) -> Option<usize> {
    let c = at(b, i);
    match c {
        b'"' | b'\'' => {
            let e = quoted(b, i);
            span(out, "string", &b[i..e]);
            return Some(e);
        }
        b'0'..=b'9' => {
            let e = number(b, i);
            span(out, "number", &b[i..e]);
            return Some(e);
        }
        b'-' if at(b, i + 1).is_ascii_digit() => {
            let e = number(b, i + 1);
            span(out, "number", &b[i..e]);
            return Some(e);
        }
        b'(' => {
            let close = cx.close(b, i)?;
            if let Some(e) = fn_type(cx, out, b, i, close) {
                return Some(e);
            }
            cx.bracket(out, b'(');
            list(cx, out, &b[i + 1..close]);
            cx.bracket(out, b')');
            return Some(close + 1);
        }
        b'[' => {
            let close = cx.close(b, i)?;
            cx.bracket(out, b'[');
            list(cx, out, &b[i + 1..close]);
            cx.bracket(out, b']');
            return Some(close + 1);
        }
        b'{' => {
            let close = cx.close(b, i)?;
            cx.bracket(out, b'{');
            members(cx, out, &b[i + 1..close]);
            cx.bracket(out, b'}');
            return Some(close + 1);
        }
        b'<' => {
            let close = angle_close(cx, b, i)?;
            let open = gap_end(b, close + 1);
            let pclose = (at(b, open) == b'(').then(|| cx.close(b, open)).flatten()?;
            generics(cx, out, b, i, close);
            gap(out, b, close + 1, open);
            return fn_type(cx, out, b, open, pclose);
        }
        _ => {}
    }
    let e = ident(b, i)?;
    let id = &b[i..e];
    match id {
        b"keyof" | b"typeof" | b"readonly" | b"unique" | b"infer" | b"new" | b"abstract"
        | b"asserts" => {
            let j = gap_end(b, e);
            if !(is_id_start(at(b, j)) || matches!(at(b, j), b'(' | b'[' | b'{' | b'<')) {
                span(out, "type", id);
                return Some(e);
            }
            span(out, "keyword", id);
            gap(out, b, e, j);
            if id == b"typeof" {
                if kw(b, j, b"import") {
                    span(out, "keyword", b"import");
                    return Some(j + 6);
                }
                return Some(path(cx, out, b, j, "variable"));
            }
            Some(postfix(cx, out, b, j).unwrap_or(j))
        }
        b"true" | b"false" => {
            span(out, "literal", id);
            Some(e)
        }
        b"const" => {
            span(out, "keyword", id);
            Some(e)
        }
        _ if is_keyword(id) && !matches!(id, b"void" | b"this") => None,
        _ => {
            let j = gap_end(b, e);
            if kw(b, j, b"is") && at(b, j + 2) != b'.' {
                span(out, "variable", id);
                gap(out, b, e, j);
                span(out, "keyword", b"is");
                let k = skip(out, b, j + 2);
                return Some(ty(cx, out, b, k).unwrap_or(k));
            }
            Some(path(cx, out, b, i, "type"))
        }
    }
}

/// `A.B.C<T>`, with the names marked `cls`.
fn path(cx: &Ctx, out: &mut Out, b: &[u8], mut i: usize, cls: &str) -> usize {
    while let Some(e) = ident(b, i) {
        span(out, cls, &b[i..e]);
        i = e;
        if at(b, i) != b'.' || ident(b, i + 1).is_none() {
            break;
        }
        out.push(b'.');
        i += 1;
    }
    if at(b, i) == b'<'
        && let Some(close) = angle_close(cx, b, i)
    {
        push(out, "&lt;");
        list(cx, out, &b[i + 1..close]);
        push(out, "&gt;");
        i = close + 1;
    }
    i
}

/// `(params) => Type` with the parameters in `b[open..=close]`.
fn fn_type(cx: &Ctx, out: &mut Out, b: &[u8], open: usize, close: usize) -> Option<usize> {
    let a = gap_end(b, close + 1);
    if at(b, a) != b'=' || at(b, a + 1) != b'>' {
        return None;
    }
    params(cx, out, b, true, open, close);
    gap(out, b, close + 1, a);
    span(out, "operator", b"=>");
    let k = skip(out, b, a + 2);
    Some(ty(cx, out, b, k).unwrap_or(k))
}

/// Comma-separated types, as in type arguments and tuples. Tuple elements
/// can have `...` and a `name?:` label.
fn list(cx: &Ctx, out: &mut Out, b: &[u8]) {
    let mut i = skip(out, b, 0);
    loop {
        if b[i..].starts_with(b"...") {
            push(out, "...");
            i += 3;
        }
        if let Some(e) = ident(b, i) {
            let mut j = gap_end(b, e);
            if at(b, j) == b'?' {
                j += 1;
            }
            if at(b, j) == b':' {
                span(out, "attr", &b[i..e]);
                esc(out, &b[e..j]);
                i = annot(cx, out, b, j);
                if !next(out, b, &mut i) {
                    break;
                }
                continue;
            }
        }
        match ty(cx, out, b, i) {
            Some(e) if e > i => i = e,
            _ => break,
        }
        if !next(out, b, &mut i) {
            break;
        }
    }
    code(cx, out, b, i);
}

/// Moves past a `,` after `i`.
fn next(out: &mut Out, b: &[u8], i: &mut usize) -> bool {
    let j = gap_end(b, *i);
    if at(b, j) != b',' {
        return false;
    }
    gap(out, b, *i, j);
    out.push(b',');
    *i = skip(out, b, j + 1);
    true
}

/// Type parameters `<T extends A = B, …>` in `b[open..=close]`.
pub fn generics(cx: &Ctx, out: &mut Out, b: &[u8], open: usize, close: usize) {
    push(out, "&lt;");
    let s = &b[open + 1..close];
    let mut i = skip(out, s, 0);
    loop {
        while let Some(e) = ident(s, i)
            && matches!(&s[i..e], b"const" | b"in" | b"out")
            && ident(s, gap_end(s, e)).is_some()
        {
            span(out, "keyword", &s[i..e]);
            i = skip(out, s, e);
        }
        let Some(e) = ident(s, i) else { break };
        span(out, "type", &s[i..e]);
        i = e;
        for (sep, word) in [(b"extends".as_slice(), true), (b"=", false)] {
            let j = gap_end(s, i);
            if (word && kw(s, j, sep)) || (!word && at(s, j) == sep[0]) {
                gap(out, s, i, j);
                span(out, if word { "keyword" } else { "operator" }, sep);
                let k = skip(out, s, j + sep.len());
                i = ty(cx, out, s, k).unwrap_or(k);
            }
        }
        if !next(out, s, &mut i) {
            break;
        }
    }
    code(cx, out, s, i);
    push(out, "&gt;");
}

/// Generics at `i`, if a `<…>` there closes before `limit`. Returns the end.
pub fn generics_at(cx: &Ctx, out: &mut Out, b: &[u8], i: usize, limit: usize) -> Option<usize> {
    if at(b, i) != b'<' {
        return None;
    }
    let close = angle_close(cx, b, i).filter(|&c| c < limit)?;
    generics(cx, out, b, i, close);
    Some(close + 1)
}

/// Type arguments `<…>` at `i`. Returns the end.
pub fn args_at(cx: &Ctx, out: &mut Out, b: &[u8], i: usize) -> Option<usize> {
    let close = angle_close(cx, b, i)?;
    push(out, "&lt;");
    list(cx, out, &b[i + 1..close]);
    push(out, "&gt;");
    Some(close + 1)
}

/// The members of an object type or interface body.
fn members(cx: &Ctx, out: &mut Out, b: &[u8]) {
    let mut i = skip(out, b, 0);
    while i < b.len() {
        match member(cx, out, b, i) {
            Some(e) if e > i => i = e,
            _ => break,
        }
        let j = gap_end(b, i);
        if matches!(at(b, j), b';' | b',') {
            gap(out, b, i, j);
            out.push(b[j]);
            i = skip(out, b, j + 1);
        } else if j == b.len() || b[i..j].contains(&b'\n') {
            gap(out, b, i, j);
            i = j;
        } else {
            break;
        }
    }
    code(cx, out, b, i);
}

fn is_modifier(id: &[u8]) -> bool {
    matches!(
        id,
        b"readonly"
            | b"get"
            | b"set"
            | b"static"
            | b"public"
            | b"private"
            | b"protected"
            | b"abstract"
            | b"declare"
            | b"override"
            | b"async"
            | b"new"
    )
}

fn member(cx: &Ctx, out: &mut Out, b: &[u8], mut i: usize) -> Option<usize> {
    loop {
        let sign = matches!(at(b, i), b'+' | b'-') as usize;
        match ident(b, i + sign) {
            Some(e)
                if is_modifier(&b[i + sign..e])
                    && !matches!(at(b, gap_end(b, e)), b':' | b'?' | b';' | b',' | 0) =>
            {
                esc(out, &b[i..i + sign]);
                span(out, "keyword", &b[i + sign..e]);
                i = skip(out, b, e);
            }
            _ => break,
        }
    }
    // The key, written once its kind is known.
    let key_end = match at(b, i) {
        b'[' => cx.close(b, i)? + 1,
        b'(' | b'<' => i,
        b'"' | b'\'' => quoted(b, i),
        b'0'..=b'9' => number(b, i),
        _ => ident(b, i)?,
    };
    let q = gap_end(b, key_end);
    let mut j = q;
    if matches!(at(b, j), b'+' | b'-') && at(b, j + 1) == b'?' {
        j += 1;
    }
    let optional = at(b, j) == b'?';
    let after = if optional { gap_end(b, j + 1) } else { q };
    let method = matches!(at(b, after), b'(' | b'<');
    match at(b, i) {
        b'[' => {
            cx.bracket(out, b'[');
            index(cx, out, &b[i + 1..key_end - 1]);
            cx.bracket(out, b']');
        }
        b'"' | b'\'' => span(out, "string", &b[i..key_end]),
        b'0'..=b'9' => span(out, "number", &b[i..key_end]),
        b'(' | b'<' => {}
        _ => span(
            out,
            if method { "title function_" } else { "attr" },
            &b[i..key_end],
        ),
    }
    if optional {
        gap(out, b, key_end, q);
        out.extend_from_slice(&b[q..=j]);
        gap(out, b, j + 1, after);
    } else {
        gap(out, b, key_end, after);
    }
    let mut e = after;
    if method {
        let open = if at(b, e) == b'<' {
            let close = angle_close(cx, b, e)?;
            generics(cx, out, b, e, close);
            let o = gap_end(b, close + 1);
            gap(out, b, close + 1, o);
            o
        } else {
            e
        };
        if at(b, open) != b'(' {
            return Some(open);
        }
        let close = cx.close(b, open)?;
        params(cx, out, b, true, open, close);
        return Some(ret(cx, out, b, close + 1));
    }
    if at(b, e) == b':' {
        e = annot(cx, out, b, e);
    }
    Some(e)
}

/// Inside `[…]` of a member: `key: string`, `K in keyof T as U`, or code.
fn index(cx: &Ctx, out: &mut Out, b: &[u8]) {
    let mut i = skip(out, b, 0);
    if let Some(e) = ident(b, i) {
        let j = gap_end(b, e);
        if at(b, j) == b':' {
            span(out, "params", &b[i..e]);
            gap(out, b, e, j);
            i = annot(cx, out, b, j);
        } else if kw(b, j, b"in") {
            span(out, "type", &b[i..e]);
            i = e;
            for word in [b"in".as_slice(), b"as"] {
                let j = gap_end(b, i);
                if !kw(b, j, word) {
                    break;
                }
                gap(out, b, i, j);
                span(out, "keyword", word);
                let k = skip(out, b, j + word.len());
                i = ty(cx, out, b, k).unwrap_or(k);
            }
        }
    }
    code(cx, out, b, i);
}

/// `type Name<T> = Type` from `i` (the `type` keyword). Returns the end.
pub fn alias(cx: &Ctx, out: &mut Out, b: &[u8], i: usize) -> usize {
    span(out, "keyword", b"type");
    let n = skip(out, b, i + 4);
    let Some(mut e) = ident(b, n) else { return n };
    span(out, "title class_", &b[n..e]);
    if let Some(g) = generics_at(cx, out, b, e, b.len()) {
        e = g;
    }
    let j = gap_end(b, e);
    if at(b, j) != b'=' {
        return e;
    }
    gap(out, b, e, j);
    span(out, "operator", b"=");
    let k = skip(out, b, j + 1);
    ty(cx, out, b, k).unwrap_or(k)
}

/// `interface Name<T> extends A, B { … }` from `i` (the `interface` keyword).
pub fn interface(cx: &Ctx, out: &mut Out, b: &[u8], i: usize) -> usize {
    span(out, "keyword", b"interface");
    let n = skip(out, b, i + 9);
    let Some(mut e) = ident(b, n) else { return n };
    span(out, "title class_", &b[n..e]);
    if let Some(g) = generics_at(cx, out, b, e, b.len()) {
        e = g;
    }
    let mut j = gap_end(b, e);
    if kw(b, j, b"extends") {
        gap(out, b, e, j);
        span(out, "keyword", b"extends");
        e = skip(out, b, j + 7);
        loop {
            match ty(cx, out, b, e) {
                Some(t) if t > e => e = t,
                _ => break,
            }
            if !next(out, b, &mut e) {
                break;
            }
        }
        j = gap_end(b, e);
    }
    if at(b, j) != b'{' {
        return e;
    }
    let Some(close) = cx.close(b, j) else {
        return e;
    };
    gap(out, b, e, j);
    cx.bracket(out, b'{');
    members(cx, out, &b[j + 1..close]);
    cx.bracket(out, b'}');
    close + 1
}
