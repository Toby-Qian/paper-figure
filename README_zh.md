# 📑 Paper Figure Studio

[English](README.md) 🌍 | **简体中文** 🇨🇳

> **把任何照片变成一张论文配图。** 纯本地运行、零上传、一键随机学术文案。

在浏览器里给日常照片贴上 `(a)(b)` 面板标签、红色虚线放大框、箭头、比例尺和图注 caption，导出一张"像从 Nature 里扒下来"的配图。配套有内置的中英双语学术模板库，连配图说明和假 Citation 都帮你想好了。

**在线体验**：<https://toby-qian.github.io/paper-figure/>

---

## ✨ 特性

- **🖼 画布编辑器**：上传 / 拖拽 / 粘贴图片，添加多种学术元素
  - `(a)(b)(c)` 面板标签
  - 箭头 + 说明文字
  - 红色虚线框 + 自动放大镜（从原图裁切 `×N` 倍放大）
  - 比例尺（带 μm / cm / nm 文字）
  - 自由文字注释
- **🎨 滤镜**：黑白 / 影印版模糊 / 伪热力图
- **Aa 字体控制**：任何文字对象都可选中调整字号、衬线/无衬线、粗体/斜体、填充色 + 描边色
- **🎲 模板库**（80+ 条中英双语图注）
  - 6 大主题：宠物 / 美食 / 风景 / 自拍 / 工作 / 日常
  - 占位符随机填充，每次都不重样
- **📚 自动 Citation**：假作者、假期刊名（*Purr Review Letters*、*Lying-Flat Quarterly*、*IEEE Trans. on Procrastination* …）、卷/期/页码一键生成
- **⚡ 一键随机整套**：图注 + 引用 + 图号一次搞定，不需要动脑
- **📱 完整响应式**：桌面左画布+右面板；手机底部可滑抽屉
- **📤 多比例导出**：4:3 / 1:1 / 3:4 / 16:9，PNG 自动拼接图注 + Citation，适配小红书 / 微博 / 朋友圈
- **🔒 纯前端**：零依赖、零后端、零上传，所有数据只在你的浏览器里

---

## 🚀 在线使用

直接打开 <https://toby-qian.github.io/paper-figure/>

---

## 🛠 本地运行

```bash
git clone https://github.com/Toby-Qian/paper-figure.git
cd paper-figure

# 任选一种方式启动静态服务器
python -m http.server 8000
# 或
npx serve .
```

浏览器访问 <http://localhost:8000>

> ⚠️ 不要直接双击 `index.html`（`file://` 协议下剪贴板粘贴图片会受限）。

---

## 🖱 使用流程

1. **上传图片**：点击右侧 `01 · Source` 区，或把图拖到画布、或直接 `Ctrl+V` 粘贴
2. **选主题**（可选）：在 `03 · Caption` 选宠物 / 美食 / 风景 / 自拍 / 工作 / 日常
3. **一键随机**：点红色 **🎲 随机整套** 按钮，图注与 Citation 同时出现
4. **加标注**：在 `02 · Annotations` 点"+ 面板标签"、"+ 箭头"、"+ 放大框"…
   - 点画布上的对象可拖动
   - 双击文字可改字
   - 选中后右侧 `Aa · 文字样式` 面板可改字号和字体
   - 选中后按 <kbd>Delete</kbd> 删除
5. **导出**：选比例（4:3 / 1:1 …）→ 点 `⬇ 下载 PNG`

## 📷 效果示例

> *正在补充截图…如果你用它做了有趣的图，欢迎 PR 或 issue 投稿。*

---

## 🏗 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| UI | 纯 HTML + CSS | 无框架，Google Fonts (EB Garamond / Inter / JetBrains Mono) |
| 画布 | Canvas 2D API | 原生绘制，无 Fabric.js / Konva 依赖 |
| 交互 | Pointer Events | 鼠标 + 触屏统一 |
| 模板 | 静态 JSON | `templates.js` 可自由扩充 |
| 打包 | 无 | 直接 `<script>` 引入，零构建 |

文件结构：

```
paper-figure/
├── index.html        页面结构
├── style.css         样式 + 响应式
├── app.js            Canvas 编辑器（~650 行）
├── templates.js      图注 / Citation 模板库
└── README.md
```

---

## 📝 扩展模板

想加新主题或新文案？直接编辑 `templates.js`：

```js
window.CAPTION_TEMPLATES.newTopic = [
  { cn: "你的中文模板，{val} 是占位符。",
    en: "Your English template with {val} as placeholder." },
  // …更多
];
window.FILL_POOLS.newTopic = {
  val: ["12", "34", "56"],
  n: ["10", "20"]
};
```

再把 `<select id="captionTopic">` 加上一个 `<option value="newTopic">`即可。

---

## 📦 部署到 GitHub Pages

本仓库已配置好根目录直接发布：

```bash
# 推到 main 分支
git push

# 仓库 Settings → Pages → Source: Deploy from branch (main / root)
```

几分钟后 `https://<user>.github.io/paper-figure/` 自动可用。

---

## 💡 致谢 & 灵感

灵感来自社交媒体上流传的"把日常照片 P 成伪论文配图"创意，以及所有在严肃学术格式里藏段子的研究生。

---

## 📜 许可

[MIT](LICENSE) © 2026 [Toby Qian](https://toby-qian.github.io)

> 做出的图如果要投稿真期刊请自行处理。作者不为图注内容中的任何虚构统计值负责。
