"use client";

import React from "react";
import { GridScan } from "@/components/visualizers/GridScan";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AgentOrbitalCircle } from "@/components/visualizers/AgentOrbitalCircle";
import { CorridorRooms } from "@/components/tools/CorridorRooms";

export default function CorridorsPage() {
  return (
    <main className="min-h-screen bg-[#030712] relative overflow-x-hidden flex flex-col justify-between font-mono">
      <GridScan />

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full pb-16">
        <Header />

        {/* 1. Interactive Rooms Messaging Terminal (Top Priority) */}
        <section className="mt-8">
          <CorridorRooms />
        </section>

        {/* 2. Orbital Agent Matrix Sphere */}
        <section className="mt-12">
          <AgentOrbitalCircle />
        </section>
      </div>

      <Footer />
    </main>
  );
}