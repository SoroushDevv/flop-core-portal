import React from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FdvCalculator } from "@/components/tools/FdvCalculator";

export const metadata = {
  title: "$FLOP Valuation & FDV Calculator | FlopCore",
  description: "Tokenomics and market capitalization simulator for the 18.1B $FLOP canonical supply.",
};

export default function CalculatorPage() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono">
      <GridScan />

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full pb-16">
        <Header />

        <div className="mt-8">
          <FdvCalculator />
        </div>
      </div>

      <Footer />
    </main>
  );
}