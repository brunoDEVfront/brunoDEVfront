#!/usr/bin/env python3
"""Head track from the cutout alpha (assets/subject.webm) -> track.json, 10 samples per second.

Each sample: t (s), top (head top y), cx (head centre x), in the 1080x1920 frame of aroll.mp4.
build.py uses it for the reframing camera (keeps him centred) and to tuck words behind his head.
Usage: PY track.py      (from the project folder; needs Pillow)
"""
import json
import os
import shutil
import subprocess

from PIL import Image

W, H, FPS, K = 270, 480, 10, 4   # sample size; K scales back to 1080x1920
out_dir = os.path.join('work', 'track')
os.makedirs(out_dir, exist_ok=True)
subprocess.run([shutil.which('ffmpeg') or 'ffmpeg', '-loglevel', 'error', '-y', '-c:v', 'libvpx-vp9', '-i', 'assets/subject.webm',
                '-vf', f'fps={FPS},alphaextract,scale={W}:{H}', os.path.join(out_dir, 'a_%04d.png')], check=True)
samples = []
for k, name in enumerate(sorted(f for f in os.listdir(out_dir) if f.startswith('a_'))):
    im = Image.open(os.path.join(out_dir, name)).convert('L')
    px = im.load()
    top = next((y for y in range(H) if sum(px[x, y] > 64 for x in range(W)) >= 4), None)   # soft hair edge counts
    if top is None:
        samples.append({'t': round(k / FPS, 2), 'top': None, 'cx': None})
        continue
    xs = [x for y in range(top + 4, min(H, top + 50)) for x in range(W) if px[x, y] > 64]   # crown to mid-face
    samples.append({'t': round(k / FPS, 2), 'top': top * K, 'cx': round(sum(xs) / len(xs) * K, 1) if xs else None})
with open('track.json', 'w', encoding='utf-8') as fh:
    json.dump(samples, fh)
print(f'{len(samples)} samples')
for s in samples[::10]:
    print(f"t {s['t']:5.1f}  top {s['top']}  cx {s['cx']}")
