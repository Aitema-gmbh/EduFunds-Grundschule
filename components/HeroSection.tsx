"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Search, School, Building2, HeartHandshake } from "lucide-react";
import foerderprogramme from "@/data/foerderprogramme.json";

export function HeroSection() {
  const stats = {
    total: foerderprogramme.length,
    bund: foerderprogramme.filter(p => p.foerdergeberTyp === 'bund').length,
    land: foerderprogramme.filter(p => p.foerdergeberTyp === 'land').length,
    stiftung: foerderprogramme.filter(p => p.foerdergeberTyp === 'stiftung').length,
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 pt-32 pb-20 lg:pt-40 lg:pb-32 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-slate-300">
                KI-gestützter Antragsassistent
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-100 mb-6 tracking-tight"
          >
            Fördermittel für{" "}
            <span className="text-gradient">Schulen</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Finden und beantragen Sie passende Förderungen für Ihre Schule. 
            Mit intelligenter Suche und KI-Unterstützung.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/foerderprogramme"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all"
            >
              <Search className="w-5 h-5" />
              Förderfinder öffnen
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            <div className="glass rounded-xl p-4">
              <div className="text-3xl font-bold text-orange-400">{stats.total}</div>
              <div className="text-sm text-slate-500">Programme</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-3xl font-bold text-cyan-400">{stats.bund}</div>
              <div className="text-sm text-slate-500">Bund</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-400">{stats.land}</div>
              <div className="text-sm text-slate-500">Länder</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-3xl font-bold text-green-400">{stats.stiftung}</div>
              <div className="text-sm text-slate-500">Stiftungen</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
