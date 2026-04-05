/**
 * File watcher using chokidar for local dev mode.
 * Watches prompts/ and agents/ directories for .md changes.
 * Uses escalating debounce: 500ms single file, 3000ms batch (>3 files).
 *
 * This module uses Node.js APIs and runs only server-side.
 */
import chokidar, { type FSWatcher } from 'chokidar';

export interface FileWatcherConfig {
  repoPath: string;
  onFileChange: () => void;
  enabled: boolean;
}

/**
 * Create a debounced handler with escalating batch logic.
 * - Single file change: 500ms debounce
 * - Batch changes (>3 files within window): extends to 3000ms
 */
export function createDebouncedHandler(onRefresh: () => void): {
  handler: (path: string) => void;
  cancel: () => void;
} {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let fileCount = 0;

  const SINGLE_DEBOUNCE = 500;
  const BATCH_DEBOUNCE = 3000;
  const BATCH_THRESHOLD = 3;

  function handler(_path: string): void {
    fileCount++;

    if (timer) clearTimeout(timer);

    const delay = fileCount > BATCH_THRESHOLD ? BATCH_DEBOUNCE : SINGLE_DEBOUNCE;
    timer = setTimeout(() => {
      onRefresh();
      fileCount = 0;
      timer = null;
    }, delay);
  }

  function cancel(): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fileCount = 0;
  }

  return { handler, cancel };
}

/** Directories to watch relative to repo root. */
const WATCH_DIRS = [
  'prompts/active',
  'prompts/archive',
  'prompts/index.md',
  'agents/epics',
  'agents/handoffs',
];

export function createFileWatcher(config: FileWatcherConfig): {
  start: () => void;
  stop: () => void;
} {
  let watcher: FSWatcher | null = null;
  const { handler, cancel } = createDebouncedHandler(config.onFileChange);

  function start(): void {
    if (!config.enabled || watcher) return;

    const watchPaths = WATCH_DIRS.map((d) => `${config.repoPath}/${d}`);

    watcher = chokidar.watch(watchPaths, {
      followSymlinks: false,
      ignored: [
        /(^|[\\/])node_modules([\\/]|$)/,
        /(^|[\\/])\.git([\\/]|$)/,
        /(^|[\\/])dashboard([\\/]|$)/,
        /(?<!\.md)$/,
      ],
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on('add', handler);
    watcher.on('change', handler);
    watcher.on('unlink', handler);
  }

  function stop(): void {
    cancel();
    if (watcher) {
      void watcher.close();
      watcher = null;
    }
  }

  return { start, stop };
}
