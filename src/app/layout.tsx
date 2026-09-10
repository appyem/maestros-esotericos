import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import BottomNavigation from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/features/auth";

import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maestros Esotéricos | Orientación y Guía Espiritual",
  description: "Encuentra orientación profesional y discreta. Consultas de tarot, astrología y guía espiritual con inteligencia artificial y maestros reales.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${playfair.variable} min-h-screen bg-background text-foreground antialiased`}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <footer className="border-t border-border bg-secondary py-8 text-center text-sm text-muted-foreground">
              <div className="mx-auto max-w-7xl px-4">
                <p>© {new Date().getFullYear()} Maestros Esotéricos. Todos los derechos reservados.</p>
                <div className="mt-2 flex justify-center gap-4">
                  <a href="/privacidad" className="hover:text-accent transition-colors">Privacidad</a>
                  <a href="/terminos" className="hover:text-accent transition-colors">Términos</a>
                </div>
              </div>
            </footer>
            <BottomNavigation />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
