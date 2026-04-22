# 📑 Paper Figure Studio

**English** 🌍 | [简体中文](README_zh.md) 🇨🇳

> **Turn any photo into a paper figure.** Runs entirely in the browser — no uploads, one click for a random academic caption.

Drop in a daily snapshot, stamp it with `(a)(b)` panel labels, red dashed zoom-boxes, arrows, scale bars and a caption — and walk away with an image that looks like it was ripped straight out of *Nature*. A bilingual template library ships with it, so the figure caption and fake citation are written for you.

**Live demo**: <https://toby-qian.github.io/paper-figure/>

---

## ✨ Features

- **🖼 Canvas editor** — upload / drag / paste an image, then add academic furniture:
  - `(a)(b)(c)` panel labels
  - Arrows with text
  - Red dashed zoom boxes with an auto-generated magnified inset (`×N` crop from the source)
  - Scale bars (μm / cm / nm)
  - Free-form text annotations
- **🎨 Filters** — grayscale, photocopy blur, pseudo-heatmap
- **Aa text controls** — any text object can be reselected to tweak font size, serif / sans, bold / italic, fill & stroke color
- **🎲 Template library** (80+ bilingual captions)
  - 6 topics: pets / food / landscape / selfie / work / daily life
  - Placeholders are randomly filled, so no two runs look alike
- **📚 Auto citation** — fake authors, fake journals (*Purr Review Letters*, *Lying-Flat Quarterly*, *IEEE Trans. on Procrastination* …), volume / issue / pages, all one click away
- **⚡ One-click full random** — caption, citation and figure number generated together; zero thinking required
- **📱 Fully responsive** — canvas left, panel right on desktop; swipe-up drawer on mobile
- **📤 Multi-ratio export** — 4:3 / 1:1 / 3:4 / 16:9, with caption & citation composited onto the PNG, ready for Xiaohongshu / Weibo / WeChat
- **🔒 100% front-end** — no dependencies, no backend, no uploads; your image never leaves the tab

---

## 🚀 Try it online

Just open <https://toby-qian.github.io/paper-figure/>

---

## 🛠 Run locally

```bash
git clone https://github.com/Toby-Qian/paper-figure.git
cd paper-figure

# Serve it with anything — pick one:
python -m http.server 8000
# or
npx serve .
```

Then visit <http://localhost:8000>.

> ⚠️ Don't just double-click `index.html`. The `file://` protocol blocks clipboard paste in most browsers.

---

## 🖱 Workflow

1. **Upload** — click the `01 · Source` area, drop an image on the canvas, or press `Ctrl+V` to paste.
2. **Pick a topic** *(optional)* — pets / food / landscape / selfie / work / daily under `03 · Caption`.
3. **Roll the dice** — hit the red **🎲 Random** button; caption and citation appear together.
4. **Annotate** — in `02 · Annotations` add panel labels, arrows, zoom boxes…
   - Click an object to drag it
   - Double-click text to edit it
   - The right-hand `Aa · Text style` panel adjusts the selected text
   - Press <kbd>Delete</kbd> to remove the selection
5. **Export** — choose an aspect ratio (4:3 / 1:1 / …) and hit `⬇ Download PNG`.

## 📷 Examples

> *Screenshots coming soon — PRs with your own figures are welcome.*

---

## 🏗 Tech stack

| Layer | Choice | Notes |
|---|---|---|
| UI | Vanilla HTML + CSS | No framework, Google Fonts (EB Garamond / Inter / JetBrains Mono) |
| Canvas | Canvas 2D API | Hand-rolled rendering — no Fabric.js / Konva |
| Input | Pointer Events | Unified mouse + touch |
| Templates | Static JSON | Extend `templates.js` freely |
| Build | None | Plain `<script>` tags, zero build step |

File layout:

```
paper-figure/
├── index.html        page shell
├── style.css         styles + responsive rules
├── app.js            Canvas editor (~650 lines)
├── templates.js      caption / citation pools
└── README.md
```

---

## 📝 Adding templates

Drop a new topic or line straight into `templates.js`:

```js
window.CAPTION_TEMPLATES.newTopic = [
  { cn: "你的中文模板，{val} 是占位符。",
    en: "Your English template, {val} is a placeholder." },
  // …more
];
window.FILL_POOLS.newTopic = {
  val: ["12", "34", "56"],
  n: ["10", "20"]
};
```

Then register it as an `<option value="newTopic">` under `<select id="captionTopic">`.

---

## 📦 Deploying to GitHub Pages

The repo is already configured for root-directory publishing:

```bash
# Push to main
git push

# Repo → Settings → Pages → Source: Deploy from branch (main / root)
```

A few minutes later `https://<user>.github.io/paper-figure/` goes live.

---

## 💡 Inspiration

Inspired by the running internet joke of P-shopping everyday photos into fake paper figures, and every grad student who's ever hidden a punchline inside a legitimate-looking caption.

---

## 📜 License

[MIT](LICENSE) © 2026 [Toby Qian](https://toby-qian.github.io)

> If you actually submit one of these to a real journal, you're on your own. The author takes no responsibility for any fabricated statistics that appear in the generated captions.
