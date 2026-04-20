import { z } from "zod";

export const metodeEnum = z.enum(["ONLINE", "OFFLINE"]);

// Validasi untuk URL atau base64 data URL
const urlOrDataUrl = z.union([
  z.string().min(1).refine(
    (value) => {
      // Accept standard URLs
      if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('ftp://')) {
        return true;
      }
      // Accept base64 data URLs
      if (value.startsWith('data:')) {
        return true;
      }
      return false;
    },
    { message: "File harus berupa URL atau data URL" }
  ),
  z.string().length(0), // Allow empty string (untuk handling file input kosong)
]);

export const pendaftaranSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),

  email: z
    .string()
    .email("Format email tidak valid"),

  noTelp: z.string().min(1, "No telp wajib diisi"),

  pekerjaan: z.string().min(1, "Pekerjaan wajib diisi"),

  instansi: z.string().min(1, "Instansi wajib diisi"),

  pelatihanId: z.string().min(1, "Pelatihan wajib dipilih"),

  metode: metodeEnum,

  fotoKtp: urlOrDataUrl,

  ijazah: urlOrDataUrl,

  pasFoto: urlOrDataUrl,

  suratKerja: urlOrDataUrl.optional(),

  buktiTransfer: urlOrDataUrl,

  userId: z.string().min(1, "User ID wajib diisi").optional(),

  jadwalId: z.string().min(1, "Jadwal ID wajib diisi").optional(),
});

export type PendaftaranInput = z.infer<typeof pendaftaranSchema>;