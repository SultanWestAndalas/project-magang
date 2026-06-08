"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          role_id: 2 // KUNCI UTAMA: Pendaftar dari luar otomatis jadi role_id 2 (Member Publik)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan registrasi");
      }

      // Jika sukses, arahkan ke pintu login PUBLIK (/signin), bukan /login (CMS)
      router.push("/signin?registered=true");
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-curoky circuit-pattern flex items-center justify-center p-6 relative overflow-hidden">
      {/* Efek Cahaya Latar Belakang */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-purple/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass p-8 md:p-12 rounded-[32px] w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-white mb-6 hover:opacity-80 transition-opacity">
            <img src="/logo-rai.png" alt="Logo rAi" className="w-8 h-8 object-contain" />
            ResponsAIbility
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Join the Movement</h1>
          <p className="text-text-secondary text-sm">Buat akun untuk belajar AI bersama kami</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-text-secondary mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-purple transition-all"
              
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-text-secondary mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-purple transition-all"
              
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-text-secondary mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-purple transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-accent-purple to-accent-magenta text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all mt-2 disabled:opacity-50"
          >
            {isLoading ? "Memproses..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-text-secondary text-sm mt-8">
          Sudah memiliki akun?{" "}
          {/* Tautan kembali mengarah ke pintu publik, bukan pintu CMS */}
          <Link href="/signin" className="text-accent-purple font-bold hover:text-white transition-colors">
             Login
          </Link>
        </p>
      </div>
    </main>
  );
}