import { z } from "zod";

export const pelatihanSchema = z.object({
  name: z.string().min(1, "Nama pelatihan wajib diisi"),
  description: z.string().optional(),
  image: z.string().optional(),
  status: z.boolean().default(true),
});

// 🔥 TYPE UNTUK FORM
export type PelatihanFormInput = {
  name: string;
  description?: string | null;
  image?: string | null;
  status: boolean; // Pastikan ini murni boolean, bukan optional
};

// 🔥 TYPE UNTUK DATABASE
export type PelatihanInput = z.infer<typeof pelatihanSchema>;
