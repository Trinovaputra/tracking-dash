"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Pendaftaran {
  id: string;
  userId: string;
  user?: User;
}

interface Sertifikat {
  id: string;
  pendaftaranId: string;
  certificateUrl: string;
  issuedAt: string;
  createdAt: string;
  pendaftaran?: Pendaftaran;
}

export default function AdminSertifikatPage() {
  const router = useRouter(); // Inisialisasi router
  const [sertifikatList, setSertifikatList] = useState<Sertifikat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/sertifikat");
      if (!response.ok) throw new Error("Gagal mengambil data");
      const data = await response.json();
      setSertifikatList(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredData = sertifikatList.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    const userName = item.pendaftaran?.user?.name?.toLowerCase() || "";
    const userEmail = item.pendaftaran?.user?.email?.toLowerCase() || "";
    
    return (
      userName.includes(searchLower) ||
      userEmail.includes(searchLower) ||
      item.certificateUrl.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (id: string) => {
    // Menggunakan SweetAlert untuk konfirmasi Hapus
    const result = await Swal.fire({
      title: "Hapus Sertifikat?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) return;
    
    try {
      const response = await fetch(`/api/sertifikat/${id}`, { method: "DELETE" });
      if (response.ok) {
        setSertifikatList((prev) => prev.filter((item) => item.id !== id));
        Swal.fire("Terhapus!", "Sertifikat berhasil dihapus.", "success");
      } else {
        throw new Error("Gagal menghapus data");
      }
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Cari Nama Peserta, Email, atau URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Navigasi ke halaman create */}
        <button 
          onClick={() => router.push('/dashboard/admin/sertifikat/create')}
          className="w-full sm:w-auto bg-[#1a56db] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Sertifikat
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 pt-2 px-4 text-sm font-semibold text-gray-600">Nama Peserta</th>
              <th className="pb-4 pt-2 px-4 text-sm font-semibold text-gray-600">Tanggal Terbit</th>
              <th className="pb-4 pt-2 px-4 text-sm font-semibold text-gray-600 text-center">Status Link</th>
              <th className="pb-4 pt-2 px-4 text-sm font-semibold text-gray-600 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  Memuat data sertifikat...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  Tidak ada data sertifikat ditemukan.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">
                        {item.pendaftaran?.user?.name || "Nama tidak tersedia"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.pendaftaran?.user?.email || "Email tidak tersedia"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(item.issuedAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Tersedia
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <a href={item.certificateUrl} target="_blank" rel="noreferrer" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Lihat Sertifikat">
                        <Eye className="h-4 w-4" />
                      </a>
                      <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit Data">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus Data">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}