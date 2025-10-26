import json, re

def weight_sum(stats, weights):
    s=0.0
    for k,w in weights.items():
        s += float(stats.get(k,0))*float(w)
    return s

def parse_yaml_like(txt):
    blocks,cur = {"metrics":{}}, None
    for line in txt.splitlines():
        if re.match(r"^\s{2,}[a-z_]+:\s*$", line):
            cur=line.strip()[:-1]; blocks["metrics"][cur]={}
        if "weights:" in line and cur:
            m=re.search(r"\{(.+)\}", line)
            if m:
                pairs=[p.strip() for p in m.group(1).split(",")]
                blocks["metrics"][cur]["weights"]={}
                for p in pairs:
                    k,v=p.split(":"); blocks["metrics"][cur]["weights"][k.strip()]=float(v)
    m=re.search(r"warn:\s*\{([^}]+)\}", txt); warn={}
    if m:
        pairs=[p.strip() for p in m.group(1).split(",")]
        for p in pairs:
            k,v=p.split(":"); warn[k.strip()]=float(v)
    blocks["thresholds_warn"]=warn
    return blocks

def score_from_graph(graph, rules_txt):
    r=parse_yaml_like(rules_txt)
    stats=graph.get("stats",{})
    m=r["metrics"]
    lattice = weight_sum(stats, m["lattice_coherency"]["weights"])
    symmetry = 1.0 + weight_sum(stats, m["symmetry_index"]["weights"])
    defect = max(0.0, 0.05 + weight_sum(stats, m["defect_density"]["weights"]))
    phase = max(0.0, 0.0 + weight_sum(stats, m["phase_shift"]["weights"]))
    crystallinity = max(0.0, min(1.0, 0.5*symmetry + 0.5*(1.0-defect)))
    return {
        "lattice_coherency": lattice,
        "symmetry_index": symmetry,
        "defect_density": defect,
        "phase_shift": phase,
        "crystallinity": crystallinity,
        "thresholds_warn": r["thresholds_warn"]
    }