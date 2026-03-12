"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Send, 
  Mail, 
  MousePointerClick, 
  MessageSquare,
  BarChart3,
  Loader2,
  Users,
  Target
} from "lucide-react";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [analyticsData, campaignsData] = await Promise.all([
        api.analytics.overview(),
        api.campaigns.list()
      ]);
      setOverview(analyticsData);
      setCampaigns(campaignsData || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = overview || {
    total_sent: 0,
    total_opened: 0,
    total_clicked: 0,
    total_replied: 0,
    total_prospects: 0,
    open_rate: 0,
    click_rate: 0,
    reply_rate: 0
  };

  const statCards = [
    { 
      icon: Send, 
      label: "Total Sent", 
      value: stats.total_sent, 
      color: "from-blue-500 to-cyan-500" 
    },
    { 
      icon: Mail, 
      label: "Opened", 
      value: stats.total_opened, 
      subtitle: `${stats.open_rate}% open rate`,
      color: "from-purple-500 to-pink-500" 
    },
    { 
      icon: MousePointerClick, 
      label: "Clicked", 
      value: stats.total_clicked,
      subtitle: `${stats.click_rate}% click rate`,
      color: "from-orange-500 to-red-500" 
    },
    { 
      icon: MessageSquare, 
      label: "Replied", 
      value: stats.total_replied,
      subtitle: `${stats.reply_rate}% reply rate`,
      color: "from-green-500 to-emerald-500" 
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold"
        >
          <BarChart3 size={14} />
          Campaign Analytics
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-5xl font-bold text-slate-900"
        >
          Performance Overview
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 max-w-2xl mx-auto"
        >
          Track your outreach performance across all campaigns
        </motion.p>
      </div>

      {/* Overview Stats - Campaigns & Prospects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Target size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600">Total Campaigns</h3>
              <p className="text-4xl font-bold text-slate-900">{campaigns.length}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">Active outreach campaigns</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600">Total Prospects</h3>
              <p className="text-4xl font-bold text-slate-900">{stats.total_prospects || 0}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">Discovered decision-makers</p>
        </motion.div>
      </div>

      {/* Email Performance Stats */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Email Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105"
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
              <stat.icon size={24} className="text-white" />
            </div>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">{stat.label}</h3>
            <p className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</p>
            {stat.subtitle && (
              <p className="text-xs text-slate-500">{stat.subtitle}</p>
            )}
          </motion.div>
        ))}
      </div>
      </div>

      {/* Funnel Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Conversion Funnel
        </h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-900">Sent</span>
              <span className="text-sm text-slate-600">{stats.total_sent}</span>
            </div>
            <div className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
              100%
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-900">Opened</span>
              <span className="text-sm text-slate-600">{stats.total_opened}</span>
            </div>
            <div 
              className="h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg"
              style={{ width: `${stats.open_rate}%`, minWidth: '60px' }}
            >
              {stats.open_rate}%
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-900">Clicked</span>
              <span className="text-sm text-slate-600">{stats.total_clicked}</span>
            </div>
            <div 
              className="h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shadow-lg"
              style={{ width: `${stats.click_rate}%`, minWidth: '60px' }}
            >
              {stats.click_rate}%
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-900">Replied</span>
              <span className="text-sm text-slate-600">{stats.total_replied}</span>
            </div>
            <div 
              className="h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg"
              style={{ width: `${stats.reply_rate}%`, minWidth: '60px' }}
            >
              {stats.reply_rate}%
            </div>
          </div>
        </div>
      </motion.div>

      {stats.total_sent === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center space-y-4"
        >
          <BarChart3 size={48} className="mx-auto text-slate-400" />
          <h3 className="text-xl font-bold text-slate-900">No data yet</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Create a campaign and send some emails to see your analytics here.
          </p>
        </motion.div>
      )}
    </div>
  );
}
