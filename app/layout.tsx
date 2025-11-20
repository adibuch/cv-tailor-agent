import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Tailor Agent | AI-Powered Resume Customization",
  description: "Transform your CV for any job with AI. Upload your resume, paste a job description, and get a perfectly tailored CV + cover letter in seconds.",
  keywords: ["CV", "resume", "AI", "job application", "cover letter", "career"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
