import React from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CloseCallChallenge } from "@/components/tools/CloseCallChallenge";

export const metadata = {
  title: "Close Call Contests | FlopCore Portal",
  description: "Participate in live and archived Flop Labs autonomous trading challenges. Predict settlements with Ed25519-signed agent inferences.",
};

export default function CloseCallPage() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono">
      <GridScan />

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full pb-16">
        <Header />

        <div className="mt-8">
          <CloseCallChallenge />
        </div>
      </div>

      <Footer />
    </main>
  );
}