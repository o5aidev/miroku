import os, json, subprocess, argparse

def gh_post_comment(body):
    pr = os.getenv("PR_NUMBER")
    if pr:
        subprocess.run(["gh","pr","comment",pr,"--body",body], check=False)
    else:
        subprocess.run(["gh","issue","create","--title","NCC 自動所見","--body",body], check=False)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--report", required=True)
    ap.add_argument("--markdown", required=True)
    ap.add_argument("--mode", default="pr_or_issue")
    args=ap.parse_args()

    body=open(args.markdown, encoding="utf-8").read()
    gh_post_comment(body)

if __name__=="__main__":
    main()