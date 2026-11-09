mod css;
mod html;
mod js;
mod json;
mod ts;
mod util;

use html::{Mode, markup};
use util::{Ctx, Out};

/// Highlighted HTML with hljs class names, or None for other languages or
/// input the scanners cannot handle (for example very deep nesting).
pub fn highlight(code: &str, lang: &str) -> Option<String> {
    let lang = lang.to_ascii_lowercase();
    let b = code.as_bytes();
    let cx = Ctx::default();
    let mut out = Out::with_capacity(b.len() * 2);
    match lang.as_str() {
        "javascript" | "js" | "jsx" | "mjs" | "cjs" => {
            js::js(&cx, &mut out, b, false, 0, false, js::Scope::Code);
        }
        "typescript" | "ts" | "tsx" | "mts" | "cts" => {
            js::js(&cx, &mut out, b, true, 0, false, js::Scope::Code);
        }
        "xml" | "html" | "xhtml" | "rss" | "atom" | "xjb" | "xsd" | "xsl" | "plist" | "wsf"
        | "svg" => {
            markup(&cx, &mut out, b, 0, false, Mode::Html);
        }
        "svelte" | "vue" => {
            markup(&cx, &mut out, b, 0, false, Mode::Svelte);
        }
        "css" => css::css(&cx, &mut out, b),
        "json" | "jsonc" | "json5" => out = json::json(&cx, b),
        _ => return None,
    }
    if cx.overflow.get() {
        return None;
    }
    String::from_utf8(out).ok().filter(|html| only_spans(html))
}

/// If the only markup in `html` is `<span class="hljs-…">` and `</span>`.
fn only_spans(html: &str) -> bool {
    let b = html.as_bytes();
    let mut i = 0;
    while let Some(p) = b[i..].iter().position(|&c| c == b'<' || c == b'>') {
        i += p;
        if b[i] == b'>' {
            return false;
        }
        let rest = &b[i..];
        if rest.starts_with(b"</span>") {
            i += 7;
        } else if rest.starts_with(b"<span class=\"hljs-") {
            let Some(q) = rest[18..].iter().position(|&c| c == b'"') else {
                return false;
            };
            let cls = &rest[18..18 + q];
            if !cls
                .iter()
                .all(|&c| c.is_ascii_alphanumeric() || matches!(c, b'_' | b' ' | b'-'))
                || rest.get(18 + q + 1) != Some(&b'>')
            {
                return false;
            }
            i += 18 + q + 2;
        } else {
            return false;
        }
    }
    true
}
