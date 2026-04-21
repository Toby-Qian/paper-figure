/* =========================================================
   Paper Figure Studio — Canvas editor (v2)
   多图拼接 + 期刊风格预设 + 移动端联动
   ========================================================= */

(() => {
  "use strict";

  // ---------- DOM ----------
  const $  = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const canvas = $("#canvas");
  const ctx = canvas.getContext("2d");
  const frame = $("#figureFrame");
  const emptyHint = $("#emptyHint");
  const fileInput = $("#fileInput");
  const captionInput = $("#captionInput");
  const figNumberInput = $("#figNumber");
  const captionText = $("#captionText");
  const captionLine = $("#captionLine");
  const citationLine = $("#citationLine");
  const panel = $("#panel");
  const panelHandle = $("#panelHandle");
  const panelCloseFab = $("#panelCloseFab");
  const btnDelete = $("#btnDelete");
  const btnClear = $("#btnClear");
  const btnExport = $("#btnExport");
  const btnHelp = $("#btnHelp");
  const helpDialog = $("#helpDialog");
  const cellHint = $("#cellHint");
  const autoLabel = $("#autoLabel");

  // ---------- Journal presets ----------
  const JOURNALS = {
    default: {
      name: "Journal of Daily Observations",
      meta: "ISSN 0000-0000 · VOL. 01",
      family: "serif",           // default text family for new annotations
      labelBold: true,
      labelColor: "#ffffff",
      accent: "#b02029",         // zoom / rect red
      captionFont: "serif",
    },
    nature: {
      name: "Nature — Research Letters",
      meta: "doi:10.1038/daily-0000 · 2026",
      family: "serif",
      labelBold: true,
      labelColor: "#ffffff",
      accent: "#006699",
      captionFont: "serif",
    },
    science: {
      name: "Science — Reports",
      meta: "DOI: 10.1126/science.daily · 2026",
      family: "times",
      labelBold: true,
      labelColor: "#ffffff",
      accent: "#b30000",
      captionFont: "times",
    },
    cell: {
      name: "Cell — Article",
      meta: "Volume 186 · 2026 · Elsevier",
      family: "sourcesans",
      labelBold: true,
      labelColor: "#ffffff",
      accent: "#0b6e4f",
      captionFont: "sourcesans",
    },
    ieee: {
      name: "IEEE Transactions",
      meta: "10.1109/TDAILY.2026.0000",
      family: "times",
      labelBold: true,
      labelColor: "#ffffff",
      accent: "#00629b",
      captionFont: "times",
    },
    elsevier: {
      name: "Elsevier — Daily Science",
      meta: "https://doi.org/10.1016/j.daily.2026",
      family: "serif",
      labelBold: false,
      labelColor: "#ffffff",
      accent: "#eb6500",
      captionFont: "serif",
    },
  };

  // ---------- State ----------
  const state = {
    images: [],          // [{img: HTMLImageElement, draw:{x,y,w,h}}]
    layout: { cols: 1, rows: 1 },   // grid layout
    cellGap: 12,                    // px on canvas coords
    annotations: [],
    selectedId: null,
    nextId: 1,
    ratio: [4, 3],
    filters: { grayscale: false, photocopy: false, heatmap: false },
    panelLabelSeq: 0,
    journal: "default",
    caption: { fontSize: 16, family: "serif", bold: false, italic: false, color: "#0e0e0e", stroke: "#ffffff" },
    captionSelected: false,
  };

  const BASE_LONG = 1200;

  function currentJournal() { return JOURNALS[state.journal] || JOURNALS.default; }

  function applyJournal(name) {
    if (!JOURNALS[name]) return;
    state.journal = name;
    const j = JOURNALS[name];
    document.body.setAttribute("data-journal", name);
    $("#journalName").textContent = j.name;
    $("#journalMeta").textContent = j.meta;
    $$(".j-btn").forEach(b => b.classList.toggle("on", b.dataset.journal === name));
    const allDefaults = Object.values(JOURNALS).map(x => x.family);
    for (const a of state.annotations) {
      if (TEXT_TYPES.has(a.type) && allDefaults.includes(a.family)) {
        a.family = j.family;
      }
      if (a.type === "zoom" || a.type === "rect") {
        if (!a._userColor) a.color = j.accent;
      }
    }
    // caption: only auto-change family if user hasn't customized it
    if (!state.caption._userFamily) state.caption.family = j.captionFont;
    applyCaptionStyle();
    render();
    updateCaptionPreview();
    if (state.captionSelected) syncStyleControls();
  }

  function applyCaptionStyle() {
    const c = state.caption;
    const block = $("#captionBlock");
    block.style.fontFamily = FAMILY_MAP[c.family] || FAMILY_MAP.serif;
    block.style.fontSize = `${c.fontSize}px`;
    block.style.fontWeight = c.bold ? 700 : 400;
    block.style.fontStyle = c.italic ? "italic" : "normal";
    block.style.color = c.color;
    // citation line stays slightly smaller and italic
    const cit = $("#citationLine");
    cit.style.fontSize = `${Math.max(11, c.fontSize - 3)}px`;
  }

  // ---------- Layout / grid ----------
  function setLayout(key) {
    const [cols, rows] = key.split("x").map(Number);
    state.layout = { cols, rows };
    $$(".l-btn").forEach(b => b.classList.toggle("on", b.dataset.layout === key));
    const n = cols * rows;
    cellHint.textContent = n === 1
      ? "当前布局：1 图（单面板）"
      : `当前布局：${cols}×${rows} = ${n} 图`;
    // trim images to fit
    state.images = state.images.slice(0, n);
    fitAllImages();
    render();
  }

  function cellRect(i) {
    const { cols, rows } = state.layout;
    const col = i % cols, row = Math.floor(i / cols);
    const gap = state.cellGap;
    const totalGapW = gap * (cols + 1);
    const totalGapH = gap * (rows + 1);
    const cw = (canvas.width - totalGapW) / cols;
    const ch = (canvas.height - totalGapH) / rows;
    return {
      x: gap + col * (cw + gap),
      y: gap + row * (ch + gap),
      w: cw,
      h: ch,
    };
  }

  function setRatio(rw, rh) {
    state.ratio = [rw, rh];
    if (rw >= rh) {
      canvas.width = BASE_LONG;
      canvas.height = Math.round(BASE_LONG * rh / rw);
    } else {
      canvas.height = BASE_LONG;
      canvas.width = Math.round(BASE_LONG * rw / rh);
    }
    frame.style.aspectRatio = `${rw} / ${rh}`;
    fitAllImages();
    render();
  }

  function fitImageInCell(imgObj, cell) {
    const { img } = imgObj;
    const { naturalWidth: iw, naturalHeight: ih } = img;
    const s = Math.min(cell.w / iw, cell.h / ih);
    const w = iw * s, h = ih * s;
    imgObj.draw = {
      x: cell.x + (cell.w - w) / 2,
      y: cell.y + (cell.h - h) / 2,
      w, h
    };
  }

  function fitAllImages() {
    state.images.forEach((o, i) => {
      const c = cellRect(i);
      if (o.img) fitImageInCell(o, c);
    });
  }

  // ---------- Image loading ----------
  function loadImageFromFile(file, cellIndex) {
    if (!file || !file.type.startsWith("image/")) return Promise.resolve(null);
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const n = state.layout.cols * state.layout.rows;
        const idx = (cellIndex !== undefined) ? cellIndex
                  : (state.images.length < n ? state.images.length : 0);
        const obj = { img, draw: null };
        const cell = cellRect(idx);
        fitImageInCell(obj, cell);
        state.images[idx] = obj;
        // trim
        state.images = state.images.slice(0, n);
        emptyHint.style.display = "none";
        maybeAddPanelLabels();
        render();
        URL.revokeObjectURL(url);
        resolve(obj);
      };
      img.src = url;
    });
  }

  async function loadFiles(files) {
    const n = state.layout.cols * state.layout.rows;
    const arr = Array.from(files).slice(0, n);
    // start at current images length
    let start = state.images.length < n ? state.images.length : 0;
    if (arr.length >= n) start = 0;
    for (let i = 0; i < arr.length; i++) {
      await loadImageFromFile(arr[i], start + i);
    }
  }

  fileInput.addEventListener("change", (e) => {
    const fs = e.target.files;
    if (fs && fs.length) loadFiles(fs);
    e.target.value = ""; // allow re-upload same file
  });

  ["dragenter", "dragover"].forEach(ev => frame.addEventListener(ev, (e) => {
    e.preventDefault(); frame.classList.add("dragover");
  }));
  ["dragleave", "drop"].forEach(ev => frame.addEventListener(ev, (e) => {
    e.preventDefault(); frame.classList.remove("dragover");
  }));
  frame.addEventListener("drop", (e) => {
    const fs = e.dataTransfer.files;
    if (fs && fs.length) loadFiles(fs);
  });

  window.addEventListener("paste", (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (const it of items) {
      if (it.type && it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) loadFiles([f]);
        break;
      }
    }
  });

  // auto add panel labels when loading into multi-panel layout
  function maybeAddPanelLabels() {
    if (!autoLabel.checked) return;
    const n = state.layout.cols * state.layout.rows;
    if (n < 2) return;
    // ensure each cell has exactly one auto label
    for (let i = 0; i < state.images.length; i++) {
      if (!state.images[i]) continue;
      const cell = cellRect(i);
      const tag = `(${String.fromCharCode(97 + i)})`;
      const exists = state.annotations.some(a => a._auto === i && a.type === "label");
      if (!exists) {
        const j = currentJournal();
        state.annotations.push({
          id: state.nextId++,
          type: "label",
          _auto: i,
          x: cell.x + 14,
          y: cell.y + 12,
          text: tag,
          fontSize: 40,
          family: j.family,
          bold: j.labelBold,
          italic: false,
          color: j.labelColor,
          stroke: "#000000",
        });
      }
    }
  }

  // ---------- Annotation factory ----------
  function addAnnotation(type) {
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const id = state.nextId++;
    const j = currentJournal();
    let obj;
    switch (type) {
      case "label": {
        const letter = String.fromCharCode(97 + state.panelLabelSeq++);
        obj = { id, type: "label", x: 30, y: 50, text: `(${letter})`,
                fontSize: 44, family: j.family, bold: j.labelBold, italic: false,
                color: j.labelColor, stroke: "#000000" };
        break;
      }
      case "arrow":
        obj = { id, type: "arrow", x1: cx - 160, y1: cy - 120, x2: cx - 40, y2: cy - 40, color: "#ffffff", width: 5 };
        break;
      case "text":
        obj = { id, type: "text", x: cx, y: cy, text: "双击编辑",
                fontSize: 26, family: j.family, bold: false, italic: false,
                color: "#ffffff", stroke: "#000000" };
        break;
      case "zoom":
        obj = { id, type: "zoom",
                srcX: cx - 80, srcY: cy - 60, srcW: 160, srcH: 120,
                dstX: canvas.width - 340, dstY: 40, dstW: 300, dstH: 225,
                scale: 10, color: j.accent };
        break;
      case "scale":
        obj = { id, type: "scale", x: canvas.width - 220, y: canvas.height - 60,
                length: 160, text: "100 μm",
                fontSize: 20, family: j.family, bold: false, italic: false,
                color: "#ffffff", stroke: "#000000" };
        break;
      case "rect":
        obj = { id, type: "rect", x: cx - 120, y: cy - 90, w: 240, h: 180, color: j.accent, dash: [8, 6], lineWidth: 3 };
        break;
      default: return;
    }
    state.annotations.push(obj);
    state.selectedId = id;
    updateSelUI(true);
    render();
  }

  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addAnnotation(btn.dataset.add));
  });

  // ---------- Filters ----------
  $("#fxGrayscale").addEventListener("change", e => { state.filters.grayscale = e.target.checked; render(); });
  $("#fxPhotocopy").addEventListener("change", e => { state.filters.photocopy = e.target.checked; render(); });
  $("#fxHeatmap").addEventListener("change", e => { state.filters.heatmap = e.target.checked; render(); });

  function buildFilterString() {
    const f = state.filters;
    const parts = [];
    if (f.grayscale) parts.push("grayscale(1)");
    if (f.photocopy) parts.push("grayscale(1) contrast(1.6) brightness(1.05) sepia(0.25) blur(0.3px)");
    return parts.join(" ");
  }

  function applyHeatmap(x, y, w, h) {
    try {
      const img = ctx.getImageData(x, y, w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const lum = (0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2]) / 255;
        const c = heatColor(lum);
        d[i] = c[0]; d[i+1] = c[1]; d[i+2] = c[2];
      }
      ctx.putImageData(img, x, y);
    } catch (e) { /* tainted */ }
  }
  function heatColor(t) {
    const r = Math.round(255 * Math.min(1, Math.max(0, 1.5 * t - 0.1)));
    const g = Math.round(255 * Math.min(1, Math.max(0, 1.5 * t - 0.4)));
    const b = Math.round(255 * Math.min(1, Math.max(0, 0.6 - 1.2 * Math.abs(t - 0.25))));
    return [r, g, b];
  }

  // ---------- Render ----------
  function render() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw empty cell outlines when multi-panel has empty slots
    const n = state.layout.cols * state.layout.rows;
    if (n > 1) {
      for (let i = 0; i < n; i++) {
        if (state.images[i]) continue;
        const c = cellRect(i);
        ctx.save();
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = "#3a3a3a";
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1;
        ctx.strokeRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
        ctx.fillStyle = "#666";
        ctx.setLineDash([]);
        ctx.font = '500 14px "Inter", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`+ 第 ${i+1} 张`, c.x + c.w/2, c.y + c.h/2);
        ctx.restore();
      }
    }

    // images per cell
    const fs = buildFilterString();
    for (let i = 0; i < state.images.length; i++) {
      const o = state.images[i];
      if (!o || !o.img) continue;
      const cell = cellRect(i);
      // clip to cell
      ctx.save();
      ctx.beginPath();
      ctx.rect(cell.x, cell.y, cell.w, cell.h);
      ctx.clip();
      ctx.filter = fs || "none";
      ctx.drawImage(o.img, o.draw.x, o.draw.y, o.draw.w, o.draw.h);
      ctx.filter = "none";
      ctx.restore();
      if (state.filters.heatmap) {
        applyHeatmap(Math.floor(cell.x), Math.floor(cell.y),
                     Math.floor(cell.w), Math.floor(cell.h));
      }
    }

    // annotations
    for (const a of state.annotations) drawAnnotation(a);

    const sel = currentSel();
    if (sel) drawSelection(sel);

    ctx.restore();
  }

  function drawAnnotation(a) {
    switch (a.type) {
      case "label":    return drawLabel(a);
      case "text":     return drawText(a);
      case "arrow":    return drawArrow(a);
      case "rect":     return drawRect(a);
      case "scale":    return drawScale(a);
      case "zoom":     return drawZoom(a);
    }
  }

  const FAMILY_MAP = {
    serif:       '"EB Garamond", "Noto Serif SC", Georgia, serif',
    sans:        '"Inter", "Noto Serif SC", system-ui, sans-serif',
    mono:        '"JetBrains Mono", ui-monospace, monospace',
    cnserif:     '"Noto Serif SC", "EB Garamond", serif',
    times:       '"Times New Roman", Times, "Noto Serif SC", serif',
    sourcesans:  '"Source Sans 3", "Inter", "Noto Serif SC", sans-serif',
  };
  function fontStringFor(a, fallbackWeight) {
    const weight = a.bold ? 700 : (fallbackWeight || 500);
    const italic = a.italic ? "italic " : "";
    const fam = FAMILY_MAP[a.family || "serif"];
    return `${italic}${weight} ${a.fontSize}px ${fam}`;
  }

  function drawLabel(a) {
    ctx.save();
    ctx.font = fontStringFor(a, 600);
    ctx.textBaseline = "top";
    ctx.fillStyle = a.color || "#ffffff";
    ctx.strokeStyle = a.stroke || "rgba(0,0,0,0.6)";
    ctx.lineWidth = 4;
    ctx.strokeText(a.text, a.x, a.y);
    ctx.fillText(a.text, a.x, a.y);
    ctx.restore();
    const m = ctx.measureText(a.text);
    a._bb = { x: a.x, y: a.y, w: m.width || a.fontSize, h: a.fontSize };
  }

  function drawText(a) {
    ctx.save();
    ctx.font = fontStringFor(a, 500);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = a.color || "#fff";
    ctx.strokeStyle = a.stroke || "rgba(0,0,0,0.65)";
    ctx.lineWidth = 4;
    ctx.strokeText(a.text, a.x, a.y);
    ctx.fillText(a.text, a.x, a.y);
    ctx.restore();
    const m = ctx.measureText(a.text);
    a._bb = { x: a.x - m.width/2, y: a.y - a.fontSize/2, w: m.width, h: a.fontSize };
  }

  function drawArrow(a) {
    const dx = a.x2 - a.x1, dy = a.y2 - a.y1;
    const ang = Math.atan2(dy, dx);
    const head = 22;
    ctx.save();
    ctx.strokeStyle = a.color || "#fff";
    ctx.fillStyle = a.color || "#fff";
    ctx.lineWidth = a.width || 5;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(a.x1, a.y1);
    ctx.lineTo(a.x2, a.y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(a.x2, a.y2);
    ctx.lineTo(a.x2 - head * Math.cos(ang - 0.4), a.y2 - head * Math.sin(ang - 0.4));
    ctx.lineTo(a.x2 - head * Math.cos(ang + 0.4), a.y2 - head * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    const bx = Math.min(a.x1, a.x2), by = Math.min(a.y1, a.y2);
    a._bb = { x: bx - 10, y: by - 10, w: Math.abs(dx) + 20, h: Math.abs(dy) + 20 };
  }

  function drawRect(a) {
    ctx.save();
    ctx.strokeStyle = a.color || "#d12020";
    ctx.lineWidth = a.lineWidth || 3;
    ctx.setLineDash(a.dash || []);
    ctx.strokeRect(a.x, a.y, a.w, a.h);
    ctx.restore();
    a._bb = { x: a.x, y: a.y, w: a.w, h: a.h };
  }

  function drawScale(a) {
    const barH = 8;
    ctx.save();
    ctx.fillStyle = a.color || "#fff";
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 2;
    ctx.fillRect(a.x, a.y, a.length, barH);
    ctx.strokeRect(a.x, a.y, a.length, barH);
    ctx.font = fontStringFor(a, 500);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = a.color || "#fff";
    ctx.strokeStyle = a.stroke || "rgba(0,0,0,0.6)";
    ctx.lineWidth = 3;
    ctx.strokeText(a.text, a.x + a.length/2, a.y - 4);
    ctx.fillText(a.text, a.x + a.length/2, a.y - 4);
    ctx.restore();
    a._bb = { x: a.x, y: a.y - 26, w: a.length, h: barH + 26 };
  }

  // find the image cell a given canvas-coord point falls in
  function findImageForPoint(x, y) {
    for (let i = 0; i < state.images.length; i++) {
      const o = state.images[i];
      if (!o || !o.img) continue;
      const cell = cellRect(i);
      if (x >= cell.x && x <= cell.x + cell.w && y >= cell.y && y <= cell.y + cell.h) {
        return { obj: o, cell };
      }
    }
    // fallback: first image
    const first = state.images.find(o => o && o.img);
    if (first) return { obj: first, cell: cellRect(state.images.indexOf(first)) };
    return null;
  }

  function drawZoom(a) {
    ctx.save();
    ctx.strokeStyle = a.color || "#d12020";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(a.srcX, a.srcY, a.srcW, a.srcH);
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(a.srcX + a.srcW, a.srcY); ctx.lineTo(a.dstX, a.dstY);
    ctx.moveTo(a.srcX + a.srcW, a.srcY + a.srcH); ctx.lineTo(a.dstX, a.dstY + a.dstH);
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    const hit = findImageForPoint(a.srcX + a.srcW/2, a.srcY + a.srcH/2);
    if (hit) {
      const { obj, cell } = hit;
      const sxPx = (a.srcX - obj.draw.x) / obj.draw.w * obj.img.naturalWidth;
      const syPx = (a.srcY - obj.draw.y) / obj.draw.h * obj.img.naturalHeight;
      const swPx = a.srcW / obj.draw.w * obj.img.naturalWidth;
      const shPx = a.srcH / obj.draw.h * obj.img.naturalHeight;
      const cSX = Math.max(0, sxPx), cSY = Math.max(0, syPx);
      const cSW = Math.min(obj.img.naturalWidth - cSX, swPx);
      const cSH = Math.min(obj.img.naturalHeight - cSY, shPx);
      if (cSW > 0 && cSH > 0) {
        ctx.filter = buildFilterString() || "none";
        ctx.drawImage(obj.img, cSX, cSY, cSW, cSH, a.dstX, a.dstY, a.dstW, a.dstH);
        ctx.filter = "none";
        if (state.filters.heatmap) {
          applyHeatmap(Math.floor(a.dstX), Math.floor(a.dstY), Math.floor(a.dstW), Math.floor(a.dstH));
        }
      }
    }
    ctx.strokeStyle = a.color || "#d12020";
    ctx.lineWidth = 3;
    ctx.strokeRect(a.dstX, a.dstY, a.dstW, a.dstH);

    const badge = `×${a.scale}`;
    ctx.font = '600 16px "Inter", sans-serif';
    const bw = ctx.measureText(badge).width + 16;
    ctx.fillStyle = "rgba(0,0,0,0.78)";
    ctx.fillRect(a.dstX + a.dstW - bw - 8, a.dstY + 8, bw, 24);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badge, a.dstX + a.dstW - bw/2 - 8, a.dstY + 20);
    ctx.restore();

    a._bb = { x: Math.min(a.srcX, a.dstX), y: Math.min(a.srcY, a.dstY),
              w: Math.max(a.srcX + a.srcW, a.dstX + a.dstW) - Math.min(a.srcX, a.dstX),
              h: Math.max(a.srcY + a.srcH, a.dstY + a.dstH) - Math.min(a.srcY, a.dstY) };
  }

  function drawSelection(a) {
    const bb = a._bb;
    if (!bb) return;
    ctx.save();
    ctx.strokeStyle = "#0a5cff";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(bb.x - 4, bb.y - 4, bb.w + 8, bb.h + 8);
    ctx.restore();
  }

  // ---------- Hit testing ----------
  function hitTest(x, y) {
    for (let i = state.annotations.length - 1; i >= 0; i--) {
      const a = state.annotations[i];
      if (!a._bb) continue;
      const bb = a._bb;
      if (a.type === "zoom") {
        if (inside(x, y, a.srcX, a.srcY, a.srcW, a.srcH)) { a._drag = "src"; return a; }
        if (inside(x, y, a.dstX, a.dstY, a.dstW, a.dstH)) { a._drag = "dst"; return a; }
        continue;
      }
      if (a.type === "arrow") {
        if (near(x, y, a.x1, a.y1, 16)) { a._drag = "p1"; return a; }
        if (near(x, y, a.x2, a.y2, 16)) { a._drag = "p2"; return a; }
        if (distToSeg(x, y, a.x1, a.y1, a.x2, a.y2) < 10) { a._drag = "whole"; return a; }
        continue;
      }
      if (inside(x, y, bb.x - 6, bb.y - 6, bb.w + 12, bb.h + 12)) {
        a._drag = "whole"; return a;
      }
    }
    return null;
  }
  function inside(x, y, rx, ry, rw, rh) { return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh; }
  function near(x, y, px, py, r) { return (x-px)*(x-px) + (y-py)*(y-py) < r*r; }
  function distToSeg(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((px-x1)*dx + (py-y1)*dy) / (dx*dx + dy*dy + 1e-6)));
    const qx = x1 + t*dx, qy = y1 + t*dy;
    return Math.hypot(px - qx, py - qy);
  }

  // ---------- Pointer interaction ----------
  let pointer = null;

  function getCanvasPoint(ev) {
    const r = canvas.getBoundingClientRect();
    const x = (ev.clientX - r.left) * (canvas.width / r.width);
    const y = (ev.clientY - r.top) * (canvas.height / r.height);
    return { x, y };
  }

  frame.addEventListener("pointerdown", (e) => {
    frame.setPointerCapture(e.pointerId);
    deselectCaption();
    const p = getCanvasPoint(e);
    const hit = hitTest(p.x, p.y);
    if (hit) {
      state.selectedId = hit.id;
      pointer = { id: hit.id, mode: hit._drag || "whole", startX: p.x, startY: p.y, snap: JSON.parse(JSON.stringify(hit)) };
      updateSelUI(true);  // auto-open style panel on mobile
    } else {
      state.selectedId = null;
      pointer = null;
      updateSelUI(false);
    }
    render();
  });

  frame.addEventListener("pointermove", (e) => {
    if (!pointer) return;
    const p = getCanvasPoint(e);
    const a = state.annotations.find(x => x.id === pointer.id);
    if (!a) return;
    const dx = p.x - pointer.startX, dy = p.y - pointer.startY;
    const s = pointer.snap;
    switch (a.type) {
      case "label": case "text":
        a.x = s.x + dx; a.y = s.y + dy; break;
      case "arrow":
        if (pointer.mode === "p1") { a.x1 = s.x1 + dx; a.y1 = s.y1 + dy; }
        else if (pointer.mode === "p2") { a.x2 = s.x2 + dx; a.y2 = s.y2 + dy; }
        else { a.x1 = s.x1 + dx; a.y1 = s.y1 + dy; a.x2 = s.x2 + dx; a.y2 = s.y2 + dy; }
        break;
      case "rect":
        a.x = s.x + dx; a.y = s.y + dy; break;
      case "scale":
        a.x = s.x + dx; a.y = s.y + dy; break;
      case "zoom":
        if (pointer.mode === "src") { a.srcX = s.srcX + dx; a.srcY = s.srcY + dy; }
        else { a.dstX = s.dstX + dx; a.dstY = s.dstY + dy; }
        break;
    }
    render();
  });

  frame.addEventListener("pointerup", () => { pointer = null; });
  frame.addEventListener("pointercancel", () => { pointer = null; });

  frame.addEventListener("dblclick", (e) => {
    const p = getCanvasPoint(e);
    const a = hitTest(p.x, p.y);
    if (!a) return;
    if (a.type === "text" || a.type === "label" || a.type === "scale") {
      const v = prompt("编辑文字：", a.text);
      if (v !== null) { a.text = v; render(); }
    } else if (a.type === "zoom") {
      const v = prompt("放大倍数：", a.scale);
      if (v !== null) { a.scale = parseFloat(v) || a.scale; render(); }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea, select")) return;
    if ((e.key === "Delete" || e.key === "Backspace") && state.selectedId) {
      deleteSelected();
    }
  });

  function currentSel() { return state.annotations.find(a => a.id === state.selectedId); }
  function deleteSelected() {
    state.annotations = state.annotations.filter(a => a.id !== state.selectedId);
    state.selectedId = null;
    updateSelUI(false);
    render();
  }

  // ---------- Style panel + mobile auto-expand ----------
  const styleTool   = $("#styleTool");
  const styleSize   = $("#styleSize");
  const styleSizeVal= $("#styleSizeVal");
  const styleFamily = $("#styleFamily");
  const styleBold   = $("#styleBold");
  const styleItalic = $("#styleItalic");
  const styleColor  = $("#styleColor");
  const styleStroke = $("#styleStroke");
  const styleHint   = $("#styleHint");

  const TEXT_TYPES = new Set(["label", "text", "scale"]);
  const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

  function updateSelUI(shouldExpandMobile) {
    btnDelete.disabled = !state.selectedId;
    syncStyleControls();
    if (shouldExpandMobile && state.selectedId && isMobile()) {
      const a = currentSel();
      if (a && TEXT_TYPES.has(a.type)) {
        openPanel();
        // scroll to style tool
        setTimeout(() => {
          styleTool.scrollIntoView({ behavior: "smooth", block: "start" });
          styleTool.classList.add("flash");
          setTimeout(() => styleTool.classList.remove("flash"), 1200);
        }, 200);
      }
    }
  }

  function syncStyleControls() {
    let target = null;
    let label = "";
    if (state.captionSelected) {
      target = state.caption; label = "图注 / Citation";
    } else {
      const a = currentSel();
      if (a && TEXT_TYPES.has(a.type)) {
        target = a;
        label = ({label:"面板标签",text:"文字注释",scale:"比例尺"})[a.type];
      }
    }
    styleTool.classList.toggle("disabled", !target);
    styleHint.textContent = target
      ? `当前选中：${label}`
      : "点画布上的文字对象，或点下方图注，再在此调整。";
    if (!target) return;
    styleSize.value = target.fontSize;
    styleSizeVal.textContent = `${target.fontSize} px`;
    styleFamily.value = target.family || "serif";
    styleBold.checked = !!target.bold;
    styleItalic.checked = !!target.italic;
    styleColor.value = target.color || "#0e0e0e";
    styleStroke.value = target.stroke || "#000000";
  }

  function ensureTextSelection() {
    if (state.captionSelected) return state.caption; // caption pseudo-target
    let a = currentSel();
    if (a && TEXT_TYPES.has(a.type)) return a;
    // 没有选中任何文字对象时，默认落到图注
    selectCaption();
    flash("已自动选中图注，调整会作用到图注");
    return state.caption;
  }

  function applyStyleToSel(patch) {
    const target = ensureTextSelection();
    if (!target) return;
    Object.assign(target, patch);
    // mark user customization so journal switch won't overwrite
    if (target === state.caption) {
      if ("family" in patch) target._userFamily = true;
      applyCaptionStyle();
    }
    render();
  }

  function selectCaption() {
    state.captionSelected = true;
    state.selectedId = null;
    $("#captionBlock").classList.add("selected");
    syncStyleControls();
    btnDelete.disabled = true;
  }
  function deselectCaption() {
    state.captionSelected = false;
    $("#captionBlock").classList.remove("selected");
  }

  $("#captionBlock").addEventListener("click", (e) => {
    e.stopPropagation();
    selectCaption();
    if (isMobile()) {
      openPanel();
      setTimeout(() => {
        styleTool.scrollIntoView({ behavior: "smooth", block: "start" });
        styleTool.classList.add("flash");
        setTimeout(() => styleTool.classList.remove("flash"), 1200);
      }, 200);
    }
  });
  styleSize.addEventListener("input", () => {
    styleSizeVal.textContent = `${styleSize.value} px`;
    applyStyleToSel({ fontSize: parseInt(styleSize.value, 10) });
  });
  styleFamily.addEventListener("change", () => applyStyleToSel({ family: styleFamily.value }));
  styleBold.addEventListener("change", () => applyStyleToSel({ bold: styleBold.checked }));
  styleItalic.addEventListener("change", () => applyStyleToSel({ italic: styleItalic.checked }));
  styleColor.addEventListener("input", () => applyStyleToSel({ color: styleColor.value }));
  styleStroke.addEventListener("input", () => applyStyleToSel({ stroke: styleStroke.value }));
  btnDelete.addEventListener("click", deleteSelected);
  btnClear.addEventListener("click", () => {
    if (!confirm("清空所有标注？")) return;
    state.annotations = [];
    state.selectedId = null;
    state.panelLabelSeq = 0;
    updateSelUI(false);
    render();
  });

  // ---------- Caption / citation ----------
  function updateCaptionPreview() {
    const fig = figNumberInput.value.trim() || "Figure 1";
    const txt = captionInput.value.trim() || "—";
    captionLine.innerHTML = `<b>${escapeHTML(fig)}.</b> <span id="captionText">${escapeHTML(txt)}</span>`;
  }
  function updateCitationPreview() {
    const author = $("#citAuthor").value.trim();
    const year = $("#citYear").value.trim();
    const title = $("#citTitle").value.trim();
    const journal = $("#citJournal").value.trim();
    const vp = $("#citVolPages").value.trim();
    if (!author && !title && !journal) { citationLine.textContent = "—"; return; }
    const parts = [];
    if (author) parts.push(author);
    if (year) parts.push(`(${year})`);
    let line = parts.join(" ");
    if (title) line += `. ${title}`;
    if (journal) line += `. <i>${escapeHTML(journal)}</i>`;
    if (vp) line += `, ${vp}`;
    line += ".";
    citationLine.innerHTML = line;
  }
  function escapeHTML(s) { return s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

  ["input", "change"].forEach(ev => {
    captionInput.addEventListener(ev, updateCaptionPreview);
    figNumberInput.addEventListener(ev, updateCaptionPreview);
    ["#citAuthor","#citYear","#citTitle","#citJournal","#citVolPages"].forEach(sel => {
      $(sel).addEventListener(ev, updateCitationPreview);
    });
  });

  function fillCitationFields(c) {
    $("#citAuthor").value = c.author;
    $("#citYear").value = c.year;
    $("#citTitle").value = c.title;
    $("#citJournal").value = c.journal;
    $("#citVolPages").value = c.volPages;
    updateCitationPreview();
  }

  $("#btnRandomCite").addEventListener("click", () => {
    const t = $("#captionTopic").value;
    fillCitationFields(window.pickCitation(t));
    flash("已生成 citation");
  });

  $("#btnLucky").addEventListener("click", () => {
    const t = $("#captionTopic").value;
    const lang = Math.random() < 0.5 ? "cn" : "en";
    captionInput.value = window.pickCaption(t, lang);
    const figN = Math.floor(Math.random() * 5) + 1;
    figNumberInput.value = lang === "cn" ? `图 ${figN}` : `Figure ${figN}`;
    updateCaptionPreview();
    fillCitationFields(window.pickCitation(t));
    flash("已随机生成 ✨");
  });

  $("#btnRandomCn").addEventListener("click", () => {
    const t = $("#captionTopic").value;
    captionInput.value = window.pickCaption(t, "cn");
    updateCaptionPreview();
  });
  $("#btnRandomEn").addEventListener("click", () => {
    const t = $("#captionTopic").value;
    captionInput.value = window.pickCaption(t, "en");
    updateCaptionPreview();
  });

  $("#btnCopyCaption").addEventListener("click", () => {
    const fig = figNumberInput.value.trim() || "Figure 1";
    const txt = captionInput.value.trim();
    navigator.clipboard.writeText(`${fig}. ${txt}`).then(() => flash("已复制图注"));
  });
  $("#btnCopyCite").addEventListener("click", () => {
    const text = citationLine.innerText;
    navigator.clipboard.writeText(text).then(() => flash("已复制 citation"));
  });
  $("#btnShareAll").addEventListener("click", () => {
    const fig = figNumberInput.value.trim() || "Figure 1";
    const txt = captionInput.value.trim();
    const cit = citationLine.innerText;
    navigator.clipboard.writeText(`${fig}. ${txt}\n\n${cit}`).then(() => flash("已复制"));
  });

  function flash(msg) {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0a0a0a;color:#fff;padding:8px 16px;border-radius:2px;font-family:var(--sans);font-size:12px;letter-spacing:0.05em;z-index:100;box-shadow:0 4px 20px rgba(0,0,0,0.2);";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }

  // ---------- Ratio buttons ----------
  document.querySelectorAll(".ratio").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".ratio").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      const [w, h] = btn.dataset.ratio.split(":").map(Number);
      setRatio(w, h);
    });
  });

  // ---------- Journal + layout buttons ----------
  $$(".j-btn").forEach(b => b.addEventListener("click", () => applyJournal(b.dataset.journal)));
  $$(".l-btn").forEach(b => b.addEventListener("click", () => setLayout(b.dataset.layout)));

  // ---------- Export ----------
  btnExport.addEventListener("click", () => {
    state.selectedId = null;
    render();

    const c = state.caption;
    const capFam = FAMILY_MAP[c.family] || FAMILY_MAP.serif;
    const capWeight = c.bold ? 700 : 500;
    const capItalic = c.italic ? "italic " : "";

    const padH = 32, padV = 28;
    // scale caption font: preview is ~16px, export canvas is typically 1200px wide.
    // Map the user-chosen size onto the export pixel space so it reads 1:1 with preview
    const capFont = Math.max(14, Math.round(c.fontSize * 1.4));
    const citFont = Math.max(11, capFont - 6);
    const lineGap = 10;

    const tmp = document.createElement("canvas");
    const tctx = tmp.getContext("2d");
    tctx.font = `${capItalic}${capWeight} ${capFont}px ${capFam}`;
    const fig = figNumberInput.value.trim() || "Figure 1";
    const capBody = captionInput.value.trim();
    const fullCaption = `${fig}. ${capBody}`;
    const capLines = wrapText(tctx, fullCaption, canvas.width - padH * 2, capFont);

    tctx.font = `italic ${citFont}px ${capFam}`;
    const citText = plainCitation();
    const citLines = citText ? wrapText(tctx, citText, canvas.width - padH * 2, citFont) : [];

    const capHeight = capLines.length * (capFont * 1.35);
    const citHeight = citLines.length ? (lineGap + citLines.length * (citFont * 1.4)) : 0;
    const footerHeight = padV + capHeight + citHeight + padV;

    const out = document.createElement("canvas");
    out.width = canvas.width;
    out.height = canvas.height + footerHeight;
    const octx = out.getContext("2d");
    octx.fillStyle = "#fff";
    octx.fillRect(0, 0, out.width, out.height);
    octx.drawImage(canvas, 0, 0);

    octx.fillStyle = c.color || "#0c0c0c";
    octx.textBaseline = "top";
    octx.font = `${capItalic}${capWeight} ${capFont}px ${capFam}`;
    let y = canvas.height + padV;
    capLines.forEach((ln, i) => {
      if (i === 0) {
        const prefix = fig + ". ";
        octx.font = `${capItalic}700 ${capFont}px ${capFam}`;
        octx.fillText(prefix, padH, y);
        const w = octx.measureText(prefix).width;
        octx.font = `${capItalic}${capWeight} ${capFont}px ${capFam}`;
        octx.fillText(ln.slice(prefix.length), padH + w, y);
      } else {
        octx.fillText(ln, padH, y);
      }
      y += capFont * 1.35;
    });
    if (citLines.length) {
      y += lineGap;
      octx.font = `italic ${citFont}px ${capFam}`;
      octx.fillStyle = "#555";
      citLines.forEach(ln => { octx.fillText(ln, padH, y); y += citFont * 1.4; });
    }

    out.toBlob((blob) => {
      const a = document.createElement("a");
      a.download = `paper-figure-${state.journal}-${Date.now()}.png`;
      a.href = URL.createObjectURL(blob);
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 500);
    }, "image/png");
  });

  function wrapText(c, text, maxW, fontSize) {
    const chars = text.split("");
    const lines = [];
    let cur = "";
    for (const ch of chars) {
      const test = cur + ch;
      if (c.measureText(test).width > maxW && cur.length > 0) {
        lines.push(cur);
        cur = ch;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function plainCitation() {
    const author = $("#citAuthor").value.trim();
    const year = $("#citYear").value.trim();
    const title = $("#citTitle").value.trim();
    const journal = $("#citJournal").value.trim();
    const vp = $("#citVolPages").value.trim();
    if (!author && !title && !journal) return "";
    let s = "";
    if (author) s += author;
    if (year) s += ` (${year})`;
    if (title) s += `. ${title}`;
    if (journal) s += `. ${journal}`;
    if (vp) s += `, ${vp}`;
    s += ".";
    return s;
  }

  // ---------- Panel (mobile drawer) ----------
  function openPanel()  { panel.classList.add("open");  panelCloseFab.classList.add("show"); }
  function closePanel() { panel.classList.remove("open"); panelCloseFab.classList.remove("show"); }
  function togglePanel(){ panel.classList.contains("open") ? closePanel() : openPanel(); }

  panelHandle.addEventListener("click", togglePanel);
  panelCloseFab.addEventListener("click", closePanel);

  // ---------- Help ----------
  btnHelp.addEventListener("click", () => {
    if (typeof helpDialog.showModal === "function") helpDialog.showModal();
    else alert("请参考页面右侧说明。");
  });

  // ---------- Init ----------
  setRatio(4, 3);
  applyJournal("default");
  setLayout("1x1");
  updateCaptionPreview();
  updateCitationPreview();
  render();

})();
