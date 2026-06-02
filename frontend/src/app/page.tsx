"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import LiquidEther from "@/components/LiquidEther";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- TAMBAHKAN KODE LOGIKA INI ---
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/public/posts");
        const data = await res.json();
        if (res.ok) setPosts(data.data || []);
      } catch (error) {
        console.error("Gagal mengambil artikel:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicPosts();
  }, []);
  // ---------------------------------

  return (
    <main className="min-h-screen bg-curoky circuit-pattern relative overflow-hidden font-sans selection:bg-accent-purple/30">
      {/* Liquid Ether Full-Screen Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <LiquidEther
          colors={['#5227FF', '#9d50bb', '#FF9FFC']}
          mouseForce={20}
          cursorSize={80}
          isViscous={false}
          viscous={30}
          iterationsViscous={16}
          iterationsPoisson={16}
          resolution={0.3}
          isBounce={false}
          autoDemo
          autoSpeed={0.35}
          autoIntensity={1.5}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
        <div className="glass px-6 md:px-8 py-4 rounded-full flex items-center justify-between relative z-20">
          <div className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-accent-purple to-accent-magenta rounded-lg shadow-lg shadow-accent-purple/20"></div>
            ResponsAIbility
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary uppercase tracking-widest">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#vision">Vision</NavLink>
            <NavLink href="#mission">Mission</NavLink>
            <NavLink href="#curriculum">Curriculum</NavLink>
            <NavLink href="#ethical-ai">Ethical AI</NavLink>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="btn-ghost">Log In</button>
            <button className="btn-signup shadow-xl shadow-white/10">Sign Up</button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="btn-icon md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu overlay */}
        <div
          className={`fixed inset-0 z-40 transition-all duration-500 md:hidden ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsMenuOpen(false)} />
          <div className={`absolute top-0 right-0 h-full w-[80%] max-w-sm glass border-l border-white/10 p-10 flex flex-col gap-10 transition-transform duration-500 ${isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="btn-icon"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-8 text-lg font-medium text-text-secondary uppercase tracking-widest">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Vision', href: '#vision' },
                { label: 'Mission', href: '#mission' },
                { label: 'Curriculum', href: '#curriculum' },
                { label: 'Ethical AI', href: '#ethical-ai' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className="nav-link-mobile"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4">
              <button className="btn-ghost w-full">Log In</button>
              <button className="btn-signup w-full">Sign Up</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-44 pb-16 md:pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="glass px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-text-secondary mb-8 border border-white/5 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-pulse"></span>
          Digital Literacy Powered by AI
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Empowering the World <br />
          <span className="text-gradient">with Ethical AI Education</span>
        </h1>

        <p className="max-w-2xl text-base md:text-xl text-text-secondary leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
          Demystifying Artificial Intelligence to bridge the digital divide and ensure inclusive, high-quality literacy for all—regardless of background.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300 w-full sm:w-auto">
          <button className="btn-primary w-full sm:w-auto min-w-[180px]">Get In Touch</button>
          <button className="btn-secondary w-full sm:w-auto min-w-[180px]">Learn More</button>
        </div>
      </section>

      {/* Vision & Mission Cards (Replicating the arc UI) */}
      <section id="features" className="relative px-6 max-w-7xl mx-auto py-12 md:py-20">
        {/* Arc Visual Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] border-t-2 border-accent-purple/20 rounded-[100%] pointer-events-none hidden md:block"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          <InfoCard
            badge="Our Vision"
            title="AI-Literate World"
            description="Individuals and communities harness AI responsibly, ethically, and equitably—driven by quality education."
            icon="🌍"
          />
          <InfoCard
            badge="Our Mission"
            title="Bridging the Divide"
            description="Making AI education accessible and inclusive to empower citizens and ensure transparency."
            icon="🌉"
          />
          <InfoCard
            badge="SDG 4 Focused"
            title="Quality Literacy"
            description="Ensuring inclusive education for all through engaging and demystified learning experiences."
            icon="📚"
          />
        </div>
      </section>

      {/* ── VISION SECTION ── */}
      <section id="vision" className="relative z-10 px-6 py-16 md:py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-accent-purple mb-6 opacity-80">
              <span className="w-1.5 h-1.5 bg-accent-purple rounded-full" />
              Our Vision
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-8">
              Building an{" "}
              <span style={{ background: 'linear-gradient(135deg, #9d50bb, #FF9FFC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                AI-Literate World
              </span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
              To build an AI-literate world where individuals and communities harness artificial intelligence <strong className="text-white">responsibly, ethically, and equitably</strong>—driven by inclusive and quality education for all.
            </p>
            <p className="text-text-secondary text-base leading-relaxed opacity-70">
              We believe education is the most powerful equalizer. By making AI accessible, we&apos;re not just teaching technology—we&apos;re shaping a future where every person, regardless of background, can thrive in an AI-driven world.
            </p>
          </div>

          {/* Right: Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { num: '100+', label: 'Countries Reached', icon: '🌍' },
              { num: '50K+', label: 'Students Empowered', icon: '🎓' },
              { num: '95%', label: 'Satisfaction Rate', icon: '⭐' },
              { num: 'SDG 4', label: 'Quality Education', icon: '📚' },
            ].map((stat) => (
              <div key={stat.label} className="glass p-6 md:p-8 rounded-2xl text-center group hover:border-accent-purple/40 transition-all duration-500">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-1 tracking-tighter">{stat.num}</div>
                <div className="text-[10px] md:text-[11px] text-text-secondary tracking-widest uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION PILLARS ── */}
      <section id="mission" className="relative z-10 px-6 pb-16 md:pb-32 max-w-7xl mx-auto" data-ethical-ai-adjacent>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-accent-purple mb-6 opacity-80">
            <span className="w-1.5 h-1.5 bg-accent-purple rounded-full" />
            Our Mission
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Three Pillars of{" "}
            <span style={{ background: 'linear-gradient(135deg, #9d50bb, #FF9FFC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Change
            </span>
          </h2>
          <p className="text-text-secondary text-lg mt-4 max-w-xl mx-auto">
            A mission focused on making Artificial Intelligence education accessible, ethical, and inclusive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="glass p-8 rounded-[32px] group hover:border-accent-purple/50 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent-purple/10 transition-all duration-500" />
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">🧩</div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-accent-purple uppercase mb-3 opacity-80">Pillar I</div>
            <h3 className="text-2xl font-bold mb-4">Accessible AI Education</h3>
            <p className="text-text-secondary leading-relaxed text-sm">
              Aiming to <strong className="text-white">demystify AI</strong> through engaging, interactive learning experiences designed for all skill levels—from beginners to advanced learners. We break barriers so everyone can understand and use AI.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-text-secondary">
              {['Free & open curriculum', 'Multi-language support', 'Beginner-friendly modules'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent-purple/70 rounded-full" />{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="glass p-8 rounded-[32px] group hover:border-accent-purple/50 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent-purple/10 transition-all duration-500" />
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">⚖️</div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-accent-purple uppercase mb-3 opacity-80">Pillar II</div>
            <h3 className="text-2xl font-bold mb-4">Ethical AI Awareness</h3>
            <p className="text-text-secondary leading-relaxed text-sm">
              Integrating <strong className="text-white">transparency, fairness, and accountability</strong> into every program we offer. We teach not just how AI works—but how to use it responsibly and with deep awareness of its societal impact.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-text-secondary">
              {['Bias & fairness training', 'Responsible AI frameworks', 'Critical thinking skills'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent-purple/70 rounded-full" />{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="glass p-8 rounded-[32px] group hover:border-accent-purple/50 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent-purple/10 transition-all duration-500" />
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">🤝</div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-accent-purple uppercase mb-3 opacity-80">Pillar III</div>
            <h3 className="text-2xl font-bold mb-4">Empowerment & Inclusion</h3>
            <p className="text-text-secondary leading-relaxed text-sm">
              Supporting <strong className="text-white">SDG 4</strong> to ensure high-quality digital literacy for all, regardless of background, geography, or socioeconomic status. No one gets left behind in the AI revolution.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-text-secondary">
              {['Underserved community focus', 'Scholarship programs', 'Partnership with NGOs'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent-purple/70 rounded-full" />{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── SDG 4 HIGHLIGHT ── */}
      <section id="curriculum" className="relative z-10 px-6 pb-16 md:pb-32 max-w-7xl mx-auto">
        <div className="glass rounded-[24px] md:rounded-[40px] p-8 md:p-16 relative overflow-hidden">
          {/* Decorative glow inside */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #9d50bb, transparent)' }} />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #FF9FFC, transparent)' }} />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase text-white mb-8 border-white/10">
                🎯 UN Sustainable Development Goals
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Aligned with{" "}
                <span style={{ background: 'linear-gradient(135deg, #9d50bb, #FF9FFC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  SDG 4
                </span>
              </h2>
              <p className="text-text-secondary leading-relaxed text-base mb-8">
                Quality Education—ensuring inclusive and equitable quality education and promoting lifelong learning opportunities for all. Our programs are built from the ground up to support this global commitment.
              </p>
              <button className="btn-primary w-full sm:w-auto">Learn About SDG 4</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { title: 'Inclusive Access', desc: 'Programs designed for marginalized and underrepresented communities worldwide.' },
                { title: 'Lifelong Learning', desc: 'From youth programs to adult upskilling—AI education for every stage of life.' },
                { title: 'Equitable Outcomes', desc: 'Ensuring AI skills translate into real-world opportunities regardless of background.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start p-4 rounded-2xl border border-white/5 hover:border-accent-purple/30 transition-colors duration-300 group">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #5227FF, #9d50bb)' }}>
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ARTIKEL / BLOG SECTION (TAMBAHAN KITA) ── */}
      <section id="blog" className="relative z-10 px-6 pb-16 md:pb-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-accent-purple mb-6 opacity-80">
            <span className="w-1.5 h-1.5 bg-accent-purple rounded-full" />
            Wawasan Terbaru
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Artikel <span style={{ background: 'linear-gradient(135deg, #9d50bb, #FF9FFC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pilihan</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-10 h-10 border-2 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="glass p-8 rounded-[32px] text-center text-text-secondary border border-white/5">
            Belum ada artikel yang diterbitkan saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.ID} className="glass p-6 md:p-8 rounded-[32px] group hover:border-accent-purple/50 transition-all duration-500 relative flex flex-col h-full overflow-hidden">
                {/* Dekorasi sudut membulat bawaan desain asli */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent-purple/10 transition-all duration-500" />
                
                {/* --- AREA GAMBAR THUMBNAIL (BARU) --- */}
                {post.Thumbnail ? (
                  <div className="relative w-full h-48 sm:h-56 mb-6 rounded-2xl overflow-hidden z-10 shrink-0">
                    <img 
                      src={`http://localhost:8080${post.Thumbnail}`} 
                      alt={post.Title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                ) : (
                  // Tampilan jika artikel tidak memiliki gambar (Placeholder)
                  <div className="relative w-full h-48 sm:h-56 mb-6 rounded-2xl overflow-hidden z-10 shrink-0 bg-gradient-to-br from-white/5 to-transparent border border-white/5 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}
                
                {/* --- TANGGAL --- */}
                <div className="text-[10px] font-bold tracking-[0.2em] text-accent-purple uppercase mb-4 opacity-80 relative z-10">
                  {new Date(post.CreatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                
                {/* --- JUDUL & KONTEN --- */}
                <h3 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-white transition-colors line-clamp-2 relative z-10">
                  {post.Title}
                </h3>
                
                <p className="text-text-secondary leading-relaxed text-sm line-clamp-3 mb-8 flex-grow relative z-10">
                  {post.Content}
                </p>
                
                {/* --- AUTHOR & TOMBOL BACA --- */}
                <div className="flex items-center justify-between border-t border-white/10 pt-5 mt-auto relative z-10">
                  <span className="text-xs font-medium text-white/70 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-purple to-accent-magenta flex items-center justify-center text-[10px] text-white font-bold">
                      {post.Author?.username ? post.Author.username.charAt(0).toUpperCase() : "A"}
                    </div>
                    {post.Author?.username || "Anonim"}
                  </span>
                  <button className="text-accent-purple text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                    Baca ➝
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* ── AKHIR BLOG SECTION ── */}

      {/* ── CTA SECTION ── */}
      <section id="ethical-ai" className="relative z-10 px-6 pb-16 md:pb-32 max-w-7xl mx-auto text-center">
        <div className="glass rounded-[24px] md:rounded-[40px] p-8 md:p-20 relative overflow-hidden">
          <div className="absolute inset-0 rounded-[40px] opacity-10" style={{ background: 'radial-gradient(ellipse at center, #9d50bb, transparent 70%)' }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-accent-purple mb-6 opacity-80">
              <span className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-pulse" />
              Join the Movement
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Ready to Shape the <br />
              <span style={{ background: 'linear-gradient(135deg, #9d50bb, #FF9FFC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Future of AI Education?
              </span>
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Whether you are a student, educator, NGO, or organization—join us in building an equitable, AI-literate world.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <button className="btn-primary w-full sm:w-auto min-w-[200px]">Get Started Free</button>
              <button className="btn-secondary w-full sm:w-auto min-w-[200px]">Partner With Us</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-12 md:py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #9d50bb, #6e48aa)' }} />
              ResponsAIbility
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Making AI education accessible, ethical, and inclusive for everyone on the planet.
            </p>
          </div>
          {/* Links */}
          {[
            { title: 'Company', links: ['About Us', 'Vision', 'Mission', 'Team'] },
            { title: 'Programs', links: ['AI Literacy', 'Ethical AI', 'Youth Programs', 'Curriculum'] },
            { title: 'Resources', links: ['Blog', 'Research', 'SDG 4', 'Contact'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold tracking-widest uppercase text-text-secondary mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/50 hover:text-white transition-colors duration-200">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-secondary/50 text-center md:text-left">
          <p>© 2026 ResponsAIbility. All rights reserved.</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function InfoCard({ badge, title, description, icon }: { badge: string; title: string; description: string; icon: string }) {
  return (
    <div className="glass p-6 md:p-8 rounded-[24px] md:rounded-[32px] hover:border-accent-purple/50 transition-all duration-500 group">
      <div className="text-[10px] font-bold tracking-widest text-accent-purple uppercase mb-4 opacity-80">
        {badge}
      </div>
      <div className="text-3xl md:text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <h3 className="text-xl md:text-2xl font-bold mb-4 tracking-tight">{title}</h3>
      <p className="text-text-secondary leading-relaxed text-sm overflow-hidden">
        {description}
      </p>
    </div>
  );
}

function BadgeFloating({ text, top, left, right, bottom, delay }: { text: string; top?: string; left?: string; right?: string; bottom?: string; delay: string }) {
  return (
    <div
      className="absolute glass px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase text-text-secondary flex items-center gap-2 animate-bounce border border-white/5"
      style={{ top, left, right, bottom, animationDelay: delay, animationDuration: '3s' }}
    >
      <div className="w-1.5 h-1.5 bg-accent-purple rounded-full shadow-[0_0_8px_var(--accent-purple)]"></div>
      {text}
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="nav-link group"
    >
      {children}
      {/* Animated underline bar — real element, not pseudo, avoids Tailwind preflight override */}
      <span
        className="nav-link-bar"
        aria-hidden="true"
      />
      {/* Glow dot */}
      <span
        className="nav-link-dot"
        aria-hidden="true"
      />
    </a>
  );
}
