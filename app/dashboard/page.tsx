import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function RedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Redirect based on user role
  switch (session.user.role) {
    case "SUPER_ADMIN":
      redirect("/super-admin");
    case "HOSPITAL_ADMIN":
      redirect("/hospital-admin");
    case "HEALTH_WORKER":
      redirect("/health-worker");
    default:
      redirect("/login");
  }
}
