import { utapi } from "@/lib/uploadthing";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ success: false, message: "File tidak ditemukan" });
    }

    // Langsung lempar file yang ditangkap ke UploadThing
    const uploadResponse = await utapi.uploadFiles(file);

    if (uploadResponse.error) {
      throw new Error(uploadResponse.error.message);
    }

    return Response.json({
      success: true,
      url: uploadResponse.data.url, // Mengembalikan link permanen https://utfs.io/...
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return Response.json({ success: false, message: "Upload gagal" }, { status: 500 });
  }
}
