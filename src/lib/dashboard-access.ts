export const DASHBOARD_ACCESS_COOKIE = 'coolara_dashboard_access'
export const DASHBOARD_ACCESS_VALUE = 'granted'
export const DASHBOARD_ACCESS_MAX_AGE_SECONDS = 15 * 60

export function isDashboardAccessGranted(value: string | undefined): boolean {
  return value === DASHBOARD_ACCESS_VALUE
}
