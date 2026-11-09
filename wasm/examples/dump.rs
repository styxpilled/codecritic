//! Writes the highlighter output for each block in `blocks.json` as a JSON
//! array, and the time for all blocks (best of 20 passes).
//! Usage: dump <blocks.json> <out.json>, or dump <file> <lang> to print one.
use readme::highlight::highlight;
use std::time::Instant;

fn main() {
    let a: Vec<String> = std::env::args().skip(1).collect();
    if !a[0].ends_with(".json") {
        let code = std::fs::read_to_string(&a[0]).unwrap();
        return println!("{}", highlight(&code, &a[1]).unwrap_or("<None>".into()));
    }
    let blocks: Vec<serde_json::Value> =
        serde_json::from_str(&std::fs::read_to_string(&a[0]).unwrap()).unwrap();
    let blocks: Vec<(&str, &str)> = blocks
        .iter()
        .map(|b| (b["lang"].as_str().unwrap(), b["text"].as_str().unwrap()))
        .collect();
    let outs: Vec<Option<String>> = blocks.iter().map(|(l, t)| highlight(t, l)).collect();
    let mut best = f64::MAX;
    for _ in 0..20 {
        let t = Instant::now();
        for (l, t) in &blocks {
            std::hint::black_box(highlight(t, l));
        }
        best = best.min(t.elapsed().as_secs_f64() * 1000.0);
    }
    let bytes: usize = outs.iter().flatten().map(String::len).sum();
    println!("{best:.2} ms, {bytes} bytes out");
    std::fs::write(&a[1], serde_json::to_string(&outs).unwrap()).unwrap();
}
