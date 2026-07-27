import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  getTrainingDate,
  getWeekId,
  createEmptyEntry,
  type DailyEntry,
  type MoodCheckin,
  type Who5Record,
  type WeeklyReview,
  type ReviewPlan,
  type GratitudeItem,
  type Quadrant,
  type Valence,
  type Arousal,
} from "./schema";
import {
  syncStreak,
  defaultStreakState,
  WEEKLY_FREEZES,
  type SyncResult,
} from "./streak";

/**
 * React hooks 与写入函数 —— 页面代理直接调用本模块，不要直接操作 db 表。
 * 读取：useLiveQuery 订阅，数据变化自动刷新，无 loading spinner 长驻。
 */

// ————————————————————————————
// 读取 hooks
// ————————————————————————————

/**
 * 今日记录。无记录时返回内存中的空白 entry（不落库，首次写入才创建）。
 * @returns entry 一定非空；isPersisted 表示是否已入库
 */
export function useToday(date: string = getTrainingDate()): {
  date: string;
  entry: DailyEntry;
  isPersisted: boolean;
} {
  const stored = useLiveQuery(() => db.daily_entries.get(date), [date]);
  return {
    date,
    entry: stored ?? createEmptyEntry(date),
    isPersisted: stored !== undefined,
  };
}

/** 某一日记录（历史日回顾用），无记录返回 undefined */
export function useEntry(date: string): DailyEntry | undefined {
  return useLiveQuery(() => db.daily_entries.get(date), [date]);
}

/** 日期区间内的记录（仪表盘/复盘曲线，'yyyy-MM-dd' 闭区间） */
export function useEntriesRange(from: string, to: string): DailyEntry[] {
  return (
    useLiveQuery(
      () => db.daily_entries.where("date").between(from, to, true, true).toArray(),
      [from, to],
    ) ?? []
  );
}

/** 全部签到（默认按时间倒序，limit 可截断） */
export function useMoodCheckins(limit?: number): MoodCheckin[] {
  return (
    useLiveQuery(async () => {
      const q = db.mood_checkins.orderBy("createdAt").reverse();
      return limit ? q.limit(limit).toArray() : q.toArray();
    }, [limit]) ?? []
  );
}

/** 某训练日的全部签到（倒序，[0] 为最近一次） */
export function useDayCheckins(date: string = getTrainingDate()): MoodCheckin[] {
  return (
    useLiveQuery(
      () =>
        db.mood_checkins
          .where("date")
          .equals(date)
          .reverse()
          .sortBy("createdAt"),
      [date],
    ) ?? []
  );
}

/** streak 状态：自动结算（补位/断签）并订阅变化；justLitToday 触发庆祝动效 */
export function useStreak(date: string = getTrainingDate()): SyncResult & {
  /** 剩余可用 freeze 数（0–2） */
  freezesLeft: number;
} {
  const [result, setResult] = useState<SyncResult>({
    state: defaultStreakState(),
    justLitToday: false,
  });

  // 只读订阅 daily_entries 的最新更新时间，变化时重新结算
  const lastUpdate =
    useLiveQuery(
      async () =>
        (await db.daily_entries.toArray()).reduce(
          (max, e) => Math.max(max, e.updatedAt),
          0,
        ),
      [],
    ) ?? 0;

  useEffect(() => {
    let mounted = true;
    syncStreak(date).then((next) => {
      if (mounted) setResult(next);
    });
    return () => {
      mounted = false;
    };
  }, [date, lastUpdate]);

  return {
    ...result,
    freezesLeft: WEEKLY_FREEZES - result.state.freezesUsedThisWeek,
  };
}

/** 全部 WHO-5 记录（按时间升序，画折线用） */
export function useWho5(): Who5Record[] {
  return (
    useLiveQuery(() => db.who5_records.orderBy("createdAt").toArray(), []) ??
    []
  );
}

/** 指定周（默认本周）的 WHO-5 记录，无则 undefined */
export function useWho5ForWeek(
  weekId: string = getWeekId(),
): Who5Record | undefined {
  return useLiveQuery(
    () =>
      db.who5_records
        .where("weekId")
        .equals(weekId)
        .reverse()
        .sortBy("createdAt")
        .then((arr) => arr[0]),
    [weekId],
  );
}

/** 指定周（默认本周）的复盘记录 */
export function useWeeklyReview(
  weekId: string = getWeekId(),
): WeeklyReview | undefined {
  return useLiveQuery(() => db.weekly_reviews.get(weekId), [weekId]);
}

/** 全部复盘（按周升序） */
export function useWeeklyReviews(): WeeklyReview[] {
  return (
    useLiveQuery(() => db.weekly_reviews.orderBy("weekId").toArray(), []) ?? []
  );
}

/** kv 订阅（设置项等） */
export function useKv<T>(key: string): T | undefined {
  return useLiveQuery(
    async () => (await db.kv.get(key))?.value as T | undefined,
    [key],
  );
}

// ————————————————————————————
// 写入函数（async，调用后 useLiveQuery 自动刷新）
// ————————————————————————————

async function patchEntry(
  date: string,
  patch: Partial<DailyEntry>,
): Promise<DailyEntry> {
  const current = (await db.daily_entries.get(date)) ?? createEmptyEntry(date);
  const next: DailyEntry = { ...current, ...patch, date, updatedAt: Date.now() };
  await db.daily_entries.put(next);
  return next;
}

/** 保存 if-then 意图（today.md §4.1） */
export function saveIntention(date: string, ifPart: string, thenPart: string) {
  return patchEntry(date, {
    intentionIf: ifPart.trim(),
    intentionThen: thenPart.trim(),
    intentionDone: ifPart.trim().length > 0 && thenPart.trim().length > 0,
  });
}

/** 标记练习完成（练习页回写）：正念可附实际分钟数 */
export function markPractice(
  date: string,
  type: "mindfulness" | "sigh",
  minutes?: number,
) {
  return patchEntry(
    date,
    type === "mindfulness"
      ? { mindfulnessDone: true, mindfulnessMinutes: minutes ?? 10 }
      : { sighDone: true },
  );
}

export interface NewCheckin {
  word: string;
  valence: Valence;
  arousal: Arousal;
  quadrant: Quadrant;
  score: number; // 1–5
  note?: string;
}

/** 新增一次情绪签到（每日可多次），并点亮当日签到圆点 */
export async function addMoodCheckin(
  input: NewCheckin,
  date: string = getTrainingDate(),
): Promise<number> {
  const id = (await db.mood_checkins.add({
    date,
    word: input.word,
    valence: input.valence,
    arousal: input.arousal,
    quadrant: input.quadrant,
    score: input.score,
    note: input.note?.trim() || undefined,
    createdAt: Date.now(),
  })) as number;
  await patchEntry(date, { checkinDone: true });
  return id;
}

/** 保存明日 to-do（前瞻卸载，最多 3 件，自动去空白） */
export function saveTodos(date: string, items: string[]) {
  const clean = items.map((s) => s.trim()).filter(Boolean).slice(0, 3);
  return patchEntry(date, { todoItems: clean, todoDone: clean.length > 0 });
}

/** 保存三件好事（最多 3 条，自动去空白） */
export function saveGratitudes(date: string, items: GratitudeItem[]) {
  const clean = items
    .map((g) => ({ text: g.text.trim(), reason: g.reason?.trim() || undefined }))
    .filter((g) => g.text.length > 0)
    .slice(0, 3);
  return patchEntry(date, {
    gratitudes: clean,
    gratitudeDone: clean.length > 0,
  });
}

/** 提交 WHO-5（5 题各 0–5，总分 0–25），每周一条新记录 */
export function saveWho5(scores: number[], weekId: string = getWeekId()) {
  const total = scores.reduce((a, b) => a + b, 0);
  return db.who5_records.add({
    weekId,
    scores: scores.slice(0, 5),
    total,
    createdAt: Date.now(),
  });
}

/** 保存/更新周复盘 */
export async function saveWeeklyReview(
  weekId: string,
  wins: string[],
  plans: ReviewPlan[],
  completed: boolean,
): Promise<void> {
  const existing = await db.weekly_reviews.get(weekId);
  await db.weekly_reviews.put({
    weekId,
    wins: wins.map((s) => s.trim()).filter(Boolean),
    plans: plans.filter((p) => p.if.trim() && p.then.trim()),
    completed,
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  });
}

// ————————————————————————————
// 设置页：导出 / 导入 / 清空
// ————————————————————————————

export interface ExportPayload {
  version: 1;
  exportedAt: number;
  daily_entries: DailyEntry[];
  mood_checkins: MoodCheckin[];
  who5_records: Who5Record[];
  weekly_reviews: WeeklyReview[];
  kv: { key: string; value: unknown }[];
}

/** 导出全部数据为 JSON 字符串（设置页下载为文件） */
export async function exportAllData(): Promise<string> {
  const payload: ExportPayload = {
    version: 1,
    exportedAt: Date.now(),
    daily_entries: await db.daily_entries.toArray(),
    mood_checkins: await db.mood_checkins.toArray(),
    who5_records: await db.who5_records.toArray(),
    weekly_reviews: await db.weekly_reviews.toArray(),
    kv: await db.kv.toArray(),
  };
  return JSON.stringify(payload, null, 2);
}

/** 从 JSON 导入（覆盖同名主键，返回导入条数） */
export async function importAllData(json: string): Promise<number> {
  const payload = JSON.parse(json) as ExportPayload;
  if (payload.version !== 1) throw new Error("不支持的数据版本");
  let count = 0;
  await db.transaction(
    "rw",
    [db.daily_entries, db.mood_checkins, db.who5_records, db.weekly_reviews, db.kv],
    async () => {
      await db.daily_entries.bulkPut(payload.daily_entries ?? []);
      await db.mood_checkins.bulkPut(payload.mood_checkins ?? []);
      await db.who5_records.bulkPut(payload.who5_records ?? []);
      await db.weekly_reviews.bulkPut(payload.weekly_reviews ?? []);
      await db.kv.bulkPut(payload.kv ?? []);
      count =
        (payload.daily_entries?.length ?? 0) +
        (payload.mood_checkins?.length ?? 0) +
        (payload.who5_records?.length ?? 0) +
        (payload.weekly_reviews?.length ?? 0);
    },
  );
  return count;
}

/** 清空全部本地数据（设置页破坏性操作，需二次确认） */
export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw",
    [db.daily_entries, db.mood_checkins, db.who5_records, db.weekly_reviews, db.kv],
    async () => {
      await Promise.all([
        db.daily_entries.clear(),
        db.mood_checkins.clear(),
        db.who5_records.clear(),
        db.weekly_reviews.clear(),
        db.kv.clear(),
      ]);
    },
  );
}
