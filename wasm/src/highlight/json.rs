use super::util::*;

/// `-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?`
fn number(b: &[u8], i: usize) -> Option<usize> {
    let d = |c: u8| c.is_ascii_digit();
    let s = if at(b, i) == b'-' { i + 1 } else { i };
    let mut j = run(b, s, d);
    if j == s {
        return None;
    }
    if at(b, j) == b'.' && d(at(b, j + 1)) {
        j = run(b, j + 1, d);
    }
    if matches!(at(b, j), b'e' | b'E') {
        let k = if matches!(at(b, j + 1), b'+' | b'-') {
            j + 2
        } else {
            j + 1
        };
        if d(at(b, k)) {
            j = run(b, k, d);
        }
    }
    Some(j)
}

/// `[A-Za-z_$][\w$]*`
fn word(b: &[u8], i: usize) -> Option<usize> {
    let c = at(b, i);
    (c.is_ascii_alphabetic() || c == b'_' || c == b'$')
        .then(|| run(b, i + 1, |c| is_word(c) || c == b'$'))
}

fn key_ahead(b: &[u8], i: usize) -> bool {
    at(b, spaces(b, i)) == b':'
}

/// JSON, also with comments and unquoted keys (jsonc, json5).
pub fn json(b: &[u8]) -> Out {
    let mut out = Out::with_capacity(b.len() * 2);
    let mut i = 0;
    while i < b.len() {
        let c = b[i];
        let e;
        if c == b'"' || c == b'\'' {
            e = quoted(b, i);
            span(
                &mut out,
                if key_ahead(b, e) { "attr" } else { "string" },
                &b[i..e],
            );
        } else if c == b'/' && matches!(at(b, i + 1), b'/' | b'*') {
            e = if at(b, i + 1) == b'/' {
                find(b, b"\n", i + 2).unwrap_or(b.len())
            } else {
                find(b, b"*/", i + 2).map_or(b.len(), |e| e + 2)
            };
            span(&mut out, "comment", &b[i..e]);
        } else if let Some(n) = number(b, i) {
            e = n;
            span(&mut out, "number", &b[i..e]);
        } else if let Some(w) = word(b, i) {
            e = w;
            let tok = &b[i..e];
            if matches!(tok, b"true" | b"false" | b"null") {
                push(
                    &mut out,
                    "<span class=\"hljs-literal\"><span class=\"hljs-keyword\">",
                );
                out.extend_from_slice(tok);
                push(&mut out, "</span></span>");
            } else if key_ahead(b, e) {
                span(&mut out, "attr", tok);
            } else {
                esc(&mut out, tok);
            }
        } else if b"{}[],:".contains(&c) {
            e = i + 1;
            span(&mut out, "punctuation", &b[i..e]);
        } else {
            e = i + 1;
            esc(&mut out, &b[i..e]);
        }
        i = e;
    }
    out
}
