/**
 * useAutopsy - Live Web Vitals and slow parts of the page
 * @module hooks/useAutopsy
 */

import { useEffect, useState } from 'react';
import { emptyAutopsy, observeAutopsy, type AutopsyReport } from '../grimoire/rites/autopsy';

/**
 * Options for {@link useAutopsy}.
 */
export interface AutopsyOptions {
  /** Measure while `true`. @default true */
  enabled?: boolean;
}

/**
 * Measures the page with {@link observeAutopsy} while enabled, and returns
 * the latest report. Measures from before it started (the page load) are
 * included, so it can be turned on at any time.
 *
 * @example
 * ```tsx
 * const report = useAutopsy();
 * <p>Largest paint: {report.metrics.lcp ?? 'not yet'} ms</p>
 * ```
 */
export const useAutopsy = (options: AutopsyOptions = {}): AutopsyReport => {
  const { enabled = true } = options;
  const [report, setReport] = useState<AutopsyReport>(emptyAutopsy);

  useEffect(() => {
    if (!enabled || typeof PerformanceObserver !== 'function') {
      setReport(emptyAutopsy());
      return undefined;
    }
    return observeAutopsy(setReport);
  }, [enabled]);

  return report;
};
