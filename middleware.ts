import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || ""
  const url = request.nextUrl.clone()

  // Extract subdomain from hostname
  // Handles: admin.marv.com, hospital-slug.marv.com, subdomain.localhost:3000
  let subdomain: string | null = null
  let isAdmin = false
  let hospitalSlug: string | null = null

  // Handle localhost for development (e.g., kampala-central.localhost:3000)
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    // Check for subdomain.localhost:3000 format
    const localhostMatch = hostname.match(/^(.+)\.localhost(:\d+)?$/)
    
    if (localhostMatch) {
      subdomain = localhostMatch[1]
      
      if (subdomain === "admin") {
        isAdmin = true
      } else if (subdomain !== "www") {
        hospitalSlug = subdomain
      }
    } else {
      // Fallback: use query param or header
      subdomain = url.searchParams.get("subdomain") || request.headers.get("x-subdomain")
      
      if (subdomain === "admin") {
        isAdmin = true
      } else if (subdomain) {
        hospitalSlug = subdomain
      }
    }
  } else {
    // Production: extract from actual subdomain
    // Format: subdomain.domain.tld (e.g., admin.marv.com or hospital-slug.marv.com)
    const hostParts = hostname.split(".")
    if (hostParts.length >= 3) {
      subdomain = hostParts[0]
      
      if (subdomain === "admin") {
        isAdmin = true
      } else if (subdomain !== "www") {
        hospitalSlug = subdomain
      }
    }
  }

  // Create response with headers for downstream use
  const response = NextResponse.next()

  // Set headers for use in server components and API routes
  if (isAdmin) {
    response.headers.set("x-is-admin", "true")
    response.headers.set("x-subdomain", "admin")
  } else if (hospitalSlug) {
    response.headers.set("x-hospital-slug", hospitalSlug)
    response.headers.set("x-subdomain", hospitalSlug)
  }

  return response
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes that don't need subdomain context
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
