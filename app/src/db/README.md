# 数据层使用文档（页面代理对接指南）

所有数据存本机 IndexedDB（Dexie，库名 `mindful-daily`）。**只消费本目录导出的 hooks 与写入函数，不要直接操作表、不要修改 schema。**

```ts
import { useToday, useStreak, saveIntention, ... } from "@/db/hooks";
import { getTrainingDate, getWeekId, type DailyEntry } from "@/db/schema";
```

## 表一览

| 表名 | 主键 | 内容 |
|---|---|---|
| `daily_entries` | `date`（训练日 'yyyy-MM-dd'） | 当日全部练习：晨间意图（intentionIf/intentionThen/intentionDone）、正念（mindfulnessDone/mindfulnessMinutes）、循环叹息（sighDone）、签到标记（checkinDone）、明日 to-do（todoItems/todoDone，最多 3）、三件好事（gratitudes/gratitudeDone，最多 3，含可选 reason） |
| `mood_checkins` | 自增 `id` | 情绪签到（每日多次）：word 情绪词、valence（pleasant/unpleasant）、arousal（high/low）、quadrant 象限、score 1–5、note 自由命名、createdAt 时间戳、date 训练日 |
| `who5_records` | 自增 `id` | WHO-5：scores 5 题（各 0–5）、total（0–25）、weekId 周标识、createdAt |
| `weekly_reviews` | `weekId`（周一 'yyyy-MM-dd'） | 小胜利 wins[]、下周 if-then 计划 plans[{if,then}]、completed |
| `kv` | `key` | 设置项与 streak 引擎状态（key='streak'，结构见 StreakState） |

## 日期约定

- `getTrainingDate(now?)`：训练日以 **05:00** 为界，00:00–04:59 属前一训练日。
- `getWeekId(date?)`：周一起始，返回周一的 'yyyy-MM-dd'。

## 读取 hooks（useLiveQuery 订阅，自动刷新，无 spinner）

| Hook | 签名 | 返回 |
|---|---|---|
| `useToday` | `(date?=getTrainingDate())` | `{ date, entry, isPersisted }`——entry 恒非空（无记录时给内存空白对象） |
| `useEntry` | `(date)` | `DailyEntry \| undefined` |
| `useEntriesRange` | `(from, to)` | `DailyEntry[]`（闭区间，仪表盘/复盘用） |
| `useMoodCheckins` | `(limit?)` | 全部签到，时间倒序 |
| `useDayCheckins` | `(date?=今日)` | 当日签到倒序，`[0]` 为最近一次（today.md「平静 · 14:32」摘要用它） |
| `useStreak` | `(date?=今日)` | `{ state, justLitToday, freezesLeft }`——state 含 current/totalDays/pendingRecovery（慈悲卡）/pendingFreezeToast/hasAnyRecord（首运欢迎态） |
| `useWho5` / `useWho5ForWeek` | `()` / `(weekId?=本周)` | 全部升序 / 本周一条 |
| `useWeeklyReview` / `useWeeklyReviews` | `(weekId?=本周)` / `()` | 本周一条 / 全部 |
| `useKv` | `<T>(key)` | 设置项订阅 |

## 写入函数（async；写后 hooks 自动刷新）

| 函数 | 签名 | 说明 |
|---|---|---|
| `saveIntention` | `(date, ifPart, thenPart)` | if-then 意图；两段都非空才置 intentionDone |
| `markPractice` | `(date, 'mindfulness'\|'sigh', minutes?)` | 练习页完成时回写 |
| `addMoodCheckin` | `(input: NewCheckin, date?=今日)` | 新增签到并点亮当日签到圆点，返回 id |
| `saveTodos` | `(date, items: string[])` | 明日三件事，自动去空白、截断到 3 件 |
| `saveGratitudes` | `(date, items: GratitudeItem[])` | 三件好事，最多 3 条，永不计分 |
| `saveWho5` | `(scores: number[], weekId?=本周)` | 5 题各 0–5 |
| `saveWeeklyReview` | `(weekId, wins, plans, completed)` | 保存/更新周复盘 |
| `exportAllData` | `()` | 全部数据 → JSON 字符串（设置页导出） |
| `importAllData` | `(json)` | 导入，返回条数（不支持版本会 throw） |
| `clearAllData` | `()` | 清空全部本地数据 |

## streak 引擎（`@/db/streak`）

- 点亮规则：晨/日/晚三段**每段至少完成 1 项**（`isDayLit(entry)`，纯函数）。
- `entryDots(entry)` → 6 圆点布尔数组 [意图,正念,叹息,签到,todo,好事]。
- 每周 2 枚 freeze 自动补位（周一重置），断签不清累计；`pendingRecovery=true` 时今日页显示慈悲卡，展示后调 `dismissRecovery()`；`consumeFreezeToast()` 取出待告知的补位次数（次日 Toast「昨天的空缺已被自动补位」）。
- `useStreak()` 每次执行自动结算到今天；`justLitToday=true` 时触发庆祝动效（陶土小花 +「今天的回路已点亮」）。

## 示例

```tsx
const { date, entry } = useToday();
const { state, justLitToday, freezesLeft } = useStreak();
const checkins = useDayCheckins(); // checkins[0]?.word + format(checkins[0].createdAt,'HH:mm')

await saveIntention(date, ifText, thenText);   // 意图 Sheet 提交
await markPractice(date, "mindfulness", 10);    // 练习完成
```
