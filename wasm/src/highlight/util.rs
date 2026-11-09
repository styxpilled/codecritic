use std::cell::{Cell, RefCell};
use std::collections::HashMap;
use std::rc::Rc;

/// Scanners work on bytes. Syntax is ASCII, other bytes pass through.
pub type Out = Vec<u8>;

/// Nesting limit for the recursive scanners. Deeper input is not highlighted.
const MAX_DEPTH: u32 = 200;

/// Keyed by the address and length of a source slice.
type SliceKey = (usize, usize);
type NeedleKey = (SliceKey, Vec<u8>);

/// Per-highlight state: caches keyed by source slice, and the depth guard.
#[derive(Default)]
pub struct Ctx {
    parens: RefCell<HashMap<SliceKey, Rc<[i32]>>>,
    /// Next index of a needle in a source.
    next: RefCell<HashMap<NeedleKey, Option<usize>>>,
    depth: Cell<u32>,
    brackets: Cell<u32>,
    pub overflow: Cell<bool>,
}

fn key(s: &[u8]) -> SliceKey {
    (s.as_ptr() as usize, s.len())
}

impl Ctx {
    /// Enters a nested scan. Returns false when too deep.
    pub fn enter(&self) -> bool {
        let d = self.depth.get() + 1;
        self.depth.set(d);
        if d > MAX_DEPTH {
            self.overflow.set(true);
        }
        !self.overflow.get()
    }

    pub fn leave(&self) {
        self.depth.set(self.depth.get() - 1);
    }

    /// Writes a bracket, colored by its nesting depth.
    pub fn bracket(&self, out: &mut Out, c: u8) {
        let mut d = self.brackets.get();
        if matches!(c, b')' | b']' | b'}') {
            d = d.saturating_sub(1);
            self.brackets.set(d);
        } else {
            self.brackets.set(d + 1);
        }
        out.extend_from_slice(b"<span class=\"hljs-b");
        out.push(b'1' + (d % 3) as u8);
        out.extend_from_slice(b"\">");
        out.push(c);
        out.extend_from_slice(b"</span>");
    }

    /// Index of the bracket that closes the `(`, `[` or `{` at `i`.
    pub fn close(&self, s: &[u8], i: usize) -> Option<usize> {
        let m = self.parens.borrow().get(&key(s)).cloned();
        let m = m.unwrap_or_else(|| {
            let m = paren_matches(s);
            self.parens.borrow_mut().insert(key(s), m.clone());
            m
        });
        usize::try_from(m[i]).ok()
    }

    /// If `needle` occurs at or after `i`. Caches the next index per source.
    pub fn occurs(&self, s: &[u8], needle: &[u8], i: usize) -> bool {
        let k = (key(s), needle.to_vec());
        match self.next.borrow().get(&k) {
            Some(None) => return false,
            Some(Some(f)) if *f >= i => return true,
            _ => {}
        }
        let found = find(s, needle, i);
        self.next.borrow_mut().insert(k, found);
        found.is_some()
    }
}

fn pair(c: u8) -> u8 {
    match c {
        b')' => b'(',
        b']' => b'[',
        _ => b'{',
    }
}

fn paren_matches(b: &[u8]) -> Rc<[i32]> {
    let mut matches = vec![-1i32; b.len()];
    let mut stack = Vec::new();
    let mut j = 0;
    while j < b.len() {
        match b[j] {
            b'"' | b'\'' | b'`' => j = quoted(b, j) - 1,
            b'(' | b'[' | b'{' => stack.push(j),
            c @ (b')' | b']' | b'}') => {
                if let Some(open) = stack.pop()
                    && b[open] == pair(c)
                {
                    matches[open] = j as i32;
                }
            }
            _ => {}
        }
        j += 1;
    }
    matches.into()
}

pub fn esc(out: &mut Out, s: &[u8]) {
    let mut last = 0;
    for (i, &c) in s.iter().enumerate() {
        let rep: &[u8] = match c {
            b'&' => b"&amp;",
            b'<' => b"&lt;",
            b'>' => b"&gt;",
            b'"' => b"&quot;",
            b'\'' => b"&#x27;",
            _ => continue,
        };
        out.extend_from_slice(&s[last..i]);
        out.extend_from_slice(rep);
        last = i + 1;
    }
    out.extend_from_slice(&s[last..]);
}

pub fn span(out: &mut Out, cls: &str, text: &[u8]) {
    out.extend_from_slice(b"<span class=\"hljs-");
    out.extend_from_slice(cls.as_bytes());
    out.extend_from_slice(b"\">");
    esc(out, text);
    out.extend_from_slice(b"</span>");
}

pub fn push(out: &mut Out, s: &str) {
    out.extend_from_slice(s.as_bytes());
}

/// `s[from..to]`, empty when the range is empty or out of bounds.
pub fn slice(s: &[u8], from: usize, to: usize) -> &[u8] {
    let to = to.min(s.len());
    &s[from.min(to)..to]
}

pub fn find(b: &[u8], needle: &[u8], from: usize) -> Option<usize> {
    let hay = b.get(from..)?;
    if needle.len() == 1 {
        return hay.iter().position(|&c| c == needle[0]).map(|p| p + from);
    }
    hay.windows(needle.len())
        .position(|w| w == needle)
        .map(|p| p + from)
}

pub fn at(b: &[u8], i: usize) -> u8 {
    b.get(i).copied().unwrap_or(0)
}

pub fn is_space(c: u8) -> bool {
    matches!(c, b' ' | b'\n' | b'\t' | b'\r')
}

pub fn is_word(c: u8) -> bool {
    c.is_ascii_alphanumeric() || c == b'_'
}

/// Byte length of the JS `\s` character at `i`, or 0.
pub fn space_len(b: &[u8], i: usize) -> usize {
    match (at(b, i), at(b, i + 1), at(b, i + 2)) {
        (b' ' | b'\t' | b'\n' | b'\r' | 0x0b | 0x0c, _, _) => 1,
        (0xc2, 0xa0, _) => 2,
        (0xe1, 0x9a, 0x80) | (0xe3, 0x80, 0x80) | (0xef, 0xbb, 0xbf) => 3,
        (0xe2, 0x80, 0x80..=0x8a | 0xa8 | 0xa9 | 0xaf) | (0xe2, 0x81, 0x9f) => 3,
        _ => 0,
    }
}

/// End of the `\s*` run from `i`.
pub fn spaces(b: &[u8], mut i: usize) -> usize {
    loop {
        match space_len(b, i) {
            0 => return i,
            n => i += n,
        }
    }
}

/// End of the `[ \t]*` run from `i`.
pub fn blanks(b: &[u8], mut i: usize) -> usize {
    while matches!(at(b, i), b' ' | b'\t') {
        i += 1;
    }
    i
}

/// If a JS line terminator starts at `i`.
pub fn is_line_end(b: &[u8], i: usize) -> bool {
    matches!(at(b, i), b'\n' | b'\r')
        || (at(b, i) == 0xe2 && at(b, i + 1) == 0x80 && matches!(at(b, i + 2), 0xa8 | 0xa9))
}

/// UTF-8 length of the character that starts with byte `c`.
pub fn char_len(c: u8) -> usize {
    match c {
        0xf0.. => 4,
        0xe0.. => 3,
        0xc0.. => 2,
        _ => 1,
    }
}

/// End of the run of bytes that match `f` from `i`.
pub fn run(b: &[u8], mut i: usize, f: impl Fn(u8) -> bool) -> usize {
    while i < b.len() && f(b[i]) {
        i += 1;
    }
    i
}

/// Index after the quoted string that starts at `i`. Stops at a newline.
pub fn quoted(b: &[u8], i: usize) -> usize {
    let q = b[i];
    let mut j = i + 1;
    while j < b.len() && b[j] != q && b[j] != b'\n' {
        j += if b[j] == b'\\' { 2 } else { 1 };
    }
    (j + 1).min(b.len())
}
