# 计划 V2：开发「每日训练大脑·心智·灵魂」V1 MVP

## 依据
- 报告：/mnt/agents/output/mindtraining.agent.final.md（第 6 章产品方案、第 7 章 MVP）
- V1 范围（sec07 表 7-1 含项）：
  1. 今日页（默认首页）：晨 if-then 意图 + 10 分钟正念练习 + 晚间明日 to-do/三件好事
  2. 情绪命名签到（一句话命名提示，RVLPFC 机制）
  3. streak/freeze 引擎（连续天数 + 每周 2 个 freeze 自动补位，断签不清零、无惩罚文案）
  4. 周日深度复盘（小胜利清单开场 + 下周 if-then）
  5. 基础仪表盘：柱状图（每周完成量对比）+ 折线图（情绪评分、WHO-5 趋势）
  6. IndexedDB 本地存储为唯一事实源 + JSON 导出
- V1 不含（明确排除）：UFOV 训练、AI 对话、灵魂模块库、间隔重复引擎、量表月测（PHQ-9/GAD-7/MLQ）
- WHO-5：每周一次（5 题正向措辞），纳入仪表盘折线

## 硬约束（用户历史要求）
- PWA：manifest + apple-touch-icon + standalone，Safari 添加到主屏幕全屏运行
- 无模拟数据、无硬编码假数据；所有数据来自用户真实记录
- 中文界面；实用美观；低饱和暖色（莫兰迪系），禁蓝紫渐变
- iPhone 移动优先；交互细节：按钮不重叠、弹层不出屏（历史踩坑）
- 游戏化红线：灵魂类记录仅 ✓/✗，无分数无惩罚；奖励信息式/庆祝式

## Stage 1 — 技术搭建（加载 vibecoding-webapp-swarm）
React + TypeScript + Tailwind，Dexie(IndexedDB)，Recharts（柱/折线），PWA 配置

## Stage 2 — 功能实现（按模块）
1. 数据层：Dexie schema（daily_entries / mood_checkins / who5_records / settings / streak_state）
2. 今日页：晨/日/晚三段卡片流，随时间段高亮当前段
3. 情绪签到：情绪词轮选 + 一句话命名
4. 正念练习：10 分钟计时 + 引导文案阶段（无音频，V1 用文字引导+呼吸动画）
5. 三件好事 + 明日 to-do（晚间前瞻卸载）
6. streak/freeze 引擎
7. 周日复盘页（周日解锁，平日可回看）
8. 仪表盘：柱状图周完成量 + 折线图情绪/WHO-5
9. 设置页：数据导出/导入、清空、诚实声明（关于页）

## Stage 3 — 验收
- 真机路径模拟：首日完整回路走查、断签 freeze 逻辑、周日复盘解锁
- website_version_manager build_version 交付
