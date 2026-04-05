import {
  getRecentProjects,
  saveRecentPath,
  removeRecentPath,
  clearRecentProjects,
} from '@/lib/recentProjects';

describe('recentProjects', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when no projects saved', () => {
    expect(getRecentProjects()).toEqual([]);
  });

  it('saves and retrieves a path', () => {
    saveRecentPath('/projects/my-repo');
    expect(getRecentProjects()).toEqual(['/projects/my-repo']);
  });

  it('saves multiple paths in order (most recent first)', () => {
    saveRecentPath('/projects/a');
    saveRecentPath('/projects/b');
    saveRecentPath('/projects/c');
    expect(getRecentProjects()).toEqual(['/projects/c', '/projects/b', '/projects/a']);
  });

  it('moves duplicate to front without creating duplicates', () => {
    saveRecentPath('/projects/a');
    saveRecentPath('/projects/b');
    saveRecentPath('/projects/a');
    const result = getRecentProjects();
    expect(result).toEqual(['/projects/a', '/projects/b']);
    expect(result.filter((p) => p === '/projects/a')).toHaveLength(1);
  });

  it('limits to 10 entries (drops oldest)', () => {
    for (let i = 0; i < 11; i++) {
      saveRecentPath(`/projects/repo-${i}`);
    }
    const result = getRecentProjects();
    expect(result).toHaveLength(10);
    expect(result[0]).toBe('/projects/repo-10');
    // repo-0 should have been dropped
    expect(result).not.toContain('/projects/repo-0');
  });

  it('removes a specific path', () => {
    saveRecentPath('/projects/a');
    saveRecentPath('/projects/b');
    removeRecentPath('/projects/a');
    expect(getRecentProjects()).toEqual(['/projects/b']);
  });

  it('clears all entries', () => {
    saveRecentPath('/projects/a');
    saveRecentPath('/projects/b');
    clearRecentProjects();
    expect(getRecentProjects()).toEqual([]);
  });

  it('handles malformed localStorage data gracefully', () => {
    localStorage.setItem('dashboard_recent_projects', 'not-valid-json');
    expect(getRecentProjects()).toEqual([]);
  });

  it('handles non-array localStorage data gracefully', () => {
    localStorage.setItem('dashboard_recent_projects', '"just-a-string"');
    expect(getRecentProjects()).toEqual([]);
  });

  it('filters out non-string values from storage', () => {
    localStorage.setItem('dashboard_recent_projects', JSON.stringify(['/valid', 42, null, '/also-valid']));
    expect(getRecentProjects()).toEqual(['/valid', '/also-valid']);
  });
});
