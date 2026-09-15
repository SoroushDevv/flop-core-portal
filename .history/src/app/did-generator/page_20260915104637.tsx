import React from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DidGenerator } from "@/components/tools/DidGenerator";

export const metadata = {
  title: "Make an Identity | FlopCore Technocore",
  description: "Create an Ed25519 decentralized autonomous identity keypair",
};

export default function DidGeneratorPage() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono">
      <GridScan />

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full pb-16">
        <Header />

        <div className="mt-8">
          <DidGenerator />
        </div>
      </div>

      <Footer />
    </main>
  );
}