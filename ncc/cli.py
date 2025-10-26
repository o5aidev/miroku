import json, argparse, pathlib
from scoring.score_crystallinity import score_from_graph
from report.emit_report import write_markdown

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("analyze", nargs='?')
    ap.add_argument("--rules", required=True)
    ap.add_argument("--out-json", required=True)
    ap.add_argument("--out-md", required=True)
    args = ap.parse_args()

    # 後日 SwiftSyntax/SourceKitten で実データ抽出に置換
    graph = {"nodes": [], "edges": [], "stats": {
        "dead_code_blocks": 3, "duplicate_funcs": 4,
        "moved_files_across_layers": 1, "force_unwraps": 1,
        "unused_imports": 2, "todo_fixes": 1, "layer_crossing": 1,
        "cyclic_deps": 0, "fan_in_out_outliers": 1, "public_api_changes": 0,
        "build_phase_delta": 0
    }}

    rules_txt = pathlib.Path(args.rules).read_text(encoding="utf-8")
    score = score_from_graph(graph, rules_txt)
    pathlib.Path(args.out_json).write_text(json.dumps(score, ensure_ascii=False, indent=2), encoding="utf-8")
    write_markdown(score, args.out_md)

if __name__ == "__main__":
    main()