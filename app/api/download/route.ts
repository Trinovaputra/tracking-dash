import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Tangkap URL file yang dikirim dari frontend (Sekarang bentuknya https://utfs.io/...)
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("file");

  if (!fileUrl) {
    return new NextResponse("URL file tidak diberikan", { status: 400 });
  }

  try {
    // 1. Ambil (fetch) file langsung dari server UploadThing
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error("Gagal mengambil file dari server penyimpanan luar");
    }

    // 2. Ubah file yang didapat menjadi format data biner (ArrayBuffer)
    const arrayBuffer = await response.arrayBuffer();

    // 3. Ambil nama file asli dari URL (misal: xyz123.pdf) atau gunakan nama default
    const fileName = fileUrl.split("/").pop() || "Sertifikat_Pelatihan.pdf";

    // 4. Paksa browser untuk mendownload file ini menggunakan header Content-Disposition
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    // Jika fetch gagal atau error lainnya
    return new NextResponse("File PDF sedang diproses atau tidak ditemukan di server cloud", { status: 404 });
  }
}
