import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { UserRole } from "@/app/generated/prisma/client"

/**
 * Get the current session, returns null if not authenticated
 */
export async function getSession() {
  return await auth()
}

/**
 * Require authentication, redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }
  
  return session
}

/**
 * Require specific role(s), redirects to unauthorized if not matching
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth()
  
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/unauthorized")
  }
  
  return session
}

/**
 * Require Super Admin role
 */
export async function requireSuperAdmin() {
  return requireRole(["SUPER_ADMIN"])
}

/**
 * Require Hospital Admin role
 */
export async function requireHospitalAdmin() {
  return requireRole(["HOSPITAL_ADMIN"])
}

/**
 * Require Hospital Admin or Health Worker role
 */
export async function requireHospitalStaff() {
  return requireRole(["HOSPITAL_ADMIN", "HEALTH_WORKER"])
}

/**
 * Check if user has access to a specific hospital
 */
export async function requireHospitalAccess(hospitalId: string) {
  const session = await requireAuth()
  
  // Super admin has access to all hospitals
  if (session.user.role === "SUPER_ADMIN") {
    return session
  }
  
  // Hospital staff must belong to the hospital
  if (session.user.hospitalId !== hospitalId) {
    redirect("/unauthorized")
  }
  
  return session
}
