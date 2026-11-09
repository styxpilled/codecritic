//! Compares the highlighter with the stored JS output in
//! `.scratch/highlight-baseline/blocks.json`.
use readme::highlight::highlight;

fn main() {
    let path = std::env::args()
        .nth(1)
        .unwrap_or("../.scratch/highlight-baseline/blocks.json".into());
    let blocks: Vec<serde_json::Value> =
        serde_json::from_str(&std::fs::read_to_string(path).unwrap()).unwrap();
    let (mut same, mut shown) = (0, 0);
    for (n, b) in blocks.iter().enumerate() {
        let (lang, text, ours) = (
            b["lang"].as_str().unwrap(),
            b["text"].as_str().unwrap(),
            b["ours"].as_str(),
        );
        let got = highlight(text, lang);
        if got.as_deref() == ours {
            same += 1;
        } else if shown < 3 {
            shown += 1;
            let (g, o) = (
                got.unwrap_or("<None>".into()),
                ours.unwrap_or("<null>").to_owned(),
            );
            let d = g
                .bytes()
                .zip(o.bytes())
                .position(|(a, b)| a != b)
                .unwrap_or(g.len().min(o.len()));
            let from = d.saturating_sub(120);
            println!(
                "#{n} {lang} differs at {d}\n  rust: {}\n  js:   {}",
                &g[from..(d + 120).min(g.len())],
                &o[from..(d + 120).min(o.len())]
            );
        }
    }
    println!("{same}/{} identical", blocks.len());
}
