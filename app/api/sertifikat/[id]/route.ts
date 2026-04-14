import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

// Helper type untuk params Next.js App Router
type RouteParams = { params: Promise<{ id: string }> };

// GET: Mengambil satu sertifikat berdasarkan ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const sertifikat = await prisma.sertifikat.findUnique({
      where: { id },
      include: { pendaftaran: true },
    });

    if (!sertifikat) {
      return NextResponse.json({ error: "Sertifikat tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(sertifikat, { status: 200 });
  } catch (error) {
    console.error("Error GET by ID:", error); 
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

// PATCH: Mengupdate data sertifikat (menggunakan PATCH karena update parsial)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { certificateUrl, issuedAt } = body;

    const updatedSertifikat = await prisma.sertifikat.update({
      where: { id },
      data: {
        ...(certificateUrl && { certificateUrl }),
        ...(issuedAt && { issuedAt: new Date(issuedAt) }),
      },
    });

    return NextResponse.json(updatedSertifikat, { status: 200 });
  } catch (error) {
    console.error("Error updating sertifikat:", error);
    return NextResponse.json({ error: "Gagal mengupdate data atau data tidak ditemukan" }, { status: 500 });
  }
}

// DELETE: Menghapus data sertifikat
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.sertifikat.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Sertifikat berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting sertifikat:", error);
    return NextResponse.json({ error: "Gagal menghapus data atau data tidak ditemukan" }, { status: 500 });
  }
}