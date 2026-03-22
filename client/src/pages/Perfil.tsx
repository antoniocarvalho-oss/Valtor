import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  User,
  Mail,
  Phone,
  Bell,
  BellOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Crown,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

const LOTERIAS_OPCOES = [
  { slug: "megasena",       label: "Mega-Sena",    color: "#16a34a", emoji: "🍀" },
  { slug: "lotofacil",      label: "Lotofácil",    color: "#7c3aed", emoji: "🎯" },
  { slug: "quina",          label: "Quina",        color: "#ea580c", emoji: "🎰" },
  { slug: "lotomania",      label: "Lotomania",    color: "#0ea5e9", emoji: "🌀" },
  { slug: "timemania",      label: "Timemania",    color: "#dc2626", emoji: "⚽" },
  { slug: "duplasena",      label: "Dupla Sena",   color: "#d97706", emoji: "🎲" },
  { slug: "diadesorte",     label: "Dia de Sorte", color: "#db2777", emoji: "🌸" },
  { slug: "supersete",      label: "Super Sete",   color: "#059669", emoji: "7️⃣" },
  { slug: "maismilionaria", label: "+Milionária",  color: "#6366f1", emoji: "💎" },
];

const HORARIOS = ["06:00","07:00","08:00","09:00","10:00","18:00","19:00","20:00","21:00","22:00"];

export default function Perfil() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: perfil, isLoading, refetch } = trpc.perfil.get.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  const { data: assinatura } = trpc.assinatura.status.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });

  const isPremium = perfil?.layer === "3" || assinatura?.status === "active";

  const updateMutation = trpc.perfil.update.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado!", { description: "Suas informações foram salvas com sucesso." });
      refetch();
    },
    onError: (err) => {
      toast.error("Erro ao salvar", { description: err.message });
    },
  });

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [emailLoterias, setEmailLoterias] = useState<string[]>([]);
  const [emailHorario, setEmailHorario] = useState("08:00");

  useEffect(() => {
    if (perfil) {
      setName(perfil.name ?? "");
      setPhone(perfil.phone ?? "");
      setBio(perfil.bio ?? "");
      setEmailOptIn(perfil.emailOptIn);
      setEmailLoterias(perfil.emailLoterias ?? []);
      setEmailHorario(perfil.emailHorario ?? "08:00");
    }
  }, [perfil]);

  const toggleLoteria = (slug: string) => {
    setEmailLoterias(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleSave = () => {
    updateMutation.mutate({
      name: name || undefined,
      phone: phone || null,
      bio: bio || null,
      emailOptIn,
      emailLoterias: emailLoterias.length > 0 ? emailLoterias : null,
      emailHorario: emailHorario || null,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f0f4f8]">
        <Navbar />
        <div className="container py-24 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-black text-[#0d1b3e] mb-2">Área restrita</h1>
          <p className="text-gray-500 mb-6">Faça login para acessar seu perfil.</p>
          <a href={getLoginUrl()}>
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">Fazer login</Button>
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar />

      {/* Header */}
      <section
        className="py-12 text-white"
        style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1a3a8f 100%)" }}
      >
        <div className="container">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {perfil?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div>
              <h1 className="text-2xl font-black">{perfil?.name ?? "Meu Perfil"}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/60 text-sm">{perfil?.email}</span>
                {isPremium ? (
                  <Badge className="bg-[#f5a623]/20 text-[#f5a623] border-[#f5a623]/40 hover:bg-[#f5a623]/20 text-xs">
                    <Crown className="w-3 h-3 mr-1" /> Premium
                  </Badge>
                ) : (
                  <Badge className="bg-white/10 text-white/60 border-white/20 hover:bg-white/10 text-xs">
                    Gratuito
                  </Badge>
                )}
              </div>
              {perfil?.createdAt && (
                <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Membro desde {new Date(perfil.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Dados pessoais */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <User className="w-5 h-5 text-[#2563eb]" />
                <h2 className="text-lg font-black text-[#0d1b3e]">Dados Pessoais</h2>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        Nome completo
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Seu nome"
                        className="border-gray-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        Telefone / WhatsApp
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="pl-9 border-gray-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      E-mail
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        value={perfil?.email ?? ""}
                        disabled
                        className="pl-9 border-gray-200 bg-gray-50 text-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-400">O e-mail é gerenciado pela sua conta de login e não pode ser alterado aqui.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
                      Sobre você <span className="text-gray-400 font-normal">(opcional)</span>
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre você e suas estratégias favoritas..."
                      className="border-gray-200 resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-400 text-right">{bio.length}/500</p>
                  </div>
                </div>
              )}
            </div>

            {/* Preferências de e-mail */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#2563eb]" />
                  <h2 className="text-lg font-black text-[#0d1b3e]">Notificações por E-mail</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{emailOptIn ? "Ativo" : "Desativado"}</span>
                  <Switch
                    checked={emailOptIn}
                    onCheckedChange={setEmailOptIn}
                  />
                </div>
              </div>

              {emailOptIn ? (
                <div className="space-y-5">
                  <div className="p-3 rounded-lg bg-green-50 border border-green-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-700">
                      Você receberá um e-mail diário com os resultados das loterias selecionadas.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Quais loterias você quer acompanhar?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {LOTERIAS_OPCOES.map(l => {
                        const selected = emailLoterias.includes(l.slug);
                        return (
                          <button
                            key={l.slug}
                            onClick={() => toggleLoteria(l.slug)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                              selected
                                ? "text-white border-transparent shadow-sm"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                            }`}
                            style={selected ? { background: l.color, borderColor: l.color } : {}}
                          >
                            <span>{l.emoji}</span> {l.label}
                          </button>
                        );
                      })}
                    </div>
                    {emailLoterias.length === 0 && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Nenhuma selecionada — você receberá todas as 9 loterias.
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Horário de envio</p>
                    <div className="flex flex-wrap gap-2">
                      {HORARIOS.map(h => (
                        <button
                          key={h}
                          onClick={() => setEmailHorario(h)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            emailHorario === h
                              ? "bg-[#2563eb] text-white border-[#2563eb]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-3">
                  <BellOff className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-500">
                    Notificações desativadas. Ative para receber os resultados diários no seu e-mail.
                  </p>
                </div>
              )}
            </div>

            {/* Botão salvar */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending || isLoading}
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 font-bold"
                size="lg"
              >
                {updateMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status da conta */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-black text-[#0d1b3e] mb-4">Status da Conta</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Plano</span>
                  <span className={`text-sm font-bold ${isPremium ? "text-[#f5a623]" : "text-[#0d1b3e]"}`}>
                    {isPremium ? "Clube Valtor" : "Explorador"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Acesso</span>
                  <span className={`text-sm font-bold ${isPremium ? "text-[#16a34a]" : "text-[#0d1b3e]"}`}>
                    {isPremium ? "✓ Premium Ativo" : "Gratuito"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Função</span>
                  <span className="text-sm font-bold text-[#0d1b3e] capitalize">{perfil?.role}</span>
                </div>
              </div>
              {isPremium ? (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#f5a623]/10 to-[#f5a623]/5 border border-[#f5a623]/20">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#f5a623]" />
                    <div>
                      <p className="text-sm font-bold text-[#0d1b3e]">Assinante Premium</p>
                      <p className="text-xs text-gray-500">Acesso completo a todas as ferramentas</p>
                    </div>
                  </div>
                  {assinatura?.expiresAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Válido até {new Date(assinatura.expiresAt).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              ) : (
                <a href="/planos" className="block mt-4">
                  <Button
                    className="w-full font-bold text-[#0d1b3e] hover:opacity-90"
                    style={{ background: "#f5a623" }}
                  >
                    <Crown className="w-4 h-4 mr-2" /> Assinar Premium
                  </Button>
                </a>
              )}
            </div>

            {/* Resumo de notificações */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-black text-[#0d1b3e] mb-3">Resumo de Notificações</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">E-mails diários</span>
                  <span className={`font-bold ${emailOptIn ? "text-green-600" : "text-gray-400"}`}>
                    {emailOptIn ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Loterias</span>
                  <span className="font-bold text-[#0d1b3e]">
                    {emailLoterias.length === 0 ? "Todas (9)" : `${emailLoterias.length} selecionadas`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Horário</span>
                  <span className="font-bold text-[#0d1b3e]">{emailHorario}</span>
                </div>
              </div>
            </div>

            {/* Dica */}
            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1a3a8f 100%)" }}>
              <p className="text-white/80 text-sm leading-relaxed">
                <span className="text-[#f5a623] font-bold">Dica:</span> Ative as notificações para nunca perder um resultado e receber análises dos números sorteados diretamente no seu e-mail.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
