import { pool } from '@/lib/db';
import { randomUUID } from 'crypto';
import { prisma } from "@/lib/prisma";
import { pendaftaranSchema, type PendaftaranInput } from "@/server/pendaftaran.schema";

export const dynamic = 'force-dynamic';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan server';
}

export async function GET() {
  try {
    const result = await prisma.pendaftaran.findMany({
      include: {
        user: true,           
        jadwal: {
          include: {
            pelatihan: true,  
          },
        },
        sertifikats: true,     
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('GET ERROR:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Handle two types of POST requests:
    // 1. From form (via createPendaftaran Server Action) - sudah dihandle di server/pendaftaran.ts
    // 2. Direct API calls (legacy) - userId, jadwalId, documentUrl
    
    const { userId, jadwalId, documentUrl, status = 'MENUNGGU', ...otherFields } = body;

    // Jika ada userId dan jadwalId (legacy format)
    if (userId && jadwalId) {
      if (!documentUrl) {
        return Response.json(
          { success: false, message: 'documentUrl wajib diisi untuk format ini' },
          { status: 400 }
        );
      }

      const id = randomUUID();
      const result = await pool.query(
        `INSERT INTO "Pendaftaran"
          ("id", "userId", "jadwalId", "documentUrl", status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [id, String(userId), String(jadwalId), documentUrl, status]
      );

      return Response.json({ 
        success: true, 
        data: result.rows[0],
        message: 'Pendaftaran berhasil dibuat via API'
      });
    }

    // Jika ada field lain, gunakan format dari form (validate dengan schema)
    const validatedData = pendaftaranSchema.parse(body);
    
    // Cek duplikat
    const existing = await prisma.pendaftaran.findFirst({
      where: {
        email: validatedData.email,
        pelatihanId: validatedData.pelatihanId,
      },
    });

    if (existing) {
      return Response.json(
        { success: false, message: 'Anda sudah mendaftar untuk pelatihan ini' },
        { status: 400 }
      );
    }

    // Create via Prisma
    const pendaftaran = await prisma.pendaftaran.create({
      data: {
        namaLengkap: validatedData.namaLengkap,
        email: validatedData.email,
        noTelp: validatedData.noTelp,
        pekerjaan: validatedData.pekerjaan,
        instansi: validatedData.instansi,
        metode: validatedData.metode,
        pelatihanId: validatedData.pelatihanId,
        fotoKtp: otherFields.fotoKtp || validatedData.fotoKtp,
        ijazah: otherFields.ijazah || validatedData.ijazah,
        pasFoto: otherFields.pasFoto || validatedData.pasFoto,
        buktiTransfer: otherFields.buktiTransfer || validatedData.buktiTransfer,
        suratKerja: otherFields.suratKerja || validatedData.suratKerja,
        userId: validatedData.userId,
        jadwalId: validatedData.jadwalId,
      },
      include: {
        pelatihan: true,
      },
    });

    return Response.json({ 
      success: true, 
      data: pendaftaran,
      message: 'Pendaftaran berhasil dibuat via API'
    });
  } catch (error: any) {
    console.error('POST ERROR:', error);
    return Response.json(
      { success: false, message: error.message || 'Gagal membuat pendaftaran' },
      { status: 500 }
    );
  }
}

// TAMBAHAN: Method PATCH untuk Update Status dari Dropdown
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json(
        { success: false, message: 'ID dan Status wajib diisi' },
        { status: 400 }
      );
    }

    const updatedData = await prisma.pendaftaran.update({
      where: { id: id },
      data: { status: status },
    });

    return Response.json({
      success: true,
      data: updatedData,
      message: 'Status berhasil diperbarui'
    });
  } catch (error: any) {
    console.error('PATCH ERROR:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
