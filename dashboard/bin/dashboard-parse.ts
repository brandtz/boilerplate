#!/usr/bin/env node

/**
 * CLI entry point for the dashboard parser.
 *
 * Usage:
 *   npx dashboard-parse --repo <path> --output <json-path> [--pretty] [--quiet]
 *   npx dashboard-parse --help
 *   npx dashboard-parse --version
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseArgs } from 'node:util';
import { parse } from '../src/parser/index';
import { isError } from '../src/parser/warnings';
import { validateRepoStructure } from '../src/parser/scanner';

const VERSION = '0.1.0';

const USAGE = `Usage: dashboard-parse [options]

Options:
  --repo <path>     Path to the repository root (default: cwd)
  --output <path>   Path to write JSON output (default: stdout)
  --pretty          Pretty-print JSON output with 2-space indent
  --quiet           Suppress info-level warnings from stderr
  --version         Print version and exit
  --help            Print this help message and exit

Examples:
  dashboard-parse
  dashboard-parse --repo /path/to/repo --output state.json --pretty
  dashboard-parse --repo . --quiet
`;

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      repo: { type: 'string', short: 'r' },
      output: { type: 'string', short: 'o' },
      pretty: { type: 'boolean', default: false },
      quiet: { type: 'boolean', default: false },
      version: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    strict: true,
  });

  if (values.help) {
    process.stdout.write(USAGE);
    process.exit(0);
  }

  if (values.version) {
    process.stdout.write(`dashboard-parse v${VERSION}\n`);
    process.exit(0);
  }

  // Resolve repo path
  const repoPath = path.resolve(values.repo ?? process.cwd());

  // Validate repo path exists
  if (!fs.existsSync(repoPath)) {
    process.stderr.write(`Error: Repository path does not exist: ${repoPath}\n`);
    process.exit(1);
  }

  // Validate repo is dashboard-capable
  const validation = await validateRepoStructure(repoPath);
  if (!validation.capable) {
    process.stderr.write(`Error: Repository is not dashboard-capable.\n`);
    process.stderr.write(`Missing required: ${validation.missingRequired.join(', ')}\n`);
    process.exit(1);
  }

  // Parse the repository
  const state = await parse(repoPath);

  // Serialize to JSON
  const json = JSON.stringify(state, null, values.pretty ? 2 : undefined);

  // Write output
  if (values.output) {
    const outputPath = path.resolve(values.output);
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, json, 'utf-8');
    if (!values.quiet) {
      process.stderr.write(`Written to ${outputPath}\n`);
    }
  } else {
    process.stdout.write(json + '\n');
  }

  // Print warning summary to stderr
  const errors = state.warnings.filter(w => isError(w));
  const warnings = state.warnings.filter(w => w.severity === 'warning');
  const infos = state.warnings.filter(w => w.severity === 'info');

  if (!values.quiet) {
    process.stderr.write(
      `Parse complete: ${errors.length} error(s), ${warnings.length} warning(s), ${infos.length} info(s)\n`,
    );
  }

  // Exit code: 1 if any error-level warnings
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((err: unknown) => {
  process.stderr.write(`Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
