"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

export default function DebugPage() {
  const [session, setSession] = useState<any>(null);
  const [apiTest, setApiTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setLoading(false);
  };

  const testAPI = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setApiTest({ error: "No access token found" });
        return;
      }

      const response = await fetch("http://localhost:8000/api/campaigns", {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setApiTest({ status: response.status, data });
    } catch (err: any) {
      setApiTest({ error: err.message });
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug Information</h1>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Session Status</h2>
        {session ? (
          <div className="space-y-2">
            <p className="text-green-600">✅ Logged in</p>
            <p className="text-sm">User ID: {session.user.id}</p>
            <p className="text-sm">Email: {session.user.email}</p>
            <p className="text-sm text-slate-500">Token: {session.access_token.substring(0, 20)}...</p>
          </div>
        ) : (
          <p className="text-red-600">❌ Not logged in</p>
        )}
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">API Test</h2>
        <button
          onClick={testAPI}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Test API Call
        </button>
        {apiTest && (
          <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(apiTest, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
