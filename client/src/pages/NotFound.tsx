import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />
      <div className="container py-24 text-center">
        <div className="text-8xl font-black text-[#2563eb] mb-4">404</div>
        <h1 className="text-2xl font-bold text-[#0d1b3e] mb-3">Página não encontrada</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white gap-2">
              <Home className="w-4 h-4" /> Ir para o início
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
