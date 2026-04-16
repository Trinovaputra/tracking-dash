import { z } from "zod";

export const pelatihanSchema = z.object({
  name: z.string().min(1, "Nama pelatihan wajib diisi"),
  description: z.string().optional(),
  image: z.string().optional(),
  tanggal: z.coerce.date(),
  status: z.boolean().default(true),
});

// 🔥 TYPE UNTUK FORM
export type PelatihanFormInput = z.input<typeof pelatihanSchema>;

// 🔥 TYPE UNTUK DATABASE
export type PelatihanInput = z.output<typeof pelatihanSchema>;
