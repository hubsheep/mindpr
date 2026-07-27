# 维度11：自我量化、测量工具与反馈可视化 —— 研究备忘录

**项目**：「每日训练大脑·心智·灵魂」软件方案
**本维度问题**：如何测量进步？用什么工具、追踪什么指标、如何可视化反馈、按什么节奏复盘？
**调研日期**：2026-07-26 ｜ 独立搜索次数：28 次（中文为主，学术内容英文）
**方法说明**：优先一手来源（期刊论文原文、量表原始文献、权威机构页面）；内容农场来源仅用于框架性/操作性内容（如复盘方法论介绍），并在 Confidence 中降级标注。

---

## 一、认知表现的自我测量：轻量认知测试与自建测试的信度问题

### 证据 1.1
Claim: 基于平板/在线的轻量认知评估系统（含处理速度、工作记忆等6个领域）可以达到可用的信度水平，但重测信度中等（0.56–0.71），提示日常自我追踪数据必然包含较大噪声。 / Source: 北京语言大学心理与认知科学学院成果速递（BOCAS 系统，发表于 BMC Psychology） / URL: https://xlrzkx.blcu.edu.cn/info/1089/3200.htm / Date: 未标注（论文发表于 2024 年前后） / Excerpt: “八观在线认知评估系统……能够评估一般认知能力（GCA）以及包括感知运动技能、处理速度、持续注意力、工作记忆、认知灵活性和空间能力在内的六个领域……内部一致性介于0.712到0.846之间，重测信度则从0.56到0.71不等。” / Context: 中国成人样本（18–40 岁）验证研究；GCA 得分与瑞文智商测试相关 r=0.58。说明即使是经过学术验证的自施测工具，单次分数波动仍不可忽视。 / Confidence: high [^1^]

### 证据 1.2
Claim: 无人监督的在线认知测试（反应时、TMT、空间工作记忆等）与面对面施测相比仅具中等重测信度，部分子任务与传统纸笔测验的相关性低（如空间工作记忆 r=0.27），在线自建测试不应被当作临床级测量。 / Source: PLOS ONE, "Feasibility and reliability of online vs in-person cognitive testing in healthy older people" (NeurOn 电池) / URL: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0309006 / Date: 2024-08-20 / Excerpt: “Global cognition in the NeurOn battery moderately validated against MoCA performance, and the battery demonstrated moderate test-retest reliability. Concurrent validity was found only between the online and paper versions of the Trail Making Test-A, as well as global cognitive performance between online and in-person testing sessions.” / Context: 32 名健康老年人、间隔一周两次施测；只有 TMT-B（r=0.615）和整体认知分（r=0.60）达到可接受的同时效度。 / Confidence: high [^2^]

### 证据 1.3
Claim: 成熟商业在线认知电池（Cambridge Brain Sciences）在近 4.5 万人的大规模研究中表现出良好的跨次稳定性（复测分数变化 <5%），且练习效应在第二次施测后基本消除——这对“每日自测”设计至关重要：应舍弃前 1–2 次成绩作基线学习期。 / Source: Cambridge Brain Sciences Test Validity and Reliability（技术白皮书，引用 Hampshire et al., 2012, Neuron） / URL: https://welpartners.com/resources/Cambridge-Brain-Sciences-Test-Validity-and-Reliability.pdf / Date: 未标注 / Excerpt: “In one study of almost 45,000 volunteers (Hampshire et al., 2012), the tests were shown to reliably measure cognition across testing sessions, with scores changing by less than 5% when volunteers took the tests a second time. The small practice effect described above is reduced or eliminated after the second time taking a test (Collie et al., 2002).” / Context: CBS 测试 30 分钟电池与 2–3 小时 WAIS-R 纸笔神经心理电池结果相当（Levine et al., 2013），并有 75,000+ 常模样本。厂商文档，需注意利益相关，但核心引用为同行评审研究。 / Confidence: medium [^3^]

### 证据 1.4
Claim: 为重复测量设计的认知电池（如 CogState）通过随机化刺激、无限等价形式来最小化练习效应，具有良好的重测信度，适合个体内（intraindividual）纵向追踪——自建每日测试应采用“随机出题+平行版本”而非固定题目。 / Source: PMC, "Computerized Cognitive Testing for Older Adults: A Review" / URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC10852880/ / Date: 未标注（综述，收录至 2023 年前后文献） / Excerpt: “CogState has been developed for repeat testing. Minimal practice effects and good test–retest reliability have been observed, making the battery suitable for measuring intraindividual cognitive decline… There are an unlimited number of equivalent forms to minimize learning effects making the battery suitable for serial assessment.” / Context: 该综述同时指出 CNS Vital Signs 可自我施测、随机呈现刺激以减少练习效应。 / Confidence: high [^4^]

### 证据 1.5
Claim: Mayo 远程自施测数字认知平台（MTD，含处理速度/工作记忆的 Symbols 测验与计算机自适应词语记忆测验）15–20 分钟完成，远程自施测信度与面对面神经心理测验相当（总分 ICC=0.79），证明“无人监督、多设备”的自测可行，但前提是有自适应与随机选题设计。 / Source: Alzheimer's & Dementia: DADM（Wiley），"Reliability of remote self-administered Web-based digital [cognitive measures]" / URL: https://alz-journals.onlinelibrary.wiley.com/doi/pdfdirect/10.1002/dad2.70338 / Date: 2025 年前后 / Excerpt: “Reliability was good for the MTD Composite (total ICC = 0.79 [0.77, 0.80])… The reliability of the remote self-administered MTD was similar to in-person-administered cognitive measures… MTD showed moderate-to-good reliability, supporting its use in longitudinal monitoring.” / Context: 强调“testing environments variability”是远程自测的主要噪声源；子测验采用随机项目选择，重测信度同时包含平行版本信度。 / Confidence: high [^5^]

### 证据 1.6
Claim: 对认知测验设置过高的重测信度门槛会误杀有用的工具：对情境/心理状态敏感的测量本身个体内波动大、重测信度天然较低，但对临床和功能结局仍然敏感。每日追踪设计应接受“低重测信度=高状态敏感性”的权衡，用多次测量取均值而非单次分数做判断。 / Source: PubMed / Applied Neuropsychology: Adult，Skirrow et al., "Test-retest reliability on the CANTAB: Comment on Karlsen et al. (2020)" / URL: https://pubmed.ncbi.nlm.nih.gov/33406910/ / Date: 2021-01-06（Epub）/ Excerpt: “Measures characterized by greater true within-subject variability typically have lower test-retest reliability… However, these measures remain sensitive to important clinical and functional outcomes. Setting arbitrarily elevated test-retest reliability thresholds for test adoption in cognitive research limits the pool of available tools.” / Context: 对 Karlsen 等人 CANTAB 重测信度研究的学术评论，是理解“自建测试信度问题”的关键方法论提醒。 / Confidence: high [^6^]

### 证据 1.7
Claim: 精神运动警觉任务（PVT，10 分钟简单反应时，主要指标为 >500ms 的失误次数）是警觉性/睡眠剥夺测量的“金标准”行为指标，学习效应极小、对睡眠与昼夜节律高度敏感，另有 3 分钟简版（PVT-B）和移动端版本，最适合作为每日认知状态快检。 / Source: HED Task（认知任务数据库），Psychomotor Vigilance Task 条目 / URL: https://www.hedtags.org/hed-task/tasks/hedtsk_psychomotor_vigilance.html / Date: 2026-04-20（页面抓取日期） / Excerpt: “The PVT is considered the gold-standard behavioral measure of vigilance and sleepiness because it is simple, has minimal learning effects, and is highly sensitive to sleep deprivation, circadian misalignment, and time-on-task… Brief PVT (PVT-B): 3-minute version; validated against standard for most outcome metrics.” / Context: 数据库条目，综合睡眠研究文献共识；PVT 原为 Dinges & Powell (1985)。 / Confidence: high [^7^]

---

## 二、心理状态的追踪工具：情绪追踪证据、标准化量表自用适配、ESM

### 证据 2.1
Claim: 每日两次、为期 3 周的移动端情绪监测（EMA）本身即可显著降低即时负性情绪（p<0.001）并降低冲动性（p=0.001）——“追踪即干预”（reactivity），情绪追踪不只是测量工具，本身有轻量干预效应。 / Source: PMC / Frontiers in Psychiatry, "The Clinical Impacts of Mobile Mood-Monitoring in Young People With Mental Health Problems: The MeMO Study" / URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8363129/ / Date: 2021 年 / Excerpt: “Use of the mood-monitoring app significantly reduced momentary negative mood (p < 0.001) and retrospectively assessed impulsivity across all 47 participants (p = 0.001).” / Context: 47 人混合方法研究（23 名有心理问题的青年+24 名对照）；作者同时指出样本小、周期短，且 App 默认评分设置可能扭曲结论——自用工具要注意默认值设计偏差。 / Confidence: high（效应方向）/ medium（效应量外推） [^8^]

### 证据 2.2
Claim: “追踪”（看到自己情绪历史曲线）比单纯“记录/报告”更能维持积极情绪：看到情绪历史的追踪组次日积极情绪更持久，而仅报告组无此效应——这直接支持软件应向用户可视化展示情绪历史（折线图）而非只收集数据。 / Source: Arizona State University W. P. Carey 新闻（报道 Boghrati et al. 发表于 Journal of Experimental Social Psychology 的研究 "Emotion Tracking (vs. Reporting) Increases the Persistence of Positive (vs. Negative) Emotions"） / URL: https://news.wpcarey.asu.edu/20241101-boosting-positivity-impact-mood-tracking-mental-well-being / Date: 2024-11-01 / Excerpt: “Compared to the reporting [group], participants in the tracking [group] (where a history of their past emotions was presented) were more likely to feel positive emotions the next day if they felt positive today… ‘If you track emotions, you're going to see a persistent improvement in positive emotions.’” / Context: 413 名被试、21 与 28 天追踪研究，三组对照（无询问/仅报告/报告+历史可视化）。 / Confidence: medium-high [^9^]

### 证据 2.3
Claim: PHQ-9 是完全自施测的 9 题抑郁严重度量表，≥10 分对重性抑郁的敏感度与特异度均为 88%，5/10/15/20 分对应轻/中/中重/重度分级——适合作为软件中的“周期性（如每月）心理状态筛查”，但不适合每日施测（其参考时间窗为“过去两周”）。 / Source: PubMed / J Gen Intern Med，Kroenke et al., 2001, "The PHQ-9: validity of a brief depression severity measure"（被引 5.7 万+） / URL: https://pubmed.ncbi.nlm.nih.gov/11556941/ / Date: 2001-09 / Excerpt: “Using the MHP reinterview as the criterion standard, a PHQ-9 score ≥10 had a sensitivity of 88% and a specificity of 88% for major depression. PHQ-9 scores of 5, 10, 15, and 20 represented mild, moderate, moderately severe, and severe depression, respectively.” / Context: 6000 名基层医疗与妇产科患者验证；量表询问“过去 2 周”症状频率，每日重复作答在测量学上无意义。中文版已有一般人群验证（Wang et al., 2014, Gen Hosp Psychiatry）。 / Confidence: high [^10^]

### 证据 2.4
Claim: GAD-7（7 题焦虑量表）原始验证中 ≥10 分的敏感度 89%、特异度 82%，Cronbach's α=0.92、重测信度 0.83；但在临床混合样本中特异度可低至 0.45，因此自用时应作为“严重度连续指标”而非诊断筛查工具，避免分数波动引发误读焦虑。 / Source: ①Nature Scientific Reports（引述 Spitzer et al., 2006 原始参数）；②PMC / Rutter et al., "Psychometric Properties of the GAD-7 in Outpatients with Anxiety and Mood Disorders" / URL: https://www.nature.com/articles/s41598-025-96165-6 ; https://pmc.ncbi.nlm.nih.gov/articles/PMC5333929/ / Date: 2025-04-06 / 2016 / Excerpt: ①“A cutoff score of 10 provides a sensitivity of 89% and a specificity of 82%. The Cronbach's alpha coefficient of the scale is 0.92, and the test-retest reliability is 0.83.” ②“the measure may better serve as a dimensional indicator of GAD severity than a screening tool.” / Context: 原始文献 Spitzer et al., 2006, Arch Intern Med；GAD-2（前两题）被 NICE 推荐为超短筛查版。 / Confidence: high [^11^]

### 证据 2.5
Claim: WHO-5 幸福感指数（5 题、正向措辞、非侵入性）是最适合高频自用的心理状态量表：系统综述（213 篇文献）确认其高测量学效度，可作抑郁筛查工具与临床试验结局指标；中文版 α=0.81–0.88，单维结构稳定。 / Source: ①PubMed / Topp et al., 2015, "The WHO-5 Well-Being Index: a systematic review"（被引 6200+）；②PMC, "Validity and Psychometric Evaluation of the Chinese Version of the 5-Item WHO Well-Being Index" / URL: https://pubmed.ncbi.nlm.nih.gov/25831962/ ; https://pmc.ncbi.nlm.nih.gov/articles/PMC9005828/ / Date: 2015 / 2022 / Excerpt: ①“The review demonstrated that the WHO-5 has high clinimetric validity… is a sensitive and specific screening tool for depression and its applicability across study fields is very high.” ②“The results indicate that the WHO-5 is unidimensional and has good internal consistency, with Cronbach's α = 0.85 and 0.81.” / Context: WHO-5 询问“过去两周”感受，0–25 分×4 转为百分制；因其正向措辞、无病症污名，适合非临床人群日常自用；中国糖尿病样本中与 PHQ-9 相关 r=-0.694，筛查切点约 42–52 分。 / Confidence: high [^12^]

### 证据 2.6
Claim: 经验取样法（ESM/EMA）是捕捉日常生活中心理状态的金标准方法学：高频、实时或近实时自报，具有高生态效度并最小化回忆偏差；1987 年 Csikszentmihalyi & Larson 已系统确立其信效度。自用软件借鉴其设计原则：每日 1–3 次、每次 <1 分钟的微问卷，优于每周一次长问卷。 / Source: ①PMC, "Using ESM/EMA in Clinical Assessment and Clinical Research: Introduction to the Special Section"；②多篇文献引用 Csikszentmihalyi & Larson (1987, J Nerv Ment Dis) 与 Myin-Germeys et al. (2018, World Psychiatry) / URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC4255457/ ; https://www.nature.com/articles/s44400-025-00023-1 / Date: 2014 前后 / 2025-08-30 / Excerpt: “we use the designation ESM/EMA as an umbrella term to refer to all of these ‘daily life’ sampling approaches that obtain multiple measures over time and emphasize real-time or near real-time assessment.” / Context: ESM 强调即时取样以规避回忆偏差；日重建法（DRM, Kahneman et al., 2004）是更省时的替代方案（回顾昨天分时段事件与感受），适合作为软件的“每日复盘”模板。 / Confidence: high [^13^]

### 证据 2.7
Claim: 人对一段经历的回顾性评价主要由“峰值+结尾”决定（峰终定律），存在“时长忽视”；174 个效应量的元分析显示峰终效应大（r=0.581）——意味着用户主观的“这周过得怎样”回忆是系统性偏差的，客观高频取样数据可校正这种偏差；同时软件设计可利用“结尾体验”优化每日会话的收尾。 / Source: ResearchGate / 元分析摘要（"peak-end rule meta-analysis, 174 effect sizes"）；原始文献 Fredrickson & Kahneman (1993, JPSP)、Kahneman et al. (1993, Psychological Science)、Redelmeier & Kahneman (1996, Pain) / URL: https://www.researchgate.net/publication/1748...（条目页）; https://www.behavioraleconomics.com/resources/mini-encyclopedia-of-be/peak-end-rule/ / Date: 1993/1996（原始）；元分析近年 / Excerpt: “We meta-analyzed 174 effect sizes and found strong support for the peak-end rule. The peak-end effect on retrospective summary evaluations was: (1) large (r = 0.581…) …stronger than the effect of the duration of the experience (which was essentially nil, thereby supporting the idea of duration neglect).” / Context: 对软件的两层启示：①用户的周/月主观回顾会被最差时刻与最后时刻主导，应与高频数据对照呈现；②每日训练会话应设计“好结尾”。 / Confidence: high [^14^]

---

## 三、意义感/灵性的测量

### 证据 3.1
Claim: MLQ（生命意义感问卷，10 题、7 点计分）是当前区分“意义存在（Presence）”与“意义寻求（Search）”两个独立维度的最佳量表，原始验证 α=0.86/0.87，与幸福感/抑郁相关但又具区分效度；中文版（刘涵慧/王孟成等修订）信效度良好、纵向测量等值性成立，可用于月度自我追踪。 / Source: ①PMC 多篇引用 Steger, Frazier, Oishi & Kaler (2006, Journal of Research in Personality)；②Frontiers in Psychology 2025 综述性使用；③PMC, "Longitudinal measurement invariance of the MLQ in Chinese college students" / URL: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1580663/full ; https://pmc.ncbi.nlm.nih.gov/articles/PMC9640618/ / Date: 2006（原始）/ 2022-09-02（中文纵向等值）/ Excerpt: “the MLQ presents the current best rating scale to distinctly assess meaning in life as separate from similar, but related wellbeing constructs… The two factors are typically somewhat inversely correlated (r = −0.19), where Presence is associated with positive wellbeing and Search with negative wellbeing.” / Context: 关键实操点：Presence 与 Search 应分开画两条曲线，Search 升高未必是好事（与负性情绪相关）；量表免费开放用于教育/研究用途（作者 Steger 官网提供多语言版）。 / Confidence: high [^15^]

### 证据 3.2
Claim: 繁盛感（Flourishing）测量已形成多个短量表：Diener 等 2010 年 Flourishing Scale 仅 8 题、单一总分、α 0.78–0.95，是最短选择；但其只覆盖幸福感（eudaimonic）不含愉悦感（hedonic）；若需更全面可选 PERMA-profiler（23 题）或 MHC-SF（14 题）。范围综述指出这类量表设计上施测频率不宜高于每月一次。 / Source: PMC, "Measurement of flourishing: a scoping review" / URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC10867253/ / Date: 2024 年前后 / Excerpt: “The shortest is the 8-item Flourishing Scale (Diener et al., 2010)… only one scale, the Flourishing Scale, excluded hedonic wellbeing from its definition… All scales seem to be designed to be administered no more than once per month.” / Context: 综述比较 7 个主流繁盛量表的维度、长度与计分方式；为软件“灵魂/意义”维度的月度测量选型直接依据。 / Confidence: high [^16^]

### 证据 3.3
Claim: 日常灵性体验量表（DSES，16 题版/6 题简版）测量“日常生活中超越性体验的频率”（敬畏、感恩、深层内在平安、与超越者的连接感），刻意去教派化、适用于有宗教或无宗教信仰者；α=0.94–0.95、重测 0.92，6 题简版 α=0.91——是“灵魂”维度中唯一定位于“日常频率”而非“信念”的量表，天然适配每日/每周追踪。 / Source: ①Springer Medizin, "Validation of the DSES Short Forms"；②PMC 多篇（含 Jackson Heart Study 心理测量学验证）；原始文献 Underwood & Teresi (2002, Annals of Behavioral Medicine) / URL: https://www.springermedizin.de/validation-of-the-daily-spiritual-experience-scale-short-forms-a/51334426 ; https://pmc.ncbi.nlm.nih.gov/articles/PMC2888881/ / Date: 2002（原始）/ 2025-08-11（简版验证综述）/ Excerpt: “designed to assess an individual's perception of a regular spiritual connection with the transcendent (e.g., God, Nature), focusing on daily spiritual experience rather than extraordinary events, specific spiritual beliefs, or religious behaviors… The original S-DSES showed good internal consistency (α = .91).” / Context: 6 题简版条目如“我感到深层的内在平安与和谐”“我被创造之美所触动”；非商用学术研究通常免费使用（dsescale.org）。注意量表含“God”措辞，中文自用版可替换为“超越性存在/更高力量”。 / Confidence: high [^17^]

---

## 四、自我量化（Quantified Self）运动的经验：追踪什么、追踪疲劳与数据过载

### 证据 4.1
Claim: Quantified Self 运动（2007 年由 Wired 编辑 Gary Wolf 与 Kevin Kelly 发起，口号“通过数字认识自我”）的核心经验是：追踪应服务于“自我认知的 n-of-1 实验”，而非为追踪而追踪；早期手动追踪的负担常常超过洞察收益（“数据拜物教”批评），2025 年后行业趋势是“被动传感+AI 解读”以消除追踪负担。 / Source: ①Healthcare Digital, "The Quantified Self Movement: From Niche Subculture to the Infrastructure of Precision Medicine"；②arXiv 论文引用 QS 官方定位 / URL: https://www.healthcare.digital/single-post/the-quantified-self-movement-from-niche-subculture-to-the-infrastructure-of-precision-medicine ; https://www.arxiv.org/pdf/2512.03682 / Date: 2025-11-23 / Excerpt: “Critiques of ‘data fetishism’ and ‘narcissistic navel-gazing’ were common, as the burden of tracking often outweighed the actionable insights derived from the rudimentary tools available. By 2025… The burden of tracking has vanished, replaced by ‘invisible’ passive sensors… The burden of interpretation has shifted from the user to Generative AI.” / Context: 设计启示：手动输入项必须极少（每日 ≤3 个核心问题），其余尽量自动采集；解读（周报/洞察）应由系统生成而非让用户自己分析原始数据。 / Confidence: medium-high [^18^]

### 证据 4.2
Claim: 个人信息系统的经典 HCI 模型（Li, Dey & Forlizzi, CHI 2010，被引 1600+）将自我追踪分为五阶段：准备、采集、整合、反思、行动；各阶段的障碍会“级联”到后续阶段——采集环节的负担（手动记录太麻烦）会导致反思与行动阶段彻底崩塌，这是追踪疲劳/放弃的主要机制。 / Source: Ian Li 个人学术主页 PDF, "A Stage-Based Model of Personal Informatics Systems" (CHI 2010) / URL: https://www.ianli.com/publications/2010-ianli-chi-stage-based-model.pdf / Date: 2010 / Excerpt: “We derived a stage-based model of personal informatics systems composed of five stages (preparation, collection, integration, reflection, and action) and identified barriers in each of the stages. These stages have four essential properties: barriers cascade to later stages; they are iterative…” / Context: 对设计的四条建议：跨阶段整体设计、允许阶段间迭代、自动化与用户控制的平衡、支持生活多面向关联。 / Confidence: high [^19^]

### 证据 4.3
Claim: 测量本身有隐性成本：6 个实验证明，量化（如计步）虽然提高了行为数量，却降低了活动的乐趣与内在动机（使有趣的活动“更像工作”），进而降低持续投入与主观幸福感——“不追踪什么”与“追踪什么”同样重要。 / Source: Journal of Consumer Research, Etkin (2016), "The Hidden Cost of Personal Quantification"（经《心理科学进展》中文期刊参考文献转引核实摘要） / URL: https://journal.psych.ac.cn/xlkxjz/article/2024/1671-3710/1671-3710-32-1-27.shtml ; https://www.researchgate.net/publication/295503681_The_Hidden_Cost_of_Personal_Quantification / Date: 2016 / Excerpt: “Six experiments demonstrate that while measurement increases how much of an activity people do (e.g., walk or read more), it can simultaneously reduce how much people enjoy those activities. This occurs because measurement can undermine intrinsic motivation… measurement can decrease continued engagement in the activity and subjective well-being.” / Context: 对三维训练软件的直接警示：冥想、阅读、感恩练习等“灵魂/心智”活动本身依赖内在动机，若用冷冰冰的 KPI 化追踪，可能适得其反——应弱化这类活动的量化呈现，改用“完成标记+质性日记”。 / Confidence: high [^20^]

### 证据 4.4
Claim: 健身 App 质性研究（British Journal of Health Psychology, 2025）发现自我监测可驱动外在动机但损害内在动机：数据丢失（如记录断档、streak 中断）让用户关注“未完成”而非“已取得的进步”，产生沮丧与乐趣丧失——连续记录（streak）机制是双刃剑。 / Source: Wiley / British Journal of Health Psychology / URL: https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/bjhp.70026 / Date: 2025-10-22 / Excerpt: “those who experienced loss of exercise data… expressed disappointment and loss of enjoyment in the activity… users who reported losing ‘streaks’ in the app – rather than focusing on the progress that had been made until that point, the user was preoccupied by what had not been achieved.” / Context: 结合 Etkin (2016) 与自我决定理论（SDT：自主、胜任、关联）解读；支持设计中“断签不清零”“强调累计而非连续”的原则。 / Confidence: high [^21^]

### 证据 4.5
Claim: “三件好事”（Three Good Things）感恩日记干预（Seligman et al., 2005 开发）在医护人员 RCT 中显示可改善情绪、积极情感与生活满意度——质性微日记（每天 3 件好事+自己的角色）是有 RCT 支持的最轻量“心智/灵魂”日常记录形式。 / Source: PMC, "'Three Good Things' Digital Intervention Among Health Care Workers: A Randomized Controlled Trial" / URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC10202508/ / Date: 2023 / Excerpt: “The intervention instructs individuals to write down 3 positive things that happened during the day and to consider their role in these events… 3GT has shown benefits in reducing emotional exhaustion, depressive symptoms, work-life balance problems…” / Context: 原始研究 Seligman et al. (2005, American Psychologist) 显示一周练习的幸福感提升可持续 6 个月；可作为每日复盘的固定模块。 / Confidence: high [^22^]

---

## 五、反馈的心理学：进步可视化与动机

### 证据 5.1
Claim: 目标梯度效应：越接近目标，努力与动机越强（Hull 1932 大鼠实验；Kivetz, Urminsky & Zheng 2006 咖啡馆积分卡现场研究在人类中验证，越接近奖励购买间隔越短）；且“虚幻进步”（预印 2 个章的 12 格卡 vs 空白 10 格卡，实际都需 10 次）也显著提升完成率——感知距离比客观距离更重要。 / Source: ①Laws of UX / 多来源转述 Hull (1932, Psychological Review) 与 Kivetz et al. (2006, Journal of Marketing Research 43(1), 39-58)；②Susan Weinschenk 博客引原文 / URL: https://lawsofux.com/goal-gradient-effect/ ; https://www.blog.theteamw.com/2010/07/20/100-things-you-should-know-about-people-38-even-the-illusion-of-progress-is-motivating/ / Date: 1932/2006（原始）/ Excerpt: “The goal-gradient hypothesis… states that the tendency to approach a goal increases with proximity to the goal… you can get this extra motivation even with the illusion of progress.” / Context: 软件应用：大目标切成多个近端里程碑以频繁制造“终点在望”；新周期开始时给予“禀赋进度”（如展示累计总进度而非本周从零开始）。 / Confidence: high [^23^]

### 证据 5.2
Claim: 目标达成后动机骤降（“奖励后重置现象”，post-reward resetting）——达成里程碑的时刻恰是用户流失风险最高的时刻；同时动机在目标追求中段最低（“中间困顿”）。 / Source: Susan Weinschenk 博客引 Kivetz et al. (2006)；上海财经大学期刊《消费者感知目标进展研究述评》综合 Bonezzi et al. (2011) 等 / URL: https://www.blog.theteamw.com/2010/07/20/100-things-you-should-know-about-people-38-even-the-illusion-of-progress-is-motivating/ ; https://qks.sufe.edu.cn/j/PDFFull/a1a911eb-ea8d-4d08-966f-a6b3be1127f3.pdf / Date: 2010-07-20 / 2020-08-28 / Excerpt: ①“Motivation and purchases plummet right after the goal is reached. This is called a ‘post-reward resetting phenomenon’.” ②“中间位置动机最弱，称‘中间困顿效应’，由参考点转换造成。” / Context: 设计应用：达成里程碑的当屏立即无缝开启下一级目标；周/月周期中段（周三、月中）主动推送进度对比以对抗中段低谷。 / Confidence: high（现象）/ medium（机制归因） [^24^]

### 证据 5.3
Claim: 进步原理（The Progress Principle）：对 238 名知识工作者、12,000 篇工作日日记的分析发现，影响“内在工作心灵”最强的正向事件是“在有意义的工作上取得进步”——哪怕是小胜利；最好的日子 76% 有进步事件，最差的日子 67% 有挫折事件；小胜利的情绪效应可与大突破相当。 / Source: Amabile & Kramer, The Progress Principle (Harvard Business Review Press, 2011)；HBR 文章 "The Power of Small Wins" (2011) / URL: https://www.creativityatwork.com/on-the-power-of-small-wins/ ; https://auvietuc.edu.vn/upload/files/PDFs/.../The%20Progress%20Principle...pdf / Date: 2011 / Excerpt: “of all the positive events that influence inner work life, the single most powerful is progress in meaningful work… Small wins often had a surprisingly strong positive effect, and small losses a surprisingly strong negative one… We found that 76 percent of the best days involved progress, but only 13 percent involved setbacks.” / Context: 书籍原始 PDF 与多个二级来源一致。软件核心机制依据：每日反馈的首要任务不是“评价表现”，而是“让用户看见今天的进步”。 / Confidence: high [^25^]

### 证据 5.4
Claim: 主观进步感与客观进步数据是两种不同的测量：主观进步测量对“客观指标捕捉不到的进步类型”（如已开始锻炼但体重未降）和情境扭曲更敏感，且能支持个体内多目标比较；而客观数据提供抗偏差的锚点。两者应并列呈现而非互相替代。 / Source: Psychological Science (psychopen.eu), Kung, Scholer & Inzlicht 等, "What Constitutes Successful Goal Pursuit? Exploring the Relation Between Subjective and Objective Measures of Goal Progress" / URL: https://ps.psychopen.eu/index.php/ps/article/download/12017/12017.pdf / Date: 未标注（2023 年前后） / Excerpt: “Subjective measures may be sensitive to certain types of progress that are missed with objective measures (e.g., starting to exercise but not yet losing weight) as well as situational factors that diminish or exaggerate objective progress… They are also easy to administer, inexpensive, and offer insight in contexts where objective measures are lacking or unfeasible.” / Context: 实证发现主观与客观进步仅中等相关。设计应用：仪表盘同时给“客观数据折线”和一条“本周你感觉进步了吗？”的主观滑块，二者背离本身是重要的复盘素材。 / Confidence: high [^26^]

### 证据 5.5
Claim: 感知目标进展的“框架”影响动机：Koo & Fishbach (2012) 发现目标追求初期聚焦“已完成进展”更增动机，接近终点时聚焦“剩余进展”更增动机；中文系统述评（上海财经大学期刊）确认该文献体系并梳理“中间困顿”“惯性滑行”等效应。 / Source: 上海财经大学期刊（QKS），《持之以恒还是半途而废？消费者感知目标进展研究述评与展望》 / URL: https://qks.sufe.edu.cn/mv_html/j00002/202105/a1a911eb-ea8d-4d08-966f-a6b3be1127f3_WEB.htm / Date: 2020-08-28 / Excerpt: “希望实现目标的消费者在目标追求开始时，若将注意力集中在已完成的目标进展框架上，其目标追求动机更容易增强；而在接近目标终点时，若将注意力集中在待完成的目标进展框架上，其目标追求动机更容易增强。” / Context: 设计应用：进度条文案动态切换——周期前期显示“你已完成 X%”（累计柱状图），后期显示“只剩 Y 天/任务即可达标”。 / Confidence: high [^27^]

### 证据 5.6
Claim: 进度条的“速度曲线”影响完成率：问卷实验显示“先快后慢”的进度反馈中途放弃率最低（11.3%），匀速次之（14.4%），“先慢后快”最差（21.8%）——早期快速可见的进步对留存至关重要。 / Source: UXDesign.cc 转述进度指示器实验研究（Villar, Callegaro & Yang 关于进度条与问卷中断的研究） / URL: https://uxdesign.cc/from-rpgs-to-ux-how-progress-indicators-affect-user-engagement-8748f02d766a / Date: 2024-08-19（页面日期；原始研究更早） / Excerpt: “people were more likely to abandon the task when the progress feedback was slow-to-fast (was discouraging) with a breakoff rate of 21.8%. Users were most likely to complete the task when the progress feedback started off fast and then slowed towards the end… breakoff rate of 11.3%.” / Context: 二手转述、未直接核对原始论文，故定 medium。设计应用：新手期前 7 天应设计“极易达成的小目标”让第一条曲线快速上扬。 / Confidence: medium [^28^]

### 证据 5.7
Claim: 自我量化对幸福感的元分析显示总体关系复杂：多数研究报告 SQ 对感知健康/赋能有正向作用，但也有研究（如 Etkin 2016）报告对主观幸福感的负向作用——自我量化不是无条件有益的干预。 / Source: Wiley / Psychology & Marketing, "Self-quantification and consumer well-being: A meta-analytic review" / URL: https://onlinelibrary.wiley.com/doi/full/10.1002/mar.22141 / Date: 2024-10-12 / Excerpt: 表格逐研究列出方向：Wulfovich et al. (2019) 正向；Kari et al. (2017) “Perceived WB effects are minor during the short-term use”；Etkin (2016) “Measurement of behavior or activity decreases enjoyment and reduces subjective WB. Negative.” / Context: 支持“测量系统必须设关闭阀/休息日，且用户可控”的设计原则。 / Confidence: high [^29^]

---

## 六、复盘系统：日/周/月/年节奏与框架

### 证据 6.1
Claim: GTD 周回顾（Weekly Review）是被广泛验证有效的周复盘操作框架，David Allen 称其为 GTD 的“关键成功因子”，分三段：Get Clear（清空收集箱与大脑）、Get Current（回顾行动/日历/项目/等待清单）、Get Creative（回顾将来也许清单、激发新想法）；实践社区的共识是“放弃 GTD 的人几乎都先放弃了周回顾”。 / Source: ①gettingthingsdone.com 官方 Weekly Review Checklist PDF；②Super Productivity 博客综述 / URL: https://gettingthingsdone.com/wp-content/uploads/2014/10/Weekly_Review_Checklist.pdf ; https://super-productivity.com/blog/gtd-weekly-review-guide/ / Date: 官方清单未标注 / 2026-01-12 / Excerpt: “David Allen calls the Weekly Review ‘the critical success factor’ in making GTD stick… those who abandon GTD typically don't fail at capturing or organizing – they stop reviewing.” / Context: 框架性/实践性内容（非实验研究），定 medium；但 GTD 体系为 Allen 原著方法论，官方清单为一手来源。软件应用：周复盘模板直接复用三段式。 / Confidence: medium [^30^]

### 证据 6.2
Claim: 中文管理实践中最通用的复盘框架是联想柳传志倡导的 GRAI 四步复盘法：Goal（回顾目标）、Result（评估结果，对照目标找亮点与不足）、Analysis（分析成败的主客观根本原因）、Insight（总结规律，输出继续/叫停/新举措）；另有轻量版 KISS 复盘法（Keep/Improve/Start/Stop）适合日常与周度使用。 / Source: ①搜狐号“一文看懂复盘的正确姿势”；②36氪“不会做复盘，再努力都是低水平的勤奋”；③极客时间专栏“一个优秀的复盘模型”（含 PDF 模型：Preview-Do-FuPan） / URL: https://www.sohu.com/a/444646512_772835 ; https://m.36kr.com/p/2475250506798983 ; https://time.geekbang.org/column/article/341000 / Date: 2021-01-14 / 2023-10-14 / 2021-02-05 / Excerpt: “GRAI复盘法，即Goal（回顾目标）、Result（评估结果）、Analysis（分析原因）、Insight（总结规律）。”；“KISS…Keep(保持)…Improve（改进）…Start（开始）…Stop（停止）。” / Context: 二手方法论介绍（B 级来源），但 GRAI 出处明确（柳传志《复盘》一书）。设计应用：月复盘用 GRAI 四屏引导，周复盘用 KISS 四格。 / Confidence: medium [^31^]

### 证据 6.3
Claim: YearCompass 是 2012 年起源于布达佩斯国际团队、全球超百万人使用的免费年度回顾手册，结构为“回顾过去（日历逐周翻看→生活各领域大事→六句话/六问题总结→三大成就与三大挑战→宽恕与放下→三个词定义一年）+ 规划新年（大胆梦想→分领域目标→承诺）”——提供可直接数字化的年度复盘信息架构。 / Source: ①YearCompass 中文官网；②官方手册 PDF（简体中文版） / URL: https://yearcompass.com/cn/ ; https://booklet.yearcompass.com/zh-hans-CN-YearCompass-booklet-A5-printable.pdf / Date: 官网持续更新（2025→2026 版已发布） / Excerpt: “这是一本可以帮你回顾过去和计划新的一年的免费手册。YearCompass通过精挑细选的问题和练习，来帮助你挖掘你的生活方式… 对于从2012年开始，在世界各地的超一百万的人们。” / Context: 一手来源（官方手册全文），含全部问题清单（如“最明智的决定/最大的教训/最大的冒险/最大的惊喜/为他人做的最重要的事/完成的最大事情”）。 / Confidence: high（框架真实性）；medium（“很有效”的效果宣称无对照研究） [^32^]

---

## 七、设计启示（综合）

> 以下 8 条直接面向“大脑·心智·灵魂”三维每日训练软件的测量与反馈系统设计。用户偏好柱状图/折线图的可视化呈现。

**D1. 三层测量架构：高频行为数据（自动/轻）+ 中频状态量表（周期）+ 低频深度量表（月度/年度）。**
- 每日（自动或 ≤1 分钟）：训练完成标记、训练时长、PVT-B 式 3 分钟反应时快检（可选）、1 个情绪评分（1–10）+1 件“今日好事”。
- 每周：WHO-5（5 题，正向无污名，α>0.8）[^12^]；KISS 周复盘四格 [^31^]。
- 每月：PHQ-9 与 GAD-7（仅作严重度趋势参考，展示时注明“非诊断”）[^10^][^11^]；MLQ-P 与 MLQ-S 分开两条折线 [^15^]；Flourishing Scale 8 题 [^16^]。
- 每年：YearCompass 式结构化年复盘 [^32^]。
依据：flourishing 类量表设计施测频率不宜高于每月一次 [^16^]；PHQ-9/GAD-7 参考时间窗为两周，每日施测无意义 [^10^]。

**D2. 认知自测要接受噪声，用“滚动均值+区间”而非单次分数。** 自建/轻量认知测试重测信度普遍中等（0.56–0.79）[^1^][^2^][^5^]，且练习效应在前 1–2 次施测后消退 [^3^][^4^]。设计：前 7 天标记为“基线学习期”不入图；折线图默认显示 7 日滚动均值与波动带，而非原始散点；优先选用学习效应小的任务（反应时/PVT 类）[^7^]，出题随机化避免记忆 [^4^]。

**D3. “追踪什么”白名单（推荐指标清单）：**
| 维度 | 每日（自动/≤60秒） | 每周 | 每月 | 每年 |
|---|---|---|---|---|
| 大脑 | 训练完成/时长；3min 反应时快检（可选） | 认知任务滚动均值趋势 | 认知分项（处理速度/工作记忆/灵活性）月度快照 | 年度认知基线对比 |
| 心智 | 情绪评分 1–10 + 一句情绪标签；今日 1 件好事 | WHO-5；情绪曲线+触发因素标注 | PHQ-9、GAD-7（带免责声明） | 年度心理健康回顾 |
| 灵魂 | 冥想/感恩/善行完成标记（✓/✗，不打分） | 意义感单题滑块（“本周我觉得生活有意义”0–10） | MLQ-P/MLQ-S；Flourishing Scale；DSES-6（可选） | YearCompass 年复盘 |

**D4. “不追踪什么”黑名单与降级呈现：** ①不给冥想、阅读、感恩等内在动机型活动设置数字 KPI 或排行榜——测量会削弱其乐趣与坚持（Etkin 2016）[^20^]，只记录“做了/没做”；②不追踪无法行动的虚荣指标（如总登录次数）；③不使用“断签清零”的 streak 机制，改为累计天数+“最长连续”双指标，数据断档不惩罚 [^21^]；④每日手动输入项 ≤3 个，其余自动采集，防止采集负担级联摧毁整个系统 [^18^][^19^]。

**D5. 仪表盘设计（柱状图/折线图优先）：** ①首页三条主线折线图（大脑=训练量/认知均值，心智=情绪/WHO-5，灵魂=意义感滑块），支持 7/30/90 日切换；②周视图用柱状图（每日训练完成量，天然离散数据用柱不用线）；③进度条采用目标梯度设计：周期前期显示“已完成 X%”（累计框），后期显示“仅剩 Y”[^27^]；里程碑达成当屏立即呈现下一级目标，防“奖励后重置”流失 [^24^]；④新手前 7 天设置极易达成目标，让曲线“先快”上扬（先快后慢放弃率 11.3% vs 先慢后快 21.8%）[^28^]；⑤情绪历史必须可视化回显给用户（追踪组 vs 报告组效应）[^9^]。

**D6. 主客观双轨进步呈现。** 客观折线旁设置每周一题的主观进步滑块（“这周你感觉自己在进步吗？”）；二者背离（数据升+感觉降，或反之）自动生成复盘提示——主观进步对客观指标捕捉不到的进步类型敏感 [^26^]，且用户周回顾受峰终定律偏差影响，需高频数据校正 [^14^]。每日会话设计“好结尾”（如以今日最佳时刻/好事收尾），利用结尾权重改善记忆与次日回归意愿 [^14^]。

**D7. 复盘节奏与模板（全部内置引导式问卷）：**
- 每日（2 分钟）：DRM 简版——“今天分三段（上午/下午/晚上）各发生了什么？感受如何？”+ 今日好事 1 件 [^13^][^22^]。
- 每周（15 分钟，固定周日）：GTD 三段式（清空→回顾→创造）[^30^] + KISS 四格 [^31^] + 查看本周三条曲线。
- 每月（30 分钟）：GRAI 四步（目标→结果→归因→规律）[^31^]，对照月度量表分数变化。
- 每年（2–4 小时）：YearCompass 全流程数字化（回顾部分+梦想部分）[^32^]。

**D8. 反馈系统的首要 KPI 是“让用户看见进步”，而非“评价表现”。** 进步原理的证据（12,000 篇日记，最好日子 76% 含进步事件）[^25^] 表明：每日反馈页的第一屏应是“今天的你比昨天/上周多做到了什么”（小胜利放大），挫折信息降权、延迟到周复盘处理；同时提供“测量休息日”选项并允许一键关闭所有数字，防范量化对内在动机的侵蚀 [^20^][^29^]。

---

## 八、证据分级表

| 级别 | 数量 | 证据编号 | 说明 |
|---|---|---|---|
| **High**（同行评审一手文献/官方一手文档，结论可直接依赖） | 20 | [^1^][^2^][^4^][^5^][^6^][^7^][^8^][^10^][^11^][^12^][^13^][^14^][^15^][^16^][^17^][^19^][^20^][^22^][^25^][^26^][^27^][^29^]（计 22 条引用，其中 [^9^][^24^] 部分降级） | 期刊论文原文（PLOS ONE、PubMed/PMC、Wiley、JCR、JPSP、JMR、HBR Press 原著等） |
| **Medium**（厂商白皮书含同行评审引用、二手转述经典实验、实践框架无对照研究） | 7 | [^3^][^9^][^18^][^21^部分][^24^][^28^][^30^][^31^][^32^] | CBS 白皮书、ASU 新闻稿、QS 综述文、进度条实验转述、GTD/GRAI/YearCompass 框架 |
| **Low** | 0 | — | 本次未采信任何内容农场级证据支撑实质主张 |

**关键不确定性声明**：①进度条速度实验（[^28^]）未能核对原始论文，仅作设计启发；②情绪追踪的干预效应（[^8^][^9^]）样本量小、周期短，长期效应未知；③所有量表分数用于个人自用趋势参考，不构成临床诊断；④DSES 含宗教措辞，中文自用需本地化改写。

---

## 引用来源清单

[^1^]: 北京语言大学心理学院成果速递（BOCAS，BMC Psychology）. https://xlrzkx.blcu.edu.cn/info/1089/3200.htm
[^2^]: Feasibility and reliability of online vs in-person cognitive testing in healthy older people. PLOS ONE, 2024-08-20. https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0309006
[^3^]: Cambridge Brain Sciences Test Validity and Reliability（白皮书，引 Hampshire et al., 2012）. https://welpartners.com/resources/Cambridge-Brain-Sciences-Test-Validity-and-Reliability.pdf
[^4^]: Computerized Cognitive Testing for Older Adults: A Review. PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC10852880/
[^5^]: Reliability of remote self-administered Web-based digital cognitive measures (Mayo MTD). Alzheimer's Dement: DADM. https://alz-journals.onlinelibrary.wiley.com/doi/pdfdirect/10.1002/dad2.70338
[^6^]: Skirrow et al. Test-retest reliability on the CANTAB: Comment on Karlsen et al. (2020). Appl Neuropsychol Adult, 2021. https://pubmed.ncbi.nlm.nih.gov/33406910/
[^7^]: Psychomotor Vigilance Task 条目. HED Task Database. https://www.hedtags.org/hed-task/tasks/hedtsk_psychomotor_vigilance.html
[^8^]: The Clinical Impacts of Mobile Mood-Monitoring in Young People (MeMO Study). Front Psychiatry, 2021. https://pmc.ncbi.nlm.nih.gov/articles/PMC8363129/
[^9^]: Boosting positivity: The impact of mood tracking on mental well-being（Boghrati et al., JESP）. ASU W. P. Carey, 2024-11-01. https://news.wpcarey.asu.edu/20241101-boosting-positivity-impact-mood-tracking-mental-well-being
[^10^]: Kroenke et al. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med, 2001. https://pubmed.ncbi.nlm.nih.gov/11556941/
[^11^]: Spitzer et al. GAD-7（2006, Arch Intern Med）参数引述：Nature Sci Rep 2025 https://www.nature.com/articles/s41598-025-96165-6 ；Rutter et al., 2016 https://pmc.ncbi.nlm.nih.gov/articles/PMC5333929/
[^12^]: Topp et al. The WHO-5 Well-Being Index: a systematic review. Psychother Psychosom, 2015. https://pubmed.ncbi.nlm.nih.gov/25831962/ ；中文版验证 https://pmc.ncbi.nlm.nih.gov/articles/PMC9005828/ ；糖尿病样本验证 https://pmc.ncbi.nlm.nih.gov/articles/PMC10685601/
[^13^]: Using ESM/EMA in Clinical Assessment and Research（特刊导言）. PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC4255457/ ；Csikszentmihalyi & Larson (1987) 及 Myin-Germeys et al. (2018) 引自 https://www.nature.com/articles/s44400-025-00023-1
[^14^]: 峰终定律元分析（174 效应量, r=0.581）；原始：Kahneman et al., 1993; Fredrickson & Kahneman, 1993; Redelmeier & Kahneman, 1996. 综述页：https://www.behavioraleconomics.com/resources/mini-encyclopedia-of-be/peak-end-rule/
[^15^]: Steger et al., 2006 MLQ（J Res Pers）；使用与评价：https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1580663/full ；中文纵向等值 https://pmc.ncbi.nlm.nih.gov/articles/PMC9640618/
[^16^]: Measurement of flourishing: a scoping review. PMC, 2024. https://pmc.ncbi.nlm.nih.gov/articles/PMC10867253/
[^17^]: Underwood & Teresi, 2002, DSES（Ann Behav Med）；简版验证 https://www.springermedizin.de/validation-of-the-daily-spiritual-experience-scale-short-forms-a/51334426 ；心理测量 https://pmc.ncbi.nlm.nih.gov/articles/PMC2888881/
[^18^]: The Quantified Self Movement 综述. Healthcare Digital, 2025-11-23. https://www.healthcare.digital/single-post/the-quantified-self-movement-from-niche-subculture-to-the-infrastructure-of-precision-medicine
[^19^]: Li, Dey & Forlizzi. A Stage-Based Model of Personal Informatics Systems. CHI 2010. https://www.ianli.com/publications/2010-ianli-chi-stage-based-model.pdf
[^20^]: Etkin. The Hidden Cost of Personal Quantification. J Consumer Research, 2016. 摘要转引：《心理科学进展》https://journal.psych.ac.cn/xlkxjz/article/2024/1671-3710/1671-3710-32-1-27.shtml
[^21^]: Fitness apps 与内在动机质性研究. Br J Health Psychol, 2025-10-22. https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/bjhp.70026
[^22^]: "Three Good Things" Digital Intervention Among Health Care Workers: RCT. PMC, 2023. https://pmc.ncbi.nlm.nih.gov/articles/PMC10202508/
[^23^]: Hull (1932); Kivetz, Urminsky & Zheng (2006, JMR). 综述：https://lawsofux.com/goal-gradient-effect/
[^24^]: Post-reward resetting（Kivetz et al., 2006 转述）https://www.blog.theteamw.com/2010/07/20/100-things-you-should-know-about-people-38-even-the-illusion-of-progress-is-motivating/ ；中间困顿述评（上海财经大学期刊）https://qks.sufe.edu.cn/j/PDFFull/a1a911eb-ea8d-4d08-966f-a6b3be1127f3.pdf
[^25^]: Amabile & Kramer. The Progress Principle. HBR Press, 2011. 原著节选 PDF 与 https://www.creativityatwork.com/on-the-power-of-small-wins/
[^26^]: Kung/Scholer/Inzlicht 等. What Constitutes Successful Goal Pursuit? Subjective vs Objective Goal Progress. https://ps.psychopen.eu/index.php/ps/article/download/12017/12017.pdf
[^27^]: 《持之以恒还是半途而废？消费者感知目标进展研究述评与展望》. 上海财经大学期刊, 2020-08-28. https://qks.sufe.edu.cn/mv_html/j00002/202105/a1a911eb-ea8d-4d08-966f-a6b3be1127f3_WEB.htm
[^28^]: 进度指示器速度与任务放弃率实验（转述）. UXDesign.cc, 2024-08-19. https://uxdesign.cc/from-rpgs-to-ux-how-progress-indicators-affect-user-engagement-8748f02d766a
[^29^]: Self-quantification and consumer well-being: A meta-analytic review. Psychol & Marketing, 2024. https://onlinelibrary.wiley.com/doi/full/10.1002/mar.22141
[^30^]: GTD Weekly Review 官方清单 https://gettingthingsdone.com/wp-content/uploads/2014/10/Weekly_Review_Checklist.pdf ；综述 https://super-productivity.com/blog/gtd-weekly-review-guide/
[^31^]: GRAI/KISS/PDF 复盘法介绍：搜狐 https://www.sohu.com/a/444646512_772835 ；36氪 https://m.36kr.com/p/2475250506798983 ；极客时间 https://time.geekbang.org/column/article/341000
[^32^]: YearCompass 中文官网 https://yearcompass.com/cn/ ；官方手册（简体）https://booklet.yearcompass.com/zh-hans-CN-YearCompass-booklet-A5-printable.pdf
