/**
 * The Autopsy: measures how fast the page loads and responds, with the Performance APIs.
 * @module grimoire/rites/autopsy
 */

import { defineCapability } from '../core/capability';
import { defineRite } from '../core/rite';
import { shortSelector } from '../dom/selector';

/** Reading the page's own performance timings. */
export const autopsyCapability = defineCapability({
  id: 'autopsy',
  label: 'PerformanceObserver',
  detect: () => typeof PerformanceObserver === 'function',
});

export const autopsyRite = defineRite({
  id: 'autopsy',
  name: 'Autopsy',
  tagline: 'Measures how quickly the page appeared, how much it jumped, and how fast it answers clicks.',
  sigil: 'skull',
  accent: 'moonlight',
  family: 'seeing',
  support: {
    chromium: 'full',
    firefox: 'partial',
    safari: 'partial',
    note: 'Some measures, such as layout shift and long tasks, are only reported by Chromium browsers.',
  },
  capability: autopsyCapability,
});

/** The measures the Autopsy reports. */
export type AutopsyMetric = 'lcp' | 'cls' | 'inp' | 'fcp' | 'ttfb' | 'tbt';

/** Plain names for each measure. */
export const AUTOPSY_LABELS: Record<AutopsyMetric, string> = {
  lcp: 'Largest paint',
  cls: 'Layout shift',
  inp: 'Response to input',
  fcp: 'First paint',
  ttfb: 'Server response',
  tbt: 'Blocked time',
};

/**
 * Where each measure turns from good to "needs work", and from "needs work"
 * to poor, following the published Web Vitals guidance. Times are in ms;
 * layout shift has no unit.
 */
export const AUTOPSY_THRESHOLDS: Record<AutopsyMetric, readonly [number, number]> = {
  lcp: [2500, 4000],
  cls: [0.1, 0.25],
  inp: [200, 500],
  fcp: [1800, 3000],
  ttfb: [800, 1800],
  tbt: [200, 600],
};

/** Tasks longer than this block the page, in ms. */
export const LONG_TASK_MS = 50;
/** Layout shifts closer together than this belong to one burst, in ms. */
const SHIFT_GAP_MS = 1000;
/** Longest burst of layout shifts, in ms. */
const SHIFT_WINDOW_MS = 5000;
/** Slowest resources and longest tasks kept. */
export const AUTOPSY_LIST_LIMIT = 8;
/** Interactions per extra one ignored when finding the response time, so one odd hiccup does not decide it. */
const INP_INTERACTIONS_PER_OUTLIER = 50;
/** Shortest event duration the browser is asked to report, in ms. */
const EVENT_DURATION_THRESHOLD = 16;

/** How a measure is judged. */
export type AutopsyVerdict = 'good' | 'warn' | 'bad';

/** Judges a value against {@link AUTOPSY_THRESHOLDS}. */
export const judgeMetric = (metric: AutopsyMetric, value: number): AutopsyVerdict => {
  const [good, poor] = AUTOPSY_THRESHOLDS[metric];
  if (value <= good) return 'good';
  return value <= poor ? 'warn' : 'bad';
};

/** Plain words for each verdict. */
export const VERDICT_WORDS: Record<AutopsyVerdict, string> = { good: 'Good', warn: 'Needs work', bad: 'Poor' };

/** One slow thing: a resource or a long task. */
export interface AutopsyItem {
  /** A file name, or what ran. */
  name: string;
  /** How long it took, in ms. */
  duration: number;
  /** When it started, in ms after the page began loading. */
  start: number;
  /** Bytes sent over the network, where known. */
  size?: number;
}

/** Everything measured so far, from {@link observeAutopsy}. */
export interface AutopsyReport {
  /** Each measure, or `null` before it is known or where the browser does not report it. */
  metrics: Record<AutopsyMetric, number | null>;
  /** What the largest paint was, such as `img.hero`. */
  lcpElement: string | null;
  /** How many interactions were timed. */
  interactions: number;
  longTasks: AutopsyItem[];
  /** Number of long tasks, including those not kept. */
  longTaskCount: number;
  slowestResources: AutopsyItem[];
  resourceCount: number;
  /** Bytes of all resources, where the browser reports them. */
  resourceBytes: number;
  /** Which kinds of measurement this browser reports. */
  supported: string[];
}

/** A report with nothing measured. */
export const emptyAutopsy = (): AutopsyReport => ({
  metrics: { lcp: null, cls: null, inp: null, fcp: null, ttfb: null, tbt: null },
  lcpElement: null,
  interactions: 0,
  longTasks: [],
  longTaskCount: 0,
  slowestResources: [],
  resourceCount: 0,
  resourceBytes: 0,
  supported: [],
});

const fileName = (url: string): string => {
  try {
    const { pathname, host } = new URL(url);
    return pathname.split('/').filter(Boolean).pop() ?? host;
  } catch {
    return url;
  }
};

const keepSlowest = (items: AutopsyItem[], item: AutopsyItem): AutopsyItem[] =>
  [...items, item].sort((a, b) => b.duration - a.duration).slice(0, AUTOPSY_LIST_LIMIT);

interface ShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface EventTimingEntry extends PerformanceEntry {
  interactionId?: number;
}

interface PaintEntry extends PerformanceEntry {
  element?: Element | null;
  renderTime?: number;
  loadTime?: number;
}

/**
 * Starts measuring the page with PerformanceObserver and calls `onUpdate`
 * with a fresh report whenever something new is measured. Entries from
 * before it started are included. Returns a function that stops it.
 *
 * - Largest paint, first paint, and server response come from the load.
 * - Layout shift adds up the worst burst of unexpected jumps.
 * - Response to input waits for clicks, taps, and key presses.
 * - Blocked time adds up the part of each long task over 50 ms.
 *
 * @example
 * ```ts
 * const stop = observeAutopsy((report) => console.log(report.metrics.lcp));
 * ```
 */
export const observeAutopsy = (onUpdate: (report: AutopsyReport) => void): (() => void) => {
  const report = emptyAutopsy();
  const supportedTypes: readonly string[] = PerformanceObserver.supportedEntryTypes ?? [];
  report.supported = [...supportedTypes];
  const observers: PerformanceObserver[] = [];
  const interactionTimes = new Map<number, number>();
  const shifts = { burst: 0, burstStart: 0, last: 0, worst: 0 };
  let scheduled = false;
  let stopped = false;

  const publish = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      if (stopped) return;
      onUpdate({ ...report, metrics: { ...report.metrics }, longTasks: [...report.longTasks], slowestResources: [...report.slowestResources] });
    });
  };

  const watch = (type: string, handle: (entry: PerformanceEntry) => void, extra: Record<string, unknown> = {}) => {
    if (!supportedTypes.includes(type)) return;
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(handle);
        publish();
      });
      observer.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
      observers.push(observer);
    } catch {
      // This browser lists the type but will not observe it; leave the measure empty.
    }
  };

  if (supportedTypes.includes('longtask')) report.metrics.tbt = 0;

  watch('navigation', (entry) => {
    const navigation = entry as PerformanceNavigationTiming;
    report.metrics.ttfb = Math.max(0, navigation.responseStart - navigation.startTime);
  });
  watch('paint', (entry) => {
    if (entry.name === 'first-contentful-paint') report.metrics.fcp = entry.startTime;
  });
  watch('largest-contentful-paint', (entry) => {
    const paint = entry as PaintEntry;
    report.metrics.lcp = paint.renderTime || paint.loadTime || paint.startTime;
    report.lcpElement = paint.element ? shortSelector(paint.element) : null;
  });
  watch('layout-shift', (entry) => {
    const shift = entry as ShiftEntry;
    if (shift.hadRecentInput) return;
    const startsNewBurst = shift.startTime - shifts.last > SHIFT_GAP_MS || shift.startTime - shifts.burstStart > SHIFT_WINDOW_MS;
    if (startsNewBurst) {
      shifts.burst = 0;
      shifts.burstStart = shift.startTime;
    }
    shifts.burst += shift.value;
    shifts.last = shift.startTime;
    shifts.worst = Math.max(shifts.worst, shifts.burst);
    report.metrics.cls = shifts.worst;
  });
  watch(
    'event',
    (entry) => {
      const event = entry as EventTimingEntry;
      if (!event.interactionId) return;
      interactionTimes.set(event.interactionId, Math.max(interactionTimes.get(event.interactionId) ?? 0, event.duration));
      const times = [...interactionTimes.values()].sort((a, b) => b - a);
      report.interactions = times.length;
      report.metrics.inp = times[Math.min(times.length - 1, Math.floor(times.length / INP_INTERACTIONS_PER_OUTLIER))];
    },
    { durationThreshold: EVENT_DURATION_THRESHOLD }
  );
  watch('longtask', (entry) => {
    report.longTaskCount += 1;
    report.metrics.tbt = (report.metrics.tbt ?? 0) + Math.max(0, entry.duration - LONG_TASK_MS);
    report.longTasks = keepSlowest(report.longTasks, { name: entry.name === 'self' ? 'This page' : entry.name, duration: entry.duration, start: entry.startTime });
  });
  watch('resource', (entry) => {
    const resource = entry as PerformanceResourceTiming;
    report.resourceCount += 1;
    report.resourceBytes += resource.transferSize || 0;
    report.slowestResources = keepSlowest(report.slowestResources, {
      name: fileName(resource.name),
      duration: resource.duration,
      start: resource.startTime,
      size: resource.transferSize || undefined,
    });
  });

  publish();
  return () => {
    stopped = true;
    observers.forEach((observer) => observer.disconnect());
  };
};
