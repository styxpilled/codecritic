use std::borrow::Cow;
use std::collections::HashSet;
use std::sync::LazyLock;

use ammonia::Builder;
use highlight::highlight;
use pulldown_cmark::{CodeBlockKind, Event, Options, Parser, Tag, TagEnd, html};
use url::Url;
#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

pub mod highlight;

const SCHEMES: [&str; 3] = ["http", "https", "mailto"];

/// Sanitizer policy. Relative links are rewritten per render, so the
/// attribute filter reads the repo base URLs from `BASES`.
static SANITIZER: LazyLock<Builder<'static>> = LazyLock::new(|| {
    let mut b = Builder::empty();
    b.add_tags([
        "address",
        "article",
        "aside",
        "footer",
        "header",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hgroup",
        "main",
        "nav",
        "section",
        "blockquote",
        "dd",
        "div",
        "dl",
        "dt",
        "figcaption",
        "figure",
        "hr",
        "li",
        "ol",
        "p",
        "pre",
        "ul",
        "a",
        "abbr",
        "b",
        "bdi",
        "bdo",
        "br",
        "cite",
        "code",
        "data",
        "dfn",
        "em",
        "i",
        "kbd",
        "mark",
        "q",
        "rb",
        "rp",
        "rt",
        "rtc",
        "ruby",
        "s",
        "samp",
        "small",
        "span",
        "strong",
        "sub",
        "sup",
        "time",
        "u",
        "var",
        "wbr",
        "caption",
        "col",
        "colgroup",
        "table",
        "tbody",
        "td",
        "tfoot",
        "th",
        "thead",
        "tr",
        "img",
        "picture",
        "source",
        "details",
        "summary",
        "del",
        "ins",
        "input",
    ])
    .add_generic_attributes(["align"])
    .add_tag_attributes("a", ["href", "name", "title"])
    .add_tag_attributes("img", ["src", "srcset", "alt", "title", "width", "height"])
    .add_tag_attributes("source", ["srcset", "media", "type"])
    .add_tag_attributes("input", ["checked"])
    .add_tag_attributes("details", ["open"])
    .add_tag_attributes("td", ["colspan", "rowspan"])
    .add_tag_attributes("th", ["colspan", "rowspan"])
    .add_tag_attributes("code", ["class"])
    .set_tag_attribute_value("input", "type", "checkbox")
    .set_tag_attribute_value("input", "disabled", "")
    .url_schemes(HashSet::from(SCHEMES))
    .link_rel(Some("nofollow noopener"))
    .attribute_filter(filter);
    b
});

struct Bases {
    raw: Url,
    blob: Url,
}

thread_local! {
    static BASES: std::cell::RefCell<Option<Bases>> = const { std::cell::RefCell::new(None) };
}

fn is_relative(url: &str) -> bool {
    let b = url.as_bytes();
    if url.starts_with("//") || url.starts_with('#') {
        return false;
    }
    let scheme = b.iter().position(|&c| c == b':').is_some_and(|i| {
        i > 0
            && b[0].is_ascii_alphabetic()
            && b[1..i]
                .iter()
                .all(|&c| c.is_ascii_alphanumeric() || b"+.-".contains(&c))
    });
    !scheme
}

fn resolve(url: &str, base: &Url) -> Option<String> {
    base.join(url.trim_start_matches('/'))
        .ok()
        .map(String::from)
}

fn allowed_url(url: &str) -> bool {
    match Url::parse(url) {
        Ok(u) => SCHEMES.contains(&u.scheme()),
        Err(url::ParseError::RelativeUrlWithoutBase) => !url.starts_with("//"),
        Err(_) => false,
    }
}

fn filter<'u>(element: &str, attribute: &str, value: &'u str) -> Option<Cow<'u, str>> {
    match (element, attribute) {
        ("code", "class") => {
            let classes = value
                .split_ascii_whitespace()
                .filter(|c| *c == "hljs" || c.starts_with("language-"))
                .collect::<Vec<_>>()
                .join(" ");
            (!classes.is_empty()).then_some(Cow::Owned(classes))
        }
        (_, "href" | "src") if value.starts_with("//") => None,
        ("a", "href") if is_relative(value) => BASES.with_borrow(|b| {
            b.as_ref()
                .and_then(|b| resolve(value, &b.blob))
                .map(Cow::Owned)
        }),
        ("img" | "source", "src") if is_relative(value) => BASES.with_borrow(|b| {
            Some(
                b.as_ref()
                    .and_then(|b| resolve(value, &b.raw))
                    .map_or(Cow::Borrowed(value), Cow::Owned),
            )
        }),
        ("img" | "source", "srcset") => BASES.with_borrow(|b| {
            let mut out = String::new();
            for candidate in value.split(',').map(str::trim).filter(|s| !s.is_empty()) {
                let mut parts = candidate.split_ascii_whitespace();
                let url = parts.next()?;
                let url = match b {
                    Some(b) if is_relative(url) => resolve(url, &b.raw)?,
                    _ => url.to_owned(),
                };
                if !allowed_url(&url) {
                    return None;
                }
                if !out.is_empty() {
                    out.push_str(", ");
                }
                out.push_str(&url);
                for p in parts {
                    out.push(' ');
                    out.push_str(p);
                }
            }
            Some(Cow::Owned(out))
        }),
        _ => Some(Cow::Borrowed(value)),
    }
}

fn escape(s: &str, out: &mut String) {
    for c in s.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&#x27;"),
            c => out.push(c),
        }
    }
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = crypto, js_name = getRandomValues)]
    fn get_random_values(buf: &mut [u8]);
}

/// Renders README markdown to sanitized HTML. Relative links resolve against
/// `repo` (`owner/name`) on GitHub.
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn render(markdown: &str, repo: Option<String>) -> String {
    let mut nonce = [0u8; 16];
    get_random_values(&mut nonce);
    let mut placeholder = String::from("x");
    for b in nonce {
        placeholder.push_str(&format!("{b:02x}"));
    }
    placeholder.push(':');
    render_with(markdown, repo.as_deref(), &placeholder)
}

/// Highlighted code skips the sanitizer: it is escaped text in hljs spans.
/// Code blocks render as `{placeholder}{index};`, replaced after sanitizing.
/// `placeholder` must be unguessable, or a README could place highlighted
/// HTML in an attribute.
pub fn render_with(markdown: &str, repo: Option<&str>, placeholder: &str) -> String {
    let bases = repo.and_then(|repo| {
        Some(Bases {
            raw: Url::parse(&format!("https://raw.githubusercontent.com/{repo}/HEAD/")).ok()?,
            blob: Url::parse(&format!("https://github.com/{repo}/blob/HEAD/")).ok()?,
        })
    });
    BASES.set(bases);

    let options = Options::ENABLE_TABLES
        | Options::ENABLE_STRIKETHROUGH
        | Options::ENABLE_TASKLISTS
        | Options::ENABLE_FOOTNOTES;
    let mut highlighted = Vec::new();
    let mut code: Option<(String, String)> = None;
    let events = Parser::new_ext(markdown, options).filter_map(|event| match (&mut code, event) {
        (None, Event::Start(Tag::CodeBlock(kind))) => {
            let lang = match kind {
                CodeBlockKind::Fenced(info) => {
                    info.split_whitespace().next().unwrap_or("").to_owned()
                }
                CodeBlockKind::Indented => String::new(),
            };
            code = Some((lang, String::new()));
            None
        }
        (Some((_, text)), Event::Text(t)) => {
            text.push_str(&t);
            None
        }
        (Some(_), Event::End(TagEnd::CodeBlock)) => {
            let (lang, mut text) = code.take()?;
            if text.ends_with('\n') {
                text.pop();
            }
            let mut out = String::from("<pre><code");
            if !lang.is_empty() {
                out.push_str(" class=\"hljs language-");
                escape(&lang, &mut out);
                out.push('"');
            }
            out.push('>');
            match (!lang.is_empty())
                .then(|| highlight(&text, &lang))
                .flatten()
            {
                Some(html) => {
                    out.push_str(&format!("{placeholder}{};", highlighted.len()));
                    highlighted.push(html);
                }
                None => escape(&text, &mut out),
            }
            out.push_str(
                "</code></pre>
",
            );
            Some(Event::Html(out.into()))
        }
        (_, event) => Some(event),
    });
    let mut unsafe_html = String::with_capacity(markdown.len() * 3 / 2);
    html::push_html(&mut unsafe_html, events);

    let clean = SANITIZER.clean(&unsafe_html).to_string();
    BASES.set(None);

    let mut out =
        String::with_capacity(clean.len() + highlighted.iter().map(String::len).sum::<usize>());
    let mut rest = clean.as_str();
    while let Some(i) = rest.find(placeholder) {
        out.push_str(&rest[..i]);
        rest = &rest[i + placeholder.len()..];
        let end = rest.find(';').unwrap_or(0);
        match rest[..end]
            .parse::<usize>()
            .ok()
            .and_then(|n| highlighted.get(n))
        {
            Some(html) => {
                out.push_str(html);
                rest = &rest[end + 1..];
            }
            None => out.push_str(placeholder),
        }
    }
    out.push_str(rest);
    out
}

#[cfg(test)]
mod tests {
    use super::render_with;

    fn render(md: &str) -> String {
        render_with(md, Some("o/r"), "x0:")
    }

    #[test]
    fn removes_scripts_and_unsafe_urls() {
        let html = render(
            "<script>alert(1)</script><img src=x onerror=alert(1)>\n\n[a](javascript:alert(1)) <a href=\"//evil.com\">b</a>",
        );
        assert!(
            !html.contains("script") && !html.contains("onerror"),
            "{html}"
        );
        assert!(
            !html.contains("javascript:") && !html.contains("evil.com"),
            "{html}"
        );
    }

    #[test]
    fn rewrites_relative_links() {
        let html = render("[doc](docs/a.md) ![img](/logo.png) [top](#top)");
        assert!(
            html.contains(r#"href="https://github.com/o/r/blob/HEAD/docs/a.md""#),
            "{html}"
        );
        assert!(
            html.contains(r#"src="https://raw.githubusercontent.com/o/r/HEAD/logo.png""#),
            "{html}"
        );
        assert!(html.contains(r##"href="#top""##), "{html}");
        assert!(html.contains(r#"rel="nofollow noopener""#), "{html}");
    }

    #[test]
    fn guessed_placeholder_stays_text() {
        let md = "<a title=\"x0:0;\">t</a>\n\n```js\nlet a = '\"';\n```";
        let html = render_with(md, None, "x5f3a:");
        assert!(html.contains(r#"title="x0:0;""#), "{html}");
        assert!(
            html.contains(r#"<span class="hljs-keyword">let</span>"#),
            "{html}"
        );
    }

    #[test]
    fn task_lists_are_disabled_checkboxes() {
        let html = render("- [x] done\n\n<input type=text value=x>");
        assert_eq!(html.matches(r#"type="checkbox""#).count(), 2, "{html}");
        assert!(!html.contains("value"), "{html}");
    }
}
