"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Settings, Zap, ArrowRight, CheckCircle2, ShieldCheck, Bell, Palette, Clock, Loader2, X, Users } from "lucide-react";
import Link from "next/link";

export default function SlottLandingPage() {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: checkoutEmail }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || "Erreur lors de la redirection.");
        setCheckoutLoading(false);
      }
    } catch {
      setCheckoutError("Erreur réseau.");
      setCheckoutLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  const features = [
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Time Engine Rapide",
      desc: "Prenez rendez-vous en 30 secondes."
    },
    {
      icon: <Calendar className="w-12 h-12" />,
      title: "Agenda Intelligent",
      desc: "Gérez vos plannings sans jamais croiser vos rendez-vous."
    },
    {
      icon: <Settings className="w-12 h-12" />,
      title: "Architecture Sur-Mesure",
      desc: "Services, prix et durées... Le tout ajusté à votre image."
    }
  ];

  const pricing = [
    {
      name: "Licence Pro Unique",
      price: "49",
      desc: "L'outil complet, sans aucune limite cachée pour votre salon.",
      features: [
        "Réservations & Calendriers illimités",
        "Tunnel Time Engine Ultra-rapide",
        "Vue Gérant Dashboard Complète",
        "Support en direct 7j/7"
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-black text-slate-50 font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <Link href="/" className="text-2xl font-bold tracking-tighter leading-none">
              SLO<span className="text-emerald-500">T</span>T
            </Link>
            <a href="https://codeir.net" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-emerald-500/80 tracking-widest uppercase mt-1 hover:text-emerald-400 transition-colors">
              by Code IR
            </a>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Tarifs</a>
            <a href="#avantages" className="hover:text-emerald-400 transition-colors">Avantages</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="#pricing"
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-semibold transition-all hover:border-emerald-500/50"
            >
              Obtenir SLOTT
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Effet de lueur en fond */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-500/50 text-emerald-400 text-sm font-medium mb-8">
              <ShieldCheck className="w-5 h-5" /> Première plateforme de gestion nouvelle génération
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              Prenez des rendez-vous, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
                avec élégance.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              SLOTT est le SaaS de gestion de rendez-vous conçu pour les salons exigeants.
              Surpassez vos concurrents avec un tunnel de réservation ultra-rapide et un design premium qui reflète la qualité de votre travail.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#pricing"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-black font-bold rounded-lg drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:drop-shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Lancer mon Salon <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#avantages"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                Voir les avantages <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Editorial Look */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl md:text-6xl font-normal tracking-tight mb-6">L&apos;excellence au <br /><span className="text-emerald-500 italic">quotidien.</span></h2>
            <p className="text-xl text-slate-400 max-w-xl">Oubliez les grilles classiques et les interfaces génériques. SLOTT est une mécanique de précision pour votre salon.</p>
          </div>

          <div className="flex flex-col border-t border-white/10">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { delay: idx * 0.15, duration: 0.5 } }
                }}
                className="flex flex-col md:flex-row items-start md:items-center py-12 border-b border-white/10 hover:bg-white/[0.03] transition-colors gap-6 md:gap-12 group cursor-default"
              >
                <div className="text-emerald-500 font-mono text-sm opacity-50 group-hover:opacity-100 transition-opacity">
                  0{idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl md:text-4xl font-normal tracking-tight mb-3 group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-lg max-w-2xl">
                    {feature.desc}
                  </p>
                </div>
                <div className="hidden md:flex text-emerald-500 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                  {feature.icon}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Avantages Section */}
      <section id="avantages" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500 mb-4">Dashboard Admin</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Tout ce qu&apos;il vous faut,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">directement dans votre panneau.</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              En quelques clics, gérez votre salon comme un pro — sans formation, sans complexité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
            {[
              {
                icon: <Calendar className="w-6 h-6" />,
                title: "Agenda en temps réel",
                desc: "Visualisez tous vos rendez-vous du jour, avec les détails client, la prestation et le praticien — en un coup d'œil."
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Gestion de l'équipe",
                desc: "Ajoutez vos praticiens, définissez leurs horaires de travail jour par jour et attribuez-leur des services spécifiques."
              },
              {
                icon: <Settings className="w-6 h-6" />,
                title: "Catalogue de services",
                desc: "Créez vos prestations avec durée, prix et catégorie. Vos clients voient en direct ce que vous proposez."
              },
              {
                icon: <Palette className="w-6 h-6" />,
                title: "Page de réservation brandée",
                desc: "Couleur, police, logo, mode clair/sombre, image de couverture... Votre page reflète votre identité visuelle."
              },
              {
                icon: <Bell className="w-6 h-6" />,
                title: "Notifications instantanées",
                desc: "Soyez alerté à chaque nouvelle réservation. Consultez l'historique complet depuis votre tableau de bord."
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Anti double-booking",
                desc: "Le moteur de créneaux calcule automatiquement les disponibilités et bloque toute réservation en conflit."
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.08 } } }}
                className="bg-black p-8 hover:bg-white/[0.02] transition-colors group"
              >
                <div className={`w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-5 group-hover:bg-emerald-500/20 transition-colors`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors"
            >
              Démarrer mon abonnement <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Un investissement rentable</h2>
            <p className="text-slate-400">Boostez vos réservations, sans payer de commissions sur chaque client.</p>
          </div>

          <div className="grid grid-cols-1 max-w-lg mx-auto">
            {pricing.map((plan, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1, transition: { delay: idx * 0.15 } }
                }}
                className={`relative bg-black border p-12 flex flex-col transition-all duration-500 ${plan.popular
                  ? "border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                  : "border-white/10"
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest">
                    Le plus choisi
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-200 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-slate-400">/mois</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-4">{plan.desc}</p>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-sm text-slate-300">{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowEmailModal(true)}
                  className={`w-full py-4 text-sm font-bold uppercase tracking-widest text-center transition-all ${plan.popular
                    ? "bg-white text-black hover:bg-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "bg-transparent text-white border border-white/20 hover:border-emerald-500 hover:text-emerald-500"
                    }`}
                >
                  Choisir ce plan
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold tracking-tighter">
            SLO<span className="text-emerald-500">T</span>T
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Édité par Code IR Studio. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors">Mentions légales</a>
            <a href="#" className="text-slate-500 hover:text-emerald-400 transition-colors">CGV</a>
          </div>
        </div>
      </footer>
      {/* Email / Checkout Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-6"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-md relative"
            >
              <button onClick={() => setShowEmailModal(false)} className="absolute right-6 top-6 text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Commencer avec SLOTT</h2>
                <p className="text-slate-400 text-sm">Entrez votre email pour accéder au paiement sécurisé.</p>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  required
                  value={checkoutEmail}
                  onChange={e => setCheckoutEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
                {checkoutError && <p className="text-red-400 text-sm">{checkoutError}</p>}
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full bg-emerald-500 text-black font-bold rounded-xl p-4 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {checkoutLoading
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Redirection vers Stripe...</>
                    : "Payer 49€/mois →"}
                </button>
              </form>

              <p className="text-slate-600 text-xs text-center mt-4 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Paiement sécurisé via Stripe · Résiliable à tout moment
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
