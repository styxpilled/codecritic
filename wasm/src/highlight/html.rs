use super::css::css;
use super::js::js;
use super::util::*;

/// `Html`: plain markup. `Svelte`: `{…}` blocks hold JS. `Jsx`: JSX inside JS.
#[derive(Clone, Copy, PartialEq)]
pub enum Mode {
    Html,
    Svelte,
    Jsx,
}

/// `[A-Za-z][\w:.-]*`
fn name(b: &[u8], i: usize) -> Option<usize> {
    at(b, i)
        .is_ascii_alphabetic()
        .then(|| run(b, i + 1, |c| is_word(c) || matches!(c, b':' | b'.' | b'-')))
}

/// `[^\s"'>/={}]+`
fn attr(b: &[u8], i: usize) -> Option<usize> {
    let mut j = i;
    while j < b.len() && space_len(b, j) == 0 && !b"\"'>/={}".contains(&b[j]) {
        j += 1;
    }
    (j > i).then_some(j)
}

/// `[^\s>]+`
fn unquoted(b: &[u8], i: usize) -> usize {
    let mut j = i;
    while j < b.len() && space_len(b, j) == 0 && b[j] != b'>' {
        j += 1;
    }
    j
}

/// `&(?:[A-Za-z]\w*|#\d+|#x[\da-fA-F]+);`
fn entity(b: &[u8], i: usize) -> Option<usize> {
    let j = if at(b, i + 1).is_ascii_alphabetic() {
        run(b, i + 2, is_word)
    } else if at(b, i + 1) == b'#' && at(b, i + 2).is_ascii_digit() {
        run(b, i + 2, |c| c.is_ascii_digit())
    } else if at(b, i + 1) == b'#' && at(b, i + 2) == b'x' && at(b, i + 3).is_ascii_hexdigit() {
        run(b, i + 3, |c| c.is_ascii_hexdigit())
    } else {
        return None;
    };
    (at(b, j) == b';').then_some(j + 1)
}

/// `[#:/@][a-z]+`
fn block(b: &[u8], i: usize) -> Option<usize> {
    let j = run(b, i + 1, |c| c.is_ascii_lowercase());
    (matches!(at(b, i), b'#' | b':' | b'/' | b'@') && j > i + 1).then_some(j)
}

/// `<[A-Z]\w*\s*(?:,|extends\b|>\s*\()`
fn ts_generic(b: &[u8], i: usize) -> bool {
    if !at(b, i + 1).is_ascii_uppercase() {
        return false;
    }
    let end = run(b, i + 2, is_word);
    (i + 2..=end).rev().any(|k| {
        let j = spaces(b, k);
        at(b, j) == b','
            || (b[j.min(b.len())..].starts_with(b"extends") && !is_word(at(b, j + 7)))
            || (at(b, j) == b'>' && at(b, spaces(b, j + 1)) == b'(')
    })
}

/// `\blang=["']?ts\b`
fn lang_ts(s: &[u8]) -> bool {
    (0..s.len()).any(|i| {
        let rest = &s[i..];
        if !rest.starts_with(b"lang=") || (i > 0 && is_word(s[i - 1])) {
            return false;
        }
        let j = if matches!(at(rest, 5), b'"' | b'\'') {
            6
        } else {
            5
        };
        rest[j..].starts_with(b"ts") && !is_word(at(rest, j + 2))
    })
}

/// `{` expression `}` from `i`, as JS.
fn expression(cx: &Ctx, out: &mut Out, b: &[u8], i: usize, ts: bool, mode: Mode) -> usize {
    out.push(b'{');
    let mut j = i + 1;
    if let Some(e) = (mode == Mode::Svelte).then(|| block(b, j)).flatten() {
        span(out, "keyword", &b[j..e]);
        j = e;
    }
    let e = js(cx, out, b, ts, j, true, false);
    if at(b, e) == b'}' {
        out.push(b'}');
    }
    (e + 1).min(b.len())
}

struct Tag<'a> {
    end: usize,
    name: &'a [u8],
    closing: bool,
    self_closing: bool,
}

/// Tag from `<` at `i`.
fn tag<'a>(cx: &Ctx, out: &mut Out, b: &'a [u8], i: usize, ts: bool, mode: Mode) -> Tag<'a> {
    let closing = at(b, i + 1) == b'/';
    let mut j = i + if closing { 2 } else { 1 };
    let name_end = name(b, j).unwrap_or(j);
    let tag_name = &b[j..name_end];
    j = name_end;
    push(out, "<span class=\"hljs-tag\">&lt;");
    if closing {
        out.push(b'/');
    }
    if !tag_name.is_empty() {
        span(out, "name", tag_name);
    }
    let mut self_closing = false;
    let mut closed = false;
    while j < b.len() {
        let c = b[j];
        if c == b'>' {
            j += 1;
            closed = true;
            break;
        }
        if c == b'/' && at(b, j + 1) == b'>' {
            self_closing = true;
            j += 2;
            out.push(b'/');
            break;
        }
        if is_space(c) || c == b'=' {
            out.push(c);
            j += 1;
        } else if c == b'"' || c == b'\'' {
            let e = find(b, &[c], j + 1).map_or(b.len(), |e| e + 1);
            span(out, "string", &b[j..e]);
            j = e;
        } else if c == b'{' && mode != Mode::Html {
            j = expression(cx, out, b, j, ts, mode);
        } else if j > 0 && b[j - 1] == b'=' {
            let e = unquoted(b, j);
            span(out, "string", &b[j..e]);
            j = e;
        } else if let Some(e) = attr(b, j) {
            if c == b'@' {
                out.push(b'@');
                span(out, "attr", &b[j + 1..e]);
            } else {
                span(out, "attr", &b[j..e]);
            }
            j = e;
        } else {
            esc(out, &b[j..j + 1]);
            j += 1;
        }
    }
    if self_closing || closed {
        push(out, "&gt;");
    }
    push(out, "</span>");
    Tag {
        end: j,
        name: tag_name,
        closing,
        self_closing,
    }
}

/// Escapes `s` and marks the name in `&lt;!DOCTYPE name`.
fn meta(out: &mut Out, s: &[u8]) {
    let mut e = Out::new();
    esc(&mut e, s);
    let p = b"&lt;!doctype".len();
    let ws = spaces(&e, p);
    let word = run(&e, ws, is_word);
    if e.len() >= p && e[..p].eq_ignore_ascii_case(b"&lt;!doctype") && ws > p && word > ws {
        out.extend_from_slice(&e[..ws]);
        span(out, "keyword", &e[ws..word]);
        out.extend_from_slice(&e[word..]);
    } else {
        out.extend_from_slice(&e);
    }
}

/// Markup from `from`. In `Jsx` mode, stops after the root element closes.
pub fn markup(cx: &Ctx, out: &mut Out, b: &[u8], from: usize, ts: bool, mode: Mode) -> usize {
    if !cx.enter() {
        return b.len();
    }
    let end = markup_inner(cx, out, b, from, ts, mode);
    cx.leave();
    end
}

fn markup_inner(cx: &Ctx, out: &mut Out, b: &[u8], from: usize, ts: bool, mode: Mode) -> usize {
    let n = b.len();
    let mut i = from;
    let mut depth = 0i32;
    while i < n {
        let c = b[i];
        if c == b'<' && b[i..].starts_with(b"<!--") {
            let e = find(b, b"-->", i).map_or(n, |e| e + 3);
            span(out, "comment", &b[i..e]);
            i = e;
        } else if c == b'<' && matches!(at(b, i + 1), b'!' | b'?') {
            let e = find(b, b">", i).map_or(n, |e| e + 1);
            push(out, "<span class=\"hljs-meta\">");
            meta(out, &b[i..e]);
            push(out, "</span>");
            i = e;
        } else if c == b'<'
            && (at(b, i + 1).is_ascii_alphabetic() || matches!(at(b, i + 1), b'/' | b'>'))
        {
            let t = tag(cx, out, b, i, ts, mode);
            i = t.end;
            if mode == Mode::Jsx {
                if t.closing {
                    depth -= 1;
                } else if !t.self_closing {
                    depth += 1;
                }
                if depth <= 0 {
                    return i;
                }
                continue;
            }
            if t.closing || t.self_closing {
                continue;
            }
            let raw: &[u8] = if t.name.eq_ignore_ascii_case(b"script") {
                b"</script"
            } else if t.name.eq_ignore_ascii_case(b"style") {
                b"</style"
            } else {
                continue;
            };
            let e = (i..n)
                .find(|&k| {
                    b[k..].len() >= raw.len() && b[k..k + raw.len()].eq_ignore_ascii_case(raw)
                })
                .unwrap_or(n);
            let body = &b[i..e];
            if raw == b"</style" {
                css(out, body);
            } else {
                // JS `src.slice(i - 40, i)`, where a negative start counts from the end.
                let start = if i >= 40 {
                    i - 40
                } else {
                    (n + i).saturating_sub(40)
                };
                let ts = lang_ts(slice(b, start, i)) || ts;
                js(cx, out, body, ts, 0, false, false);
            }
            i = e;
        } else if c == b'{' && mode != Mode::Html {
            i = expression(cx, out, b, i, ts, mode);
        } else if let Some(e) = (c == b'&' && mode != Mode::Jsx)
            .then(|| entity(b, i))
            .flatten()
        {
            span(out, "symbol", &b[i..e]);
            i = e;
        } else {
            esc(out, &b[i..i + 1]);
            i += 1;
        }
    }
    i
}

/// JSX element at `i` inside JS. Returns the end, or None if `<` starts no element.
pub fn jsx(cx: &Ctx, out: &mut Out, b: &[u8], i: usize, ts: bool) -> Option<usize> {
    if ts && ts_generic(b, i) {
        return None;
    }
    if at(b, i + 1) == b'>' {
        if !cx.occurs(b, b"</>", i) {
            return None;
        }
    } else {
        let e = name(b, i + 1)?;
        let mut close = b"</".to_vec();
        close.extend_from_slice(&b[i + 1..e]);
        if !cx.occurs(b, &close, i) && !cx.occurs(b, b"/>", i) {
            return None;
        }
    }
    Some(markup(cx, out, b, i, ts, Mode::Jsx))
}
