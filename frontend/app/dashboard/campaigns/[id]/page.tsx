"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Loader2, 
  Building2, 
  Newspaper, 
  Users, 
  Mail,
  Edit,
  Send,
  Sparkles,
  MapPin,
  Calendar,
  Briefcase
} from "lucide-react";
import { api } from "@/lib/api";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [campaign, setCampaign] = useState<any>(null);
  const [prospects, setProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!campaignId || campaignId === "undefined") {
      setLoading(false);
      return;
    }
    
    loadCampaign();
    loadProspects();
    const interval = setInterval(() => {
      if (campaign?.status === "researching" || researching) {
        loadCampaign();
        loadProspects();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [campaignId, researching]);

  const loadCampaign = async () => {
    if (!campaignId || campaignId === "undefined") return;
    
    try {
      const data = await api.campaigns.get(campaignId);
      setCampaign(data);
      setLoading(false);
      if (data.status !== "researching") {
        setResearching(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadProspects = async () => {
    if (!campaignId || campaignId === "undefined") return;
    
    try {
      const data = await api.prospects.list(campaignId);
      setProspects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartResearch = async () => {
    if (!campaignId || campaignId === "undefined") {
      alert("Invalid campaign ID");
      return;
    }
    
    setResearching(true);
    try {
      await api.campaigns.research(campaignId);
      await loadCampaign();
      await loadProspects();
    } catch (err) {
      console.error(err);
      alert("Research failed. Please try again.");
      setResearching(false);
    }
  };

  const handleGenerateEmails = async () => {
    setGenerating(true);
    try {
      await api.campaigns.generate(campaignId, {
        product_description: "Our AI-powered sales automation platform"
      });
      // Navigate to edit page after generating emails
      router.push(`/dashboard/campaigns/${campaignId}/edit`);
    } catch (err) {
      console.error(err);
      setGenerating(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!confirm(`Are you sure you want to send this campaign to ${campaign.total_prospects} prospects?`)) {
      return;
    }

    setSending(true);
    try {
      // TODO: Implement actual campaign sending
      // For now, just show a message
      alert(`Campaign launch feature coming soon! This would send emails to ${campaign.total_prospects} prospects.`);
      
      // In production, this would:
      // 1. Get all prospects for this campaign
      // 2. Get the email sequence
      // 3. Schedule emails to be sent
      // 4. Update campaign status to "active"
      
    } catch (err) {
      console.error(err);
      alert("Failed to send campaign");
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">Campaign not found</p>
      </div>
    );
  }

  const companyData = campaign.company_data || {};
  const newsData = campaign.news_data || {};

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        
        <div className="flex items-center gap-3">
          {campaign.status === "ready" && (
            <>
              <Link href={`/dashboard/campaigns/${campaignId}/edit`} className="px-4 py-2 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-semibold hover:border-slate-300 transition-colors flex items-center gap-2">
                <Edit size={16} />
                Edit Emails
              </Link>
              <button 
                onClick={handleSendCampaign}
                disabled={sending}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Campaign
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">
          {campaign.name}
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold">
          {campaign.status === "researching" && <Loader2 size={14} className="animate-spin" />}
          {campaign.status === "researching" ? "Researching..." : campaign.status}
        </div>
      </div>

      {campaign.status === "researching" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center space-y-4"
        >
          <Sparkles size={48} className="mx-auto text-blue-600 animate-pulse" />
          <h3 className="text-xl font-bold text-slate-900">
            AI Agents are researching...
          </h3>
          <p className="text-slate-600">
            This usually takes 30-60 seconds. We're analyzing the company, finding news, and discovering contacts.
          </p>
        </motion.div>
      )}

      {campaign.status === "draft" && !companyData.name && prospects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center space-y-4"
        >
          <Sparkles size={48} className="mx-auto text-slate-400" />
          <h3 className="text-xl font-bold text-slate-900">
            Ready to Research
          </h3>
          <p className="text-slate-600">
            Click the button below to start AI research for this campaign.
          </p>
          <button
            onClick={handleStartResearch}
            disabled={researching}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {researching ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Start Research
              </>
            )}
          </button>
        </motion.div>
      )}

      {campaign.status !== "researching" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Building2 size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Company Profile</h2>
            </div>
            
            {companyData.name ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{companyData.name}</h3>
                  <p className="text-sm text-slate-500">{companyData.tagline}</p>
                </div>
                
                <p className="text-sm text-slate-600">{companyData.description}</p>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {companyData.industry && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase size={14} className="text-slate-400" />
                      <span className="text-slate-600">{companyData.industry}</span>
                    </div>
                  )}
                  {companyData.headquarters && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="text-slate-600">{companyData.headquarters}</span>
                    </div>
                  )}
                  {companyData.founded && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-slate-600">Founded {companyData.founded}</span>
                    </div>
                  )}
                  {companyData.company_size && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-slate-600">{companyData.company_size}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No company data available</p>
            )}
          </motion.div>

          {/* News Intelligence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <Newspaper size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Recent News</h2>
            </div>
            
            {newsData.articles?.length > 0 ? (
              <div className="space-y-3">
                {newsData.articles.slice(0, 3).map((article: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">
                      {article.title}
                    </h4>
                    <p className="text-xs text-slate-600">{article.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No recent news found</p>
            )}
          </motion.div>

          {/* Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4 lg:col-span-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Users size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Key Contacts</h2>
              {prospects.length > 0 && (
                <span className="ml-auto text-sm text-slate-500">
                  {prospects.length} prospects
                </span>
              )}
            </div>
            
            {prospects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {prospects.slice(0, 6).map((prospect: any) => (
                  <div key={prospect.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {prospect.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{prospect.name}</h4>
                        <p className="text-xs text-slate-600 truncate">{prospect.title}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{prospect.email}</p>
                    {prospect.department && (
                      <span className="inline-block mt-2 px-2 py-1 rounded text-xs bg-blue-50 text-blue-700">
                        {prospect.department}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No contacts discovered</p>
            )}
            
            {prospects.length > 6 && (
              <div className="text-center pt-2">
                <Link 
                  href="/dashboard/prospects"
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View all {prospects.length} prospects →
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {campaign.status === "draft" && (companyData.name || prospects.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={handleGenerateEmails}
            disabled={generating}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating Emails...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Email Sequence
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
