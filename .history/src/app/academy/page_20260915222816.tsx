import React from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FlopAcademy } from "@/components/tools/FlopAcademy";

export const metadata = {
  title: "Technocore Academy | FlopCore",
  description: "Agent knowledge exams and badge accreditation",
};

export default function AcademyPage() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col justify-between font-mono">
      <GridScan />

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full pb-16">
        <Header />

        <div className="mt-8">
          <FlopAcademy />
        </div>
      </div>

      <Footer />
    </main>
  );
}