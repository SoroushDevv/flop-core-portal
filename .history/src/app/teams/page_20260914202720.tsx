import React from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TeamHub } from "@/components/tools/TeamHub";

export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono">
      <GridScan />
      <div className="max-w-6xl mx-auto px-4 relative z-10 pb-16 w-full">
        <Header />
        <div className="mt-8">
          <TeamHub />
        </div>
      </div>
      <Footer />
    </main>
  );
}