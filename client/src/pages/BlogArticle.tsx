import { useParams, Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getArticleBySlug, getRelatedArticles } from "@shared/blogArticles";
import useSEO from "@/hooks/useSEO";
import { Clock, ArrowLeft, ArrowRight, Tag, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORY_COLORS: Record<string, string> = {
  "Estatísticas": "#2563eb",
  "Estratégias": "#16a34a",
  "Guias": "#9333ea",
  "Loterias Americanas": "#dc2626",
};

export default function BlogArticle() {
  const params = useParams<{ slug: string }>();
  const article = getArticleBySlug(params.slug ?? "");
  const related = article ? getRelatedArticles(article.slug) : [];

  useSEO({
    title: article?.metaTitle ?? "Artigo não encontrado | Valtor",
    description: article?.metaDescription ?? "",
    path: `/blog/${params.slug}`,
    type: "article",
    keywords: article?.tags.join(", ") ?? "",
    schema: article ? {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.metaDescription,
      author: { "@type": "Organization", name: "Valtor" },
      publisher: { "@type": "Organization", name: "Valtor", url: "https://www.valtor.com.br" },
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      mainEntityOfPage: `https://www.valtor.com.br/blog/${article.slug}`,
    } : undefined,
  });

  if (!article) {
    return (
      <div className="min-h-screen bg-[#f0f4f8]">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-black text-[#0d1b3e] mb-4">Artigo não encontrado</h1>
          <p className="text-gray-500 mb-6">O artigo que você procura não existe ou foi removido.</p>
          <Link href="/blog">
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8f] text-white py-12">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <Link href="/"><span className="hover:text-white cursor-pointer">Início</span></Link>
            <ArrowRight className="w-3 h-3" />
            <Link href="/blog"><span className="hover:text-white cursor-pointer">Blog</span></Link>
            <ArrowRight className="w-3 h-3" />
            <span className="text-white/80">{article.category}</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: CATEGORY_COLORS[article.category] || "#6b7280" }}
            >
              {article.category}
            </span>
            <span className="text-xs text-white/60 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readTime} min de leitura
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> {article.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {new Date(article.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Article content */}
          <article className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              {article.sections.map((section, i) => (
                <div key={i} className={i > 0 ? "mt-8" : ""}>
                  <h2 className="text-xl font-black text-[#0d1b3e] mb-3">{section.heading}</h2>
                  <div
                    className="prose prose-sm max-w-none text-gray-700 
                      [&_p]:mb-3 [&_p]:leading-relaxed
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul_li]:mb-1
                      [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol_li]:mb-1
                      [&_a]:text-[#2563eb] [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2
                      [&_strong]:text-[#0d1b3e]
                      [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
                      [&_th]:bg-[#f0f4f8] [&_th]:text-left [&_th]:p-2 [&_th]:text-xs [&_th]:font-bold [&_th]:text-[#0d1b3e] [&_th]:border [&_th]:border-gray-200
                      [&_td]:p-2 [&_td]:text-xs [&_td]:border [&_td]:border-gray-200"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                </div>
              ))}

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span key={tag} className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 bg-gradient-to-r from-[#0d1b3e] to-[#1a3a8f] rounded-xl p-6 text-white">
                <h3 className="font-bold mb-1">Analise seus jogos com dados reais</h3>
                <p className="text-white/70 text-sm mb-4">
                  Use as ferramentas do Valtor para aplicar as estratégias deste artigo.
                </p>
                <div className="flex flex-wrap gap-2">
                  {article.lotterySlug && (
                    <Link href={`/${article.lotterySlug}/estatisticas`}>
                      <Button size="sm" className="bg-white text-[#0d1b3e] hover:bg-gray-100 font-bold text-xs">
                        Ver estatísticas
                      </Button>
                    </Link>
                  )}
                  <Link href="/gerador">
                    <Button size="sm" className="bg-[#f5a623] hover:bg-[#e09610] text-[#0d1b3e] font-bold text-xs">
                      Gerar jogos
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Related articles */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <h3 className="font-bold text-[#0d1b3e] text-sm mb-3">Artigos relacionados</h3>
                <div className="space-y-3">
                  {related.map(r => (
                    <Link key={r.slug} href={`/blog/${r.slug}`}>
                      <div className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[r.category] || "#6b7280" }}
                        >
                          {r.category}
                        </span>
                        <p className="text-xs font-medium text-[#0d1b3e] mt-1 leading-snug">{r.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <h3 className="font-bold text-[#0d1b3e] text-sm mb-3">Ferramentas</h3>
                <div className="space-y-1.5">
                  {[
                    { href: "/gerador", label: "Gerador de Jogos" },
                    { href: "/conferidor", label: "Conferidor" },
                    { href: "/simulador", label: "Simulador" },
                    { href: "/analise", label: "Análise Geral" },
                  ].map(link => (
                    <Link key={link.href} href={link.href}>
                      <div className="text-xs text-[#2563eb] hover:text-[#1d4ed8] cursor-pointer py-0.5 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> {link.label}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Back to blog */}
        <div className="mt-8">
          <Link href="/blog">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar ao blog
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
