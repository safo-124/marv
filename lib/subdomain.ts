import { headers } from "next/headers"

export type SubdomainContext = {
  isAdmin: boolean
  hospitalSlug: string | null
  subdomain: string | null
}

/**
 * Get subdomain context from request headers
 * Use in Server Components and API routes
 */
export async function getSubdomainContext(): Promise<SubdomainContext> {
  const headersList = await headers()
  
  const isAdmin = headersList.get("x-is-admin") === "true"
  const hospitalSlug = headersList.get("x-hospital-slug")
  const subdomain = headersList.get("x-subdomain")

  return {
    isAdmin,
    hospitalSlug,
    subdomain,
  }
}

/**
 * Validate that the current request is from the admin subdomain
 * Throws if not authorized
 */
export async function requireAdminSubdomain(): Promise<void> {
  const context = await getSubdomainContext()
  
  if (!context.isAdmin) {
    throw new Error("Unauthorized: Admin subdomain required")
  }
}

/**
 * Validate that the current request is from a hospital subdomain
 * Returns the hospital slug or throws if not on a hospital subdomain
 */
export async function requireHospitalSubdomain(): Promise<string> {
  const context = await getSubdomainContext()
  
  if (!context.hospitalSlug) {
    throw new Error("Unauthorized: Hospital subdomain required")
  }
  
  return context.hospitalSlug
}
