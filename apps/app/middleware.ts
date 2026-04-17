import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  // Only protect /reps/[id] routes (rep detail pages)
  const isRepDetailRoute = /^\/reps\/[^/]+$/.test(request.nextUrl.pathname)

  if (isRepDetailRoute) {
    // Update session and check auth
    const { response, user } = await updateSession(request)

    if (!user) {
      // Preserve the intended URL for redirect after login
      const redirectUrl = new URL("/auth/login", request.url)
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  }

  // For all other routes, just update the session (no auth required)
  const { response } = await updateSession(request)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
