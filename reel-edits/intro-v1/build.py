#!/usr/bin/env python3
"""/video-edit build: intro of the barbershop reel (talking head, 26s). Bold look + motion layers BEHIND the speaker.

Story beats (motion-design: primary = kinetic words, secondary = props on the wall, ambient = light + bokeh):
  hook      "fala rapaziada... como empreendedor"   blur-to-focus open, 'empreendedor' tucked behind the head
  dor       "dificuldade absurda... produção, operação"   punch-in, 'absurda' behind the head
  rotina    "cortando o cabelo / barba / celular"   scissors + razor badges, then a buzzing phone with an unread counter
  canais    "whatsapp... clientes... instagram"   notification cards stack up on the wall (the pain, piling up)
  solucao   "então, com essa dor... uma solução"   cards swept away, 'dor' then 'solução' behind the head, warm glow
  teaser    "como que funciona essa solução?"   slow push-in, soft blur exit into the next part (the system demo)

Machinery from the skill template: bold words with blur-pop, cut punches, grades, SFX lanes, SAFE_GUIDE.
New here: reframing camera from track.json (track.py), behind-head placement from the same track, wall props.

PY build.py            writes index.html
PY build.py --safe     same + red Instagram safe-zone guide (snapshots only, never render with it)
"""
import json
import math
import os
import re
import shutil
import subprocess
import sys

SAFE = '--safe' in sys.argv or bool(os.environ.get('SAFE'))
DUR = float(subprocess.run([shutil.which('ffprobe') or 'ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                            'stream=duration', '-of', 'csv=p=0', 'assets/aroll.mp4'],
                           capture_output=True, encoding='utf-8', errors='replace').stdout.strip().split(',')[0])
YEL = '#FAE67A'
with open('segments.json', encoding='utf-8') as _f:
    SEG = {s['id']: s for s in json.load(_f)}
# cut times = exact first frame of each segment, nudged 2ms early so a tl.set lands ON that frame
T = {k: s['frame'] / 30 - .002 if s['frame'] else 0.0 for k, s in SEG.items()}
CUTS = [T['dor'], T['rotina'], T['teaser']]
# reframes inside a continuous take (no audio cut): a digital punch at a quiet dip between two sentences
R1 = SEG['dor']['frame'] / 30 + (9.84 - SEG['dor']['src_in'])        # "...operação." | "Como que funciona?"
R2 = SEG['rotina']['frame'] / 30 + (20.97 - SEG['rotina']['src_in'])  # "...pelo Instagram." | "Então"


# ------------------------------------------------------------------ word times (words.json, cut clock)
def _norm(s):
    return re.sub(r'[^\wà-ú]', '', s.lower())


with open('words.json', encoding='utf-8') as _f:
    WORDS = [(_norm(w['text']), w['start']) for w in json.load(_f)]


def at(word, n=1):
    """start of the n-th occurrence of a word in the cut"""
    hits = [t for w, t in WORDS if w == _norm(word)]
    if len(hits) < n:
        raise SystemExit(f'word not found: {word} #{n} (have {len(hits)})')
    return hits[n - 1]


# ------------------------------------------------------------------ head track -> camera
with open('track.json', encoding='utf-8') as _f:
    TRK = json.load(_f)


def _fill(vals):
    out, last = [], next(v for v in vals if v is not None)
    for v in vals:
        last = v if v is not None else last
        out.append(last)
    return out


def _gauss(vals, sigma):
    r = int(sigma * 3)
    ker = [math.exp(-(k * k) / (2 * sigma * sigma)) for k in range(-r, r + 1)]
    out = []
    for i in range(len(vals)):
        acc = wsum = 0.0
        for k, w in zip(range(-r, r + 1), ker):
            j = min(max(i + k, 0), len(vals) - 1)
            acc += vals[j] * w
            wsum += w
        out.append(acc / wsum)
    return out


TT = [s['t'] for s in TRK]
CX = _gauss(_fill([s['cx'] for s in TRK]), 6)     # 0.6s: the camera follows, it never chases
TOP = _gauss(_fill([s['top'] for s in TRK]), 2)


def _interp(series, t):
    if t <= TT[0]:
        return series[0]
    if t >= TT[-1]:
        return series[-1]
    i = int(t * 10)
    i = min(i, len(TT) - 2)
    f = (t - TT[i]) / (TT[i + 1] - TT[i])
    return series[i] + (series[i + 1] - series[i]) * f


def cx_at(t):
    return _interp(CX, t)


# (start, end, zoom at start, zoom at end): alternate wide / close at every sentence change, slow pushes where it calms
CAM = [(0.0, T['dor'], 1.06, 1.08), (T['dor'], R1, 1.17, 1.19), (R1, T['rotina'], 1.07, 1.08),
       (T['rotina'], R2, 1.04, 1.07), (R2, T['teaser'], 1.13, 1.18), (T['teaser'], DUR, 1.10, 1.21)]
FOLLOW = .9
OX, OY = 540, 653   # transform origin of #cam (50% 34%): zooms pivot on his face, so the head keeps its headroom


def zoom_at(t):
    for a, b, s0, s1 in CAM:
        if a <= t < b:
            return s0 + (s1 - s0) * (t - a) / (b - a)
    return CAM[-1][3]


def tx_at(t):
    a, b, s0, s1 = next(c for c in CAM if c[0] <= t < c[1]) if t < DUR else CAM[-1]
    lim = OX * (min(s0, s1) - 1)
    return max(-lim, min(lim, -(cx_at(t) - OX) * zoom_at(t) * FOLLOW))


def camera():
    tw = []
    for a, b, s0, s1 in CAM:
        tw.append(f"tl.set('#cam',{{scale:{s0},x:{tx_at(a):.1f}}},{a:.3f});")
        tw.append(f"tl.fromTo('#cam',{{scale:{s0}}},{{scale:{s1},duration:{b - a:.3f},ease:'sine.inOut',immediateRender:false}},{a:.3f});")
        t, kf = a, []
        while t + .1 < b:
            t = round(t + .1, 3)
            kf.append(f"{{x:{tx_at(min(t, b - .01)):.1f},duration:.1,ease:'none'}}")
        if kf:
            tw.append(f"tl.to('#cam',{{keyframes:[{','.join(kf)}]}},{a:.3f});")
    # every cut and reframe lands with a small punch; the opening blurs into focus
    for t in CUTS + [R1, R2]:
        if t == T['teaser']:
            continue   # the teaser gets a slow push instead
        tw.append(f"tl.fromTo('#stage',{{scale:1.05}},{{scale:1,duration:.32,ease:'power2.out',immediateRender:false}},{t:.3f});")
    tw += ["gsap.set('#stage',{filter:'blur(18px) brightness(1.3)',scale:1.06});",
           "tl.to('#stage',{filter:'blur(0px) brightness(1)',scale:1,duration:.5,ease:'power3.out'},0);",
           "tl.set('#stage',{filter:'none'},.52);",
           # soft exit into the next part (the system demo): blur + lift, captions out
           f"tl.to('#stage',{{filter:'blur(14px) brightness(1.35)',duration:.32,ease:'power2.in'}},{DUR - .34:.3f});",
           f"tl.to('#front',{{autoAlpha:0,duration:.22,ease:'power2.in'}},{DUR - .3:.3f});"]
    return tw


def to_content(sx, sy, t):
    """screen point -> #cam content point at time t"""
    s, tx = zoom_at(t), tx_at(t)
    return OX + (sx - OX - tx) / s, OY + (sy - OY) / s


def to_screen(x, y, t):
    s, tx = zoom_at(t), tx_at(t)
    return OX + (x - OX) * s + tx, OY + (y - OY) * s


# ------------------------------------------------------------------ captions (front) + behind-head words
C = 'left:0;right:0;text-align:center;'
POS = {'L1': C + 'top:1010px', 'L2': C + 'top:1100px', 'L3': C + 'top:1190px', 'M': C + 'top:1092px'}
SIZE = {'sm': 84, 'md': 150, 'xl': 220, 'big': 236}
GROUPS = [  # each group replaces the previous one: [(text, (word, n), classes, place)]  place BACK = behind the head
    [('fala rapaziada,', ('fala', 1), 'sm', 'L1'), ('beleza?', ('beleza', 1), 'md y', 'M')],
    [('eu quero passar', ('eu', 1), 'sm', 'L1'), ('uma visão', ('uma', 1), 'sm', 'L2'), ('aqui pra vocês', ('aqui', 1), 'sm', 'L3')],
    [('como', ('como', 1), 'sm', 'L1'), ('empreendedor', ('empreendedor', 1), 'md y back', 'BACK'), ('tá bom?', ('tá', 1), 'sm', 'L2')],
    [('o que que', ('o', 1), 'sm', 'L1'), ('acontece?', ('acontece', 1), 'md y', 'M')],
    [('eu tenho uma', ('eu', 2), 'sm', 'L1'), ('dificuldade', ('dificuldade', 1), 'md', 'M'), ('absurda', ('absurda', 1), 'xl y back', 'BACK')],
    [('aqui na minha', ('aqui', 2), 'sm', 'L1'), ('produção,', ('produção', 1), 'md', 'M')],
    [('na minha', ('na', 2), 'sm', 'L1'), ('operação.', ('operação', 1), 'md y', 'M')],
    [('como que', ('como', 2), 'sm', 'L1'), ('funciona?', ('funciona', 1), 'md y', 'M')],
    [('eu tô aqui', ('eu', 3), 'sm', 'L1'), ('cortando o cabelo,', ('cortando', 1), 'sm', 'L2')],
    [('tô fazendo uma', ('tô', 2), 'sm', 'L1'), ('barba', ('barba', 1), 'md y', 'M')],
    [('e eu não consigo', ('e', 1), 'sm', 'L1'), ('dar atenção', ('dar', 1), 'sm', 'L2')],
    [('no meu', ('no', 1), 'sm', 'L1'), ('celular,', ('celular', 1), 'md y', 'M')],
    [('não consigo', ('não', 2), 'sm', 'L1'), ('dar atenção no meu', ('dar', 2), 'sm', 'L2')],
    [('whatsapp,', ('whatsapp', 1), 'md y', 'M')],
    [('nos meus clientes', ('nos', 1), 'sm', 'L1'), ('que vêm até mim', ('vêm', 1), 'sm', 'L2')],
    [('pelo', ('pelo', 1), 'sm', 'L1'), ('whatsapp,', ('whatsapp', 2), 'md y', 'M')],
    [('pelo', ('pelo', 2), 'sm', 'L1'), ('instagram.', ('instagram', 1), 'md y', 'M')],
    [('então,', ('então', 1), 'sm', 'L1'), ('com essa', ('com', 1), 'sm', 'L2'), ('dor,', ('dor', 1), 'xl back', 'BACK')],
    [('eu fui em busca', ('eu', 5), 'sm', 'L1'), ('de uma', ('de', 1), 'sm', 'L2')],
    [('solução.', ('solução', 1), 'xl y back', 'BACK')],
    [('como que funciona', ('como', 3), 'sm', 'L1'), ('essa solução?', ('essa', 2), 'md y', 'M')],
]
BOUNDS = sorted(CUTS + [R1, R2])


def group_spans():
    """(start, end, lines) per group: a group ends where the next one starts, and never crosses a cut or reframe"""
    starts = [min(at(*w[1]) for w in g) for g in GROUPS]
    out = []
    for i, g in enumerate(GROUPS):
        a = max(0.0, starts[i] - .05)
        b = starts[i + 1] - .05 if i + 1 < len(GROUPS) else DUR
        nxt = next((c for c in BOUNDS if a + .1 < c <= b + .06), None)
        out.append((a, min(b, nxt) if nxt else b, g))
    return out


def back_style(text, size, a, b):
    """behind-head placement in #cam content coords: baseline ~30% of the x-height below the head top (layout.md),
    the word centred on his head, kept inside the safe zone on screen"""
    samples = [x / 10 for x in range(int(a * 10), int(b * 10) + 1)]
    head_top = min(_interp(TOP, t) for t in samples)        # highest head point while the word is up
    tm = (a + b) / 2
    s = zoom_at(tm)
    # Inter Tight 900 at line-height .9: baseline ~.82em below the box top, x-height ~.5em, ~.6em per letter.
    # Shrink the word until it fits the width and its top stays inside the safe zone with the baseline where it belongs.
    for size in [size * f for f in (1, .92, .84, .76, .7)]:
        top = head_top + .2 * size - .82 * size               # baseline 40% of the x-height below the head top: tucked, still ~70% visible
        w = len(text) * .6 * size * s
        if w <= 980 and to_screen(0, top + .1 * size, tm)[1] >= 226:
            break
    top = max(top, to_content(0, 226, tm)[1] - .1 * size)
    hx, _ = to_screen(cx_at(tm), 0, tm)
    hx = max(50 + w / 2, min(1030 - w / 2, hx))
    cx, _ = to_content(hx, 0, tm)
    return f'left:{cx - 700:.0f}px;width:1400px;text-align:center;top:{top:.0f}px;font-size:{size:.0f}px'


def words():
    front, back, tw = [], [], []
    for g, (a, b, lines) in enumerate(group_spans()):
        for k, (txt, key, cls, place) in enumerate(lines):
            t = at(*key)
            wid = f'w{g}-{k}'
            if place == 'BACK':
                st = back_style(txt, SIZE[cls.split()[0]], t, b)
                back.append(f'<div id="{wid}" class="dw {cls}" style="{st}">{txt}</div>')
            else:
                front.append(f'<div id="{wid}" class="dw {cls}" style="{POS[place]}">{txt}</div>')
            t_in = max(a, t - .05)
            d_in = min(.2, max(.08, b - .12 - t_in))   # a late word in a short group must land before the group blurs out
            tw.append(f"gsap.set('#{wid}',{{autoAlpha:0}});")
            tw.append(f"tl.fromTo('#{wid}',{{autoAlpha:0,scale:1.22,filter:'blur(22px)'}},{{autoAlpha:1,scale:1,filter:'blur(0px)',"
                      f"duration:{d_in:.2f},ease:'power3.out',immediateRender:false}},{t_in:.3f});")
            if b < DUR - .01:
                tw.append(f"tl.to('#{wid}',{{autoAlpha:0,scale:.96,filter:'blur(16px)',duration:.12,ease:'power2.in'}},{b - .12:.3f});")
                tw.append(f"tl.set('#{wid}',{{autoAlpha:0}},{b:.3f});")
    return front, back, tw


# ------------------------------------------------------------------ ambient layer: bokeh + glows (behind him)
def _r(i, k):
    v = math.sin(i * 12.9898 + k * 78.233) * 43758.5453
    return v - math.floor(v)


ORBS = 10
ORB_COL = ['255,196,130', '255,86,70', '255,236,205']   # lamp amber, the shop's red LED, soft white


def ambient():
    html, tw = [], []
    for i in range(ORBS):
        size = 70 + 120 * _r(i, 1)
        x, y = 40 + 1000 * _r(i, 2), 260 + 1050 * _r(i, 3)
        col = ORB_COL[i % 3]
        a = .16 + .18 * _r(i, 4)
        html.append(f'<div id="orb{i}" class="orb" style="left:{x - size / 2:.0f}px;top:{y - size / 2:.0f}px;width:{size:.0f}px;'
                    f'height:{size:.0f}px;background:radial-gradient(circle,rgba({col},{a:.2f}) 0%,rgba({col},{a * .45:.2f}) 38%,rgba({col},0) 70%)"></div>')
        rise, per = 70 + 90 * _r(i, 5), 5 + 4 * _r(i, 6)
        reps = max(0, int(DUR / per) - 1)
        tw += [f"gsap.set('#orb{i}',{{autoAlpha:0}});",
               f"tl.to('#orb{i}',{{autoAlpha:1,duration:1.2,ease:'sine.out'}},{.2 + .15 * i:.2f});",
               f"tl.fromTo('#orb{i}',{{y:0,x:0}},{{y:{-rise:.0f},x:{(_r(i, 7) - .5) * 60:.0f},duration:{per:.2f},repeat:{reps},yoyo:true,"
               f"ease:'sine.inOut',immediateRender:false}},0);"]
    # the pain section: a red pulse behind him on every burst of messages; relief: a warm gold bloom on "solução"
    html += ['<div id="redglow" class="glow"></div>', '<div id="goldglow" class="glow"></div>']
    tw += ["gsap.set(['#redglow','#goldglow'],{autoAlpha:0});",
           f"tl.to('#redglow',{{autoAlpha:.55,duration:.6,ease:'sine.out'}},{at('celular') - .1:.3f});"]
    for t in BURSTS:
        tw.append(f"tl.fromTo('#redglow',{{autoAlpha:1}},{{autoAlpha:.55,duration:.5,ease:'sine.out',immediateRender:false}},{t:.3f});")
    tw += [f"tl.to('#redglow',{{autoAlpha:0,duration:.5,ease:'power2.in'}},{at('então') + .05:.3f});",
           f"tl.fromTo('#goldglow',{{autoAlpha:0,scale:.7}},{{autoAlpha:1,scale:1,duration:.9,ease:'expo.out',immediateRender:false}},{at('solução') - .05:.3f});",
           f"tl.to('#goldglow',{{scale:1.08,autoAlpha:.8,duration:{DUR - at('solução') - .9:.2f},ease:'sine.inOut'}},{at('solução') + .85:.3f});"]
    return html, tw


# ------------------------------------------------------------------ wall props: scissors, razor, phone, messages
def side_free(t):
    """which wall is free at time t: the side away from his head"""
    return 'left' if cx_at(t) > OX else 'right'


SCISSORS = '''<svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
<g class="bA"><path d="M50 50 L88 18"/><path d="M50 50 L36 62"/><circle cx="26" cy="71" r="11"/></g>
<g class="bB"><path d="M50 50 L88 82"/><path d="M50 50 L36 38"/><circle cx="26" cy="29" r="11"/></g>
<circle cx="50" cy="50" r="3.5" fill="#fff"/></svg>'''
RAZOR = '''<svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
<g class="rb"><rect x="20" y="14" width="60" height="20" rx="6"/><path d="M26 24 H74" stroke-width="3" opacity=".6"/>
<path d="M50 34 V42"/><rect x="43" y="42" width="14" height="46" rx="7"/><path d="M45 56 H55 M45 64 H55 M45 72 H55" stroke-width="3"/></g></svg>'''
BUBBLE = '<svg viewBox="0 0 40 40"><path d="M20 7c-7.7 0-14 5.4-14 12 0 3 1.3 5.8 3.5 7.9L8 33l6.8-2.6c1.6.5 3.4.8 5.2.8 7.7 0 14-5.4 14-12S27.7 7 20 7z" fill="#fff"/></svg>'
PLANE = '<svg viewBox="0 0 40 40"><path d="M7 19.5 33 8l-8 25-5.6-9.6L7 19.5zm12.4 3.9 4.4-6.6" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg>'

# unread messages: generic placeholder clients (never real people)
MSGS = [('wa', 'Lucas', 'Tem horário hoje às 18h?'), ('wa', 'Rafael', 'Quanto tá o corte + barba?'),
        ('wa', 'Pedro', 'Oi, tá aberto agora?'), ('ig', 'Mariana', 'Vi seu trabalho, tem vaga amanhã?'),
        ('wa', 'João', 'Posso remarcar pra sexta?'), ('wa', 'Thiago', 'Chego em 10 min, segura pra mim'),
        ('ig', 'Diego', 'Quanto tá a pigmentação?'), ('ig', 'Ana', 'Tem horário sábado de manhã?')]
BURSTS = []   # filled in props(): the moments a burst of messages lands (for the red pulse and the sounds)
COUNTS = ['3', '12', '19', '31', '47']   # unread counter on the phone, one value per beat


def props():
    html, tw = [], []
    # scissors on "cortando o cabelo", razor on "barba": glass badges on the free wall, gone when the phone arrives
    t_sc, t_rz, t_ph = at('cortando'), at('barba'), at('celular')
    for bid, svg, t, spot in (('scis', SCISSORS, t_sc, 0), ('razr', RAZOR, t_rz, 1)):
        side = side_free(t + .3)
        sx = (190 if side == 'left' else 890) + (0 if spot == 0 else (40 if side == 'left' else -40))
        sy = 420 if spot == 0 else 640
        x, y = to_content(sx, sy, t + .3)
        html.append(f'<div id="{bid}" class="badge" style="left:{x - 85:.0f}px;top:{y - 85:.0f}px"><div class="ring"></div>{svg}</div>')
        tw += [f"gsap.set('#{bid}',{{autoAlpha:0,scale:.4,rotation:-20}});",
               f"tl.to('#{bid}',{{autoAlpha:1,scale:1,rotation:0,duration:.42,ease:'back.out(1.7)'}},{t - .06:.3f});",
               f"tl.fromTo('#{bid} .ring',{{scale:1,autoAlpha:.7}},{{scale:1.7,autoAlpha:0,duration:.6,ease:'expo.out',immediateRender:false}},{t:.3f});",
               f"tl.to('#{bid}',{{y:-14,duration:1.6,yoyo:true,repeat:1,ease:'sine.inOut'}},{t + .4:.3f});",
               f"tl.to('#{bid}',{{autoAlpha:0,scale:.6,y:-30,duration:.22,ease:'power2.in'}},{t_ph - .25:.3f});",
               f"tl.set('#{bid}',{{autoAlpha:0}},{t_ph:.3f});"]
    # scissors snip twice, the razor blade swings open
    tw += [f"tl.fromTo('#scis .bA',{{rotation:0}},{{rotation:-14,duration:.14,yoyo:true,repeat:3,ease:'power2.inOut',svgOrigin:'50 50',immediateRender:false}},{t_sc + .3:.3f});",
           f"tl.fromTo('#scis .bB',{{rotation:0}},{{rotation:14,duration:.14,yoyo:true,repeat:3,ease:'power2.inOut',svgOrigin:'50 50',immediateRender:false}},{t_sc + .3:.3f});",
           f"tl.fromTo('#razr .rb',{{y:-10,rotation:-8}},{{y:12,rotation:0,duration:.32,yoyo:true,repeat:3,ease:'sine.inOut',svgOrigin:'50 50',immediateRender:false}},{t_rz + .1:.3f});"]

    # phone on "celular": buzzes on every burst of messages, the unread counter climbs
    beats = [t_ph, at('whatsapp', 1), at('clientes'), at('whatsapp', 2), at('instagram')]
    BURSTS[:] = beats[1:]
    pside = side_free(t_ph + .2)
    px, py = to_content(215 if pside == 'left' else 860, 560, t_ph + .2)
    counts = ''.join(f'<span id="cnt{k}" class="cnt">{c}</span>' for k, c in enumerate(COUNTS))
    html.append(f'<div id="phone" style="left:{px - 125:.0f}px;top:{py - 250:.0f}px"><div class="scr"><div class="isl"></div>'
                f'<div class="num">{counts}</div><div class="lbl">mensagens<br>não lidas</div>'
                f'<div class="rows"><i class="g"></i><i class="p"></i><i class="g"></i></div></div><div class="badge-r">!</div></div>')
    rot = -8 if pside == 'left' else 8
    tw += [f"gsap.set('#phone',{{autoAlpha:0,y:90,scale:.85,rotation:{rot * 1.8}}});",
           "gsap.set('.cnt',{autoAlpha:0});",
           f"tl.to('#phone',{{autoAlpha:1,y:0,scale:1,rotation:{rot},duration:.5,ease:'expo.out'}},{t_ph - .08:.3f});"]
    cx1, cy1 = to_content(175 if pside == 'left' else 900, 470, beats[1])
    tw.append(f"tl.to('#phone',{{x:{cx1 - px:.0f},y:{cy1 - py:.0f},scale:.8,duration:.45,ease:'power3.inOut'}},{beats[1] - .5:.3f});")
    for k, t in enumerate(beats):
        if k:
            tw.append(f"tl.set('#cnt{k - 1}',{{autoAlpha:0}},{t:.3f});")
        tw += [f"tl.set('#cnt{k}',{{autoAlpha:1}},{t:.3f});",
               f"tl.fromTo('#cnt{k}',{{scale:1.35}},{{scale:1,duration:.3,ease:'back.out(2.2)',immediateRender:false}},{t:.3f});",
               f"tl.to('#phone',{{keyframes:[{{rotation:{rot + 4}}},{{rotation:{rot - 4}}},{{rotation:{rot + 3}}},{{rotation:{rot - 2}}},{{rotation:{rot}}}],"
               f"duration:.36,ease:'sine.inOut'}},{t:.3f});"]

    # message cards stack on the other wall: newest on top, older ones slide down, dim and shrink (iOS-like stack)
    t_out = at('então')
    cside = 'left' if pside == 'right' else 'right'
    cx0, cy0 = to_content(255 if cside == 'left' else 825, 300, at('whatsapp', 1))
    per = [2, 2, 2, 2]   # cards per burst
    entries, k = [], 0
    for b, n in zip(BURSTS, per):
        for j in range(n):
            entries.append((k, b + j * .09))
            k += 1
    for i, (src, name, msg) in enumerate(MSGS):
        app = 'WhatsApp' if src == 'wa' else 'Instagram'
        icon = BUBBLE if src == 'wa' else PLANE
        html.append(f'<div id="msg{i}" class="msg" style="left:{cx0 - 215:.0f}px;top:{cy0:.0f}px"><div class="ic {src}">{icon}</div>'
                    f'<div class="tx"><div class="ap">{app} · agora</div><div class="nm">{name}</div><div class="ms">{msg}</div></div></div>')
    for i, t in entries:
        tw += [f"gsap.set('#msg{i}',{{autoAlpha:0}});",
               f"tl.fromTo('#msg{i}',{{autoAlpha:0,y:-70,scale:.9,filter:'blur(10px)'}},{{autoAlpha:1,y:0,scale:1,filter:'blur(0px)',"
               f"duration:.38,ease:'expo.out',immediateRender:false}},{t:.3f});"]
        later = [u for j, u in entries if j > i]
        for slot, u in enumerate(later, 1):
            dim = max(0, 1 - .16 * slot) if slot < 5 else 0
            tw.append(f"tl.to('#msg{i}',{{y:{slot * 128},scale:{.97 ** slot:.3f},autoAlpha:{dim:.2f},duration:.34,ease:'power3.out'}},{u:.3f});")
        # "então": swept off the wall, newest first, accelerating out
        tw += [f"tl.to('#msg{i}',{{x:{-260 if cside == 'left' else 260},y:'-=60',autoAlpha:0,filter:'blur(12px)',duration:.3,"
               f"ease:'power2.in'}},{t_out + .03 * (len(entries) - i):.3f});",
               f"tl.set('#msg{i}',{{autoAlpha:0}},{t_out + .6:.3f});"]
    tw += [f"tl.to('#phone',{{autoAlpha:0,scale:.7,y:60,rotation:{rot * 2},duration:.3,ease:'power2.in'}},{t_out + .05:.3f});",
           f"tl.set('#phone',{{autoAlpha:0}},{t_out + .4:.3f});"]
    return html, tw


# ------------------------------------------------------------------ light: one sweep on "solução"
def light():
    t = at('solução')
    html = ['<div id="sweep" class="fx"></div>']
    tw = ["gsap.set('#sweep',{autoAlpha:0});",
          f"tl.set('#sweep',{{autoAlpha:1}},{t + .05:.3f});",
          f"tl.fromTo('#sweep',{{backgroundPosition:'130% 0%'}},{{backgroundPosition:'-30% 0%',duration:1.1,ease:'power2.inOut',"
          f"immediateRender:false}},{t + .05:.3f});",
          f"tl.set('#sweep',{{autoAlpha:0}},{t + 1.2:.3f});"]
    return html, tw


BG_F = 'contrast(1.08) saturate(.9) brightness(.86)'      # the room steps back
SUBJ_F = 'contrast(1.05) saturate(.97) brightness(1.05)'  # he stays lit (the relight)

SFX_LEN = {'whoosh-short': .57, 'pop': .72, 'sparkle': 1.8, 'click': .37, 'click-soft': .37, 'impact-bass-1': 2.1}
SFX_GAIN = 0.75   # sounds sit 25% under the original levels: subtle, never louder than the voice


def sfx_list():
    s = [('whoosh-short', .02, .22), ('whoosh-short', T['dor'], .2), ('whoosh-short', T['rotina'], .2),
         ('click', at('cortando') + .3, .3), ('click-soft', at('barba'), .28), ('pop', at('celular'), .16),
         ('pop', at('absurda'), .14), ('whoosh-short', at('então'), .28), ('sparkle', at('solução'), .24),
         ('impact-bass-1', T['teaser'], .18)]
    s += [('click-soft', t, .32) for t in BURSTS]
    return s


def audio():
    out, lanes = [], []
    for k, (name, t, vol) in enumerate(sorted(sfx_list(), key=lambda x: x[1])):
        d = min(SFX_LEN[name], DUR - t)
        lane = next((i for i, end in enumerate(lanes) if end <= t), None)
        if lane is None:
            lanes.append(0)
            lane = len(lanes) - 1
        lanes[lane] = t + d
        out.append(f'<audio id="sfx{k}" src="assets/sfx/{name}.mp3" data-start="{t:.3f}" data-duration="{d:.3f}" '
                   f'data-track-index="{10 + lane}" data-volume="{vol * SFX_GAIN:.3f}"></audio>')
    return out


CSS = f'''
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1920px;overflow:hidden;background:#000}}
#root{{position:relative;width:1080px;height:1920px;overflow:hidden;background:#000}}
#cam{{position:absolute;inset:0;transform-origin:50% 34%}}
#stage{{position:absolute;inset:0;transform-origin:50% 45%}}
.full{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}}
#bgv{{z-index:0;filter:{BG_F}}}
#glare{{position:absolute;inset:0;z-index:1;background:radial-gradient(300px 260px at 70px 300px,rgba(0,0,0,.5),rgba(0,0,0,0) 100%);mix-blend-mode:multiply}}
.orb{{position:absolute;z-index:2;border-radius:50%}}
.glow{{position:absolute;z-index:2;left:90px;top:160px;width:900px;height:900px;border-radius:50%}}
#redglow{{background:radial-gradient(circle,rgba(255,52,40,.30) 0%,rgba(255,52,40,.12) 40%,rgba(255,52,40,0) 70%);mix-blend-mode:screen}}
#goldglow{{background:radial-gradient(circle,rgba(250,230,122,.5) 0%,rgba(250,210,120,.22) 42%,rgba(250,210,120,0) 70%);mix-blend-mode:screen}}
.dw.back{{z-index:3}}
#cutwrap{{position:absolute;inset:0;z-index:6}}
#cut{{filter:{SUBJ_F}}}

/* wall props (behind him) */
.badge{{position:absolute;z-index:4;width:170px;height:170px;border-radius:50%;background:rgba(16,16,18,.74);
  border:2px solid rgba(255,255,255,.16);box-shadow:0 24px 60px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center}}
.badge svg{{width:96px;height:96px;overflow:visible}}
.badge .ring{{position:absolute;inset:-4px;border-radius:50%;border:4px solid {YEL}}}
#phone{{position:absolute;z-index:4;width:250px;height:500px;border-radius:44px;background:#0b0b0d;padding:10px;
  box-shadow:0 0 0 2px rgba(255,255,255,.14),0 40px 90px rgba(0,0,0,.6)}}
#phone .scr{{position:relative;width:100%;height:100%;border-radius:36px;overflow:hidden;
  background:linear-gradient(170deg,#1d2230 0%,#121418 60%,#0d0e10 100%)}}
#phone .isl{{position:absolute;left:50%;top:12px;width:78px;height:22px;margin-left:-39px;border-radius:12px;background:#000}}
#phone .num{{position:absolute;left:0;right:0;top:88px;height:130px;text-align:center}}
#phone .cnt{{position:absolute;left:0;right:0;font:900 124px 'Inter Tight';letter-spacing:-.05em;color:#fff;line-height:1}}
#phone .lbl{{position:absolute;left:0;right:0;top:226px;text-align:center;font:600 24px Inter;color:#a9adb8;line-height:1.2}}
#phone .rows{{position:absolute;left:18px;right:18px;top:318px}}
#phone .rows i{{display:block;height:34px;margin-bottom:10px;border-radius:12px;background:rgba(255,255,255,.08);position:relative}}
#phone .rows i::before{{content:'';position:absolute;left:10px;top:9px;width:16px;height:16px;border-radius:5px}}
#phone .rows i.g::before{{background:#2fbe63}}
#phone .rows i.p::before{{background:linear-gradient(135deg,#f6a03a,#d6326f,#7a3fc0)}}
#phone .badge-r{{position:absolute;right:-16px;top:-16px;width:56px;height:56px;border-radius:50%;background:#ff3b30;color:#fff;
  font:900 34px 'Inter Tight';display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(255,59,48,.45)}}
.msg{{position:absolute;z-index:4;width:430px;height:116px;border-radius:30px;background:rgba(24,24,28,.9);
  border:1.5px solid rgba(255,255,255,.1);box-shadow:0 22px 50px rgba(0,0,0,.45);display:flex;align-items:center;padding:0 22px;
  transform-origin:50% 0%}}
.msg .ic{{flex:0 0 66px;height:66px;border-radius:18px;display:flex;align-items:center;justify-content:center;margin-right:18px}}
.msg .ic svg{{width:40px;height:40px}}
.msg .ic.wa{{background:#2fbe63}}
.msg .ic.ig{{background:linear-gradient(135deg,#f6a03a 0%,#d6326f 55%,#7a3fc0 100%)}}
.msg .tx{{min-width:0;flex:1}}
.msg .ap{{font:600 19px Inter;color:#8e8e96;letter-spacing:.06em;text-transform:uppercase}}
.msg .nm{{font:600 27px Inter;color:#fff;margin-top:2px}}
.msg .ms{{font:500 24px Inter;color:#d2d2d8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}

/* look overlays (bold) */
.fx{{position:absolute;inset:0;pointer-events:none}}
#dtone{{z-index:7;background:linear-gradient(180deg,rgba(20,55,75,.14),rgba(70,45,20,.10));mix-blend-mode:soft-light}}
#dvig{{z-index:7;background:radial-gradient(95% 62% at 50% 44%,rgba(0,0,0,0) 55%,rgba(0,0,0,.46) 100%)}}
#dgrad{{z-index:7;background:linear-gradient(180deg,rgba(0,0,0,.36) 0%,rgba(0,0,0,0) 20%,rgba(0,0,0,0) 56%,rgba(0,0,0,.34) 100%)}}
#sweep{{z-index:7;mix-blend-mode:screen;background:linear-gradient(105deg,rgba(255,240,210,0) 38%,rgba(255,240,210,.24) 50%,rgba(255,240,210,0) 62%);
  background-size:260% 100%;background-repeat:no-repeat}}

/* bold type */
#front{{position:absolute;inset:0;z-index:8}}
.dw{{position:absolute;z-index:8;color:#fff;font-family:'Inter Tight';font-weight:900;letter-spacing:-.05em;line-height:.9;
  text-shadow:0 10px 40px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.35);transform-origin:50% 60%;white-space:nowrap}}
.sm{{font-size:84px;font-weight:800;letter-spacing:-.04em}}
.md{{font-size:150px}}
.xl{{font-size:220px}}
.big{{font-size:236px}}
.y{{color:{YEL}}}
'''

# PY build.py --safe: draws the Instagram safe zone (red = UI covers it) for snapshot checks, never for renders
SAFE_GUIDE = ('<div style="position:absolute;inset:0;z-index:99;pointer-events:none">'
              '<div style="position:absolute;left:0;right:0;top:0;height:220px;background:rgba(255,0,0,.28)"></div>'
              '<div style="position:absolute;left:0;right:0;top:1470px;bottom:0;background:rgba(255,0,0,.28)"></div>'
              '<div style="position:absolute;left:0;width:35px;top:220px;height:1250px;background:rgba(255,0,0,.28)"></div>'
              '<div style="position:absolute;right:0;width:35px;top:220px;height:935px;background:rgba(255,0,0,.28)"></div>'
              '<div style="position:absolute;right:0;width:100px;top:1155px;height:315px;background:rgba(255,0,0,.28)"></div></div>')


def build():
    p_html, p_tw = props()          # first: fills BURSTS for the glows and the sounds
    front, back, w_tw = words()
    a_html, a_tw = ambient()
    l_html, l_tw = light()
    tweens = camera() + a_tw + p_tw + w_tw + l_tw
    nl = '\n'
    return f'''<!doctype html>
<html lang="pt-BR" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<link rel="stylesheet" href="assets/fonts/fonts.css" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>{CSS}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{DUR:.3f}" data-width="1080" data-height="1920">
  <audio id="bga" src="assets/aroll.mp4" data-start="0" data-media-start="0" data-duration="{DUR:.3f}" data-track-index="2" data-volume="1"></audio>
{nl.join(audio())}
  <div id="cam"><div id="stage">
    <video id="bgv" class="full" src="assets/aroll.mp4" muted playsinline data-start="0" data-media-start="0" data-duration="{DUR:.3f}" data-track-index="0"></video>
    <div id="glare"></div>
{nl.join(a_html)}
{nl.join(back)}
{nl.join(p_html)}
    <div id="cutwrap"><video id="cut" class="full" src="assets/subject.webm" muted playsinline data-start="0" data-media-start="0" data-duration="{DUR:.3f}" data-track-index="1"></video></div>
  </div></div>
  <div id="dtone" class="fx"></div><div id="dvig" class="fx"></div><div id="dgrad" class="fx"></div>
{nl.join(l_html)}
  <div id="front">
{nl.join(front)}
  </div>
{SAFE_GUIDE if SAFE else ''}
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{nl.join(tweens)}
tl.set({{}}, {{}}, {DUR:.3f});
window.__timelines["main"] = tl;
</script>
</body>
</html>
'''


# utf-8 on every OS: the page declares charset UTF-8, and Windows would otherwise write cp1252 (broken accents)
with open('index.html', 'w', encoding='utf-8', newline='\n') as _f:
    _f.write(build())
print(f'wrote index.html {DUR:.3f}s  cuts {[round(c, 3) for c in CUTS]}  reframes {R1:.3f} {R2:.3f}  bursts {[round(b, 2) for b in BURSTS]}')
