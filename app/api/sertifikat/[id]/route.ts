import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildCertificatePDF } from "@/lib/generateSertifikat"; // Import lib
import fs from "fs";
import path from "path";

type RouteParams = { params: Promise<{ id: string }> };

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const sertifikat = await prisma.sertifikat.findUnique({
      where: { id },
      // Tetap include user untuk fallback/jaga-jaga jika namaLengkap kosong
      include: { pendaftaran: { include: { user: true } } }, 
    });

    if (!sertifikat) return NextResponse.json({ error: "Sertifikat tidak ditemukan" }, { status: 404 });
    return NextResponse.json(sertifikat, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // namaPeserta dari form edit akan kita simpan sebagai namaLengkap
    const { namaPeserta, status, issuedAt } = body;

    const existingSertifikat = await prisma.sertifikat.findUnique({
      where: { id },
      include: {
        pendaftaran: { include: { user: true, jadwal: { include: { pelatihan: true } } } }
      }
    });

    if (!existingSertifikat) return NextResponse.json({ error: "Sertifikat tidak ditemukan" }, { status: 404 });

    // --- PERUBAHAN: Update namaLengkap & status di tabel Pendaftaran ---
    if (existingSertifikat.pendaftaranId) {
      // Kita gabungkan update agar database tidak kerja dua kali
      const updateData: any = {};
      if (namaPeserta) updateData.namaLengkap = namaPeserta; 
      if (status) updateData.status = status;

      if (Object.keys(updateData).length > 0) {
        await prisma.pendaftaran.update({
          where: { id: existingSertifikat.pendaftaranId },
          data: updateData
        });
      }

      // Opsional: Jika kamu juga ingin mengupdate nama di tabel User, buka komentar di bawah ini
      if (namaPeserta && existingSertifikat.pendaftaran?.userId) {
        await prisma.user.update({
          where: { id: existingSertifikat.pendaftaran.userId }, 
          data: { name: namaPeserta }
        });
      }
    }

    // Cabut sertifikat jika status diubah menjadi TIDAK LULUS (atau lainnya)
    if (status && status !== "LULUS") {
      if (existingSertifikat.certificateUrl) {
        const oldFilePath = path.join(process.cwd(), "public", existingSertifikat.certificateUrl);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      await prisma.sertifikat.delete({ where: { id } });
      return NextResponse.json({ message: "Status tidak lulus, sertifikat dicabut." }, { status: 200 });
    }

    // --- PERUBAHAN: Prioritaskan namaLengkap dari Pendaftaran ---
    const finalName = 
      namaPeserta || // 1. Ambil dari inputan form edit (jika ada)
      existingSertifikat.pendaftaran?.namaLengkap || // 2. Ambil dari namaLengkap di DB Pendaftaran
      existingSertifikat.pendaftaran?.user?.name || // 3. Fallback ke nama User jika namaLengkap kosong
      "Nama Tidak Diketahui";
      
    const pelatihanName = existingSertifikat.pendaftaran?.jadwal?.pelatihan?.name || "Pelatihan";
    const lokasi = existingSertifikat.pendaftaran?.jadwal?.location || "Feducation Jakarta";
    const finalIssuedAt = issuedAt ? new Date(issuedAt) : existingSertifikat.issuedAt;

    const urutPendaftar = await prisma.pendaftaran.count({ 
        where: { createdAt: { lte: existingSertifikat.pendaftaran?.createdAt || new Date() } } 
    });

    // Generate PDF baru menggunakan Lib dengan nama yang sudah benar
    const newCertificateUrl = await buildCertificatePDF({
      userName: finalName,
      pelatihanName,
      lokasi,
      tanggalTerbit: finalIssuedAt,
      urutPendaftar
    });

    // Hapus file PDF lama untuk hemat storage server
    if (existingSertifikat.certificateUrl) {
      const oldFilePath = path.join(process.cwd(), "public", existingSertifikat.certificateUrl);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath); 
    }

    // Update URL dan Tanggal Terbit di tabel Sertifikat
    const updatedSertifikat = await prisma.sertifikat.update({
      where: { id },
      data: { certificateUrl: newCertificateUrl, issuedAt: finalIssuedAt },
    });

    return NextResponse.json(updatedSertifikat, { status: 200 });
  } catch (error) {
    console.error("Error updating sertifikat:", error);
    return NextResponse.json({ error: "Gagal memproses data" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const sertifikat = await prisma.sertifikat.findUnique({ where: { id } });
    if (sertifikat && sertifikat.certificateUrl) {
      const filePath = path.join(process.cwd(), "public", sertifikat.certificateUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.sertifikat.delete({ where: { id } });
    return NextResponse.json({ message: "Berhasil dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}