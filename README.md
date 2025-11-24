# 🚀 CV Tailor Agent

> AI-powered CV tailoring that gets you hired. Upload your CV, paste a job description, and get a perfectly tailored resume + cover letter in seconds.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama--3.3-orange)](https://groq.com/)



## ✨ Features

- 🤖 **AI-Powered Tailoring** - Uses Groq's Llama-3.3-70b to intelligently match your CV to job requirements
- 📄 **PDF Generation** - Download professional PDFs of your tailored CV and cover letter
- 🎨 **Beautiful UI** - Modern glassmorphism design with smooth animations
- 🔒 **Privacy First** - Your data is processed securely and never stored
- ⚡ **Lightning Fast** - Get results in 10-20 seconds
- 📱 **Responsive** - Works perfectly on desktop, tablet, and mobile

## 🎬 Demo

**Try it live:** [(https://cv-tailor-agent-6eszxbhid-adibuchs-projects.vercel.app)]

### How it works:

1. **Upload** your CV (PDF format)
2. **Paste** the job description
3. **Generate** - AI analyzes and tailors your CV
4. **Download** professional PDFs

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### Backend
- **Groq** - Fast LLM inference (Llama-3.3-70b)
- **Mastra** - AI agent orchestration
- **@react-pdf/renderer** - PDF generation
- **pdf-parse** - PDF text extraction

### Infrastructure
- **Vercel** - Deployment and hosting
- **Bun** - Fast JavaScript runtime

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Groq API key ([get one here](https://console.groq.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cv-tailor-agent.git
   cd cv-tailor-agent
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Add your Groq API key to `.env.local`:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
cv-tailor-agent/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── agent/          # AI agent endpoint
│   │   ├── parse-pdf/      # PDF parsing
│   │   └── generate-pdf/   # PDF generation
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── components/              # React components
│   ├── HeroSection.tsx     # Landing hero
│   ├── UploadSection.tsx   # File upload form
│   ├── ProcessingSection.tsx  # Loading state
│   └── ResultsSection.tsx  # Results display
├── lib/                     # Utilities
│   ├── pdf/                # PDF handling
│   │   ├── parser.ts       # PDF text extraction
│   │   ├── generator.ts    # PDF generation logic
│   │   └── templates/      # PDF templates
│   ├── mastra/             # AI agent
│   │   ├── agent.ts        # Agent config
│   │   ├── tools.ts        # Agent tools
│   │   └── prompts.ts      # System prompts
│   ├── session.ts          # Session management
│   └── utils.ts            # Helper functions
└── public/                  # Static assets
```

## 🎨 Design System

### Colors
- **Primary**: Indigo (#6366F1) → Purple (#8B5CF6) → Blue (#3B82F6)
- **Background**: Dark slate with gradient overlays
- **Accents**: Green (success), Red (errors)

### Key Design Patterns
- **Glassmorphism**: `backdrop-blur-2xl` + `bg-black/40`
- **Gradients**: Purple-blue theme throughout
- **Animations**: Framer Motion for smooth transitions
- **Typography**: Clean, modern sans-serif

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq API key for LLM | ✅ Yes |

### Supported Models

Currently using **Llama-3.3-70b-versatile** for:
- Fast inference (2-3 seconds)
- High quality output
- Cost-effective

## 📦 Building for Production

1. **Build the project**
   ```bash
   bun run build
   ```

2. **Test production build locally**
   ```bash
   bun run start
   ```

3. **Deploy to Vercel**
   ```bash
   vercel deploy
   ```

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cv-tailor-agent)

1. Push to GitHub
2. Import to Vercel
3. Add `GROQ_API_KEY` environment variable
4. Deploy!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👨‍💻 Author

**Adi Buchris**

## 🙏 Acknowledgments

- Built with [Mastra](https://mastra.ai) for AI agent orchestration
- Powered by [Groq](https://groq.com) for lightning-fast inference
- UI inspired by modern SaaS products like Linear, Vercel, and Stripe

---

<div align="center">
  <strong>⭐ Star this repo if you found it helpful!</strong>
  <br>
  <sub>Built with ❤️ by Adi Buchris</sub>
</div>
