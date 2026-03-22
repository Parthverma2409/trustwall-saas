import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/t/(.*)',
  '/wall/(.*)',
  '/powered-by',
  '/api/widget(.*)',
  '/api/embed-js(.*)',
  '/api/testimonials/submit',
  '/api/webhook(.*)',
  '/api/og(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)', '/'],
}
