import { pool } from '@/lib/db';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan server';
}

type RouteParams = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT * FROM "Jadwal" WHERE "id" = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { success: false, message: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

//put
export async function PUT(req: Request, context: RouteParams) {
  try {
    // Catatan: Jika menggunakan Next.js 15+, params harus di-await: 
    // const { id } = await params;
    const resolvedParams = await context.params; 
    const id = resolvedParams.id;

    console.log('ID Diterima di Backend:', id); // Cek apakah ID masuk

    if (!id || id === 'undefined') {
      return Response.json({ success: false, message: 'ID tidak valid' }, { status: 400 });
    }

    const body = await req.json();
    // Tambahkan 'metode' di sini
    const { date, location, pelatihanId, metode, status } = body;

    const result = await pool.query(
      `UPDATE "Jadwal"
       SET "date" = $1,
           "location" = $2,
           "pelatihanId" = $3,
           "status" = $4,
           "metode" = $5, 
           "updatedAt" = NOW()
       WHERE "id" = $6
       RETURNING *`,
       // Pastikan urutan array ini sama persis dengan urutan $1 sampai $6 di atas
      [date, location, String(pelatihanId), status, metode, id] 
    );

    if (result.rowCount === 0) {
      return Response.json({ success: false, message: 'Data tidak ditemukan' }, { status: 404 });
    }

    return Response.json({ success: true, data: result.rows[0] });

  } catch (error: any) {
    console.error('UPDATE ERROR:', error);

    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

//delete
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `DELETE FROM "Jadwal" WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return Response.json({
        success: false,
        message: 'Data tidak ditemukan',
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, message: getErrorMessage(error) });
  }
}
