import { z } from "zod";

export const metodeEnum = z.enum(["ONLINE", "OFFLINE"]);

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

  fotoKtp: z.string().url("Foto KTP harus berupa URL"),

  ijazah: z.string().url("Ijazah harus berupa URL"),

  pasFoto: z.string().url("Pas foto harus berupa URL"),

  suratKerja: z
    .string()
    .url("Surat kerja harus berupa URL")
    .optional(),

  buktiTransfer: z.string().url("Bukti transfer harus berupa URL"),
});

export type PendaftaranInput = z.infer<typeof pendaftaranSchema>;