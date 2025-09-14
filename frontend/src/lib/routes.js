// Centralized route path constants for the CleanSight app
// Use these instead of hard-coded strings to avoid drift.

export const ROUTES = {
  ROOT: '/',
  IMPACT: '/impact',
  HELP: '/help',
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING_ADDRESS: '/onboarding/address',

  // Citizen
  CITIZEN_DASHBOARD: '/dashboard',
  CITIZEN_REPORT: '/report',
  CITIZEN_REPORT_NEW: '/report/new',
  CITIZEN_MAP: '/map',
  CITIZEN_LEADERBOARD: '/leaderboard',
  CITIZEN_REWARDS: '/rewards',
  CITIZEN_COMMUNITY: '/community',
  CITIZEN_SETTINGS: '/settings',

  // Ragpicker
  RAGPICKER_TASKS: '/r/tasks',
  RAGPICKER_MAP: '/r/map',
  RAGPICKER_EARNINGS: '/r/earnings',
  RAGPICKER_PROFILE: '/r/profile',

  // Institution
  ORG_DASHBOARD: '/org/dashboard',
  ORG_REPORTS: '/org/reports',
  ORG_MEMBERS: '/org/members',
  ORG_ANALYTICS: '/org/analytics',
  ORG_SETTINGS: '/org/settings',

  // Admin
  ADMIN_OVERVIEW: '/admin/overview',
  ADMIN_MODERATION: '/admin/moderation',
  ADMIN_ASSIGN: '/admin/assign',
  ADMIN_HEATMAP: '/admin/heatmap',
  ADMIN_USERS: '/admin/users',
  ADMIN_PARTNERS: '/admin/partners',
  ADMIN_SETTINGS: '/admin/settings',

  // Fallback
  NOT_FOUND: '*'
};

export function getDefaultRouteForRole(role) {
  switch (role) {
    case 'citizen': return ROUTES.CITIZEN_DASHBOARD;
    case 'ragpicker': return ROUTES.RAGPICKER_TASKS;
    case 'institution': return ROUTES.ORG_DASHBOARD;
    case 'admin': return ROUTES.ADMIN_OVERVIEW;
    default: return ROUTES.CITIZEN_DASHBOARD;
  }
}
