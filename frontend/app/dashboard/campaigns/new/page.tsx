"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, Globe, Zap } from "lucide-react";
import { api } from "@/lib/api";

export default function NewCampaignPage() {
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const campaign = await api.campaigns.create({ name, target_url: targetUrl });
      await api.campaigns.research(campaign.id);
      router.push(`/dashboard/campaigns/${campaign.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold">
          <Sparkles size={14} />
          AI-Powered Campaign
        </div>
        <h1 className="text-4xl font-bold text-slate-900">
          Create New Campaign
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Enter a company website URL and let our AI agents research the company, find key contacts, and generate personalized email sequences.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Campaign Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="e.g., Q1 SaaS Outreach"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Company Website URL
            </label>
            <div className="relative">
              <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="https://example.com"
                required
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Enter the company's website or LinkedIn company page URL
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating & Researching...
              </>
            ) : (
              <>
                <Zap size={20} />
                Create & Start Research
              </>
            )}
          </button>
        </form>

        <div className="mt-8 p-6 rounded-xl bg-slate-50 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            What happens next?
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-semibold mt-0.5">1.</span>
              <span>AI agents scrape and analyze the company website</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-semibold mt-0.5">2.</span>
              <span>Find recent news, funding rounds, and product launches</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-semibold mt-0.5">3.</span>
              <span>Discover key decision-makers and their contact info</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-semibold mt-0.5">4.</span>
              <span>Generate a personalized 5-email outreach sequence</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
