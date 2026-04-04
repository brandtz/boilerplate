/**
 * Route path constants for the five primary views.
 */
export const ROUTES = {
  overview: '/',
  epics: '/epics',
  prompts: '/prompts',
  sessions: '/sessions',
  tasks: '/tasks',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export interface NavItem {
  label: string;
  href: RoutePath;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: ROUTES.overview, icon: '📊' },
  { label: 'Epics', href: ROUTES.epics, icon: '🗂️' },
  { label: 'Prompts', href: ROUTES.prompts, icon: '📝' },
  { label: 'Sessions', href: ROUTES.sessions, icon: '🕐' },
  { label: 'Tasks', href: ROUTES.tasks, icon: '✅' },
];
