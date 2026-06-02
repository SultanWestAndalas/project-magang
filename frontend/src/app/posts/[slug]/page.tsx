"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchPostDetail = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/public/posts/${slug}`);
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.error || "Gagal memuat artikel");
        setPost(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090d16] text-blue-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg font-medium">Memuat artikel...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090d16] text-gray-300 p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center max-w-md">
          <p className="text-red-400 font-medium mb-4">⚠️ {error || "Artikel tidak ditemukan"}</p>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-xl transition">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#090d16] text-gray-200 font-sans overflow-x-hidden">
      {/* ORNAMEN BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* NAVBAR / BACK BUTTON */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 pt-8 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition group">
          <span>←</span> <span className="group-hover:translate-x-1 transition-transform">Kembali ke Beranda</span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
          rAi Content
        </span>
      </header>

      {/* AREA UTAMA ARTIKEL */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Judul & Metadata */}
        <div className="mb-8">
          <div className="text-xs font-bold text-purple-400 tracking-wider uppercase mb-3">
            {new Date(post.CreatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            {post.Title}
          </h1>
          
          {/* Penulis info */}
          <div className="flex items-center space-x-3 border-y border-white/5 py-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs text-white font-bold">
              {post.Author?.username ? post.Author.username.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <p className="text-xs text-gray-400">Ditulis oleh</p>
              <p className="text-sm font-semibold text-gray-200">{post.Author?.username || "Anonim"}</p>
            </div>
          </div>
        </div>

        {/* Gambar Utama (Jika ada) */}
        {post.Thumbnail && (
          <div className="w-full h-[250px] sm:h-[400px] rounded-3xl overflow-hidden mb-10 border border-white/10 shadow-2xl">
            <img 
              src={`http://localhost:8080${post.Thumbnail}`} 
              alt={post.Title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Isi Artikel */}
        <article className="text-gray-300 leading-relaxed text-base sm:text-lg whitespace-pre-wrap space-y-6">
          {post.Content}
        </article>
      </main>
    </div>
  );
}