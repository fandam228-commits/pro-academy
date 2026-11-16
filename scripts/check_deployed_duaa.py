import urllib.request
import re

url = "https://pro-academy-sfl3.vercel.app/"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as resp:
    html = resp.read().decode("utf-8")

for m in re.finditer(r'<script[^>]*src="([^"]+)"', html):
    print("SCRIPT TAG:", m.group(1))

# Check build ID or hash
build_id = re.search(r'"buildId":"([^"]+)"', html)
if build_id:
    print("Build ID:", build_id.group(1))
