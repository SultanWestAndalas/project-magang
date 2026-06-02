"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  
  // State Data Utama
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_posts: 0, total_categories: 0, total_users: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleId, setRoleId] = useState<string | null>(null);

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // State Input Form
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [categoryID, setCategoryID] = useState<number>(1);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  // Fungsi Gabungan: Ambil Artikel & Kategori
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") {
      router.push("/login");
      return;
    }

    try {
      // 1. Ambil Data Artikel
      const resPosts = await fetch("http://localhost:8080/api/posts", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataPosts = await resPosts.json();
      if (resPosts.ok) setPosts(dataPosts.data || []);

      // 2. Ambil Data Kategori
      const resCategories = await fetch("http://localhost:8080/api/categories", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataCategories = await resCategories.json();
      if (resCategories.ok) {
        setCategories(dataCategories.data || []);
        // Set default dropdown ke kategori pertama jika ada
        if (dataCategories.data && dataCategories.data.length > 0) {
          setCategoryID(dataCategories.data[0].ID);
        }
      }

      // 3. Ambil Data Statistik Dashboard
      const resStats = await fetch("http://localhost:8080/api/dashboard/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataStats = await resStats.json();
      if (resStats.ok) {
        setStats(dataStats.data || { total_posts: 0, total_categories: 0, total_users: 0 });
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Baca role_id saat halaman pertama kali dimuat
    setRoleId(localStorage.getItem("role_id"));
    fetchData();
  }, [router]);

  // Handler Form
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const resetForm = () => {
    setTitle(""); setSlug(""); setContent(""); setStatus("draft"); 
    if (categories.length > 0) setCategoryID(categories[0].ID);
    setIsEditing(false); setEditId(null); setIsModalOpen(false);
  };

  
  // Fungsi Submit (Tambah & Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitLoading(true);
    const token = localStorage.getItem("token");

    try {
      let response;

      if (isEditing) {
        // --- LOGIKA EDIT (Sementara tetap pakai JSON) ---
        response = await fetch(`http://localhost:8080/api/posts/${editId}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title, slug, content, status, category_id: Number(categoryID),
          }),
        });
      } else {
        // --- LOGIKA TAMBAH BARU (Pakai FormData untuk Gambar) ---
        const formData = new FormData();
        formData.append("title", title);
        formData.append("slug", slug);
        formData.append("content", content);
        formData.append("status", status);
        formData.append("category_id", String(categoryID));
        
        // Masukkan file gambar ke dalam bungkusan jika ada
        if (thumbnail) {
          formData.append("thumbnail", thumbnail);
        }

        response = await fetch("http://localhost:8080/api/posts", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            // PENTING: Jangan tulis "Content-Type" di sini. 
            // Browser akan otomatis menyetelnya menjadi multipart/form-data.
          },
          body: formData,
        });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan artikel");

      resetForm();
      fetchData();
      alert(isEditing ? "Artikel berhasil diperbarui!" : "Artikel berhasil ditambahkan!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setFormSubmitLoading(false);
    }
  };

  // Buka Modal Edit
  const openEditModal = (post: any) => {
    setTitle(post.Title); setSlug(post.Slug); setContent(post.Content);
    setStatus(post.Status); setCategoryID(post.CategoryID); setEditId(post.ID);
    setIsEditing(true); setIsModalOpen(true);
  };

  // Hapus Artikel
  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus artikel ini?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8080/api/posts/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal menghapus artikel");
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Tampilan Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090d16] text-blue-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg font-medium">Initializing rAi CMS...</span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-[#090d16] text-gray-200 font-sans overflow-hidden">
      
      {/* ORNAMEN BACKGROUND (Glow Nebula) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* SIDEBAR (Glassmorphism) */}
      <aside className="relative z-10 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            rAi CMS
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center space-x-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-3 rounded-xl transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path></svg>
            <span className="font-semibold">Artikel</span>
          </Link>
          <Link href="/categories" className="flex items-center space-x-3 text-gray-400 hover:bg-white/5 hover:text-gray-200 px-4 py-3 rounded-xl transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
            <span className="font-medium">Kategori</span>
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
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl transition duration-200"
          >
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header Atas */}
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-8 py-5 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-200">Manajemen Artikel</h1>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2 px-5 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] transition duration-200"
          >
            + Tulis Artikel
          </button>
        </header>

        {/* Tabel Data (Glassmorphism Box) */}
        <div className="p-8 flex-1 overflow-auto">

          {/* === WIDGET STATISTIK MULA === */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Widget 1: Artikel */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center space-x-5 shadow-lg hover:bg-white/10 transition duration-300">
              <div className="p-4 bg-blue-500/20 text-blue-400 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path></svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Total Artikel</p>
                <h3 className="text-3xl font-bold text-gray-100">{stats.total_posts}</h3>
              </div>
            </div>

            {/* Widget 2: Kategori */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center space-x-5 shadow-lg hover:bg-white/10 transition duration-300">
              <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Total Kategori</p>
                <h3 className="text-3xl font-bold text-gray-100">{stats.total_categories}</h3>
              </div>
            </div>

            {/* Widget 3: Pengguna (Eksklusif Superadmin) */}
            {roleId === "1" && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-center space-x-5 shadow-lg hover:bg-white/10 transition duration-300">
                <div className="p-4 bg-purple-500/20 text-purple-400 rounded-xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Pengguna Terdaftar</p>
                  <h3 className="text-3xl font-bold text-gray-100">{stats.total_users}</h3>
                </div>
              </div>
            )}
          </div>
          {/* === WIDGET STATISTIK SELESAI === */}
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {posts.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="text-lg">Belum ada artikel yang diterbitkan.</p>
              </div>
            ) : (
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/20 tracking-wider border-b border-white/10 text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">Judul Artikel</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Kategori (ID)</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Penulis</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {posts.map((post) => (
                    <tr key={post.ID} className="hover:bg-white/5 transition duration-150">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-200">{post.Title}</div>
                        <div className="text-xs text-gray-500">{post.Slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 inline-flex text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20">
                          {categories.find(cat => cat.ID === post.CategoryID)?.Name || `Cat ID: ${post.CategoryID}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 font-medium">
                        {post.Author?.username || "Anonim"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full border ${
                          post.Status === 'published' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {post.Status === 'published' ? 'Terbit' : 'Draf'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditModal(post)} className="text-indigo-400 hover:text-indigo-300 mr-4 font-medium transition">Edit</button>
                        <button onClick={() => handleDelete(post.ID)} className="text-red-400 hover:text-red-300 font-medium transition">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* MODAL FORM DARK GLASSMORPHISM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-gray-100">
                {isEditing ? "Edit Artikel" : "Tulis Artikel Baru"}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white transition text-xl">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Judul & Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Judul Artikel</label>
                <input 
                  type="text" required value={title} onChange={handleTitleChange} placeholder="Masukkan judul..."
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Slug</label>
                <input 
                  type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/5 text-gray-400 focus:outline-none"
                />
              </div>

              {/* Kategori & Status */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Kategori</label>
                  <select 
                    value={categoryID} onChange={(e) => setCategoryID(Number(e.target.value))} required
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {categories.length === 0 ? (
                      <option value="" disabled>Belum ada kategori</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.ID} value={cat.ID} className="bg-slate-800 text-white">{cat.Name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
                  <select 
                    value={status} onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="draft" className="bg-slate-800 text-white">Draf</option>
                    <option value="published" className="bg-slate-800 text-white">Terbit</option>
                  </select>
                </div>
              </div>

              {/* Input Upload Gambar (Tambahkan ini) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Gambar Thumbnail (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 transition"
                />
              </div>

              {/* Konten */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Konten Artikel</label>
                <textarea 
                  required rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Tuliskan isi artikel..."
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                ></textarea>
              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button 
                  type="button" onClick={resetForm} 
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" disabled={formSubmitLoading} 
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/30 transition disabled:opacity-50"
                >
                  {formSubmitLoading ? "Menyimpan..." : "Simpan Artikel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}