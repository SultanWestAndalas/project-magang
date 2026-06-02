"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: {
    name: string;
  };
}

export default function UsersPage() {
  const router = useRouter();
  const [roleId, setRoleId] = useState<string | null>(null);
  
  // State Data
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State Modal & Form Tambah Akun
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<number>(3); // Default ke Penulis (ID: 3 atau sesuaikan)

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Fetch Users
      const resUsers = await fetch("http://localhost:8080/api/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataUsers = await resUsers.json();
      if (resUsers.ok) setUsers(dataUsers.data || []);

      // Fetch Roles (Untuk pilihan di dropdown tambah akun)
      const resRoles = await fetch("http://localhost:8080/api/roles", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const dataRoles = await resRoles.json();
      if (resRoles.ok) {
        setRoles(dataRoles.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentRoleId = localStorage.getItem("role_id");

    if (!token) {
      router.push("/login");
      return;
    }

    if (currentRoleId !== "1") {
      router.push("/dashboard");
      return;
    }

    setRoleId(currentRoleId);
    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role_id");
    router.push("/login");
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    if (roles.length > 0) setSelectedRoleId(roles[0].id);
    setIsModalOpen(false);
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role_id: Number(selectedRoleId)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mendaftarkan akun baru");
      }

      alert("Akun berhasil didaftarkan!");
      resetForm();
      fetchData(); // Refresh tabel pengguna
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Fungsi untuk menghapus pengguna
  const handleDeleteUser = async (id: number, username: string) => {
    // Meminta konfirmasi admin agar tidak tidak sengaja terhapus
    if (!window.confirm(`Peringatan: Yakin ingin menghapus akun "${username}"?`)) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghapus pengguna");
      }

      // Refresh tabel setelah berhasil dihapus
      fetchData(); 
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090d16] text-blue-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg font-medium">Memuat Data Pengguna...</span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-[#090d16] text-gray-200 font-sans overflow-hidden">
      
      {/* ORNAMEN BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* SIDEBAR */}
      <aside className="relative z-10 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            rAi CMS
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center space-x-3 text-gray-400 hover:bg-white/5 hover:text-gray-200 px-4 py-3 rounded-xl transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path></svg>
            <span className="font-medium">Artikel</span>
          </Link>
          <Link href="/categories" className="flex items-center space-x-3 text-gray-400 hover:bg-white/5 hover:text-gray-200 px-4 py-3 rounded-xl transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
            <span className="font-medium">Kategori</span>
          </Link>

          {roleId === "1" && (
            <Link href="/users" className="flex items-center space-x-3 bg-purple-600/20 text-purple-400 border border-purple-500/30 px-4 py-3 rounded-xl transition mt-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <span className="font-semibold">Pengguna</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl transition duration-200">
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-8 py-5 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-200">Manajemen Pengguna</h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2 px-5 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.5)] transition duration-200">
            + Tambah Akun
          </button>
        </header>

        <div className="p-8 flex-1 overflow-auto">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6">{error}</div>}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-black/20 tracking-wider border-b border-white/10 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Username</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Jabatan (Role)</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition duration-150">
                    <td className="px-6 py-4 font-semibold text-gray-200">{user.username}</td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.role?.name === "Superadmin" 
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {user.role?.name || "Belum ada jabatan"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Sembunyikan tombol hapus untuk akun milik kita sendiri agar tidak bunuh diri/terhapus tak sengaja */}
                      {user.role?.name === "Superadmin" ? (
                        <span className="text-gray-500 text-xs italic">Dilindungi</span>
                      ) : (
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.username)} 
                          className="text-red-400 hover:text-red-300 font-medium transition"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL TAMBAH AKUN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-gray-100">Daftarkan Akun Baru</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white transition text-xl">✕</button>
            </div>
            
            <form onSubmit={handleRegisterUser} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan username..."
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@rai.com"
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Jabatan (Role)</label>
                <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(Number(e.target.value))} required
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                  {roles.map((r) => (
                    <option key={r.id} value={r.id} className="bg-slate-800 text-white">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition">Batal</button>
                <button type="submit" disabled={formLoading} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-900/30 transition disabled:opacity-50">
                  {formLoading ? "Menyimpan..." : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}   