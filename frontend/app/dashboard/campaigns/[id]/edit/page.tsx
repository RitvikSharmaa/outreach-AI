"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Loader2, Mail, Users } from "lucide-react";
import { api } from "@/lib/api";

export default function EmailEditorPage() {
  const params = useParams();
  const campaignId = params.id as string;
  
  const [emails, setEmails] = useState<any[]>([]);
  const [prospects, setProspects] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [selectedStep, setSelectedStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!campaignId || campaignId === "undefined") {
      setLoading(false);
      return;
    }
    loadData();
  }, [campaignId]);

  const loadData = async () => {
    if (!campaignId || campaignId === "undefined") return;
    
    try {
      const [emailsData, prospectsData, campaignData] = await Promise.all([
        api.campaigns.getEmails(campaignId),
        api.prospects.list(campaignId),
        api.campaigns.get(campaignId)
      ]);
      setEmails(emailsData);
      setProspects(prospectsData);
      setCampaign(campaignData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const email = emails.find(e => e.step_number === selectedStep);
      if (email) {
        await api.campaigns.updateEmail(campaignId, selectedStep, {
          subject: email.subject,
          body: email.body
        });
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleSendTest = async () => {
    setSending(true);
    try {
      await api.campaigns.sendTest(campaignId, selectedStep);
      alert("Test email sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send test email");
    }
    setSending(false);
  };

  const updateEmail = (field: string, value: string) => {
    setEmails(emails.map(e => 
      e.step_number === selectedStep 
        ? { ...e, [field]: value }
        : e
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  // Handle case when no emails are found
  if (!emails || emails.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-20 space-y-4">
        <Mail size={64} className="mx-auto text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-900">No Email Sequence Found</h2>
        <p className="text-slate-600">
          This campaign doesn't have any emails yet. Go back and generate an email sequence first.
        </p>
        <Link 
          href={`/dashboard/campaigns/${campaignId}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Campaign
        </Link>
      </div>
    );
  }

  const currentEmail = emails.find(e => e.step_number === selectedStep);
  
  // Handle case when selected email doesn't exist
  if (!currentEmail) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-20 space-y-4">
        <Mail size={64} className="mx-auto text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-900">Email Not Found</h2>
        <p className="text-slate-600">
          The selected email step doesn't exist. Try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  const emailTypes = ["intro", "value", "social_proof", "reminder", "breakup"];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link 
          href={`/dashboard/campaigns/${campaignId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Campaign
        </Link>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleSendTest}
            disabled={sending}
            className="px-4 py-2 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-semibold hover:border-slate-300 transition-colors flex items-center gap-2"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Send Test
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">
          Email Sequence Editor
        </h1>
        <p className="text-lg text-slate-600">
          Customize your AI-generated email sequence
        </p>
      </div>

      {/* Prospects Summary */}
      {prospects.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {prospects.length} Prospects Added
                </h3>
                <p className="text-sm text-slate-600">
                  These contacts will receive your email sequence
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/prospects"
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {prospects.slice(0, 6).map((prospect: any) => (
              <div key={prospect.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {prospect.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {prospect.name}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      {prospect.title}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {prospect.email}
                </p>
              </div>
            ))}
          </div>
          
          {prospects.length > 6 && (
            <p className="text-sm text-slate-500 text-center mt-4">
              + {prospects.length - 6} more prospects
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Email Step Selector */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Email Sequence
          </h3>
          {emails.map((email, i) => (
            <button
              key={email.step_number}
              onClick={() => setSelectedStep(email.step_number)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedStep === email.step_number
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  selectedStep === email.step_number
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {email.step_number}
                </div>
                <Mail size={16} className="text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-900 capitalize">
                {emailTypes[i] || `Email ${email.step_number}`}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Day {email.send_delay_days}
              </p>
            </button>
          ))}
        </div>

        {/* Email Editor */}
        <div className="lg:col-span-3 space-y-6">
          {currentEmail ? (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={currentEmail.subject}
                    onChange={(e) => updateEmail("subject", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Email subject..."
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Keep it under 60 characters for best open rates
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Email Body
                  </label>
                  <textarea
                    value={currentEmail.body}
                    onChange={(e) => updateEmail("body", e.target.value)}
                    className="w-full min-h-[400px] p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors resize-none font-mono text-sm"
                    placeholder="Email body..."
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Keep it concise - aim for 80-120 words for emails 1-3, 40-60 words for emails 4-5
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Preview
                </h3>
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="pb-4 border-b border-slate-300">
                    <p className="text-xs text-slate-500 mb-1">Subject:</p>
                    <p className="text-base font-semibold text-slate-900">
                      {currentEmail.subject}
                    </p>
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                    {currentEmail.body}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-12 text-center">
              <p className="text-slate-600">Select an email to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
