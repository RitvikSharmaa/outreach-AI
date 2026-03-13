# Cold AutoPilot Outreach

**AI-Powered Sales Automation Platform** - Automate your B2B outreach with intelligent company research, contact discovery, and personalized email sequences.

![AutoPilot Dashboard](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)

---

## ✨ Features

### 🤖 AI-Powered Research
- **Automated Company Analysis** - Scrapes and analyzes company websites to extract key information
- **News Intelligence** - Finds recent news, funding rounds, and product launches
- **Contact Discovery** - Uses Hunter.io to find verified email addresses with 90-99% confidence scores

### 📧 Smart Email Campaigns
- **5-Step Email Sequences** - Intro → Value → Social Proof → Reminder → Breakup
- **Personalized Content** - AI generates custom emails based on company research and news
- **SMTP Integration** - Send emails directly from your Gmail account
- **Test Email Feature** - Verify your configuration before launching campaigns

### 📊 Analytics Dashboard
- **Real-time Metrics** - Track campaigns, prospects, emails sent, and open rates
- **Campaign Management** - Create, edit, and monitor multiple outreach campaigns
- **Prospect Tracking** - View all discovered contacts with their titles and departments

### 🔐 Multi-User Support
- **Supabase Authentication** - Secure user registration and login
- **Data Isolation** - Each user has completely isolated campaigns and prospects
- **JWT Token Validation** - Backend validates all requests with user-specific tokens

---

## 🎯 How It Works

1. **Create Campaign** - Enter a company website URL
2. **AI Research** - Agents scrape the website, find news, and discover contacts
3. **Generate Emails** - AI creates a personalized 5-email sequence
4. **Review & Edit** - Customize the generated emails if needed
5. **Launch** - Send test emails or start your campaign

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern, responsive UI design
- **Supabase Client** - Authentication and real-time data

### Backend
- **FastAPI** - High-performance Python API framework
- **Groq AI** - Fast LLM inference for content generation
- **Hunter.io** - Email finding and verification
- **Supabase** - PostgreSQL database with Row Level Security
- **BeautifulSoup & Jina AI** - Web scraping and content extraction

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard](./screenshots/outreach%206.png)
*Track your outreach performance at a glance - view campaigns, prospects, emails sent, and open rates*

### Create new Campaign
![Email Example](./screenshots/outreach%208.png)
*AI-powered campaign setup in seconds - just enter a company URL and let AI do the scraping and research*

### Company Research & Key Contacts
![Prospects](./screenshots/1%20outreach.png)

*Automated company analysis with news intelligence and verified contact discovery*

### View all the prospects from each campaign
![Create Campaign](./screenshots/outreach%207.png)

### AI-Generated Email Sequences
![Email Sequence](./screenshots/outreach%205.png)
*Personalized 5-step email sequences: Intro → Value → Social Proof → Reminder → Breakup*

### Prospects Management
![Company Profile](./screenshots/outreach%204.png)
*Manage all discovered contacts with verified emails, titles, and departments*

### SMTP Configuration & Testing
![Settings](./screenshots/outreach%203.png)
*Easy SMTP setup with one-click test email verification*

### Email Delivery Confirmation
![Email Test](./screenshots/outreach%202.png)
*Successful email configuration test - ready to send personalized campaigns*



---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Supabase account
- Groq API key
- Hunter.io API key
- Gmail account with App Password

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/RitvikSharmaa/outreach-AI.git
cd outreach-AI
```

2. **Set up environment variables**

Create a `.env` file in the root directory:
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# AI
GROQ_API_KEY=your_groq_api_key

# Email Finding
HUNTER_API_KEY=your_hunter_api_key

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_APP_PASSWORD=your_app_password

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

3. **Install dependencies**

Frontend:
```bash
cd frontend
npm install
```

Backend:
```bash
cd backend
pip install -r requirements.txt
```

4. **Set up Supabase database**

Run the SQL schema in your Supabase SQL editor (see `DEPLOY.md` for schema)

5. **Start the development servers**

Frontend (in `frontend/` directory):
```bash
npm run dev
```

Backend (in `backend/` directory):
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

6. **Open the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

---

## 📦 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Add environment variables from `frontend/.env.local`
4. Deploy

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables from `.env`
5. Deploy

---

## 🔑 API Keys Setup

### Groq API Key
1. Go to https://console.groq.com
2. Sign up and create an API key
3. Add to `.env` as `GROQ_API_KEY`

### Hunter.io API Key
1. Go to https://hunter.io
2. Sign up for a free account (50 requests/month)
3. Get your API key from the dashboard
4. Add to `.env` as `HUNTER_API_KEY`

### Gmail App Password
1. Enable 2-Step Verification on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Generate a new app password
4. Add to `.env` as `SMTP_APP_PASSWORD`

---

## 📊 Database Schema

The application uses Supabase (PostgreSQL) with the following tables:
- `campaigns` - Campaign information and research data
- `prospects` - Discovered contacts with email addresses
- `email_sequences` - Generated email templates
- `settings` - User-specific SMTP and profile settings

All tables have Row Level Security (RLS) enabled for multi-user data isolation.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq** - Lightning-fast LLM inference
- **Hunter.io** - Email finding and verification
- **Supabase** - Backend infrastructure and authentication
- **Jina AI** - Web content extraction
- **Vercel** - Frontend hosting
- **Render** - Backend hosting

---

## 📧 Contact

**Ritvik Sharma** - [@RitvikSharmaa](https://github.com/RitvikSharmaa)

Project Link: [https://github.com/RitvikSharmaa/outreach-AI](https://github.com/RitvikSharmaa/outreach-AI)

---

## ⚡ Performance

- **Email Discovery**: 10-15 verified contacts per company
- **Research Speed**: ~30 seconds per company
- **Email Generation**: ~10 seconds for 5-email sequence
- **Confidence Score**: 90-99% email accuracy with Hunter.io

---

## 🔒 Security

- JWT token authentication on all API endpoints
- Row Level Security (RLS) on all database tables
- Environment variables for sensitive data
- HTTPS encryption for all communications
- User-specific data isolation

---

Made with ❤️ by Ritvik Sharma
