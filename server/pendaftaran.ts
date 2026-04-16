"use server";

import { prisma } from "@/lib/prisma";
import { pendaftaranSchema, type PendaftaranInput } from "@/server/pendaftaran.schema";
import { revalidatePath } from "next/cache";

export async function createPendaftaran(data: PendaftaranInput) {
  try {
    // Validasi data dengan Zod
    const validatedData = pendaftaranSchema.parse(data);

    // Check apakah user sudah mendaftar pelatihan ini
    const existing = await prisma.pendaftaran.findFirst({
      where: {
        email: validatedData.email,
        pelatihanId: validatedData.pelatihanId,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Anda sudah mendaftar untuk pelatihan ini",
      };
    }

    // Create pendaftaran
    const pendaftaran = await prisma.pendaftaran.create({
      data: validatedData,
      include: {
        pelatihan: true,
      },
    });

    revalidatePath("/dashboard/user/pendaftaran");

    return {
      success: true,
      data: pendaftaran,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat pendaftaran",
    };
  }
}

export async function getPendaftaranByEmail(email: string) {
  try {
    const pendaftaran = await prisma.pendaftaran.findMany({
      where: { email },
      include: {
        pelatihan: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: pendaftaran,
    };
  } catch (error) {
    return {
      success: false,
      error: "Gagal mengambil data pendaftaran",
    };
  }
}

export async function getPelatihanList() {
  try {
    const pelatihans = await prisma.pelatihan.findMany({
      where: { status: true },
      select: {
        id: true,
        name: true,
        tanggal: true,
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    return {
      success: true,
      data: pelatihans,
    };
  } catch (error) {
    return {
      success: false,
      error: "Gagal mengambil daftar pelatihan",
    };
  }
}
