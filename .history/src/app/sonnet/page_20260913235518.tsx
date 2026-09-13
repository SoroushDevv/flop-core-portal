import React from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { SonnetPortal } from "@/components/tools/SonnetPortal";

export default function SonnetPage() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden">
      <GridScan />
      <div className="max-w-6xl mx-auto px-4 relative z-10 pb-20">
        <Header />
        <div className="mt-8">
          <SonnetPortal />
        </div>
      </div>
      <Footer/>
    </main>
  );
}