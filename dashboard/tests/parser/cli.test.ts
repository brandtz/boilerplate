import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const CLI_PATH = path.resolve(__dirname, '../../bin/dashboard-parse.ts');
const SNAPSHOT_REPO = path.resolve(__dirname, '../fixtures/snapshot-repo');

function runCli(args: string[]): { stdout: string; stderr: string; exitCode: number } {
  const cmd = `npx tsx "${CLI_PATH}" ${args.map(a => `"${a}"`).join(' ')}`;
  try {
    const stdout = execSync(cmd, {
      encoding: 'utf-8',
      cwd: path.resolve(__dirname, '../..'),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? '',
      exitCode: e.status ?? 1,
    };
  }
}

describe('CLI: dashboard-parse', () => {
  it('--help prints usage and exits 0', () => {
    const result = runCli(['--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('--repo');
    expect(result.stdout).toContain('--output');
  });

  it('--version prints version and exits 0', () => {
    const result = runCli(['--version']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('dashboard-parse v');
  });

  it('--repo <valid-path> outputs valid JSON to stdout', () => {
    const result = runCli(['--repo', SNAPSHOT_REPO]);
    expect(result.exitCode).toBe(0);
    const state = JSON.parse(result.stdout);
    expect(state).toHaveProperty('project');
    expect(state).toHaveProperty('prompts');
    expect(state.prompts.length).toBe(6);
  });

  it('--repo <valid-path> --output <file> writes JSON to file', () => {
    const tmpFile = path.join(os.tmpdir(), `dashboard-test-${Date.now()}.json`);
    try {
      const result = runCli(['--repo', SNAPSHOT_REPO, '--output', tmpFile]);
      expect(result.exitCode).toBe(0);
      expect(fs.existsSync(tmpFile)).toBe(true);
      const content = fs.readFileSync(tmpFile, 'utf-8');
      const state = JSON.parse(content);
      expect(state).toHaveProperty('project');
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  });

  it('--pretty outputs indented JSON', () => {
    const result = runCli(['--repo', SNAPSHOT_REPO, '--pretty']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('\n');
    expect(result.stdout).toContain('  "project"');
  });

  it('--repo <invalid-path> exits with error', () => {
    const result = runCli(['--repo', '/nonexistent/path/that/does/not/exist']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Error');
  });
});
