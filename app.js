/* =========================================================
   Paper Figure Studio — Canvas editor
   Pure front-end, no dependencies.
   ========================================================= */

(() => {
  "use strict";

  // ---------- DOM ----------
  const $  = (s) => document.querySelector(s);
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
  const btnDelete = $("#btnDelete");
  const btnClear = $("#btnClear");
  const btnExport = $("#btnExport");
  const btnHelp = $("#btnHelp");
  const helpDialog = $("#helpDialog");

  // ---------- State ----------
  const state = {
    img: null,           // HTMLImageElement
    imgDraw: null,       // {x,y,w,h} on canvas
    annotations: [],
    selectedId: null,
    nextId: 1,
    ratio: [4, 3],
    filters: { grayscale: false, photocopy: false, heatmap: false },
    panelLabelSeq: 0,    // 0 -> 'a', 1 -> 'b'...
  };

  const BASE_LONG = 1200; // long edge of canvas

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
    fitImage();
    render();
  }

  function fitImage() {
    if (!state.img) return;
    const { naturalWidth: iw, naturalHeight: ih } = state.img;
    const cw = canvas.width, ch = canvas.height;
    const s = Math.min(cw / iw, ch / ih);
    const w = iw * s, h = ih * s;
    state.imgDraw = { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
  }

  // ---------- Image loading ----------
  function loadImageFromFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      state.img = img;
      fitImage();
      emptyHint.style.display = "none";
      render();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  fileInput.addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) loadImageFromFile(f);
  });

  // drag & drop onto frame
  ["dragenter", "dragover"].forEach(ev => frame.addEventListener(ev, (e) => {
    e.preventDefault(); frame.classList.add("dragover");
  }));
  ["dragleave", "drop"].forEach(ev => frame.addEventListener(ev, (e) => {
    e.preventDefault(); frame.classList.remove("dragover");
  }));
  frame.addEventListener("drop", (e) => {
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) loadImageFromFile(f);
  });

  // paste
  window.addEventListener("paste", (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (const it of items) {
      if (it.type && it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) loadImageFromFile(f);
        break;
      }
    }
  });

  // ---------- Annotation factory ----------
  function addAnnotation(type) {
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const id = state.nextId++;
    let obj;
    switch (type) {
      case "label": {
        const letter = String.fromCharCode(97 + state.panelLabelSeq++);
        obj = { id, type: "label", x: 30, y: 50, text: `(${letter})`,
                fontSize: 44, family: "serif", bold: true, italic: false,
                color: "#ffffff", stroke: "#000000" };
        break;
      }
      case "arrow":
        obj = { id, type: "arrow", x1: cx - 160, y1: cy - 120, x2: cx - 40, y2: cy - 40, color: "#ffffff", width: 5 };
        break;
      case "text":
        obj = { id, type: "text", x: cx, y: cy, text: "双击编辑",
                fontSize: 26, family: "serif", bold: false, italic: false,
                color: "#ffffff", stroke: "#000000" };
        break;
      case "zoom":
        obj = { id, type: "zoom",
                srcX: cx - 80, srcY: cy - 60, srcW: 160, srcH: 120,
                dstX: canvas.width - 340, dstY: 40, dstW: 300, dstH: 225,
                scale: 10, color: "#d12020" };
        break;
      case "scale":
        obj = { id, type: "scale", x: canvas.width - 220, y: canvas.height - 60,
                length: 160, text: "100 μm",
                fontSize: 20, family: "serif", bold: false, italic: false,
                color: "#ffffff", stroke: "#000000" };
        break;
      case "rect":
        obj = { id, type: "rect", x: cx - 120, y: cy - 90, w: 240, h: 180, color: "#d12020", dash: [8, 6], lineWidth: 3 };
        break;
      default: return;
    }
    state.annotations.push(obj);
    state.selectedId = id;
    updateSelUI();
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
    // sample pixel data inside image area and remap to heatmap LUT
    try {
      const img = ctx.getImageData(x, y, w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const lum = (0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2]) / 255;
        const c = heatColor(lum);
        d[i] = c[0]; d[i+1] = c[1]; d[i+2] = c[2];
      }
      ctx.putImageData(img, x, y);
    } catch (e) { /* tainted canvas — ignore */ }
  }
  function heatColor(t) {
    // simple viridis-ish: dark purple -> red -> yellow
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

    // image with CSS-like filter
    if (state.img && state.imgDraw) {
      const fs = buildFilterString();
      ctx.filter = fs || "none";
      ctx.drawImage(state.img, state.imgDraw.x, state.imgDraw.y, state.imgDraw.w, state.imgDraw.h);
      ctx.filter = "none";
      if (state.filters.heatmap) {
        applyHeatmap(Math.floor(state.imgDraw.x), Math.floor(state.imgDraw.y),
                     Math.floor(state.imgDraw.w), Math.floor(state.imgDraw.h));
      }
    }

    // annotations
    for (const a of state.annotations) drawAnnotation(a);

    // selection
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
    serif: '"EB Garamond", "Noto Serif SC", Georgia, serif',
    sans: '"Inter", "Noto Serif SC", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
    cnserif: '"Noto Serif SC", "EB Garamond", serif'
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
    // white bar with thin black border
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

  function drawZoom(a) {
    // source dashed rect
    ctx.save();
    ctx.strokeStyle = a.color || "#d12020";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(a.srcX, a.srcY, a.srcW, a.srcH);
    ctx.setLineDash([]);

    // connectors from src corners to dst corners
    ctx.beginPath();
    ctx.moveTo(a.srcX + a.srcW, a.srcY); ctx.lineTo(a.dstX, a.dstY);
    ctx.moveTo(a.srcX + a.srcW, a.srcY + a.srcH); ctx.lineTo(a.dstX, a.dstY + a.dstH);
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // dst box: magnified crop
    if (state.img && state.imgDraw) {
      const id = state.imgDraw;
      // map src rect (canvas coords) back to image coords
      const sx = (a.srcX - id.x) / id.w * state.img.naturalWidth;
      const sy = (a.srcY - id.y) / id.h * state.img.naturalHeight;
      const sw = a.srcW / id.w * state.img.naturalWidth;
      const sh = a.srcH / id.h * state.img.naturalHeight;
      // clip to image bounds
      const clampedSX = Math.max(0, sx), clampedSY = Math.max(0, sy);
      const clampedSW = Math.min(state.img.naturalWidth - clampedSX, sw);
      const clampedSH = Math.min(state.img.naturalHeight - clampedSY, sh);
      if (clampedSW > 0 && clampedSH > 0) {
        ctx.filter = buildFilterString() || "none";
        ctx.drawImage(state.img, clampedSX, clampedSY, clampedSW, clampedSH,
                      a.dstX, a.dstY, a.dstW, a.dstH);
        ctx.filter = "none";
        if (state.filters.heatmap) {
          applyHeatmap(Math.floor(a.dstX), Math.floor(a.dstY), Math.floor(a.dstW), Math.floor(a.dstH));
        }
      }
    }
    // outer border
    ctx.strokeStyle = a.color || "#d12020";
    ctx.lineWidth = 3;
    ctx.strokeRect(a.dstX, a.dstY, a.dstW, a.dstH);

    // scale badge
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
      // for zoom allow hitting both src and dst sub-boxes
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
    const p = getCanvasPoint(e);
    const hit = hitTest(p.x, p.y);
    if (hit) {
      state.selectedId = hit.id;
      pointer = { id: hit.id, mode: hit._drag || "whole", startX: p.x, startY: p.y, snap: JSON.parse(JSON.stringify(hit)) };
    } else {
      state.selectedId = null;
      pointer = null;
    }
    updateSelUI();
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

  // double-click to edit text
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
    updateSelUI();
    render();
  }
  function updateSelUI() {
    btnDelete.disabled = !state.selectedId;
    syncStyleControls();
  }

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

  function syncStyleControls() {
    const a = currentSel();
    const has = a && TEXT_TYPES.has(a.type);
    styleTool.classList.toggle("disabled", !has);
    styleHint.textContent = has
      ? `当前选中：${({label:"面板标签",text:"文字注释",scale:"比例尺"})[a.type]}`
      : "先点画布上的文字对象，再在此调整。";
    if (!has) return;
    styleSize.value = a.fontSize;
    styleSizeVal.textContent = `${a.fontSize} px`;
    styleFamily.value = a.family || "serif";
    styleBold.checked = !!a.bold;
    styleItalic.checked = !!a.italic;
    styleColor.value = a.color || "#ffffff";
    styleStroke.value = a.stroke || "#000000";
  }

  function applyStyleToSel(patch) {
    const a = currentSel();
    if (!a || !TEXT_TYPES.has(a.type)) return;
    Object.assign(a, patch);
    render();
  }
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
    updateSelUI();
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
    // 随机图号
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

  // ---------- Export ----------
  btnExport.addEventListener("click", () => {
    // compose final PNG with caption block below
    state.selectedId = null;
    render();

    const padH = 32, padV = 28;
    const capFont = 22;
    const citFont = 16;
    const lineGap = 10;

    // measure caption text
    const tmp = document.createElement("canvas");
    const tctx = tmp.getContext("2d");
    tctx.font = `500 ${capFont}px "EB Garamond", serif`;
    const fig = figNumberInput.value.trim() || "Figure 1";
    const capBody = captionInput.value.trim();
    const fullCaption = `${fig}. ${capBody}`;
    const capLines = wrapText(tctx, fullCaption, canvas.width - padH * 2, capFont);

    tctx.font = `italic ${citFont}px "EB Garamond", serif`;
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

    // caption
    octx.fillStyle = "#0c0c0c";
    octx.textBaseline = "top";
    octx.font = `500 ${capFont}px "EB Garamond", serif`;
    let y = canvas.height + padV;
    // bold fig number inline
    // drew as one wrapped block; bold not rendered — simplify: wrap the whole line plain, then overlay bold prefix
    capLines.forEach((ln, i) => {
      if (i === 0) {
        const prefix = fig + ". ";
        octx.font = `700 ${capFont}px "EB Garamond", serif`;
        octx.fillText(prefix, padH, y);
        const w = octx.measureText(prefix).width;
        octx.font = `500 ${capFont}px "EB Garamond", serif`;
        octx.fillText(ln.slice(prefix.length), padH + w, y);
      } else {
        octx.fillText(ln, padH, y);
      }
      y += capFont * 1.35;
    });
    if (citLines.length) {
      y += lineGap;
      octx.font = `italic ${citFont}px "EB Garamond", serif`;
      octx.fillStyle = "#555";
      citLines.forEach(ln => { octx.fillText(ln, padH, y); y += citFont * 1.4; });
    }

    out.toBlob((blob) => {
      const a = document.createElement("a");
      a.download = `paper-figure-${Date.now()}.png`;
      a.href = URL.createObjectURL(blob);
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 500);
    }, "image/png");
  });

  function wrapText(c, text, maxW, fontSize) {
    const words = text.split("");
    const lines = [];
    let cur = "";
    for (const ch of words) {
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
  panelHandle.addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  // ---------- Help ----------
  btnHelp.addEventListener("click", () => {
    if (typeof helpDialog.showModal === "function") helpDialog.showModal();
    else alert("请参考页面右侧说明。");
  });

  // ---------- Init ----------
  setRatio(4, 3);
  updateCaptionPreview();
  updateCitationPreview();
  render();

})();
