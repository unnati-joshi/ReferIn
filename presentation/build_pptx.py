#!/usr/bin/env python3
"""Build the ReferIn pitch deck as a self-contained .pptx.

On-theme (warm paper + petrol + teal + clay), real app screenshots, a drawn
architecture flow and a comparison table. All copy is written with no em or en
dashes anywhere.
"""
import os
from PIL import Image
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

HERE = os.path.dirname(os.path.abspath(__file__))
SCREENS = os.path.join(HERE, "screens")
ASSETS = os.path.join(HERE, "_deck_assets")
os.makedirs(ASSETS, exist_ok=True)
OUT = os.path.join(HERE, "ReferIn-Pitch.pptx")
LOGO_PAPER = os.path.join(ASSETS, "logo_petrol.png")   # petrol tile, white glyph
LOGO_LIGHT = os.path.join(ASSETS, "logo_light.png")    # paper tile, petrol glyph

# ---- palette ---------------------------------------------------------------
PAPER   = RGBColor(0xF7, 0xF3, 0xEC)
PAPER2  = RGBColor(0xFB, 0xF8, 0xF3)
INK     = RGBColor(0x15, 0x53, 0x5F)   # petrol
TEAL    = RGBColor(0x0E, 0x93, 0x84)
CLAY    = RGBColor(0xC0, 0x55, 0x2A)
MUTED   = RGBColor(0x5E, 0x6B, 0x6C)
LINE    = RGBColor(0xDD, 0xD6, 0xC8)
PAPERTX = RGBColor(0xF2, 0xEE, 0xE6)   # light text on petrol
GREENBG = RGBColor(0xE4, 0xF2, 0xEC)

HEAD = "Georgia"        # serif display, ships on Windows + macOS
BODY = "Calibri"        # default Office body
MONO = "Consolas"       # default Office mono

# ---- references ------------------------------------------------------------
ADLER_URL = ("https://www.linkedin.com/pulse/"
             "new-survey-reveals-85-all-jobs-filled-via-networking-lou-adler")
JOBVITE_URL = "https://www.jobvite.com/blog/4-reasons-to-invest-in-employee-referrals/"

TEAM_NAME = "Ori"
MEMBERS = ["Breeti Bandyopadhyay", "Unnati Joshi", "Aishwarya Mol",
           "Mishti Kinker", "Mohana"]

EMU_IN = 914400
SW, SH = 13.333, 7.5
TOTAL = 16          # total slide count, shown in the page footer

prs = Presentation()
prs.slide_width  = Inches(SW)
prs.slide_height = Inches(SH)
BLANK = prs.slide_layouts[6]


# ---- helpers ---------------------------------------------------------------
def render_logo():
    """Draw the ReferIn referral-path mark (from favicon.svg) to PNG tiles."""
    import cairo, math

    def draw(out, tile_rgb, glyph_rgb):
        S = 1024
        surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, S, S)
        cr = cairo.Context(surf)
        r = S / 4                              # rounded tile (rx 16 of 64)
        cr.new_sub_path()
        cr.arc(S - r, r, r, -math.pi / 2, 0)
        cr.arc(S - r, S - r, r, 0, math.pi / 2)
        cr.arc(r, S - r, r, math.pi / 2, math.pi)
        cr.arc(r, r, r, math.pi, 1.5 * math.pi)
        cr.close_path()
        cr.set_source_rgb(*tile_rgb); cr.fill()
        # glyph: favicon used translate(8,8) scale(2) inside a 64 tile
        off = 8 / 64 * S; sc = 2 * S / 64
        cr.save(); cr.translate(off, off); cr.scale(sc, sc)
        cr.set_line_cap(cairo.LINE_CAP_ROUND)
        cr.set_line_join(cairo.LINE_JOIN_ROUND)
        g = glyph_rgb
        cr.set_source_rgb(*g)
        cr.arc(5.5, 6, 2.4, 0, 2 * math.pi); cr.fill()            # candidate node
        cr.set_source_rgba(*g, 0.9); cr.set_line_width(1.9)        # referral path
        cr.move_to(5.5, 8.6); cr.curve_to(5.5, 12.8, 6.7, 15.0, 11.5, 15.8)
        cr.stroke()
        cr.set_source_rgb(*g); cr.set_line_width(1.9)             # arrowhead in
        cr.move_to(9.6, 13.2); cr.line_to(11.8, 15.8); cr.line_to(8.7, 16.9)
        cr.stroke()
        cr.set_line_width(1.9)                                    # network ring
        cr.arc(16.5, 16, 4.4, 0, 2 * math.pi); cr.stroke()
        cr.arc(16.5, 16, 1.5, 0, 2 * math.pi); cr.fill()
        cr.restore()
        surf.write_to_png(out)

    draw(LOGO_PAPER, (0x15/255, 0x53/255, 0x5f/255), (1, 1, 1))
    draw(LOGO_LIGHT, (0xF2/255, 0xEE/255, 0xE6/255), (0x15/255, 0x53/255, 0x5f/255))


def slide():
    return prs.slides.add_slide(BLANK)


def bg(s, color):
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = color


def no_line(shape):
    shape.line.fill.background()


def fill(shape, color):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color


def rect(s, l, t, w, h, color=None, line=None, rounded=False, line_w=1.0):
    shp = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE,
        Inches(l), Inches(t), Inches(w), Inches(h))
    if color is None:
        shp.fill.background()
    else:
        fill(shp, color)
    if line is None:
        no_line(shp)
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(line_w)
    shp.shadow.inherit = False
    return shp


def textbox(s, l, t, w, h, anchor=MSO_ANCHOR.TOP):
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    return tf


def para(tf, text, size, color, font=BODY, bold=False, italic=False,
         first=False, space_before=0, space_after=6, align=PP_ALIGN.LEFT,
         line_spacing=1.05):
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    p.alignment = align
    p.space_before = Pt(space_before)
    p.space_after = Pt(space_after)
    p.line_spacing = line_spacing
    r = p.add_run()
    r.text = text
    r.font.size = Pt(size)
    r.font.name = font
    r.font.bold = bold
    r.font.italic = italic
    r.font.color.rgb = color
    return p


def bullet(tf, text, first=False, size=14):
    p = tf.paragraphs[0] if first else tf.add_paragraph()
    p.space_before = Pt(7)
    p.space_after = Pt(0)
    p.line_spacing = 1.06
    m = p.add_run()
    m.text = "▸  "          # ▸ triangle marker
    m.font.size = Pt(size)
    m.font.name = BODY
    m.font.bold = True
    m.font.color.rgb = TEAL
    r = p.add_run()
    r.text = text
    r.font.size = Pt(size)
    r.font.name = BODY
    r.font.color.rgb = INK
    return p


def kicker(s, l, t, text, color=TEAL):
    tf = textbox(s, l, t, 6, 0.3)
    para(tf, text.upper(), 11, color, font=MONO, bold=True, first=True,
         space_after=0)


def source_line(s, l, t, w, dark=True):
    tf = textbox(s, l, t, w, 0.4)
    p = tf.paragraphs[0]; p.space_after = Pt(0); p.line_spacing = 1.05
    base = RGBColor(0x9F, 0xB4, 0xB2) if dark else MUTED

    def run(text, link=None, color=None):
        r = p.add_run(); r.text = text
        r.font.size = Pt(8.5); r.font.name = MONO
        r.font.color.rgb = color or base
        if link:
            r.hyperlink.address = link
        return r

    run("Sources: 85% of roles filled via networking, Lou Adler, ")
    run("LinkedIn (2016)", link=ADLER_URL, color=TEAL)
    run(".  Referred candidates about 4x more likely to get an offer, ")
    run("Jobvite", link=JOBVITE_URL, color=TEAL)
    run(".")


def page_num(s, n, dark=False):
    tf = textbox(s, SW - 1.1, SH - 0.55, 0.7, 0.3)
    para(tf, f"{n:02d} / {TOTAL}", 9, PAPERTX if dark else MUTED, font=MONO,
         first=True, align=PP_ALIGN.RIGHT, space_after=0)


def brand_tag(s, l, t, dark=False, mark_size=0.34, word_size=15):
    pic = s.shapes.add_picture(LOGO_LIGHT if dark else LOGO_PAPER,
                               Inches(l), Inches(t),
                               Inches(mark_size), Inches(mark_size))
    pic.shadow.inherit = False
    tf = textbox(s, l + mark_size + 0.14, t, 4.5, mark_size,
                 anchor=MSO_ANCHOR.MIDDLE)
    p = tf.paragraphs[0]; p.space_after = Pt(0)
    r1 = p.add_run(); r1.text = "Refer"
    r2 = p.add_run(); r2.text = "In"
    for r in (r1, r2):
        r.font.size = Pt(word_size); r.font.name = HEAD; r.font.bold = True
    r1.font.color.rgb = PAPERTX if dark else INK
    r2.font.color.rgb = TEAL


def fit_box(path, box_w, box_h):
    """Return (w,h) in inches fitting image aspect inside box."""
    iw, ih = Image.open(path).size
    ratio = iw / ih
    if box_w / box_h > ratio:
        h = box_h; w = h * ratio
    else:
        w = box_w; h = w / ratio
    return w, h


def crop_top(path, target_ratio, name):
    """Crop a tall image from the top to target_ratio (w/h)."""
    im = Image.open(path)
    iw, ih = im.size
    if iw / ih >= target_ratio:
        return path
    new_h = int(iw / target_ratio)
    out = os.path.join(ASSETS, name)
    im.crop((0, 0, iw, new_h)).save(out)
    return out


def crop_region(path, box, name):
    out = os.path.join(ASSETS, name)
    Image.open(path).crop(box).save(out)
    return out


def place_image(s, path, box_l, box_t, box_w, box_h, border=True, shadow=True):
    w, h = fit_box(path, box_w, box_h)
    l = box_l + (box_w - w) / 2
    t = box_t + (box_h - h) / 2
    if shadow:
        sh = rect(s, l + 0.06, t + 0.07, w, h, color=RGBColor(0xE6, 0xDF, 0xD2))
    pic = s.shapes.add_picture(path, Inches(l), Inches(t), Inches(w), Inches(h))
    if border:
        pic.line.color.rgb = LINE
        pic.line.width = Pt(1.0)
    pic.shadow.inherit = False
    return l, t, w, h


def content_slide(n, kick, title, summary, bullets, img=None,
                  img_box=(6.9, 1.55, 5.95, 5.2), title_size=31):
    s = slide()
    bg(s, PAPER)
    rect(s, 0, 0, 0.18, SH, color=INK)          # left spine
    brand_tag(s, 0.55, 0.45)
    kicker(s, 0.6, 1.15, kick)
    tf = textbox(s, 0.6, 1.5, 5.9, 2.4)
    para(tf, title, title_size, INK, font=HEAD, bold=True, first=True,
         line_spacing=1.0, space_after=10)
    para(tf, summary, 14.5, MUTED, space_after=4, line_spacing=1.12)
    bt = textbox(s, 0.6, 4.55, 5.95, 2.5)
    for i, b in enumerate(bullets):
        bullet(bt, b, first=(i == 0))
    if img:
        place_image(s, img, *img_box)
    page_num(s, n)
    return s


render_logo()

# ===========================================================================
# Slide 1 — Hook
# ===========================================================================
s = slide()
bg(s, INK)
# faint accent band
rect(s, 0, SH - 0.9, SW, 0.9, color=RGBColor(0x10, 0x46, 0x50))
brand_tag(s, 0.7, 0.55, dark=True, mark_size=0.5, word_size=21)
# team tag, top right
ttag = textbox(s, SW - 4.7, 0.62, 4.3, 0.5)
para(ttag, "PROJECT REFERIN", 10.5, TEAL, font=MONO, bold=True, first=True,
     align=PP_ALIGN.RIGHT, space_after=2)
para(ttag, "TEAM ORI", 10.5, RGBColor(0x9F, 0xB4, 0xB2), font=MONO,
     align=PP_ALIGN.RIGHT, space_after=0)
kicker(s, 0.72, 1.05, "Find the person who can refer you in", color=TEAL)
tf = textbox(s, 0.7, 2.3, 11.9, 3.0)
para(tf, "80% of Jobs Are Filled", 52, PAPERTX, font=HEAD, bold=True,
     first=True, line_spacing=0.98, space_after=0)
para(tf, "Through Referrals", 52, TEAL, font=HEAD, bold=True,
     line_spacing=0.98, space_after=0)
tf2 = textbox(s, 0.72, 4.85, 10.5, 1.0)
para(tf2, "If you don't already know someone inside, you are applying through "
          "the slowest door. ReferIn gets you the warm intro.",
     16, RGBColor(0xC7, 0xD6, 0xD4), first=True, line_spacing=1.15)
# three stat chips
chips = ["About 4x more likely to get an offer when referred",
         "Most applicants have no insider to ask",
         "ReferIn finds the right one in seconds"]
cx = 0.72
for c in chips:
    box = rect(s, cx, 5.7, 3.85, 0.8, color=RGBColor(0x10, 0x46, 0x50),
               rounded=True)
    ctf = box.text_frame; ctf.word_wrap = True
    ctf.margin_left = Inches(0.18); ctf.margin_right = Inches(0.14)
    ctf.vertical_anchor = MSO_ANCHOR.MIDDLE
    para(ctf, c, 11.5, RGBColor(0xDF, 0xEA, 0xE8), first=True, line_spacing=1.0,
         space_after=0)
    cx += 4.02
source_line(s, 0.72, 6.85, 11.8, dark=True)
page_num(s, 1, dark=True)

# ===========================================================================
# Slide 2 — Problem (clay accent)
# ===========================================================================
s = slide()
bg(s, PAPER)
rect(s, 0, 0, 0.18, SH, color=CLAY)
brand_tag(s, 0.55, 0.45)
kicker(s, 0.6, 1.15, "The problem", color=CLAY)
tf = textbox(s, 0.6, 1.55, 7.0, 2.0)
para(tf, "Cold Applications Disappear", 34, INK, font=HEAD, bold=True,
     first=True, line_spacing=1.0, space_after=10)
para(tf, "Everyone knows referrals work. Actually getting one is the hard part.",
     15.5, MUTED, line_spacing=1.15)
problems = [
    ("Finding the right insider is manual and slow",
     "Hundreds of unfiltered profiles, no time to read them."),
    ("No signal for who actually fits your background",
     "Follower counts are not fit. You are guessing."),
    ("People burn goodwill messaging the wrong people",
     "One bad cold ask and the door closes for good."),
]
px = 0.6
for head, sub in problems:
    card = rect(s, px, 4.1, 3.95, 2.6, color=PAPER2, line=LINE, rounded=True,
                line_w=1.0)
    num = rect(s, px + 0.28, 4.4, 0.5, 0.5, color=CLAY, rounded=True)
    ntf = num.text_frame; ntf.vertical_anchor = MSO_ANCHOR.MIDDLE
    para(ntf, str(problems.index((head, sub)) + 1), 16, PAPER, font=HEAD,
         bold=True, first=True, align=PP_ALIGN.CENTER, space_after=0)
    ctf = textbox(s, px + 0.3, 5.15, 3.4, 1.5)
    para(ctf, head, 14.5, INK, bold=True, first=True, line_spacing=1.05,
         space_after=6)
    para(ctf, sub, 12, MUTED, line_spacing=1.1)
    px += 4.12
page_num(s, 2)

# ===========================================================================
# Slide 3 — Solution
# ===========================================================================
content_slide(
    3, "The solution", "Paste a Job, Meet Your Referrer",
    "ReferIn turns any job posting into a ranked shortlist of people who can "
    "refer you, with the message already written.",
    ["Ranked insiders in seconds from a pasted job description",
     "Scored by real fit, not follower counts",
     "A tailored intro draft, ready to send"],
    img=os.path.join(SCREENS, "01-landing.png"))

# ===========================================================================
# Slide 4 — Effortless Search (top crop of 03)
# ===========================================================================
search_crop = crop_region(os.path.join(SCREENS, "03-find-search.png"),
                          (0, 0, 2960, 1660), "03_search.png")
content_slide(
    4, "Effortless search", "Search Is One Paste Away",
    "No boolean filters, no scrolling. Drop in the description and the parsing "
    "is done for you.",
    ["Auto extracts role, company, skills and location",
     "Works with LinkedIn, Greenhouse, Lever, anywhere",
     "Jump straight from any job listing into its referrers"],
    img=search_crop, img_box=(6.85, 1.9, 6.05, 4.5))

# ===========================================================================
# Slide 5 — Smart Fit Scoring
# ===========================================================================
content_slide(
    5, "Smart fit scoring", "Ranked by Real Fit",
    "Every referrer gets a match score from how their background lines up with "
    "the role and with you.",
    ["Vector similarity across job, person and your profile",
     "Shared skills surfaced and highlighted in green",
     "Alumni, coworker and connection paths boost the score"],
    img=os.path.join(SCREENS, "03-find-referrers.png"))

# ===========================================================================
# Slide 6 — Live Sourcing
# ===========================================================================
content_slide(
    6, "Relationship sourcing", "The People Who Can Actually Vouch",
    "We rank insiders by the warm paths that get referrals accepted: a shared "
    "employer or a shared campus, surfaced on every card and labelled by source.",
    ["Coworker and Alumni paths, the signals that actually convert",
     "Every card labelled by source, here a curated profile database",
     "Proof of concept now; an official LinkedIn or ATS API makes it production grade"],
    img=os.path.join(SCREENS, "03-find-referrers.png"))

# ===========================================================================
# Slide 7 — AI Outreach
# ===========================================================================
content_slide(
    7, "AI outreach", "The Message, Already Written",
    "Each referrer comes with a personalised outreach draft built from the job "
    "and your profile, fully editable.",
    ["Tailored to the role and your background",
     "Edit inline, copy, or send in one click",
     "No more blank page cold messages"],
    img=os.path.join(SCREENS, "03-find-referrers.png"))

# ===========================================================================
# Slide 8 — Contacted Tracking
# ===========================================================================
content_slide(
    8, "A real differentiator", "Never Message the Same Person Twice",
    "ReferIn remembers everyone you have reached out to, protecting "
    "relationships and your time.",
    ["Sent requests tracked per person",
     "Requested badges plus a hide contacted filter",
     "Recognises someone even across new searches"],
    img=os.path.join(SCREENS, "02-opportunities-contacted.png"))

# ===========================================================================
# Slide 9 — Auto Resume to Profile
# ===========================================================================
content_slide(
    9, "Auto resume to profile", "Resume In, Profile Done",
    "Upload a PDF or DOCX and ReferIn fills your skills, education and "
    "experience automatically. You just confirm.",
    ["Auto extracts skills, education and experience",
     "Review and confirm before anything saves",
     "Editable profile and photo, matches sharpen instantly"],
    img=os.path.join(SCREENS, "06-resume-extraction.png"))

# ===========================================================================
# Slide 10 — Built-in Job Search
# ===========================================================================
jobs_crop = crop_top(os.path.join(SCREENS, "08-jobs-results.png"), 1.4,
                     "08_jobs.png")
content_slide(
    10, "Built-in job search", "Find the Jobs, Too",
    "Browse live openings by role, company and country, then jump straight to "
    "who can refer you.",
    ["Live listings filtered by role, company and country",
     "Roles auto suggested from your profile",
     "Every job links straight into referrer search"],
    img=jobs_crop)

# ===========================================================================
# Slide 11 — Experience / Design (three theme thumbnails)
# ===========================================================================
s = slide()
bg(s, PAPER)
rect(s, 0, 0, 0.18, SH, color=INK)
brand_tag(s, 0.55, 0.45)
kicker(s, 0.6, 1.15, "Experience and design")
tf = textbox(s, 0.6, 1.5, 11.5, 1.4)
para(tf, "Built to Feel Effortless", 32, INK, font=HEAD, bold=True, first=True,
     space_after=8, line_spacing=1.0)
para(tf, "A fast, polished interface with the small details that make a tool "
         "genuinely pleasant to use.", 14.5, MUTED, line_spacing=1.12)
themes = [("09-theme-dark.png", "Midnight"),
          ("10-theme-violet.png", "Violet"),
          ("11-theme-sand.png", "Sand")]
tw = 3.95; gap = 0.2
tx = 0.6
for fname, label in themes:
    l, t, w, h = place_image(s, os.path.join(SCREENS, fname), tx, 3.0, tw, 2.5)
    cap = textbox(s, tx, t + h + 0.08, tw, 0.3)
    para(cap, label.upper(), 10.5, TEAL, font=MONO, bold=True, first=True,
         align=PP_ALIGN.CENTER, space_after=0)
    tx += tw + gap
bt = textbox(s, 0.6, 6.2, 12.0, 0.9)
for i, b in enumerate([
        "Six light and dark themes, switch in one click",
        "Auto growing inputs, live validation and clean empty states",
        "Editorial design, not your average hackathon UI"]):
    p = bt.paragraphs[0] if i == 0 else bt.add_paragraph()
    if i > 0:
        sep = p.add_run(); sep.text = ""
    m = p.add_run(); m.text = "▸ "
    m.font.color.rgb = TEAL; m.font.bold = True; m.font.size = Pt(12.5)
    m.font.name = BODY
    r = p.add_run(); r.text = b + "    "
    r.font.size = Pt(12.5); r.font.name = BODY; r.font.color.rgb = INK
    p.space_after = Pt(2)
# put bullets on one line each instead; simpler already
page_num(s, 11)

# ===========================================================================
# Slide 12 — Architecture flow
# ===========================================================================
s = slide()
bg(s, PAPER)
rect(s, 0, 0, 0.18, SH, color=INK)
brand_tag(s, 0.55, 0.45)
kicker(s, 0.6, 1.15, "How it works")
tf = textbox(s, 0.6, 1.5, 12.0, 1.3)
para(tf, "Simple Stack, Swappable Data", 32, INK, font=HEAD, bold=True, first=True,
     space_after=8, line_spacing=1.0)
para(tf, "A lean React and Flask app wired to a language model and a relationship "
         "graph, with no heavy ML dependencies.", 14.5, MUTED, line_spacing=1.12)

flow = [
    ("Job\ndescription", INK),
    ("LLM parse\nDeepSeek", TEAL),
    ("Relationship DB\ncurated, LinkedIn ready", INK),
    ("Fit + relationship\nscoring engine", TEAL),
    ("Ranked referrers\n+ intro draft", CLAY),
]
n = len(flow)
fw = 2.18; fh = 1.5; arrow_w = 0.3
total = n * fw + (n - 1) * arrow_w
start = (SW - total) / 2
y = 3.5
x = start
for i, (label, col) in enumerate(flow):
    box = rect(s, x, y, fw, fh, color=PAPER2, line=col, rounded=True,
               line_w=2.0)
    btf = box.text_frame; btf.word_wrap = True
    btf.vertical_anchor = MSO_ANCHOR.MIDDLE
    parts = label.split("\n")
    para(btf, parts[0], 13.5, INK, bold=True, first=True,
         align=PP_ALIGN.CENTER, space_after=2, line_spacing=1.0)
    if len(parts) > 1:
        para(btf, parts[1], 10.5, col, font=MONO, align=PP_ALIGN.CENTER,
             space_after=0, line_spacing=1.0)
    x += fw
    if i < n - 1:
        ar = textbox(s, x, y, arrow_w, fh, anchor=MSO_ANCHOR.MIDDLE)
        para(ar, "▸", 18, TEAL, bold=True, first=True,
             align=PP_ALIGN.CENTER, space_after=0)
        x += arrow_w

bt = textbox(s, 0.6, 5.7, 12.0, 1.4)
for i, b in enumerate([
        "React, Vite and Tailwind talking to Flask and SQLite",
        "DeepSeek parses the posting and drafts the intro message",
        "Matching in pure Python: TF-IDF cosine plus shared employer and campus "
        "scoring, swap the data source for a LinkedIn API and the engine is unchanged"]):
    bullet(bt, b, first=(i == 0), size=13.5)
page_num(s, 12)

# ===========================================================================
# Slide 13 — Differentiator comparison table
# ===========================================================================
s = slide()
bg(s, PAPER)
rect(s, 0, 0, 0.18, SH, color=INK)
brand_tag(s, 0.55, 0.45)
kicker(s, 0.6, 1.15, "Key differentiator")
tf = textbox(s, 0.6, 1.5, 12.2, 1.3)
para(tf, "Not a Job Board. Not LinkedIn Search.", 30, INK, font=HEAD,
     bold=True, first=True, space_after=8, line_spacing=1.0)
para(tf, "ReferIn is the only tool that ranks insiders by your fit, writes the "
         "intro, and stops you contacting them twice.", 14.5, MUTED,
     line_spacing=1.12)

rows = ["Finds the right person inside",
        "Ranks by how well they fit you",
        "Drafts your outreach for you",
        "Prevents duplicate outreach"]
cols = ["Capability", "ReferIn", "LinkedIn search", "Cold applying"]
table_l, table_t = 0.7, 3.35
table_w, table_h = 11.9, 3.2
gt = s.shapes.add_table(len(rows) + 1, len(cols),
                        Inches(table_l), Inches(table_t),
                        Inches(table_w), Inches(table_h)).table
gt.columns[0].width = Inches(5.0)
for c in range(1, 4):
    gt.columns[c].width = Inches((table_w - 5.0) / 3)

# strip default banding style by setting cell fills manually
def set_cell(cell, text, size=13, color=INK, bold=False, fillc=PAPER2,
             font=BODY, align=PP_ALIGN.CENTER):
    cell.fill.solid(); cell.fill.fore_color.rgb = fillc
    cell.vertical_anchor = MSO_ANCHOR.MIDDLE
    cell.margin_left = Inches(0.12); cell.margin_right = Inches(0.08)
    cell.margin_top = Inches(0.04); cell.margin_bottom = Inches(0.04)
    tfc = cell.text_frame; tfc.word_wrap = True
    p = tfc.paragraphs[0]; p.alignment = align
    r = p.add_run(); r.text = text
    r.font.size = Pt(size); r.font.name = font; r.font.bold = bold
    r.font.color.rgb = color

for c, head in enumerate(cols):
    set_cell(gt.cell(0, c), head, size=13, color=PAPERTX, bold=True,
             fillc=INK, font=MONO,
             align=PP_ALIGN.LEFT if c == 0 else PP_ALIGN.CENTER)
for ri, row in enumerate(rows, start=1):
    band = PAPER2 if ri % 2 else PAPER
    set_cell(gt.cell(ri, 0), row, size=13, color=INK, bold=True, fillc=band,
             align=PP_ALIGN.LEFT)
    # ReferIn = yes, others = no
    set_cell(gt.cell(ri, 1), "✓ Yes", size=13, color=TEAL, bold=True,
             fillc=GREENBG)
    set_cell(gt.cell(ri, 2), "✗ No", size=12.5, color=MUTED, fillc=band)
    set_cell(gt.cell(ri, 3), "✗ No", size=12.5, color=MUTED, fillc=band)
page_num(s, 13)

# ===========================================================================
# Slide 14 — Market and roadmap
# ===========================================================================
s = slide()
bg(s, PAPER)
rect(s, 0, 0, 0.18, SH, color=INK)
brand_tag(s, 0.55, 0.45)
kicker(s, 0.6, 1.15, "Market, model and what is next")
tf = textbox(s, 0.6, 1.5, 12.0, 1.3)
para(tf, "Big Market, Clear Path Forward", 32, INK, font=HEAD, bold=True,
     first=True, space_after=8, line_spacing=1.0)
para(tf, "ReferIn serves a worldwide pool of job seekers and grows into a two "
         "sided referral network.", 14.5, MUTED, line_spacing=1.12)

# left: who it is for
left = rect(s, 0.6, 3.3, 5.7, 3.4, color=PAPER2, line=LINE, rounded=True)
ltf = textbox(s, 0.95, 3.6, 5.1, 3.0)
para(ltf, "WHO IT IS FOR", 11, TEAL, font=MONO, bold=True, first=True,
     space_after=10)
for b in ["Students, new grads and switchers without an in",
          "A worldwide pool of job seekers, with a strong pull in India",
          "Anyone who would rather get referred than apply cold"]:
    bullet(ltf, b, size=14)

# right: roadmap timeline
right = rect(s, 6.6, 3.3, 6.0, 3.4, color=PAPER2, line=LINE, rounded=True)
rtf = textbox(s, 6.95, 3.6, 5.4, 0.4)
para(rtf, "ROADMAP", 11, CLAY, font=MONO, bold=True, first=True, space_after=0)
stages = [("Now", "Free product, live search, scoring, drafting and tracking",
           TEAL),
          ("Next", "Pro tier plus employer referral tools", INK),
          ("Later", "Opt in referrers, verified alumni paths, response "
                    "tracking", CLAY)]
ry = 4.15
for name, desc, col in stages:
    dot = rect(s, 7.0, ry + 0.06, 0.22, 0.22, color=col, rounded=True)
    stf = textbox(s, 7.45, ry, 4.9, 0.9)
    para(stf, name, 14, col, font=HEAD, bold=True, first=True, space_after=2,
         line_spacing=1.0)
    para(stf, desc, 12, MUTED, line_spacing=1.08)
    ry += 0.83
page_num(s, 14)

# ===========================================================================
# Slide 15 — Two-sided value (good for referrers too)
# ===========================================================================
s = slide()
bg(s, PAPER)
rect(s, 0, 0, 0.18, SH, color=INK)
brand_tag(s, 0.55, 0.45)
kicker(s, 0.6, 1.15, "A two-sided network")
tf = textbox(s, 0.6, 1.5, 12.2, 1.3)
para(tf, "Good for Referrers, Too", 32, INK, font=HEAD, bold=True, first=True,
     space_after=8, line_spacing=1.0)
para(tf, "ReferIn is not only for job seekers. The employees who refer win as "
         "well, and that is what makes the network grow.", 14.5, MUTED,
     line_spacing=1.12)

# left card: candidates
lc = rect(s, 0.6, 3.25, 5.95, 3.45, color=PAPER2, line=LINE, rounded=True)
ltf = textbox(s, 0.95, 3.55, 5.35, 3.0)
para(ltf, "FOR CANDIDATES", 11, TEAL, font=MONO, bold=True, first=True,
     space_after=10)
for b in ["A warm intro instead of the application void",
          "Ranked by real fit and real relationships",
          "A tailored message, already written",
          "Never the same person contacted twice"]:
    bullet(ltf, b, size=13.5)

# right card: referrers
rc = rect(s, 6.7, 3.25, 5.95, 3.45, color=GREENBG, line=TEAL, rounded=True)
rtf = textbox(s, 7.05, 3.55, 5.35, 3.0)
para(rtf, "FOR REFERRERS", 11, CLAY, font=MONO, bold=True, first=True,
     space_after=10)
for b in ["Pre-qualified, high-fit candidates land in their inbox",
          "Companies already pay a referral bonus, often a thousand dollars "
          "or more, per successful hire",
          "Less time wasted and less reputation risk on a weak referral",
          "They earn it with one click, so they keep coming back"]:
    bullet(rtf, b, size=13.5)

# bottom line
bl = textbox(s, 0.6, 6.95, 12.0, 0.4)
para(bl, "Every accepted referral pays the employee and opens a door for a "
         "candidate. Both sides compound.", 12.5, INK, font=BODY, bold=True,
     first=True, align=PP_ALIGN.CENTER, space_after=0, line_spacing=1.0)
page_num(s, 15)

# ===========================================================================
# Slide 16 — CTA (petrol closing)
# ===========================================================================
s = slide()
bg(s, INK)
rect(s, 0, SH - 0.9, SW, 0.9, color=RGBColor(0x10, 0x46, 0x50))
brand_tag(s, 0.7, 0.55, dark=True, mark_size=0.5, word_size=21)
kicker(s, 0.72, 1.05, "Team and call to action", color=TEAL)
tf = textbox(s, 0.7, 2.5, 12.0, 2.2)
para(tf, "Try ReferIn.", 50, PAPERTX, font=HEAD, bold=True, first=True,
     line_spacing=0.98, space_after=0)
para(tf, "Get Referred In.", 50, TEAL, font=HEAD, bold=True, line_spacing=0.98,
     space_after=0)
tf2 = textbox(s, 0.72, 4.7, 11.5, 0.8)
para(tf2, "Built end to end during the hackathon by Team Ori. Live and working "
          "today.", 16, RGBColor(0xC7, 0xD6, 0xD4), first=True, line_spacing=1.1)

# team label + live-URL note
lab = textbox(s, 0.72, 5.5, 6.0, 0.3)
para(lab, "TEAM ORI", 11, TEAL, font=MONO, bold=True, first=True, space_after=0)
note = textbox(s, 7.0, 5.5, 5.6, 0.3)
para(note, "Try it live: add your URL or QR code", 10, RGBColor(0x9F, 0xB4, 0xB2),
     font=MONO, first=True, align=PP_ALIGN.RIGHT, space_after=0)

# five member chips
n = len(MEMBERS); gap = 0.16
chip_w = (12.18 - (n - 1) * gap) / n
cx = 0.72
for name in MEMBERS:
    box = rect(s, cx, 5.9, chip_w, 1.0, color=RGBColor(0x10, 0x46, 0x50),
               rounded=True)
    ctf = box.text_frame; ctf.word_wrap = True
    ctf.margin_left = Inches(0.1); ctf.margin_right = Inches(0.1)
    ctf.vertical_anchor = MSO_ANCHOR.MIDDLE
    parts = name.split(" ", 1)
    para(ctf, parts[0], 13, PAPERTX, font=HEAD, bold=True, first=True,
         align=PP_ALIGN.CENTER, space_after=1, line_spacing=1.0)
    if len(parts) > 1:
        para(ctf, parts[1], 10.5, RGBColor(0xC7, 0xD6, 0xD4), font=BODY,
             align=PP_ALIGN.CENTER, space_after=0, line_spacing=1.0)
    cx += chip_w + gap
page_num(s, 16, dark=True)

prs.save(OUT)
print("Saved", OUT)
print("Slides:", len(prs.slides._sldIdLst))
