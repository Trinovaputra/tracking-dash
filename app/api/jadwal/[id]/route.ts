import { pool } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const result = await pool.query(
    `SELECT * FROM "Jadwal" WHERE id = $1`,
    [id]
  );

  return Response.json(result.rows[0]);
}

//put
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { date, location, pelatihanId } = body;

    const result = await pool.query(
      `UPDATE "Jadwal"
       SET "date" = $1,
           "location" = $2,
           "pelatihanId" = $3,
           "updatedAt" = NOW()
       WHERE id = $4
       RETURNING *`,
      [date, location, String(pelatihanId), params.id]
    );

    return Response.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message });
  }
}

//delete
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await pool.query(`DELETE FROM "Jadwal" WHERE id = $1`, [params.id]);

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message });
  }
}