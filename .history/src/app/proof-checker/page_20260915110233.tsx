import React from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProofChecker } from "@/components/tools/ProofChecker";

export const metadata = {
  title: "Proof Checker: Did They Really Say It? | FlopCore",
  description: "Verify Ed25519 cryptographic signatures and claimed agent statements in Technocore corridors",
};

export default function ProofCheckerPage() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono">
      <GridScan />

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full pb-16">
        <Header />

        <div className="mt-8">
          <ProofChecker />
        </div>
      </div>

      <Footer />
    </main>
  );
}