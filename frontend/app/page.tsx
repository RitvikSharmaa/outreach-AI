"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Users, 
  Mail, 
  Newspaper, 
  Rocket, 
  BarChart3, 
  CheckCircle, 
  Zap 
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: "AI Company Research",
      description: "Automatically scrape and analyze company websites, extracting key intelligence and pain points.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Contact Discovery",
      description: "Find decision-makers and key contacts with AI-powered web intelligence.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Mail,
      title: "Personalized Sequences",
      description: "Generate 5-email outreach sequences that reference real company data and news.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Newspaper,
      title: "News Intelligence",
      description: "Discover recent funding rounds, product launches, and press mentions automatically.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Rocket,
      title: "Smart Sending",
      description: "Schedule emails with optimal timing and intelligent follow-up delays.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: BarChart3,
      title: "Performance Tracking",
      description: "Track opens, clicks, and replies with real-time analytics and insights.",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">AutoPilot</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Powered by AI Agents
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-7xl font-black text-slate-900 mb-6 leading-tight"
          >
            Cold Outreach That
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Actually Converts
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            AI agents research companies, discover contacts, and write hyper-personalized 
            email sequences in minutes
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link 
              href="/login" 
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              Start Free Campaign
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-semibold text-lg hover:border-slate-300 transition-colors"
            >
              Watch Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Setup in 2 minutes</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Complete outreach automation
            </h2>
            <p className="text-xl text-slate-600">
              From research to delivery, AI handles everything
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="group p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-center shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to 10x your outreach?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join sales teams using AI to generate more pipeline with less effort
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg hover:shadow-2xl transition-all"
            >
              Start Free Campaign
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="h-20" />
    </div>
  );
}
