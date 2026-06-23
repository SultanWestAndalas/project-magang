"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
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

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#090d16] text-blue-400"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  if (error || !post) return <div className="flex justify-center min-h-screen bg-[#090d16] p-8 text-red-400">⚠️ {error}</div>;

  return (
    <div className="relative min-h-screen bg-[#090d16] text-gray-200 font-sans overflow-x-hidden pb-20">
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      <header className="relative z-10 max-w-4xl mx-auto px-6 pt-8 flex justify-between items-center">
        <Link href="/member-area" className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition group">
          <span>←</span> <span className="group-hover:translate-x-1 transition-transform">Kembali ke Dasbor</span>
        </Link>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">{post.Title}</h1>
        
        {post.Thumbnail && (
          <div className="w-full h-[250px] sm:h-[400px] rounded-3xl overflow-hidden mb-10 border border-white/10 shadow-2xl">
            <img src={`http://localhost:8080${post.Thumbnail}`} alt={post.Title} className="w-full h-full object-cover" />
          </div>
        )}

        <article className="text-gray-300 leading-relaxed text-base sm:text-lg whitespace-pre-wrap space-y-6">
          {post.Content}
        </article>

        {/* ================================================== */}
        {/* TOMBOL PINDAH KE MENU KUIS */}
        {/* ================================================== */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <div className="bg-blue-900/10 p-8 rounded-3xl border border-blue-500/20">
            <h3 className="text-2xl font-bold text-white mb-2">Sudah Paham Materi Ini?</h3>
            <p className="text-gray-400 mb-6">Buktikan pemahamanmu di menu kuis dan dapatkan +50 XP!</p>
            <Link 
              href={`/quizzes/${post.ID}`}
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl transition-all shadow-[0_4px_0_rgb(37,99,235)] active:translate-y-1 active:shadow-none uppercase tracking-wider"
            >
              🎯 Lanjut ke Menu Kuis
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}