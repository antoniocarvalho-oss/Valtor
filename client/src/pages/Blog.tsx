import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BLOG_ARTICLES } from "@shared/blogArticles";
import useSEO from "@/hooks/useSEO";
import { Clock, ArrowRight, Tag } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  "Estatísticas": "#2563eb",
  "Estratégias": "#16a34a",
  "Guias": "#9333ea",
  "Loterias Americanas": "#dc2626",
};

export default function Blog() {
  useSEO({
    title: "Blog — Artigos sobre Loterias, Estatísticas e Estratégias | Valtor",
    description: "Artigos sobre loterias da Caixa: estatísticas, estratégias baseadas em dados, guias para iniciantes e comparativos. Conteúdo atualizado pelo Valtor.",
    path: "/blog",
    keywords: "blog loterias, artigos lotofácil, estratégias mega-sena, estatísticas loterias",
  });

  const sortedArticles = [...BLOG_ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const featured = sortedArticles[0];
  const rest = sortedArticles.slice(1);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f] text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-black mb-2">Blog Valtor</h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Artigos sobre loterias da Caixa: estatísticas, estratégias baseadas em dados reais e guias práticos.
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Featured article */}
        {featured && (
          <Link href={`/blog/${featured.slug}`}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer mb-8">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: CATEGORY_COLORS[featured.category] || "#6b7280" }}
                  >
                    {featured.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {featured.readTime} min de leitura
                  </span>
                </div>
                <h2 className="text-2xl font-black text-[#0d1b3e] mb-2">{featured.title}</h2>
                <p className="text-gray-600 mb-4 max-w-3xl">{featured.excerpt}</p>
                <div className="flex items-center gap-2 text-[#2563eb] font-bold text-sm">
                  Ler artigo completo <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Article grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`}>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: CATEGORY_COLORS[article.category] || "#6b7280" }}
                  >
                    {article.category}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {article.readTime} min
                  </span>
                </div>
                <h3 className="font-bold text-[#0d1b3e] mb-2 text-sm leading-snug">{article.title}</h3>
                <p className="text-xs text-gray-500 flex-1 mb-3">{article.excerpt}</p>
                <div className="flex flex-wrap gap-1">
                  {article.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
