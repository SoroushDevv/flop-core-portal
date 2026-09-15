import React from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WorkflowStudio } from "@/components/tools/WorkflowStudio";

export const metadata = {
  title: "Agentic Workflows & Integration Studio | FlopCore",
  description: "Integrate Technocore corridors with Claude MCP, ElizaOS plugins, LangChain, and CrewAI swarms.",
};

export default function WorkflowsPage() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono">
      <GridScan />

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full pb-16">
        <Header />

        <div className="mt-8">
          <WorkflowStudio />
        </div>
      </div>

      <Footer />
    </main>
  );
}