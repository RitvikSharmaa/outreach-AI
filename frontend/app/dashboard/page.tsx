"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Plus, 
  Send, 
  Users, 
  Mail, 
  TrendingUp, 
  Zap,
  Target,
  Sparkles,
  Loader2,
  Search
} from "lucide-react";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_campaigns: 0,
    total_prospects: 0,
    emails_sent: 0,
    open_rate: 0,
  });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter campaigns based on search query
    if (searchQuery.trim() === "") {
      setFilteredCampaigns(campaigns);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = campaigns.filter(campaign => 
        campaign.name.toLowerCase().includes(query) ||
        campaign.target_url.toLowerCase().includes(query) ||
        campaign.company_data?.name?.toLowerCase().includes(query) ||
        campaign.status.toLowerCase().includes(query)
      );
      setFilteredCampaigns(filtered);
    }
  }, [searchQuery, campaigns]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch campaigns
      const campaignsData = await api.campaigns.list();
      setCampaigns(campaignsData || []);
      setFilteredCampaigns(campaignsData || []);
      
      // Fetch analytics
      const analyticsData = await api.analytics.overview();
      
      setStats({
        total_campaigns: campaignsData?.length || 0,
        total_prospects: analyticsData?.total_prospects || 0,  // Use total_prospects from analytics
        emails_sent: analyticsData?.total_sent || 0,
        open_rate: analyticsData?.open_rate || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Send, label: "Campaigns", value: stats.total_campaigns, color: "from-blue-500 to-cyan-500" },
    { icon: Users, label: "Prospects", value: stats.total_prospects, color: "from-purple-500 to-pink-500" },
    { icon: Mail, label: "Emails Sent", value: stats.emails_sent, color: "from-orange-500 to-red-500" },
    { icon: TrendingUp, label: "Open Rate", value: `${stats.open_rate}%`, color: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold"
        >
          <Sparkles size={14} />
          AI-Powered Dashboard
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-5xl font-bold text-slate-900"
        >
          Welcome Back
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 max-w-2xl mx-auto"
        >
          Here's your outreach performance at a glance
        </motion.p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all hover:scale-105"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
              <stat.icon size={24} className="text-white" />
            </div>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">{stat.label}</h3>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center"
      >
        <Link 
          href="/dashboard/campaigns/new" 
          className="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Create New Campaign
          <Zap size={20} />
        </Link>
      </motion.div>

      {/* Campaigns Section */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Campaigns</h2>
        </div>

        {/* Search Bar */}
        {campaigns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mb-6"
          >
            <div className="relative max-w-md mx-auto">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns by name, company, or URL..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  {filteredCampaigns.length} of {campaigns.length}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={40} className="animate-spin text-blue-600" />
          </div>
        ) : filteredCampaigns.length === 0 && campaigns.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center py-20 text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-2xl">
              <Target size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No campaigns yet</h3>
              <p className="text-base text-slate-600 max-w-md mx-auto">
                Create your first AI-powered campaign to start automating your outreach and generating personalized email sequences.
              </p>
            </div>
            <Link href="/dashboard/campaigns/new" className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center gap-2">
              <Zap size={20} />
              Create Your First Campaign
            </Link>
          </motion.div>
        ) : filteredCampaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center space-y-4"
          >
            <Search size={48} className="mx-auto text-slate-400" />
            <h3 className="text-xl font-bold text-slate-900">No campaigns found</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              No campaigns match your search "{searchQuery}". Try a different search term.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="px-6 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
            >
              Clear Search
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign, i) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link href={`/dashboard/campaigns/${campaign.id}`}>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">{campaign.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        campaign.status === 'researching' ? 'bg-blue-100 text-blue-700' :
                        campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {campaign.company_data?.description || campaign.target_url}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{campaign.total_prospects || 0} prospects</span>
                      <span className="text-slate-500">{campaign.emails_sent || 0} sent</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
