#!/usr/bin/env python3
"""Build the site: templates/ + content/site.json -> dist/

Plain Python, standard library only, so it runs anywhere Python 3 exists
(including Netlify's build image) with nothing to install.

    python build.py

Template syntax, kept deliberately tiny:

    {{ contact.phone }}             insert a value, HTML-escaped
    {{#each services}} ... {{/each}}  repeat a block for each list item
    {{#if star}} ... {{/if}}        include a block when a value is truthy

Inside an each block, fields of the item are available by name ({{ title }}),
{{ . }} is the item itself when the list holds plain strings, and two helpers
exist: {{ @stagger }} (0-3, drives the CSS animation delay) and {{ @sep }}
(a comma on every item except the last, for building JSON lists).
"""

import html
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
OUT = ROOT / "dist"
STATIC = ("css", "js", "images")

EACH = re.compile(r"\{\{#each\s+([\w.]+)\s*\}\}(.*?)\{\{/each\}\}", re.S)
IF = re.compile(r"\{\{#if\s+([\w.@]+)\s*\}\}(.*?)\{\{/if\}\}", re.S)
VAR = re.compile(r"\{\{\s*([\w.@]+|\.)\s*\}\}")


def lookup(ctx, path, soft=False):
    if path == ".":
        return ctx.get("__item__", "")
    value = ctx
    for part in path.split("."):
        if isinstance(value, dict) and part in value:
            value = value[part]
        elif soft:
            return None
        else:
            raise KeyError(f"unknown placeholder: {{{{ {path} }}}}")
    return value


def escape(value):
    return (
        str(value)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def render(template, ctx):
    def each(match):
        items = lookup(ctx, match.group(1))
        body, parts = match.group(2), []
        for i, item in enumerate(items):
            scope = dict(ctx)
            if isinstance(item, dict):
                scope.update(item)
            scope["__item__"] = item
            scope["@index"] = i
            scope["@first"] = i == 0
            scope["@stagger"] = i % 4
            scope["@sep"] = "" if i == len(items) - 1 else ","
            parts.append(render(body, scope))
        return "".join(parts)

    def cond(match):
        return match.group(2) if lookup(ctx, match.group(1), soft=True) else ""

    template = EACH.sub(each, template)
    template = IF.sub(cond, template)
    return VAR.sub(lambda m: escape(lookup(ctx, m.group(1))), template)


def derive(data):
    """Fill in values computed from what the client typed."""
    contact = data["contact"]
    digits = re.sub(r"\D", "", contact["phone"])[-10:]
    contact["phone_href"] = "+1" + digits
    contact["phone_schema"] = f"+1-{digits[:3]}-{digits[3:6]}-{digits[6:]}"
    for review in data["reviews"]:
        contact_initials = [w[0] for w in review["name"].split()[:2] if w[0].isalpha()]
        review["initials"] = "".join(contact_initials).upper()
    return data


def main():
    data = derive(json.loads((ROOT / "content/site.json").read_text(encoding="utf-8")))

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()

    for template in (ROOT / "templates").glob("*.html"):
        (OUT / template.name).write_text(
            render(template.read_text(encoding="utf-8"), data), encoding="utf-8"
        )

    for folder in STATIC:
        source = ROOT / folder
        if source.is_dir():
            shutil.copytree(source, OUT / folder)

    print(f"built {OUT}")


if __name__ == "__main__":
    main()
