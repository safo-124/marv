import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Standard Uganda UNEPI Vaccines
const STANDARD_VACCINES = [
  {
    name: "BCG (Bacillus Calmette-Guérin)",
    shortName: "BCG",
    description: "Protects against tuberculosis (TB)",
    manufacturer: "Serum Institute of India",
    dosesRequired: 1,
    minAgeWeeks: 0,
    maxAgeWeeks: null,
    intervalWeeks: null,
    reminderDaysBefore: 0,
  },
  {
    name: "Oral Polio Vaccine - Birth Dose",
    shortName: "OPV-0",
    description: "Protects against poliomyelitis - Birth dose",
    manufacturer: "Bio Farma",
    dosesRequired: 1,
    minAgeWeeks: 0,
    maxAgeWeeks: 2,
    intervalWeeks: null,
    reminderDaysBefore: 0,
  },
  {
    name: "Oral Polio Vaccine",
    shortName: "OPV",
    description: "Protects against poliomyelitis",
    manufacturer: "Bio Farma",
    dosesRequired: 3,
    minAgeWeeks: 6,
    maxAgeWeeks: 14,
    intervalWeeks: 4,
    reminderDaysBefore: 3,
  },
  {
    name: "Pentavalent Vaccine",
    shortName: "DPT-HepB-Hib",
    description: "Protects against Diphtheria, Pertussis, Tetanus, Hepatitis B, and Haemophilus influenzae type b",
    manufacturer: "Serum Institute of India",
    dosesRequired: 3,
    minAgeWeeks: 6,
    maxAgeWeeks: 14,
    intervalWeeks: 4,
    reminderDaysBefore: 3,
  },
  {
    name: "Pneumococcal Conjugate Vaccine",
    shortName: "PCV",
    description: "Protects against pneumococcal disease",
    manufacturer: "Pfizer",
    dosesRequired: 3,
    minAgeWeeks: 6,
    maxAgeWeeks: 14,
    intervalWeeks: 4,
    reminderDaysBefore: 3,
  },
  {
    name: "Rotavirus Vaccine",
    shortName: "Rota",
    description: "Protects against rotavirus diarrhea",
    manufacturer: "GlaxoSmithKline",
    dosesRequired: 2,
    minAgeWeeks: 6,
    maxAgeWeeks: 10,
    intervalWeeks: 4,
    reminderDaysBefore: 3,
  },
  {
    name: "Inactivated Polio Vaccine",
    shortName: "IPV",
    description: "Protects against poliomyelitis - Injectable",
    manufacturer: "Sanofi Pasteur",
    dosesRequired: 1,
    minAgeWeeks: 14,
    maxAgeWeeks: null,
    intervalWeeks: null,
    reminderDaysBefore: 3,
  },
  {
    name: "Measles-Rubella Vaccine - First Dose",
    shortName: "MR-1",
    description: "Protects against measles and rubella - First dose at 9 months",
    manufacturer: "Serum Institute of India",
    dosesRequired: 1,
    minAgeWeeks: 36,
    maxAgeWeeks: 44,
    intervalWeeks: null,
    reminderDaysBefore: 3,
  },
  {
    name: "Yellow Fever Vaccine",
    shortName: "YF",
    description: "Protects against yellow fever",
    manufacturer: "Sanofi Pasteur",
    dosesRequired: 1,
    minAgeWeeks: 36,
    maxAgeWeeks: null,
    intervalWeeks: null,
    reminderDaysBefore: 3,
  },
  {
    name: "Measles-Rubella Vaccine - Second Dose",
    shortName: "MR-2",
    description: "Protects against measles and rubella - Second dose at 18 months",
    manufacturer: "Serum Institute of India",
    dosesRequired: 1,
    minAgeWeeks: 72,
    maxAgeWeeks: 80,
    intervalWeeks: null,
    reminderDaysBefore: 3,
  },
];

// POST - Import standard vaccines
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "HOSPITAL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hospitalAdmin = await prisma.hospitalAdmin.findFirst({
      where: { userId: session.user.id },
      select: { hospitalId: true },
    });

    if (!hospitalAdmin) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    // Get existing vaccines for this hospital
    const existingVaccines = await prisma.hospitalVaccine.findMany({
      where: { hospitalId: hospitalAdmin.hospitalId },
      select: { name: true },
    });
    const existingNames = new Set(existingVaccines.map((v) => v.name));

    const createdVaccines = [];
    for (const vaccineData of STANDARD_VACCINES) {
      // Skip if vaccine already exists
      if (existingNames.has(vaccineData.name)) {
        continue;
      }

      // Create vaccine
      const vaccine = await prisma.hospitalVaccine.create({
        data: {
          ...vaccineData,
          hospitalId: hospitalAdmin.hospitalId,
          createdById: session.user.id,
        },
      });

      // Create initial version
      const version = await prisma.hospitalVaccineVersion.create({
        data: {
          vaccineId: vaccine.id,
          versionNumber: 1,
          name: vaccine.name,
          minAgeWeeks: vaccine.minAgeWeeks,
          maxAgeWeeks: vaccine.maxAgeWeeks,
          intervalWeeks: vaccine.intervalWeeks,
          dosesRequired: vaccine.dosesRequired,
          changedById: session.user.id,
          changeReason: "Imported from Uganda UNEPI standard schedule",
        },
      });

      // Update vaccine with current version
      await prisma.hospitalVaccine.update({
        where: { id: vaccine.id },
        data: { currentVersionId: version.id },
      });

      createdVaccines.push(vaccine);
    }

    return NextResponse.json({
      message: `Imported ${createdVaccines.length} vaccines`,
      vaccines: createdVaccines,
    });
  } catch (error) {
    console.error("Error importing vaccines:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
