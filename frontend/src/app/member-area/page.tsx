"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MemberArea() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [realPosts, setRealPosts] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // 1. Proteksi Halaman: Cek token akses publik
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    // 2. Fetch Data Artikel Asli dari Backend Golang
    const fetchPublicPosts = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/public/posts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Gagal memuat konten edukasi");
        }

        // Simpan data artikel asli ke state
        setRealPosts(data.data || []);
      } catch (error: any) {
        console.error("Error fetching posts:", error);
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicPosts();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role_id");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-purple"></div>
        <p className="text-sm tracking-widest uppercase text-text-secondary animate-pulse">Memuat Dasbor Pembelajaran...</p>
      </div>
    );
  }

  // Mengambil 2 artikel terbaru untuk kolom "Terakhir Dibaca"
  const lastReadMock = realPosts.slice(0, 2);

  return (
    <main className="min-h-screen bg-[#050505] circuit-pattern relative overflow-hidden font-sans pb-20">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-accent-purple/10 to-transparent pointer-events-none" />
      
      {/* Navbar */}
      <nav className="relative z-20 px-6 py-6 max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white flex items-center gap-3">
          <img src="/logo-rai.png" alt="Logo" className="w-8 h-8 object-contain" />
          ResponsAIbility <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-accent-purple tracking-widest uppercase">Student</span>
        </Link>
        <button onClick={handleLogout} className="text-sm font-bold text-white/50 hover:text-red-400 transition-colors">
          Log out
        </button>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Selamat Datang, <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-magenta">Learner!</span>
          </h1>
          <p className="text-text-secondary text-lg">Lanjutkan perjalanan literasi AI Anda hari ini. Modul diambil langsung dari pustaka rAi.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm mb-6">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI & TENGAH: Modul Kurikulum (Dinamis dari Database) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Card Progress */}
            <div className="glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent-purple/20 rounded-full blur-3xl" />
              <div className="flex justify-between items-end mb-6 relative z-10">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] text-accent-purple uppercase mb-2">Progres Kelas</div>
                  <h2 className="text-2xl font-bold text-white">Kurikulum Edukasi Konten</h2>
                </div>
                <div className="text-3xl font-bold text-white">
                  {realPosts.length > 0 ? "33%" : "0%"}
                </div>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative z-10 mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-accent-purple to-accent-magenta rounded-full transition-all duration-1000"
                  style={{ width: realPosts.length > 0 ? "33%" : "0%" }}
                />
              </div>
              <p className="text-sm text-text-secondary">Tersedia {realPosts.length} materi literasi aktif di dalam database database rAi CMS.</p>
            </div>

            {/* List Materi Eksklusif */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-accent-purple rounded-full"></span> Materi Literasi Aktif (Live Data)
              </h3>
              
              <div className="flex flex-col gap-4">
                {realPosts.length === 0 ? (
                  <div className="glass p-8 rounded-2xl border border-white/5 text-center text-text-secondary">
                    Belum ada artikel publik yang diterbitkan oleh Admin di CMS.
                  </div>
                ) : (
                  realPosts.map((post: any, index: number) => (
                    <Link 
                      href={`/posts/${post.Slug}`} 
                      key={post.ID || index}
                      className="glass p-6 rounded-2xl flex items-center gap-6 border border-white/5 hover:border-accent-purple/40 hover:bg-white/[0.02] transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-accent-purple/10 text-accent-purple flex items-center justify-center text-sm font-bold shrink-0 group-hover:bg-accent-purple group-hover:text-white transition-colors">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-accent-magenta block mb-1">
                          {post.Category?.Name || "Artikel AI"}
                        </span>
                        <h4 className="text-white font-bold mb-1 group-hover:text-accent-purple transition-colors">
                          {post.Title}
                        </h4>
                        <p className="text-xs text-text-secondary line-clamp-1">
                          {post.Content ? post.Content.replace(/<[^>]*>/g, '') : ""}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">Pelajari &rarr;</span>
                    </Link>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* KOLOM KANAN: Gamifikasi & Riwayat */}
          <div className="flex flex-col gap-6">
            
            {/* Gamifikasi Card */}
            <div className="glass p-8 rounded-[32px] border border-white/5 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-accent-purple rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg shadow-purple-500/20">
                🎯
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Pahlawan SDG 4</h3>
              <p className="text-xs text-text-secondary leading-relaxed">Akun Anda dikonfigurasi untuk mendukung pilar pendidikan digital inklusif.</p>
            </div>

            {/* Rekomendasi / Terakhir Dilihat */}
            <div className="glass p-8 rounded-[32px] border border-white/5 flex-grow">
              <h3 className="text-white font-bold text-lg mb-6">
                Sorotan Materi
              </h3>
              
              <div className="flex flex-col gap-5">
                {lastReadMock.length === 0 ? (
                  <p className="text-xs text-text-secondary">Tidak ada sorotan berkas saat ini.</p>
                ) : (
                  lastReadMock.map((item: any, idx: number) => (
                    <Link href={`/posts/${item.Slug}`} key={idx} className="group block">
                      <h4 className="text-sm font-bold text-white/80 group-hover:text-accent-purple transition-colors line-clamp-2 leading-snug">
                        {item.Title}
                      </h4>
                      <span className="text-[10px] text-text-secondary mt-1 block">Rekomendasi Utama</span>
                    </Link>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}