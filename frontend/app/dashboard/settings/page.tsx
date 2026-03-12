"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Mail, Lock, FileText, Calendar, Settings as SettingsIcon, CheckCircle, Send } from "lucide-react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    full_name: "",
    company_name: "",
    product_description: "",
    calendar_link: "",
    smtp_email: "",
    smtp_app_password: "",
    smtp_host: "smtp.gmail.com",
    smtp_port: 587
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
      setSettings({ ...settings, ...data });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await api.settings.update(settings);
      setMessage("Settings saved successfully!");
      setHasUnsavedChanges(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err.message || "Failed to save settings");
    }
    setSaving(false);
  };

  const handleTestEmail = async () => {
    setTesting(true);
    setTestMessage("");

    try {
      // First save settings if there are unsaved changes
      if (hasUnsavedChanges) {
        await api.settings.update(settings);
        setHasUnsavedChanges(false);
      }

      // Test email by sending to self using API with auth
      const response = await api.email.test(settings.smtp_email);
      setTestMessage("✅ Test email sent successfully! Check your inbox.");
    } catch (err: any) {
      const errorMsg = err.message || "Failed to test email connection";
      setTestMessage("❌ " + errorMsg);
    }

    setTesting(false);
    setTimeout(() => setTestMessage(""), 5000);
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value });
    setHasUnsavedChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold"
        >
          <SettingsIcon size={14} />
          Account Settings
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-5xl font-bold text-slate-900"
        >
          Settings
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 max-w-2xl mx-auto"
        >
          Configure your profile and email sending settings
        </motion.p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4"
        >
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText size={20} />
            Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                value={settings.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Company Name
              </label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Acme Inc"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Product Description
            </label>
            <textarea
              value={settings.product_description}
              onChange={(e) => setSettings({ ...settings, product_description: e.target.value })}
              className="w-full min-h-[100px] p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
              placeholder="Describe what your product/service does. This will be used to personalize emails."
            />
            <p className="text-xs text-slate-500 mt-2">
              Used by AI to generate personalized email content
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
              <Calendar size={14} />
              Calendar Link
            </label>
            <input
              type="url"
              value={settings.calendar_link}
              onChange={(e) => setSettings({ ...settings, calendar_link: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="https://calendly.com/your-link"
            />
            <p className="text-xs text-slate-500 mt-2">
              Calendly, Cal.com, or any booking link for CTAs
            </p>
          </div>
        </motion.div>

        {/* SMTP Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4"
        >
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Mail size={20} />
            Email Sending Configuration
          </h2>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-sm text-slate-700">
              <strong className="text-blue-700">Gmail Setup:</strong> Go to your Google Account → Security → 2-Step Verification → App Passwords. 
              Generate a new app password and paste it below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                SMTP Host
              </label>
              <input
                type="text"
                value={settings.smtp_host}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="smtp.gmail.com"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.smtp_port}
                onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="587"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Email Address
            </label>
            <input
              type="email"
              value={settings.smtp_email}
              onChange={(e) => setSettings({ ...settings, smtp_email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="your-email@gmail.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
              <Lock size={14} />
              App Password
            </label>
            <input
              type="password"
              value={settings.smtp_app_password}
              onChange={(e) => setSettings({ ...settings, smtp_app_password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="••••••••••••••••"
            />
            <p className="text-xs text-slate-500 mt-2">
              Your Gmail app password (not your regular password)
            </p>
          </div>

          {/* Test Email Button */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testing || !settings.smtp_email || !settings.smtp_app_password}
              className="w-full px-6 py-3 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {testing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Test Email Connection
                </>
              )}
            </button>
            {testMessage && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-center mt-2 text-slate-700"
              >
                {testMessage}
              </motion.p>
            )}
            <p className="text-xs text-slate-500 text-center mt-2">
              Sends a test email to verify your SMTP configuration
            </p>
          </div>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${
              message.includes("success")
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {hasUnsavedChanges ? <Save size={20} /> : <CheckCircle size={20} />}
                {hasUnsavedChanges ? 'Save Settings' : 'All Changes Saved'}
              </>
            )}
          </button>
          {hasUnsavedChanges && (
            <p className="text-sm text-slate-500 text-center">
              You have unsaved changes
            </p>
          )}
        </motion.div>
      </form>
    </div>
  );
}
