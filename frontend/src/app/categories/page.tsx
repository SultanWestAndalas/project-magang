"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [roleId, setRoleId] = useState<string | null>(null);

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const res = await fetch("http://localhost:8080/api/categories", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCategories(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ambil role_id dari localStorage
    const savedRoleId = localStorage.getItem("role_id");
    setRoleId(savedRoleId);

    fetchCategories();
  }, [router]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const resetForm = () => {
    setName(""); setSlug(""); setIsEditing(false); setEditId(null); setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitLoading(true);
    const token = localStorage.getItem("token");
    const url = isEditing ? `http://localhost:8080/api/categories/${editId}` : "http://localhost:8080/api/categories";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan kategori");
      resetForm();
      fetchCategories();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const openEditModal = (cat: any) => {
    setName(cat.Name); setSlug(cat.Slug); setEditId(cat.ID);
    setIsEditing(true); setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus kategori ini?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:8080/api/categories/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` },
      });
      fetchCategories();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#090d16] text-blue-400"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="relative flex min-h-screen bg-[#090d16] text-gray-200 font-sans overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <aside className="relative z-10 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">rAi CMS</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center space-x-3 text-gray-400 hover:bg-white/5 hover:text-gray-200 px-4 py-3 rounded-xl transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path></svg>
            <span className="font-medium">Artikel</span>
          </Link>
          <Link href="/categories" className="flex items-center space-x-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-3 rounded-xl transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
            <span className="font-semibold">Kategori</span>
          </Link>
          {/* MENU KHUSUS SUPER ADMIN */}
          {roleId === "1" && (
            <Link href="/users" className="flex items-center space-x-3 text-purple-400 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 px-4 py-3 rounded-xl transition mt-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <span className="font-medium">Pengguna</span>
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { localStorage.removeItem("token"); router.push("/login"); }} className="w-full flex items-center justify-center space-x-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl transition duration-200">
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-8 py-5 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-200">Manajemen Kategori</h1>
          {roleId === "1" && (
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2 px-5 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] transition duration-200">
            + Tambah Kategori
          </button>
          )}
        </header>

        <div className="p-8 flex-1 overflow-auto">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6">{error}</div>}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/20 tracking-wider border-b border-white/10 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama Kategori</th>
                  <th className="px-6 py-4 font-semibold">Slug</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((cat) => (
                  <tr key={cat.ID} className="hover:bg-white/5 transition duration-150">
                    <td className="px-6 py-4 font-semibold text-gray-200">{cat.Name}</td>
                    <td className="px-6 py-4 text-gray-500">{cat.Slug}</td>
                    <td className="px-6 py-4 text-right">
                      {/* Tampilkan tombol aksi HANYA jika roleId adalah 1 (Super Admin) */}
                      {roleId === "1" ? (
                        <>
                          <button onClick={() => openEditModal(cat)} className="text-indigo-400 hover:text-indigo-300 mr-4 font-medium transition">Edit</button>
                          <button onClick={() => handleDelete(cat.ID)} className="text-red-400 hover:text-red-300 font-medium transition">Hapus</button>
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs italic">Hanya Baca</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-gray-100">{isEditing ? "Edit Kategori" : "Tambah Kategori"}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white transition text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nama Kategori</label>
                <input type="text" required value={name} onChange={handleNameChange} placeholder="Misal: Teknologi" className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Slug</label>
                <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/5 text-gray-400 focus:outline-none" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition">Batal</button>
                <button type="submit" disabled={formSubmitLoading} className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50">
                  {formSubmitLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}