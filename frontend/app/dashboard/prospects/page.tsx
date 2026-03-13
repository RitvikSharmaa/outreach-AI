"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Loader2, Mail, Briefcase, Building2, Plus, X } from "lucide-react";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase";

// Helper to get auth headers
async function getAuthHeaders() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    };
  }
  
  return {
    'Content-Type': 'application/json'
  };
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingProspect, setAddingProspect] = useState(false);
  const [newProspect, setNewProspect] = useState({
    name: "",
    email: "",
    title: "",
    department: "",
    company_name: "",
    campaign_id: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load campaigns and all prospects in parallel (much faster)
      const [campaignsData, allProspectsData] = await Promise.all([
        api.campaigns.list(),
        fetch('http://localhost:8000/api/prospects/all', {
          headers: await getAuthHeaders()
        }).then(r => r.json()).catch(() => [])
      ]);
      
      const campaignsArray = Array.isArray(campaignsData) ? campaignsData : [];
      setCampaigns(campaignsArray);
      
      // Map campaign names to prospects
      const campaignMap = new Map(campaignsArray.map(c => [c.id, c.name]));
      const prospectsWithCampaigns = (Array.isArray(allProspectsData) ? allProspectsData : []).map((p: any) => ({
        ...p,
        campaign_name: campaignMap.get(p.campaign_id) || 'Unknown'
      }));
      
      setProspects(prospectsWithCampaigns);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddProspect = async () => {
    if (!newProspect.name || !newProspect.email || !newProspect.campaign_id) {
      alert("Please fill in name, email, and select a campaign");
      return;
    }

    setAddingProspect(true);
    try {
      // Create prospect via API
      const response = await fetch(`http://localhost:8000/api/prospects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProspect)
      });

      if (!response.ok) throw new Error('Failed to add prospect');

      // Reload data
      await loadData();
      
      // Reset form and close modal
      setNewProspect({
        name: "",
        email: "",
        title: "",
        department: "",
        company_name: "",
        campaign_id: ""
      });
      setShowAddModal(false);
      alert("Prospect added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add prospect");
    }
    setAddingProspect(false);
  };

  const filteredProspects = prospects.filter(p => {
    const matchesCampaign = selectedCampaign === "all" || p.campaign_id === selectedCampaign;
    const matchesSearch = searchQuery === "" || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCampaign && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "replied": return "text-green-700 bg-green-50 border-green-200";
      case "opened": return "text-blue-700 bg-blue-50 border-blue-200";
      case "contacted": return "text-purple-700 bg-purple-50 border-purple-200";
      case "bounced": return "text-red-700 bg-red-50 border-red-200";
      case "unsubscribed": return "text-slate-700 bg-slate-50 border-slate-200";
      default: return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold"
        >
          <Users size={14} />
          Prospect Management
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-5xl font-bold text-slate-900"
        >
          All Prospects
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 max-w-2xl mx-auto"
        >
          View and manage all prospects across your campaigns
        </motion.p>
      </div>

      {/* Add Prospect Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex justify-end"
      >
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Prospect Manually
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Search
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Search by name, email, or company..."
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Campaign
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-600">
            Showing {filteredProspects.length} of {prospects.length} prospects
          </p>
        </div>
      </motion.div>

      {/* Add Prospect Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Add Prospect Manually</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newProspect.name}
                    onChange={(e) => setNewProspect({...newProspect, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newProspect.email}
                    onChange={(e) => setNewProspect({...newProspect, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newProspect.title}
                    onChange={(e) => setNewProspect({...newProspect, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="VP of Sales"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newProspect.department}
                    onChange={(e) => setNewProspect({...newProspect, department: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Sales"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={newProspect.company_name}
                    onChange={(e) => setNewProspect({...newProspect, company_name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Acme Corp"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Campaign *
                  </label>
                  <select
                    value={newProspect.campaign_id}
                    onChange={(e) => setNewProspect({...newProspect, campaign_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select a campaign</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProspect}
                  disabled={addingProspect}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addingProspect ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Add Prospect
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Prospects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
      >
        {filteredProspects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Title</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Company</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Campaign</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-900">Step</th>
                </tr>
              </thead>
              <tbody>
                {filteredProspects.map((prospect, i) => (
                  <motion.tr
                    key={prospect.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {prospect.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {prospect.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {prospect.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Briefcase size={14} className="text-slate-400" />
                        {prospect.title || "—"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 size={14} className="text-slate-400" />
                        {prospect.company_name || "—"}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-600">
                        {prospect.campaign_name}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(prospect.status)}`}>
                        {prospect.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-600">
                        {prospect.current_step > 0 ? `Email ${prospect.current_step}` : "Not started"}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <Users size={48} className="mx-auto text-slate-400" />
            <h3 className="text-xl font-bold text-slate-900">No prospects found</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              {searchQuery || selectedCampaign !== "all" 
                ? "Try adjusting your filters"
                : "Create a campaign and run research to discover prospects"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
