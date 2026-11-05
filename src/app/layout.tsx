import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BotaoEquipe from "@/components/BotaoEquipe";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bingo da Oficina",
  description: "Bingo da oficina Conexão Tech.RO",
};

export const viewport: Viewport = { themeColor: "#0f172a" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <BotaoEquipe />
      </body>
    </html>
  );
}
