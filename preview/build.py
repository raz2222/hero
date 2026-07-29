#!/usr/bin/env python3
"""Bundle cypher-hero.html into a fully self-contained page.

The source keeps readable references (/img/robot.png, __JOST_B64__ …) so the
same markup can be served by Vite. This inlines the font and the three Figma
exports as data URIs so the page works under the Artifact CSP, which blocks
every external host.
"""
import base64
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
def data_uri(path: pathlib.Path, mime: str) -> str:
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


src = ROOT / "preview" / "cypher-hero.html"
out = ROOT / "preview" / "cypher-hero.build.html"

html = src.read_text()
html = html.replace(
    "__JOST_B64__",
    base64.b64encode((ROOT / "public" / "fonts" / "jost-latin.woff2").read_bytes()).decode(),
)
for token, name in (("__ROBOT__", "robot.png"), ("__ANDROID__", "android.png"), ("__CPU__", "cpu.png")):
    html = html.replace(token, data_uri(ROOT / "public" / "img" / name, "image/png"))

out.write_text(html)
print(f"built {out.relative_to(ROOT)} — {out.stat().st_size / 1024:.0f} KB")
