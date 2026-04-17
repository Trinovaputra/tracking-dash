import { pool } from '@/lib/db';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan server';
}

export async function GET(
<<<<<<< HEAD
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const result = await pool.query(
    `SELECT * FROM "Jadwal" WHERE id = $1`,
    [id]
  );

  return Response.json({
  success: true,
  data: result.rows[0],
});
}

//put
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
=======
  req: Request,
  { params }: { params: Promise<{ id: string }> }
>>>>>>> d3f7bfd6aa7302cf46e820b001ae63b1159cd341
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
<<<<<<< HEAD
  } catch (error) {
    return Response.json({ success: false, message: getErrorMessage(error) });
=======

  } catch (error: any) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

//put
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json({
        success: false,
        message: 'ID tidak dikirim',
      });
    }

    const body = await req.json();
    const { date, location, pelatihanId, status } = body;

    const result = await pool.query(
      `UPDATE "Jadwal"
       SET "date" = $1,
           "location" = $2,
           "pelatihanId" = $3,
           "status" = $4,
           "updatedAt" = NOW()
       WHERE "id" = $5
       RETURNING *`,
      [date, location, String(pelatihanId), status, id]
    );

    if (result.rowCount === 0) {
      return Response.json({
        success: false,
        message: 'Data tidak ditemukan',
      });
    }

    return Response.json({
      success: true,
      data: result.rows[0],
    });

  } catch (error: any) {
    console.error('UPDATE ERROR:', error);

    return Response.json({
      success: false,
      message: error.message,
    });
>>>>>>> d3f7bfd6aa7302cf46e820b001ae63b1159cd341
  }
}

//delete
export async function DELETE(
<<<<<<< HEAD
  _req: Request,
  { params }: { params: { id: string } }
=======
  req: Request,
  { params }: { params: Promise<{ id: string }> }
>>>>>>> d3f7bfd6aa7302cf46e820b001ae63b1159cd341
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
