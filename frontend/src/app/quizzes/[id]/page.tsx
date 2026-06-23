"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function QuizFocusPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id; // ID materi yang dijadikan referensi kuis

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [xpClaimed, setXpClaimed] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/public/quizzes/${postId}`);
        const result = await res.json();
        
        if (res.ok && result.data && result.data.length > 0) {
          setQuiz(result.data[0]);
        }
      } catch (err) {
        console.error("Gagal menarik kuis", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [postId]);

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    
    if (selectedAnswer === quiz?.correct_answer) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
      setTimeout(() => setIsCorrect(null), 1500); // Reset efek merah setelah 1.5 detik
    }
  };

  const handleClaimXP = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesi berakhir. Silakan login kembali.");
      router.push("/signin");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/posts/${postId}/complete`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("user_xp", data.xp_total);
        localStorage.setItem("user_level", data.level_sekarang);
        setXpClaimed(true);

        if (data.level_up) {
          alert(`🌟 LEVEL UP! 🌟\n\nSelamat! Anda naik ke Level ${data.level_sekarang}!`);
        }
      } else {
        alert(data.error || "XP sudah pernah diklaim sebelumnya.");
        setXpClaimed(true); // Biarkan tetap true agar tombolnya hilang jika sudah diklaim
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Memuat Kuis...</div>;
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Belum Ada Kuis</h2>
        <p className="text-gray-400 mb-8">Kuis untuk materi ini belum tersedia di sistem.</p>
        <Link href="/member-area" className="bg-blue-600 px-6 py-2 rounded-xl">Kembali ke Dasbor</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      
      <div className="w-full max-w-2xl">
        {/* Header Kuis */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/member-area" className="text-gray-500 hover:text-white transition font-bold text-xl">
            ✕ Keluar
          </Link>
          <div className="bg-white/10 px-4 py-2 rounded-full text-sm font-bold tracking-widest text-gray-300">
            EVALUASI MATERI
          </div>
        </div>

        {/* Area Soal */}
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-relaxed">
            {quiz.question}
          </h2>
        </div>

        {/* Area Pilihan Ganda */}
        <div className="grid grid-cols-1 gap-4 mb-10">
          {['A', 'B', 'C', 'D'].map((optionChar) => {
            const optionKey = `option_${optionChar.toLowerCase()}`;
            const optionText = quiz[optionKey];
            
            let buttonClass = "border-2 border-white/20 bg-transparent text-gray-200 hover:bg-white/5 shadow-[0_4px_0_rgba(255,255,255,0.2)]";
            if (selectedAnswer === optionChar) {
              buttonClass = "border-2 border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0px_0_rgba(59,130,246,0.5)] translate-y-1"; 
            }
            if (isCorrect === true && optionChar === quiz.correct_answer) {
              buttonClass = "border-2 border-green-500 bg-green-500/20 text-green-400 shadow-[0_0px_0_rgba(34,197,94,0.5)] translate-y-1";
            }
            if (isCorrect === false && selectedAnswer === optionChar) {
              buttonClass = "border-2 border-red-500 bg-red-500/20 text-red-400 shadow-[0_0px_0_rgba(239,68,68,0.5)] translate-y-1";
            }

            return (
              <button
                key={optionChar}
                onClick={() => !isCorrect && setSelectedAnswer(optionChar)}
                disabled={isCorrect === true}
                className={`p-5 rounded-2xl text-left font-bold text-lg sm:text-xl transition-all ${buttonClass}`}
              >
                <span className="inline-block w-10 h-10 rounded-lg bg-black/50 text-center leading-[40px] mr-4 border border-white/10">
                  {optionChar}
                </span>
                {optionText}
              </button>
            );
          })}
        </div>

        {/* Area Aksi (Tombol Cek / Selesai) */}
        <div className="border-t border-white/10 pt-8 flex justify-between items-center min-h-[100px]">
          {isCorrect === false && (
            <div className="text-red-500 font-bold text-xl animate-pulse">
              ❌ Jawaban belum tepat!
            </div>
          )}

          {isCorrect === true && !xpClaimed && (
            <div className="text-green-500 font-bold text-xl">
              ✅ Hebat! Jawaban Benar.
            </div>
          )}

          {xpClaimed && (
            <div className="text-green-500 font-bold text-xl">
              +50 XP telah ditambahkan!
            </div>
          )}

          <div className="ml-auto">
            {isCorrect === null && (
              <button
                onClick={handleCheckAnswer}
                disabled={!selectedAnswer}
                className={`px-10 py-4 rounded-2xl font-black text-xl uppercase tracking-wider transition-all ${
                  selectedAnswer 
                    ? 'bg-blue-500 text-white shadow-[0_5px_0_rgb(29,78,216)] active:translate-y-1 active:shadow-none hover:bg-blue-400' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                Periksa
              </button>
            )}

            {isCorrect === true && !xpClaimed && (
              <button
                onClick={handleClaimXP}
                className="px-10 py-4 rounded-2xl font-black text-xl text-black uppercase tracking-wider bg-green-500 shadow-[0_5px_0_rgb(21,128,61)] active:translate-y-1 active:shadow-none hover:bg-green-400 transition-all"
              >
                Klaim XP
              </button>
            )}

            {xpClaimed && (
              <Link
                href="/member-area"
                className="inline-block px-10 py-4 rounded-2xl font-black text-xl text-black uppercase tracking-wider bg-yellow-400 shadow-[0_5px_0_rgb(202,138,4)] active:translate-y-1 active:shadow-none hover:bg-yellow-300 transition-all"
              >
                Kembali ke Dasbor
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}