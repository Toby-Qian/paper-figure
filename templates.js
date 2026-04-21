/* =========================================================
   Paper Figure Studio — 大型模板库
   图注 + Citation，一键随机，不让用户动脑
   ========================================================= */

/* ---------- Caption templates ----------
   Placeholders: {n} {val} {p} {obj} {target} {unit} {time} {loc}
----------------------------------------------------------*/
window.CAPTION_TEMPLATES = {

  pet: [
    { cn: "尽管研究人员提供了价值 {val} 元的专业{obj}，受试对象仍表现出对{target}的显著偏好（P < 0.001, n = {n}）。",
      en: "Despite the provision of a professional-grade {obj} valued at ¥{val}, the subject exhibited a significant preference for {target} (P < 0.001, n = {n})." },
    { cn: "在长达 {n} 小时的持续观测中，受试个体始终维持蜷缩姿态，提示其对外界刺激的响应阈值显著上调。",
      en: "Over a continuous {n}-h observation window, the subject maintained a curled posture, indicating a markedly elevated response threshold." },
    { cn: "受试对象在 t = {val} s 时对食物信号的响应延迟低于 0.1 s，远低于群体均值。",
      en: "At t = {val} s the subject's latency to food-related cues dropped below 0.1 s, far lower than the population mean." },
    { cn: "图中虚线框为受试对象自发选择的栖息位置，与实验预设区域重合度低于 {val}%。",
      en: "The dashed box indicates the self-selected resting location; overlap with the pre-defined zone was below {val}%." },
    { cn: "热力分布显示受试者的活动密度在键盘区域达到峰值，显著高于周边（P < 0.01）。",
      en: "Heatmap analysis revealed peak activity density over the keyboard region, significantly exceeding adjacent areas (P < 0.01)." },
    { cn: "受试对象对主人呼唤的响应率为 {val}%，远低于对开罐头声音的响应率（98.6%）。",
      en: "Response rate to the owner's call was {val}%, markedly lower than the response rate to can-opening sounds (98.6%)." },
    { cn: "图示为受试者典型的 REM 阶段外显表情，胡须振幅达 {val} mm，表明深度梦境参与。",
      en: "Typical externalized REM expression of the subject; whisker oscillation reached {val} mm, indicating deep dream engagement." },
    { cn: "通过 {n} 次独立实验证实：纸箱对受试个体的吸引力随体积减小而单调递增。",
      en: "Across {n} independent trials, the attractiveness of cardboard boxes to the subject increased monotonically with decreasing volume." },
    { cn: "受试者对新购{obj}的接纳时间为 {val} h，而对包装盒的占有时间 > 72 h。",
      en: "Acceptance latency for the newly purchased {obj} was {val} h, whereas occupation of the packaging exceeded 72 h." },
    { cn: "受试个体的日均打鼾持续时间为 {val} h，显著长于文献报道的种属均值（Welch's t-test, P = 0.002）。",
      en: "Daily snoring duration averaged {val} h, significantly longer than species-level means reported in the literature (Welch's t-test, P = 0.002)." },
    { cn: "图中 (a) 与 (b) 为同一受试个体在不同时段的空间占据模式；差异由日照角度驱动。",
      en: "Panels (a) and (b) show spatial occupancy patterns of the same subject at different times; differences were driven by solar incidence angle." },
    { cn: "受试者主动社交行为的发生频率与投喂间隔呈负相关（r = -0.{val}, n = {n}）。",
      en: "The frequency of active social behavior was negatively correlated with feeding interval (r = -0.{val}, n = {n})." },
    { cn: "图示为受试对象在刺激源（吸尘器）出现 {val} s 后的空间分布，显示出高度可重复的回避模式。",
      en: "Spatial distribution {val} s after stimulus (vacuum cleaner) onset, showing a highly reproducible avoidance pattern." },
    { cn: "受试者的爪部肌电信号在梦境阶段达到清醒阶段的 {val} 倍，提示强化的虚拟捕猎行为。",
      en: "Paw EMG amplitude during dreaming reached {val}× that of the awake state, suggesting amplified virtual hunting behavior." },
    { cn: "红色虚线框内为目标行为单元；放大倍数 ×{val}。比例尺 = 1 cm。",
      en: "Target behavioral unit enclosed by the dashed box; magnification ×{val}. Scale bar = 1 cm." },
  ],

  food: [
    { cn: "{obj} 的体外消耗速率在 t ∈ [0, {val}] min 区间远超 Michaelis–Menten 预测值，呈现零级动力学特征。",
      en: "Ex-vivo consumption of {obj} during t ∈ [0, {val}] min greatly exceeded Michaelis–Menten predictions, exhibiting zero-order kinetics." },
    { cn: "经过 n = {n} 次独立重复实验，证实 {obj} 在 {val}°C 条件下具有最佳感官评分（9.{val}/10）。",
      en: "Across n = {n} independent replicates, {obj} achieved the highest sensory score at {val}°C (9.{val}/10)." },
    { cn: "图示为 {obj} 的典型形貌；标尺 = 1 cm。注意其表面的规律性脆化裂纹，与图 2 中的理想模型吻合。",
      en: "Representative morphology of {obj}; scale bar = 1 cm. Note the periodic fracture pattern consistent with the idealized model in Fig. 2." },
    { cn: "本餐次的饱腹效应持续时间为 {val} ± 0.3 h，显著短于文献报道值（P = 0.003）。",
      en: "Post-prandial satiety persisted for {val} ± 0.3 h, significantly shorter than reported in the literature (P = 0.003)." },
    { cn: "{obj} 从购入到消耗的时间间隔仅 {val} min，显著短于冰箱内同类样本的平均留置时间。",
      en: "Time from acquisition to consumption of {obj} was only {val} min, markedly shorter than mean refrigerator residence time." },
    { cn: "受试者在面对 {obj} 时的瞳孔直径增大 {val}%，符合预期的奖赏回路激活。",
      en: "Subject pupil diameter increased by {val}% in the presence of {obj}, consistent with anticipated reward-circuit activation." },
    { cn: "{obj} 的空间分布呈现显著的群聚模式（Moran's I = 0.{val}, P < 0.001），提示共享进食场景。",
      en: "Spatial distribution of {obj} exhibited significant clustering (Moran's I = 0.{val}, P < 0.001), suggesting shared consumption events." },
    { cn: "图示为 {obj} 典型横截面的显微形态；局部放大区域揭示出均匀的多孔结构。",
      en: "Typical cross-section of {obj}; magnified inset reveals a uniform porous microstructure." },
    { cn: "受试者对 {obj} 的自我报告满意度为 {val}/10，显著高于对替代方案（沙拉）的评分（P < 0.001）。",
      en: "Self-reported satisfaction for {obj} was {val}/10, significantly higher than the alternative (salad) (P < 0.001)." },
    { cn: "深夜 {time} 点的饥饿信号强度达日内峰值，{obj} 的感知吸引力同步上升 {val}%。",
      en: "Hunger signal intensity peaked at {time} in the evening, with perceived attractiveness of {obj} increasing by {val}% in parallel." },
    { cn: "图 (a)–(c) 展示 {obj} 在不同加热时长下的颜色演化，色调角变化符合 Arrhenius 关系。",
      en: "Panels (a)–(c) depict color evolution of {obj} under varying heating durations; hue shift follows an Arrhenius relationship." },
    { cn: "口感得分与咀嚼次数呈倒 U 型关系，最优咀嚼次数为 {val} 次（n = {n}）。",
      en: "Mouthfeel score followed an inverted-U curve with chewing count; optimum was {val} chews (n = {n})." },
    { cn: "单位时间内 {obj} 消耗量与社交氛围指数正相关（r = 0.{val}），提示情感代偿机制。",
      en: "Per-minute {obj} intake correlated positively with social-ambience index (r = 0.{val}), suggesting emotional compensation." },
  ],

  scene: [
    { cn: "日落色温随时间呈指数衰减（τ = {val} min），与大气瑞利散射模型一致。",
      en: "Sunset color temperature decayed exponentially (τ = {val} min), consistent with Rayleigh-scattering predictions." },
    { cn: "图示区域的主观美感评分（VAS, 1–10）为 {val} ± 0.4，显著高于对照地点（P < 0.001）。",
      en: "Subjective aesthetic rating (VAS 1–10) for the depicted region was {val} ± 0.4, significantly higher than controls (P < 0.001)." },
    { cn: "云层覆盖度经图像分割得到（IoU = 0.{val}），详见方法 2.3。",
      en: "Cloud-cover fraction was obtained via image segmentation (IoU = 0.{val}); see Methods 2.3." },
    { cn: "图 (a) 与 (b) 分别为同一地点在 {time} 与 {time2} 的色彩分布，证实短时大气变化对场景色调的显著影响。",
      en: "Panels (a) and (b) show color distributions at the same location at {time} and {time2}, confirming significant short-term atmospheric effects on scene tones." },
    { cn: "观察者驻留时间与地平线可见度呈正相关（r = 0.{val}, n = {n}），建议在该季节延长拍摄窗口。",
      en: "Observer dwell time correlated positively with horizon visibility (r = 0.{val}, n = {n}); extended capture windows are recommended this season." },
    { cn: "图中红色箭头所示为最佳构图锚点；黄金分割误差 < {val}%。",
      en: "The red arrow indicates the optimal compositional anchor; deviation from the golden ratio was < {val}%." },
    { cn: "大气通透度（AOD550）= 0.{val}，与裸眼判断的'通透'等级一致。",
      en: "Aerosol optical depth (AOD550) = 0.{val}, in agreement with the perceived 'clarity' rating." },
    { cn: "本场景在社交媒体平台的预期传播指数为 {val}（满分 10），显著高于近 30 日均值。",
      en: "Expected social-media propagation index for this scene was {val}/10, significantly above the 30-day mean." },
    { cn: "山体阴影延展长度 L = {val} m，可用于反推拍摄时刻的太阳高度角（Methods 3.1）。",
      en: "Projected shadow length L = {val} m allows inversion of solar elevation at capture time (Methods 3.1)." },
    { cn: "图示区域的行人密度低于 {val} 人/100 m²，满足'独处'场景的定义阈值。",
      en: "Pedestrian density in the depicted area was below {val} persons / 100 m², meeting the threshold for a 'solitude' scene." },
    { cn: "图中风场方向由地物偏折推断（见放大框），与气象站记录误差 < {val}°。",
      en: "Wind direction inferred from ground-object deflection (see inset) agreed with the meteorological station within < {val}°." },
  ],

  selfie: [
    { cn: "受试者自拍频率在外出前 10 分钟出现单峰激增（峰值 = {n} 张/min），与镜前停留时间高度相关（r = 0.{val}）。",
      en: "Self-portrait frequency peaked sharply during the 10-min pre-departure window (peak = {n} images/min), strongly correlated with mirror-dwell time (r = 0.{val})." },
    { cn: "图 (a) 与 (b) 为同一个体在不同光照下的面部反射率分布；差异主要由入射角（Δθ = {val}°）驱动。",
      en: "Panels (a) and (b) show facial reflectance distributions under distinct illumination; differences were driven by incidence angle (Δθ = {val}°)." },
    { cn: "自评得分平均高于他评 {val} 分，符合已知的 Dunning–Kruger 偏差。",
      en: "Self-rating exceeded peer rating by {val} points on average, consistent with the documented Dunning–Kruger bias." },
    { cn: "候选照片数 N = {n}；经多轮筛选仅 {val}% 被认为达到发布阈值（criteria 见 Methods 2.4）。",
      en: "Candidate pool N = {n}; only {val}% met the posting threshold after iterative filtering (criteria in Methods 2.4)." },
    { cn: "在受控光照下，受试者面部对称性指数提升 {val}%，与镜像偏好假说一致。",
      en: "Under controlled illumination, facial symmetry index improved by {val}%, consistent with the mirror-preference hypothesis." },
    { cn: "从按下快门到发布朋友圈的中位时间为 {val} min，反映后处理的高强度依赖。",
      en: "Median latency from shutter release to public posting was {val} min, reflecting heavy reliance on post-processing." },
    { cn: "角度 θ ∈ [{val}°, 45°] 被证明为本受试者的最优拍摄角度（n = {n}）。",
      en: "Angles θ ∈ [{val}°, 45°] were identified as optimal for the subject (n = {n})." },
    { cn: "图中虚线圈为算法识别的'核心光源区'，其面积与照片点赞数正相关（r² = 0.{val}）。",
      en: "The dashed circle marks the algorithm-identified 'core illumination zone', whose area correlated with like counts (r² = 0.{val})." },
    { cn: "穿搭一致性指数 = {val}/10；背景色对比度贡献了 {val}% 的视觉重量。",
      en: "Outfit coherence index = {val}/10; background contrast contributed {val}% of visual weight." },
    { cn: "受试者在镜头前的平均停留时间为 {val} s，显著长于对照场景（P < 0.01）。",
      en: "Mean time in front of the camera was {val} s, significantly longer than in control scenarios (P < 0.01)." },
  ],

  work: [
    { cn: "受试者在非工作时段的任务切换频率显著高于工作时段（{val} 次/h vs 0.3 次/h, P < 0.001）。",
      en: "Task-switching frequency off-hours was markedly higher than on-hours ({val}/h vs 0.3/h, P < 0.001)." },
    { cn: "咖啡因摄入与代码输出量呈非单调关系；局部最优出现在 {val} mg 处。",
      en: "The caffeine–output relationship was non-monotonic, peaking locally at {val} mg." },
    { cn: "图示为典型工位配置；工具密度超过有效工作面积 {val}%，其余空间用于放置情绪补偿物。",
      en: "Representative workstation; tool density exceeded effective work area by {val}%, with remaining space devoted to emotional compensation objects." },
    { cn: "日均会议时长 = {val} h；有效输出时间与会议时长呈负相关（β = -0.{val}）。",
      en: "Daily meeting duration = {val} h; effective output time correlated negatively with meeting duration (β = -0.{val})." },
    { cn: "受试者的屏幕切换频率在 15:00 后显著上升，与认知疲劳模型预测一致。",
      en: "Screen-switching frequency rose markedly after 15:00, consistent with cognitive-fatigue model predictions." },
    { cn: "图 (a)–(d) 为 {n} 天内同一工位的熵值演化，证实单调递增趋势（Kendall's τ = 0.{val}）。",
      en: "Panels (a)–(d) show entropy evolution of the same workstation across {n} days, confirming a monotonic increase (Kendall's τ = 0.{val})." },
    { cn: "代码行数与实际功能产出的相关系数为 r = 0.{val}，提示部分'膨胀'现象。",
      en: "Lines of code correlated with functional output at r = 0.{val}, suggesting partial 'inflation'." },
    { cn: "注意放大框内的物理键盘磨损图样；高频键位（E, N, Space）磨损深度达 {val} μm。",
      en: "Note the key-wear pattern in the inset; high-frequency keys (E, N, Space) showed wear depth up to {val} μm." },
    { cn: "受试者对 Slack 消息的首次响应延迟服从对数正态分布（μ = {val}, σ = 0.9）。",
      en: "First-response latency to Slack messages followed a log-normal distribution (μ = {val}, σ = 0.9)." },
    { cn: "图示咖啡杯占据空间在 72 小时内增长 {val}%，遵循指数堆积模型（R² = 0.{val}）。",
      en: "Coffee-cup occupied volume grew by {val}% over 72 h, following an exponential accumulation model (R² = 0.{val})." },
  ],

  daily: [
    { cn: "受试者在外部刺激持续 {val} 分钟后仍维持水平静息状态，表明该行为具有高度时间稳定性。",
      en: "The subject maintained a horizontal resting state after {val} min of external stimulation, indicating high temporal stability of the behavior." },
    { cn: "日常行为轨迹呈现明显的双峰结构（早、晚），与预期的 ultradian rhythm 一致（R² = 0.{val}）。",
      en: "Daily behavioral trajectories displayed a clear bimodal structure (morning/evening), consistent with ultradian rhythm (R² = 0.{val})." },
    { cn: "对{obj}的依赖程度随温度降低而指数上升（k = {val} °C⁻¹）。",
      en: "Dependence on {obj} increased exponentially with decreasing temperature (k = {val} °C⁻¹)." },
    { cn: "图示受试者在床与工位之间的日均位移为 {val} m，显著低于 WHO 推荐阈值。",
      en: "Daily displacement between bed and workstation averaged {val} m, significantly below the WHO recommended threshold." },
    { cn: "闹钟响应延迟服从重尾分布；P99 = {val} min，详见附录 S3。",
      en: "Alarm-response latency followed a heavy-tailed distribution; P99 = {val} min (see Supplementary S3)." },
    { cn: "地铁通勤阶段的屏幕凝视时长为 {val} ± 1.2 min，与竖屏短视频播放时长强相关。",
      en: "Subway-commute screen-gaze time was {val} ± 1.2 min, strongly correlated with vertical short-video playback." },
    { cn: "受试者于 {time} 启动首次进食行为，较作息计划延迟 {val} min（Cohen's d = 0.{val}）。",
      en: "First feeding event initiated at {time}, delayed by {val} min relative to scheduled routine (Cohen's d = 0.{val})." },
    { cn: "图示为典型周末状态：有效清醒时长占比 = {val}%，其余为过渡态。",
      en: "Typical weekend state: effective awake fraction = {val}%, the remainder comprising transition states." },
    { cn: "快递开箱行为的多巴胺峰值在开箱后 {val} s 达到；残留效应 < 3 min。",
      en: "Package-opening dopamine peaked at {val} s post-unboxing; residual effect < 3 min." },
    { cn: "受试者对外卖的依赖指数 DI = {val}；DI 与厨房使用率呈显著负相关（r = -0.{val}）。",
      en: "Food-delivery dependence index DI = {val}; DI was negatively correlated with kitchen utilization (r = -0.{val})." },
    { cn: "图中放大框显示典型卧床姿态；躯干轴与水平面夹角为 {val}°，符合'躺平'定义。",
      en: "The inset reveals a characteristic bed-bound posture; torso-horizontal angle = {val}°, satisfying the 'lying-flat' definition." },
  ]
};

/* ---------- 占位符填充池（更丰富） ---------- */
window.FILL_POOLS = {
  pet: {
    obj: ["猫爬架", "羊毛毯", "宠物零食", "电动逗猫棒", "有机猫粮", "智能饮水机", "磨爪板", "恒温窝"],
    target: ["价值 3 块钱的纸箱", "房主的键盘", "阳光斑块", "用户大腿", "塑料袋", "空水瓶", "地板角落", "刚拖过的地"],
    val: ["1500", "299", "48", "9.8", "85", "67", "42", "128", "3.2", "7.9"],
    n: ["37", "128", "64", "256", "48", "93"],
    time: ["03:27", "14:05", "22:18"]
  },
  food: {
    obj: ["炸鸡", "螺蛳粉", "关东煮", "奶茶", "提拉米苏", "麻辣烫", "烧烤串", "寿喜锅", "牛角包", "蛋挞"],
    val: ["6.2", "38", "72", "4.5", "93", "8.7", "12", "55", "3.6"],
    n: ["30", "42", "88", "120"],
    time: ["23", "24", "1", "2"]
  },
  scene: {
    val: ["8.7", "7.3", "12.4", "88", "91", "62", "4.8", "1.6", "73"],
    n: ["24", "48", "96"],
    time: ["07:32", "17:48", "19:12"],
    time2: ["08:15", "18:30", "20:05"]
  },
  selfie: {
    val: ["84", "79", "2.3", "37", "3.8", "91", "12", "68"],
    n: ["14", "22", "47", "88"]
  },
  work: {
    obj: ["工位", "显示器", "机械键盘", "电子日历"],
    val: ["4.2", "180", "47", "2.6", "33", "9.1", "62"],
    n: ["12", "18", "45"]
  },
  daily: {
    obj: ["外卖", "被窝", "奶茶", "电子产品", "空调", "羽绒服"],
    val: ["42", "0.87", "3.5", "128", "23", "7.4", "12.6", "1.8"],
    n: ["7", "30"],
    time: ["07:48", "11:03", "13:21"]
  }
};

window.ALL_TOPICS = ["pet", "food", "scene", "selfie", "work", "daily"];

/* 从模板池抽一条并填占位符 */
window.pickCaption = function(topic, lang) {
  const topics = (topic && topic !== "all") ? [topic] : window.ALL_TOPICS;
  const t = topics[Math.floor(Math.random() * topics.length)];
  const arr = window.CAPTION_TEMPLATES[t] || [];
  if (!arr.length) return "";
  const tpl = arr[Math.floor(Math.random() * arr.length)];
  let s = (lang === "en") ? tpl.en : tpl.cn;
  const pool = window.FILL_POOLS[t] || {};
  s = s.replace(/\{(\w+)\}/g, (_, key) => {
    const options = pool[key] || [];
    if (options.length) return options[Math.floor(Math.random() * options.length)];
    const g = {
      n: Math.floor(Math.random() * 90 + 10),
      val: (Math.random() * 9 + 1).toFixed(1),
      p: "< 0.001", obj: "对象", target: "目标",
      time: `${Math.floor(Math.random()*24).toString().padStart(2,"0")}:${Math.floor(Math.random()*60).toString().padStart(2,"0")}`,
      time2: `${Math.floor(Math.random()*24).toString().padStart(2,"0")}:${Math.floor(Math.random()*60).toString().padStart(2,"0")}`
    };
    return g[key] ?? "";
  });
  return s;
};

/* =========================================================
   Citation 模板库
========================================================= */

window.CITATION_POOL = {
  authors: [
    "Qian, T.", "Li, W.", "Zhang, H.", "Chen, Y.", "Wang, J.", "Liu, X.",
    "Zhao, M.", "Kim, S.", "Tanaka, H.", "Patel, R.", "Nakamura, A.",
    "Gonzalez, M.", "Hoffmann, F.", "Ivanova, E.", "Park, D.",
    "Rossi, L.", "Dubois, M.", "Yamamoto, K.", "O'Brien, S.", "Silva, R.",
    "钱, T.", "李, W.", "张, H.", "王, J.", "刘, X.", "赵, M."
  ],
  coauthor_prob: 0.7, // 70% 概率有共同作者
  // 期刊分主题 + 通用库
  journals: {
    generic: [
      "Journal of Daily Observations",
      "Nature Everyday",
      "Annals of Casual Science",
      "Proceedings of the Personal Academy",
      "Cell Reports: Behavior",
      "PLOS Trivial",
      "Frontiers in Slice-of-Life Research",
      "Journal of Informal Findings",
      "ACM Transactions on Life",
      "IEEE Life Events Magazine"
    ],
    pet: [
      "Journal of Feline Behavioral Sciences",
      "Companion Animal Research Letters",
      "Ethology Reports",
      "Nature Small Mammals",
      "Purr Review Letters",
      "Cat & Society"
    ],
    food: [
      "Journal of Gastronomic Observations",
      "Culinary Physics Reports",
      "Food Behavioral Quarterly",
      "International Journal of Snacking Studies",
      "Annals of Late-Night Dining"
    ],
    scene: [
      "Landscape Perception Quarterly",
      "Atmospheric Aesthetics Letters",
      "Journal of Urban Wandering",
      "Nature Skies",
      "Annals of Sunset Studies"
    ],
    selfie: [
      "Journal of Self-Portraiture",
      "Social Media Behavioral Sciences",
      "Mirror Studies International",
      "Frontiers in Pose Analysis"
    ],
    work: [
      "Workplace Entropy Journal",
      "IEEE Transactions on Procrastination",
      "Annals of Cubicle Studies",
      "Journal of Meeting Science",
      "Nature Productivity"
    ],
    daily: [
      "Journal of Ordinary Behavior",
      "Lying-Flat Quarterly",
      "Annals of Domestic Inertia",
      "Nature Weekend",
      "Sleep & Beyond"
    ]
  },
  // 标题骨架：%topic% %method% %what%
  title_templates: [
    "A {method} study of {what} in {context}",
    "Quantitative characterization of {what}: evidence from {context}",
    "On the relationship between {what} and {context}: a {method} perspective",
    "{what} revisited: {method} evidence from a longitudinal cohort",
    "Latent patterns of {what} in {context}",
    "The paradox of {what}: a {method} investigation",
    "Spatiotemporal dynamics of {what} under naturalistic conditions",
    "Why do we {verb}? A {method} approach",
    "Mapping {what} across {context}",
    "{what}: a dose-response analysis"
  ],
  title_fills: {
    pet: {
      what: ["feline territoriality", "cardboard-box affinity", "feeding-cue latency", "rest-state duration", "purr-frequency spectra", "whisker-motion kinematics"],
      context: ["domestic environments", "urban apartments", "multi-pet households", "small enclosures"],
      method: ["behavioral", "longitudinal", "observational", "ethological"],
      verb: ["love cats", "feed strays", "buy useless toys"]
    },
    food: {
      what: ["late-night snacking", "takeout dependence", "mouthfeel optimization", "spice tolerance drift", "bubble-tea selection"],
      context: ["shared kitchens", "delivery ecosystems", "weekend dining", "college dormitories"],
      method: ["sensory", "kinetic", "cross-sectional", "meta-analytic"],
      verb: ["crave spicy food", "order at 2am", "rate restaurants"]
    },
    scene: {
      what: ["sunset color shifts", "cloud morphology", "urban-nature contrast", "horizon visibility"],
      context: ["metropolitan dusk", "mountain lookouts", "coastal regions", "seasonal transitions"],
      method: ["photometric", "spectral", "time-lapse", "geospatial"],
      verb: ["photograph sunsets", "chase golden hour"]
    },
    selfie: {
      what: ["facial symmetry perception", "mirror-dwell time", "posting-latency distribution", "lighting preference"],
      context: ["social-media cohorts", "pre-departure windows", "weekend settings"],
      method: ["self-report", "image-analytic", "longitudinal"],
      verb: ["retake selfies", "edit photos"]
    },
    work: {
      what: ["task-switching frequency", "workstation entropy", "coffee-intake patterns", "meeting-induced fatigue"],
      context: ["open-plan offices", "remote cohorts", "agile teams"],
      method: ["ergonomic", "temporal", "cross-sectional", "empirical"],
      verb: ["miss deadlines", "join meetings", "refill coffee"]
    },
    daily: {
      what: ["lying-flat behavior", "alarm-response latency", "weekend inertia", "delivery-dependence index"],
      context: ["young adult cohorts", "first-tier cities", "post-pandemic routines"],
      method: ["actigraphic", "self-report", "retrospective"],
      verb: ["skip breakfast", "binge-watch", "sleep in"]
    },
    generic: {
      what: ["observed phenomena", "behavioral outcomes", "contextual signals"],
      context: ["naturalistic settings", "everyday environments"],
      method: ["observational", "mixed-methods"],
      verb: ["do what we do"]
    }
  }
};

function randomOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

window.pickCitation = function(topic) {
  const pool = window.CITATION_POOL;
  const t = (topic && topic !== "all" && pool.journals[topic]) ? topic : "generic";

  // authors
  const first = randomOf(pool.authors);
  let authorStr = first;
  if (Math.random() < pool.coauthor_prob) {
    const second = randomOf(pool.authors.filter(a => a !== first));
    authorStr = `${first}, ${second}`;
    if (Math.random() < 0.3) {
      const third = randomOf(pool.authors.filter(a => a !== first && a !== second));
      authorStr = `${first}, ${second}, & ${third}`;
    }
  }

  // year
  const year = String(randInt(2019, 2026));

  // journal
  const journalArr = pool.journals[t] || pool.journals.generic;
  const journal = randomOf(journalArr);

  // title
  const fills = pool.title_fills[t] || pool.title_fills.generic;
  let title = randomOf(pool.title_templates);
  title = title.replace(/\{what\}/g, randomOf(fills.what))
               .replace(/\{context\}/g, randomOf(fills.context))
               .replace(/\{method\}/g, randomOf(fills.method))
               .replace(/\{verb\}/g, randomOf(fills.verb));
  // 首字母大写
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // volume, pages
  const vol = randInt(3, 48);
  const issue = randInt(1, 12);
  const startPage = randInt(1, 800);
  const endPage = startPage + randInt(5, 30);
  const volPages = `${vol}(${issue}), ${startPage}–${endPage}`;

  return { author: authorStr, year, title, journal, volPages };
};
