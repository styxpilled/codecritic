use super::util::*;

fn is_ident(c: u8) -> bool {
    is_word(c) || c == b'-'
}

/// `-?[A-Za-z_][\w-]*|--[\w-]+`
fn ident(b: &[u8], i: usize) -> Option<usize> {
    let s = if at(b, i) == b'-' { i + 1 } else { i };
    let c = at(b, s);
    if c.is_ascii_alphabetic() || c == b'_' {
        return Some(run(b, s + 1, is_ident));
    }
    (at(b, i) == b'-' && at(b, i + 1) == b'-' && is_ident(at(b, i + 2)))
        .then(|| run(b, i + 2, is_ident))
}

/// `\d+(?:\.\d+)?(?:%|[A-Za-z]+)?`
fn number(b: &[u8], i: usize) -> Option<usize> {
    let d = |c: u8| c.is_ascii_digit();
    let mut j = run(b, i, d);
    if j == i {
        return None;
    }
    if at(b, j) == b'.' && d(at(b, j + 1)) {
        j = run(b, j + 1, d);
    }
    Some(if at(b, j) == b'%' {
        j + 1
    } else {
        run(b, j, |c| c.is_ascii_alphabetic())
    })
}

/// `#[\da-fA-F]{3,8}\b`
fn hex(b: &[u8], i: usize) -> Option<usize> {
    let j = run(b, i + 1, |c| c.is_ascii_hexdigit());
    ((4..=9).contains(&(j - i)) && !is_word(at(b, j))).then_some(j)
}

/// `@[\w-]+`
fn at_rule(b: &[u8], i: usize) -> Option<usize> {
    let j = run(b, i + 1, is_ident);
    (at(b, i) == b'@' && j > i + 1).then_some(j)
}

/// `![ \t]*important\b`, case-insensitive.
fn important(b: &[u8], i: usize) -> Option<usize> {
    let j = blanks(b, i + 1);
    let end = j + 9;
    (end <= b.len() && b[j..end].eq_ignore_ascii_case(b"important") && !is_word(at(b, end)))
        .then_some(end)
}

fn comment(b: &[u8], i: usize) -> usize {
    find(b, b"*/", i + 2).map_or(b.len(), |e| e + 2)
}

/// Index of the first `{`, `;` or `}` at nesting level 0 from `i`.
fn statement_end(b: &[u8], i: usize) -> usize {
    let mut depth = 0i32;
    let mut j = i;
    while j < b.len() {
        match b[j] {
            b'"' | b'\'' => j = quoted(b, j) - 1,
            b'/' if at(b, j + 1) == b'*' => j = comment(b, j) - 1,
            b'(' | b'[' => depth += 1,
            b')' | b']' => depth -= 1,
            b'{' | b';' | b'}' if depth <= 0 => return j,
            _ => {}
        }
        j += 1;
    }
    b.len()
}

/// Shared tokens: whitespace, comments, strings. Returns the end.
fn common(out: &mut Out, b: &[u8], i: usize, to: usize) -> Option<usize> {
    let c = b[i];
    if is_space(c) {
        let e = spaces(b, i);
        out.extend_from_slice(&b[i..e]);
        Some(e)
    } else if c == b'/' && at(b, i + 1) == b'*' {
        let e = comment(b, i).min(to);
        span(out, "comment", &b[i..e]);
        Some(e)
    } else if c == b'"' || c == b'\'' {
        let e = quoted(b, i).min(to);
        span(out, "string", &b[i..e]);
        Some(e)
    } else {
        None
    }
}

/// Escapes `s` and marks `&quot;…&quot;` and `&#x27;…&#x27;` on one line.
fn attr_selector(out: &mut Out, s: &[u8]) {
    let mut e = Out::new();
    esc(&mut e, s);
    let mut i = 0;
    while i < e.len() {
        let q: &[u8] = if e[i..].starts_with(b"&quot;") {
            b"&quot;"
        } else if e[i..].starts_with(b"&#x27;") {
            b"&#x27;"
        } else {
            out.push(e[i]);
            i += 1;
            continue;
        };
        let mut j = i + q.len();
        let close = loop {
            if j >= e.len() || is_line_end(&e, j) {
                break None;
            }
            if e[j..].starts_with(q) {
                break Some(j + q.len());
            }
            j += 1;
        };
        match close {
            Some(end) => {
                push(out, "<span class=\"hljs-string\">");
                out.extend_from_slice(&e[i..end]);
                push(out, "</span>");
                i = end;
            }
            None => {
                out.push(e[i]);
                i += 1;
            }
        }
    }
}

fn selector(out: &mut Out, b: &[u8], from: usize, to: usize) {
    let mut i = from;
    while i < to {
        if let Some(e) = common(out, b, i, to) {
            i = e;
            continue;
        }
        let c = b[i];
        let id = if c == b'.' || c == b'#' {
            ident(b, i + 1)
        } else {
            None
        };
        if let Some(e) = id {
            span(
                out,
                if c == b'.' {
                    "selector-class"
                } else {
                    "selector-id"
                },
                &b[i..e],
            );
            i = e;
        } else if c == b':' {
            let colons = if at(b, i + 1) == b':' { 2 } else { 1 };
            let e = ident(b, i + colons).unwrap_or(i + colons);
            span(out, "selector-pseudo", &b[i..e]);
            i = e;
        } else if c == b'[' {
            let e = match find(b, b"]", i) {
                Some(e) if e <= to => e + 1,
                _ => to,
            };
            push(out, "<span class=\"hljs-selector-attr\">");
            attr_selector(out, &b[i..e]);
            push(out, "</span>");
            i = e;
        } else if let Some(e) = ident(b, i) {
            span(out, "selector-tag", &b[i..e]);
            i = e;
        } else if let Some(e) = number(b, i) {
            span(out, "number", &b[i..e]);
            i = e;
        } else {
            esc(out, &b[i..i + 1]);
            i += 1;
        }
    }
}

/// Values in declarations and at-rule preludes.
fn value(out: &mut Out, b: &[u8], from: usize, to: usize, prelude: bool) {
    let mut i = from;
    let mut parens = 0i32;
    while i < to {
        if let Some(e) = common(out, b, i, to) {
            i = e;
            continue;
        }
        let c = b[i];
        if let Some(e) = (c == b'!').then(|| important(b, i)).flatten() {
            span(out, "meta", &b[i..e]);
            i = e;
        } else if let Some(e) = (c == b'#').then(|| hex(b, i)).flatten() {
            span(out, "number", &b[i..e]);
            i = e;
        } else if let Some(e) = number(b, i) {
            span(out, "number", &b[i..e]);
            i = e;
        } else if let Some(e) = ident(b, i) {
            let tok = &b[i..e];
            if at(b, e) == b'(' {
                span(out, "built_in", tok);
            } else if tok.starts_with(b"--") && parens == 0 {
                span(out, "attr", tok);
            } else if prelude && matches!(tok, b"and" | b"or" | b"not" | b"only") {
                span(out, "keyword", tok);
            } else if prelude && at(b, blanks(b, e)) == b':' {
                span(out, "attribute", tok);
            } else {
                esc(out, tok);
            }
            i = e;
        } else {
            match c {
                b'(' => parens += 1,
                b')' => parens -= 1,
                _ => {}
            }
            esc(out, &b[i..i + 1]);
            i += 1;
        }
    }
}

fn trim_end(s: &[u8]) -> &[u8] {
    let mut e = s.len();
    loop {
        if e > 0 && space_len(s, e - 1) == 1 {
            e -= 1;
        } else if e >= 2 && space_len(s, e - 2) == 2 {
            e -= 2;
        } else if e >= 3 && space_len(s, e - 3) == 3 {
            e -= 3;
        } else {
            return &s[..e];
        }
    }
}

pub fn css(out: &mut Out, b: &[u8]) {
    let n = b.len();
    let mut i = 0;
    while i < n {
        if let Some(e) = common(out, b, i, n) {
            i = e;
            continue;
        }
        let c = b[i];
        if matches!(c, b'}' | b';' | b'{') {
            out.push(c);
            i += 1;
            continue;
        }
        let end = statement_end(b, i);
        if let Some(e) = at_rule(b, i) {
            span(out, "keyword", &b[i..e]);
            value(out, b, e, end, true);
        } else if at(b, end) == b'{' {
            selector(out, b, i, end);
        } else {
            match find(b, b":", i).filter(|&colon| colon <= end) {
                None => value(out, b, i, end, false),
                Some(colon) => {
                    let name = trim_end(&b[i..colon]);
                    span(
                        out,
                        if name.starts_with(b"--") {
                            "attr"
                        } else {
                            "attribute"
                        },
                        name,
                    );
                    out.extend_from_slice(&b[i + name.len()..colon + 1]);
                    value(out, b, colon + 1, end, false);
                }
            }
        }
        if at(b, end) == b'{' {
            out.push(b'{');
            i = end + 1;
        } else {
            i = end;
        }
    }
}
