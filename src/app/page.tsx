"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  FileText, 
  Download, 
  Eye, 
  Search, 
  ArrowRight, 
  Github
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Navigation */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-550/20">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-250 to-slate-400 bg-clip-text text-transparent">
            Smart CV
          </span>
        </div>
        
        <Link href="/cv-builder">
          <Button 
            className="bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl px-5 py-2 text-xs font-semibold backdrop-blur-md transition-all duration-300"
          >
            Start Building
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        
        {/* Badge Banner */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Gen CV Generator</span>
        </div>

        {/* Hero Title */}
        <h1 className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none mb-6">
          Build a Job-Winning Resume <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
            In Seconds, Effortlessly.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="max-w-2xl text-slate-400 text-base sm:text-lg lg:text-xl font-normal leading-relaxed mb-10">
          Create a beautiful, ATS-friendly professional CV with real-time A4 preview. Fully customizable, saved locally, and ready to export instantly.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/cv-builder">
            <Button 
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm px-8 py-6 shadow-xl shadow-indigo-600/30 transition-all duration-350 hover:-translate-y-0.5 hover:shadow-indigo-600/40 flex items-center gap-2 group"
            >
              <span>Start Building CV</span>
              <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Button 
              variant="outline"
              size="lg"
              className="border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl font-semibold text-sm px-6 py-6"
            >
              <Github className="h-4 w-4 mr-2" />
              <span>Star on GitHub</span>
            </Button>
          </a>
        </div>

        {/* App Showcase Preview Mockup */}
        <div className="max-w-5xl w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-3 shadow-2xl relative group/preview">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur-xl opacity-20 group-hover/preview:opacity-25 transition-opacity" />
          
          {/* Top window styling */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800/80 bg-slate-950/80 rounded-t-xl text-[10px] text-slate-500">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-medium">smart-cv-builder.app/cv-builder</span>
          </div>

          {/* Simple Vector Mockup representing the app */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-950 rounded-b-xl min-h-[300px] text-left">
            <div className="md:col-span-5 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div className="h-4 w-1/3 bg-slate-800 rounded-sm" />
              <div className="h-2 w-full bg-slate-900 rounded-sm" />
              <div className="space-y-2 pt-2">
                <div className="h-8 w-full bg-slate-900 rounded-md border border-slate-850" />
                <div className="h-8 w-full bg-slate-900 rounded-md border border-slate-850" />
                <div className="h-16 w-full bg-slate-900 rounded-md border border-slate-850" />
              </div>
            </div>
            <div className="md:col-span-7 border border-slate-800/80 rounded-xl p-4 bg-slate-900/20 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                  <div>
                    <div className="h-5 w-32 bg-slate-200 rounded-sm" />
                    <div className="h-3 w-20 bg-slate-500 rounded-sm mt-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2.5 w-24 bg-slate-600 rounded-sm" />
                    <div className="h-2.5 w-20 bg-slate-600 rounded-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-1/4 bg-slate-400 rounded-sm" />
                  <div className="h-2.5 w-full bg-slate-800 rounded-sm" />
                  <div className="h-2.5 w-5/6 bg-slate-800 rounded-sm" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <div className="h-7 w-24 bg-indigo-500/20 border border-indigo-500/30 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Sections */}
        <section className="max-w-7xl w-full mx-auto mt-28 sm:mt-36">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Designed For High-Performance Job Applications
            </h2>
            <p className="text-slate-455 text-sm sm:text-base mt-3 max-w-xl mx-auto">
              Everything you need in a modern, streamlined tool to land your dream role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            {/* Live Preview */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 hover:bg-slate-900/50 hover:-translate-y-1 transition-all duration-300 group">
              <div className="bg-indigo-550/10 text-indigo-400 p-3 rounded-xl w-fit mb-5 group-hover:scale-105 transition-transform">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-100 text-lg mb-2">Live Preview</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Watch your CV update instantly on an A4 layout sheet side-by-side as you type details.
              </p>
            </div>

            {/* PDF Export */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 hover:bg-slate-900/50 hover:-translate-y-1 transition-all duration-300 group">
              <div className="bg-emerald-550/10 text-emerald-400 p-3 rounded-xl w-fit mb-5 group-hover:scale-105 transition-transform">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-100 text-lg mb-2">PDF Export</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Generate and download highly professional, beautifully styled PDFs with one simple click.
              </p>
            </div>

            {/* ATS Friendly */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 hover:bg-slate-900/50 hover:-translate-y-1 transition-all duration-300 group">
              <div className="bg-violet-550/10 text-violet-400 p-3 rounded-xl w-fit mb-5 group-hover:scale-105 transition-transform">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-100 text-lg mb-2">ATS-Friendly</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Clean layout structures designed to sail smoothly through Applicant Tracking Systems.
              </p>
            </div>

            {/* AI Auto-Improve */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700/80 hover:bg-slate-900/50 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              {/* Badge "Soon" */}
              <span className="absolute top-3 right-3 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                Soon
              </span>
              <div className="bg-amber-550/10 text-amber-400 p-3 rounded-xl w-fit mb-5 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-100 text-lg mb-2">AI Auto-Improve</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Polish bullet points and structure sentences using integrated LLM capability for maximum impact.
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950 py-8 text-center text-xs text-slate-500 relative z-10">
        <p>&copy; {new Date().getFullYear()} Smart CV Builder. Designed with excellence by Horn Vanhong.</p>
      </footer>
    </div>
  );
}
