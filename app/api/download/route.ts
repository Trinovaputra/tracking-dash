import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("file");

  if (!fileUrl) {
    return new NextResponse("URL file tidak diberikan", { status: 400 });
  }

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error("Gagal mengambil file dari server penyimpanan luar");
    }

    const arrayBuffer = await response.arrayBuffer();

    // PERBAIKAN DI SINI
    let fileName = fileUrl.split("/").pop();
    if (!fileName || !fileName.includes(".")) {
      fileName = "Sertifikat_Pelatihan.pdf";
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("File PDF sedang diproses atau tidak ditemukan di server cloud", { status: 404 });
  }
}
