import Dexie, { type EntityTable } from "dexie";
import { format, subDays } from "date-fns";

/**
 * 心智日课 · 数据层 Schema（Dexie / IndexedDB）
 * 所有数据仅存本机，无后端、无模拟数据。
 * 页面代理只消费本模块导出的类型与 db 实例，不要修改表结构。
 */

// 日期约定

/** 训练日以 05:00 为界：00:00–04:59 仍属前一训练日（today.md §10 深夜跨日） */
export const DAY_BOUNDARY_HOUR = 5;

/** 取当前时刻所属的训练日 'yyyy-MM-dd' */
export function getTrainingDate(now: Date = new Date()): string {
  const d = now.getHours() < DAY_BOUNDARY_HOUR ? subDays(now, 1) : now;
  return format(d, "yyyy-MM-dd");
}

/** 周标识：周一起始，返回该周周一的 'yyyy-MM-dd'（date-fns 周计算，周一起点） */
export function getWeekId(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(`${date}T12:00:00`) : date;
  const day = d.getDay(); // 0=周日
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return format(monday, "yyyy-MM-dd");
}

// 表 1：daily_entries —— 按日期记录当日全部练习状态

/** 三件好事条目（灵魂类练习只记内容，永不计分——design.md §9 红线 1） */
export interface GratitudeItem {
  text: string;
  reason?: string; // 可附原因（evening.md）
}

export interface DailyEntry {
  /** 主键：训练日 'yyyy-MM-dd' */
  date: string;

  // —— 晨间段 ——
  /** if-then 意图「如果____」部分 */
  intentionIf?: string;
  /** if-then 意图「那么我就____」部分 */
  intentionThen?: string;
  /** 意图已填写 */
  intentionDone: boolean;
  /** 10 分钟正念已完成 */
  mindfulnessDone: boolean;
  /** 正念实际时长（分钟，练习页回写） */
  mindfulnessMinutes?: number;

  // —— 日间段 ——
  /** 1 分钟循环叹息已完成 */
  sighDone: boolean;
  /** 当日是否至少签到过一次（明细在 mood_checkins） */
  checkinDone: boolean;

  // —— 晚间段 ——
  /** 明日 to-do（前瞻卸载，最多 3 件） */
  todoItems: string[];
  /** 明日 to-do 已写下（至少 1 件） */
  todoDone: boolean;
  /** 三件好事（最多 3 条） */
  gratitudes: GratitudeItem[];
  /** 三件好事已记录（至少 1 条） */
  gratitudeDone: boolean;

  /** 最后更新时间戳 */
  updatedAt: number;
}

/** 创建某训练日的空白记录 */
export function createEmptyEntry(date: string): DailyEntry {
  return {
    date,
    intentionDone: false,
    mindfulnessDone: false,
    sighDone: false,
    checkinDone: false,
    todoItems: [],
    todoDone: false,
    gratitudes: [],
    gratitudeDone: false,
    updatedAt: Date.now(),
  };
}

// 表 2：mood_checkins —— 情绪命名签到（每日可多次）

/** 效价：愉悦 / 不愉悦 */
export type Valence = "pleasant" | "unpleasant";
/** 唤醒度：高 / 低 */
export type Arousal = "high" | "low";
/** 象限（由效价×唤醒度组合，checkin.md 词格定位） */
export type Quadrant =
  | "pleasant-high"
  | "pleasant-low"
  | "unpleasant-high"
  | "unpleasant-low";

export interface MoodCheckin {
  /** 自增主键 */
  id?: number;
  /** 所属训练日 'yyyy-MM-dd' */
  date: string;
  /** 情绪词（如「平静」「紧绷」） */
  word: string;
  valence: Valence;
  arousal: Arousal;
  quadrant: Quadrant;
  /** 整体状态评分 1–5 */
  score: number;
  /** 一句话自由命名（可空） */
  note?: string;
  /** 签到时间戳（毫秒） */
  createdAt: number;
}

// 表 3：who5_records —— WHO-5 幸福感量表（每周一次，复盘页）

export interface Who5Record {
  /** 自增主键 */
  id?: number;
  /** 周标识（周一日期 'yyyy-MM-dd'，见 getWeekId） */
  weekId: string;
  /** 5 题原始分数，每题 0–5 */
  scores: number[];
  /** 总分（0–25） */
  total: number;
  createdAt: number;
}

// 表 4：weekly_reviews —— 周日复盘

/** 下周 if-then 计划条目 */
export interface ReviewPlan {
  if: string;
  then: string;
}

export interface WeeklyReview {
  /** 主键：周标识（周一日期） */
  weekId: string;
  /** 小胜利清单 */
  wins: string[];
  /** 下周 if-then 计划 */
  plans: ReviewPlan[];
  /** 本周复盘是否完成 */
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

// 表 5：kv —— 设置与 streak 引擎状态

export interface KvRecord {
  key: string;
  /** 任意可结构化克隆的值 */
  value: unknown;
}

/** streak 引擎持久化状态（存于 kv，key = 'streak'，见 streak.ts） */
export interface StreakState {
  /** 当前连续点亮天数（断签无 freeze 时归零，但不影响 totalDays） */
  current: number;
  /** 累计点亮天数（永远保留，不清零——design.md §9 红线 2） */
  totalDays: number;
  /** 最近一次点亮的训练日 */
  lastLitDate: string | null;
  /** 本统计周内已用的 freeze 数（0–2，每周一重置） */
  freezesUsedThisWeek: number;
  /** freeze 计数所属的周标识 */
  freezeWeekId: string | null;
  /** 是否处于断签恢复待展示状态（慈悲卡，展示后置 false） */
  pendingRecovery: boolean;
  /** 待 Toast 告知的 freeze 自动补位次数（次日轻声告知后清零） */
  pendingFreezeToast: number;
  /** 是否有过任意记录（首运欢迎态判断） */
  hasAnyRecord: boolean;
}

// 数据库实例

export class MindfulDb extends Dexie {
  daily_entries!: EntityTable<DailyEntry, "date">;
  mood_checkins!: EntityTable<MoodCheckin, "id">;
  who5_records!: EntityTable<Who5Record, "id">;
  weekly_reviews!: EntityTable<WeeklyReview, "weekId">;
  kv!: EntityTable<KvRecord, "key">;

  constructor() {
    super("mindful-daily");
    this.version(1).stores({
      daily_entries: "date, updatedAt",
      mood_checkins: "++id, date, createdAt, quadrant",
      who5_records: "++id, weekId, createdAt",
      weekly_reviews: "weekId, completed, updatedAt",
      kv: "key",
    });
  }
}

/** 全局单例 */
export const db = new MindfulDb();
