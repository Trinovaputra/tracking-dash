<<<<<<< HEAD
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const pelatihans = await prisma.pelatihan.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: pelatihans,
    })
  } catch (error) {
    console.error("GET PELATIHAN ERROR:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data pelatihan",
      },
      { status: 500 }
    )
  }
}
=======
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.pelatihan.findMany({
      where: { status: true }, 
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('GET PELATIHAN ERROR:', error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
>>>>>>> d3f7bfd6aa7302cf46e820b001ae63b1159cd341
