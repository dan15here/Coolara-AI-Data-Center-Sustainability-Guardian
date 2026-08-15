import { type NextRequest, NextResponse } from 'next/server'
import { DASHBOARD_ACCESS_COOKIE, isDashboardAccessGranted } from '@/lib/dashboard-access'

/**
 * Presentation-flow gate: the Command Center is entered from the landing CTA.
 * This is intentionally not an authentication boundary; no real infrastructure
 * data or control capability is exposed by the demo.
 */
export function proxy(request: NextRequest): NextResponse {
  if (isDashboardAccessGranted(request.cookies.get(DASHBOARD_ACCESS_COOKIE)?.value)) {
    return NextResponse.next()
  }

  const landingUrl = request.nextUrl.clone()
  landingUrl.pathname = '/'
  landingUrl.search = ''
  return NextResponse.redirect(landingUrl)
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
