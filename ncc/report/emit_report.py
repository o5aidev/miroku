def write_markdown(score, out_md):
    md = []
    md.append("### NCC 結晶レポート")
    md.append(f"- 欠陥密度: **{score['defect_density']:.3f}**")
    md.append(f"- 対称性: **{score['symmetry_index']:.3f}**")
    md.append(f"- 相転移: **{score['phase_shift']:.3f}**")
    md.append(f"- 結晶性: **{score['crystallinity']:.3f}**")
    md.append("\n**所見（Heuristic）**:")
    if score['defect_density'] > score['thresholds_warn'].get('defect_density', 0.12):
        md.append("- 欠陥密度が閾値超過。デッドコード/未使用import/TODOの整理を推奨。")
    if score['symmetry_index'] < score['thresholds_warn'].get('symmetry_index', 0.65):
        md.append("- 対称性不足。重複実装/類似関数の統合とレイヤ規律強化を推奨。")
    open(out_md, "w", encoding="utf-8").write("\n".join(md))