import { createClient } from "./supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export const api = {
  campaigns: {
    list: async () => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/campaigns`, { headers });
      return res.json();
    },
    get: async (id: string) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/campaigns/${id}`, { headers });
      return res.json();
    },
    create: async (data: { name: string; target_url: string }) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/campaigns`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return res.json();
    },
    research: async (id: string) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/campaigns/${id}/research`, {
        method: 'POST',
        headers,
      });
      return res.json();
    },
    generate: async (id: string, data: { product_description: string }) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/campaigns/${id}/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return res.json();
    },
    getEmails: async (id: string) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/campaigns/${id}/emails`, { headers });
      return res.json();
    },
    updateEmail: async (id: string, step: number, data: { subject: string; body: string }) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/campaigns/${id}/emails/${step}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      return res.json();
    },
    sendTest: async (id: string, step: number) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/campaigns/${id}/send-test`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ step_number: step }),
      });
      return res.json();
    },
  },
  analytics: {
    overview: async () => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/analytics/overview`, { headers });
      return res.json();
    },
  },
  settings: {
    get: async () => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/settings`, { headers });
      return res.json();
    },
    update: async (data: any) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
  prospects: {
    list: async (campaignId: string) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/campaigns/${campaignId}/prospects`, { headers });
      return res.json();
    },
  },
  email: {
    test: async (email?: string) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/test-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: email || '' }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to send test email');
      }
      return res.json();
    },
  },
};
