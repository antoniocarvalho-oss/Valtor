import { Link } from "wouter";
import ValtorLogo from "@/components/ValtorLogo";

export default function Footer() {
  return (
    <footer className="bg-[#0d1b3e] text-white mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <ValtorLogo dark className="mb-3" />
            <p className="text-sm text-white/60 leading-relaxed">
              Resultados atualizados, números atrasados, estatísticas e gerador de jogos para loterias do Brasil e dos EUA.
            </p>
            <p className="text-xs text-white/40 mt-3 italic">Onde a matemática encontra a sorte.</p>
          </div>

          {/* Resultados */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-white/90">Resultados</h4>
            <ul className="space-y-2">
              {[
                { label: "Mega-Sena", href: "/megasena" },
                { label: "Lotofácil", href: "/lotofacil" },
                { label: "Quina", href: "/quina" },
                { label: "Lotomania", href: "/lotomania" },
                { label: "Timemania", href: "/timemania" },
                { label: "Dupla Sena", href: "/duplasena" },
                { label: "Dia de Sorte", href: "/diadesorte" },
                { label: "Super Sete", href: "/supersete" },
                { label: "+Milionária", href: "/maismilionaria" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ferramentas */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-white/90">Ferramentas</h4>
            <ul className="space-y-2">
              {[
                { label: "Gerador de Jogos", href: "/gerador" },
                { label: "Conferidor", href: "/conferidor" },
                { label: "Simulador", href: "/simulador" },
                { label: "Estatísticas", href: "/megasena/estatisticas" },
                { label: "Importar Jogos", href: "/importar" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Clube */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-white/90">Clube Valtor</h4>
            <ul className="space-y-2">
              {[
                { label: "Planos e Preços", href: "/planos" },
                { label: "Aposta Rápida", href: "/aposta-rapida" },
                { label: "Minha Conta", href: "/clube" },
                { label: "Sobre o Valtor", href: "/sobre" },
                { label: "Termos de Uso", href: "/termos" },
                { label: "Privacidade", href: "/privacidade" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Valtor. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/30 text-center">
            O Valtor é uma plataforma de análise estatística. Não vendemos bilhetes de loteria. Jogue com responsabilidade.
          </p>
        </div>
      </div>
    </footer>
  );
}
