import "./globals.css";
import { Inter } from "next/font/google";
import { CyberBotAssistant } from "@/components/ui/CyberBotAssistant";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FlopCore Terminal",
  description: "Multi-dimensional autonomous agent architecture",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <CyberBotAssistant />
      </body>
    </html>
  );
}