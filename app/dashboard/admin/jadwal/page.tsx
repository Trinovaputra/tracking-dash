'use client';

import { useEffect, useState } from 'react';

type Jadwal = {
  id: string;
  date: string;
  location: string;
  pelatihanId: string;
};

export default function AdminJadwalPage() {
  const [data, setData] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [pelatihanList, setPelatihanList] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    id: '',
    date: '',
    location: '',
    pelatihanId: '',
  });

  // FETCH 
  const fetchData = async () => {
    const res = await fetch('/api/jadwal');
    const json = await res.json();

    if (json.success) {
      setData(json.data);
    }
    setLoading(false);
  };
  const fetchPelatihan = async () => {
  try {
    const res = await fetch('/api/pelatihan');
    const json = await res.json();

    if (json.success) {
      setPelatihanList(json.data);
    }
  } catch (error) {
    console.error('FETCH PELATIHAN ERROR:', error);
  }
};
  useEffect(() => {
  fetchData();
  fetchPelatihan();
}, []);

  
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // TAMBAH 
  const handleAdd = async () => {
  const payload = {
    ...form,
    date: new Date(form.date).toISOString(), 
  };

  const res = await fetch('/api/jadwal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  console.log('ADD RESULT:', result);

  if (!result.success) {
    alert(result.message);
    return;
  }

  setShowModal(false);
  fetchData();
};

  // EDIT 
  const handleEdit = (item: Jadwal) => {
    setIsEdit(true);
    setShowModal(true);
    setForm(item);
  };

  const handleUpdate = async () => {
  const payload = {
    ...form,
    date: new Date(form.date).toISOString(),
  };

  const res = await fetch(`/api/jadwal/${form.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  console.log('UPDATE RESULT:', result);

  if (!result.success) {
    alert(result.message);
    return;
  }

  setShowModal(false);
  setIsEdit(false);
  fetchData();
};

  // DELETE 
  const handleDelete = async (id: string) => {
  const confirmDelete = confirm('Yakin mau hapus?');
  if (!confirmDelete) return;

  const res = await fetch(`/api/jadwal/${id}`, {
    method: 'DELETE',
  });

  const result = await res.json();
  console.log('DELETE RESULT:', result);

  if (!result.success) {
    alert(result.message);
    return;
  }

  fetchData();
};

  
  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Data Jadwal</h2>

        <button
          onClick={() => {
            setShowModal(true);
            setIsEdit(false);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Tambah
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Tanggal</th>
            <th className="border p-2">Lokasi</th>
            <th className="border p-2">Pelatihan</th>
            <th className="border p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">
                {new Date(item.date).toLocaleDateString()}
              </td>
              <td className="border p-2">{item.location}</td>
              <td className="border p-2">{item.pelatihanId}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-bold mb-4">
              {isEdit ? 'Edit Jadwal' : 'Tambah Jadwal'}
            </h3>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border p-2 mb-2"
            />

            <input
              type="text"
              name="location"
              placeholder="Lokasi"
              value={form.location}
              onChange={handleChange}
              className="w-full border p-2 mb-2"
            />

           <select
  name="pelatihanId"
  value={form.pelatihanId}
  onChange={handleChange}
  className="w-full border p-2 mb-4"
>
  <option value="">Pilih Pelatihan</option>
  {pelatihanList.map((p: any) => (
    <option key={p.id} value={p.id}>
      {p.title}
    </option>
  ))}
</select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded"
              >
                Batal
              </button>

              <button
                onClick={isEdit ? handleUpdate : handleAdd}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                {isEdit ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}