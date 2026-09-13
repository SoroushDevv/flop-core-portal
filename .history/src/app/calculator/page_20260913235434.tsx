import React from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { FdvCalculator } from "@/components/tools/FdvCalculator";
import { Footer } from "@/components/layout/Footer";
export default function CalculatorPage() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden">
      <GridScan />
      <div className="max-w-6xl mx-auto px-4 relative z-10 pb-20">
        <Header />
        <div className="mt-8">
          <FdvCalculator />
        </div>
      </div>
      <Footer/>
    </main>
  );
}