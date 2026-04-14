"use client";

import { useState } from "react";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function CreateSertifikatPage() {
  const router = useRouter(); // Gunakan router untuk navigasi
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pendaftaranId: "",
    certificateUrl: "",
    issuedAt: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/sertifikat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menyimpan data");
      }

      await Swal.fire({
        title: "Berhasil!",
        text: "Data sertifikat berhasil ditambahkan.",
        icon: "success",
        confirmButtonColor: "#1a56db",
      });

      // Redirect kembali ke halaman tabel & refresh data Next.js
      router.push("/dashboard/admin/sertifikat");
      router.refresh(); 

    } catch (error: any) {
      Swal.fire({
        title: "Terjadi Kesalahan",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Halaman */}
      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Tambah Sertifikat</h2>
          <p className="text-sm text-gray-500 mt-1">Masukkan detail sertifikat peserta di bawah ini.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin/sertifikat")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID Pendaftaran <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="pendaftaranId"
            required
            value={formData.pendaftaranId}
            onChange={handleChange}
            placeholder="Masukkan ID Pendaftaran..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Dokumen Sertifikat <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            name="certificateUrl"
            required
            value={formData.certificateUrl}
            onChange={handleChange}
            placeholder="https://example.com/sertifikat.pdf"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Terbit
          </label>
          <input
            type="date"
            name="issuedAt"
            value={formData.issuedAt}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/sertifikat")}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#1a56db] hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Simpan Data
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}