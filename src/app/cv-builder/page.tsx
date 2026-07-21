"use client";

import React from "react";
import dynamic from "next/dynamic";

// Import CVBuilder dynamically with SSR disabled to prevent hydration errors from localStorage usage
const CVBuilder = dynamic(
  () => import("@/components/CVBuilder").then((mod) => mod.CVBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Loading CV Builder...</p>
        </div>
      </div>
    ),
  }
);

export default function BuilderPage() {
  return <CVBuilder />;
}
