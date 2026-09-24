#!/usr/bin/env python3
"""Bundle the game into a single self-contained HTML file.

All stylesheets and scripts referenced by index.html are inlined, so the
result can be opened, emailed or hosted on its own.

Usage:
  python3 tools/bundle.py [out.html] [--fragment]

  --fragment  leave out the <!doctype>/<html>/<head>/<body> wrapper, for
              hosts that supply their own page skeleton.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
        return f.read()


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    fragment = '--fragment' in sys.argv
    out = args[0] if args else os.path.join(ROOT, 'dist', 'aimon.html')

    html = read('index.html')
    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">',
                  lambda m: '<style>\n' + read(m.group(1)) + '</style>', html)
    html = re.sub(r'<script src="([^"]+)"></script>',
                  lambda m: '<script>\n' + read(m.group(1)).replace('</script', '<\\/script') + '</script>', html)

    if fragment:
        head = re.search(r'<head>(.*)</head>', html, re.S).group(1)
        body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
        keep = ''.join(re.findall(r'<title>.*?</title>|<style>.*?</style>', head, re.S))
        html = keep + '\n' + body

    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'wrote {out} ({len(html) // 1024} KB)')


if __name__ == '__main__':
    main()
