/**
 * Development-only switches for rites that inspect or change the page.
 * @module grimoire/core/dev
 */

// Only the part of Node's `process` this file reads. Declared here so apps that
// type-check this source without Node types still compile.
declare const process: { env: { NODE_ENV?: string } };

/**
 * `true` in development builds.
 *
 * Bundlers such as Vite, webpack, and Next.js replace `process.env.NODE_ENV`
 * when they build the app, so this becomes a constant and production builds
 * can drop dev-only code. Where nothing replaces it, `process` does not exist
 * in the browser and this returns `false`, which keeps dev-only rites off.
 */
export const isDevelopmentBuild = (): boolean => {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
};

/**
 * Options for {@link resolveRiteEnabled}.
 */
export interface RiteEnabledOptions {
  /** What the app asked for. `undefined` means "use the default". */
  enabled?: boolean;
  /** The rite inspects or changes the page, so it defaults to development builds only. */
  devOnly?: boolean;
}

/**
 * Decides whether a rite should run. An explicit `enabled` always wins, so
 * apps can turn an inspector on in production on purpose. Otherwise dev-only
 * rites run in development builds only, and the rest run everywhere.
 *
 * @example
 * ```ts
 * const on = resolveRiteEnabled({ enabled: props.enabled, devOnly: true });
 * ```
 */
export const resolveRiteEnabled = ({ enabled, devOnly = false }: RiteEnabledOptions): boolean =>
  enabled ?? (devOnly ? isDevelopmentBuild() : true);
