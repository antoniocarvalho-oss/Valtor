import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, CheckCheck, Trophy, Target, Info, Volume2, VolumeX } from "lucide-react";
import { Link } from "wouter";

const NOTIFICATION_SOUND_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663436858219/5Sb2Q4HEgP7cWSHaDrz6fk/valtor_notification_600e2763.wav";

const LOTERIA_META: Record<string, { color: string; emoji: string; nome: string }> = {
  megasena:       { color: "#16a34a", emoji: "🍀", nome: "Mega-Sena" },
  lotofacil:      { color: "#7c3aed", emoji: "🎯", nome: "Lotofácil" },
  quina:          { color: "#ea580c", emoji: "🎰", nome: "Quina" },
  lotomania:      { color: "#0ea5e9", emoji: "🌀", nome: "Lotomania" },
  timemania:      { color: "#dc2626", emoji: "⚽", nome: "Timemania" },
  duplasena:      { color: "#d97706", emoji: "🎲", nome: "Dupla Sena" },
  diadesorte:     { color: "#db2777", emoji: "🌸", nome: "Dia de Sorte" },
  supersete:      { color: "#059669", emoji: "7️⃣", nome: "Super Sete" },
  maismilionaria: { color: "#6366f1", emoji: "💎", nome: "+Milionária" },
};

interface NotificationBellProps {
  dark?: boolean;
}

export default function NotificationBell({ dark = false }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("valtor_notif_sound") !== "off";
    }
    return true;
  });
  const ref = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utils = trpc.useUtils();

  // Preload audio
  useEffect(() => {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.5;
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Toggle sound preference
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem("valtor_notif_sound", next ? "on" : "off");
      return next;
    });
  }, []);

  // Play notification sound
  const playSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return;
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Browser may block autoplay — silently ignore
      });
    } catch {
      // Ignore audio errors
    }
  }, [soundEnabled]);

  // Trigger shake + glow animation
  const triggerAnimation = useCallback(() => {
    setShaking(true);
    setGlowing(true);
    setTimeout(() => setShaking(false), 800);
    setTimeout(() => setGlowing(false), 2000);
  }, []);

  const { data: unreadCount } = trpc.notificacoes.contarNaoLidas.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  // Detect new notifications
  useEffect(() => {
    const count = typeof unreadCount === "number" ? unreadCount : 0;
    if (prevCountRef.current !== null && count > prevCountRef.current) {
      // New notifications arrived!
      playSound();
      triggerAnimation();
    }
    prevCountRef.current = count;
  }, [unreadCount, playSound, triggerAnimation]);

  const { data: notificacoes, isLoading } = trpc.notificacoes.listar.useQuery(
    { limit: 20 },
    { enabled: open }
  );

  const marcarLidaMutation = trpc.notificacoes.marcarLida.useMutation({
    onSuccess: () => {
      utils.notificacoes.contarNaoLidas.invalidate();
      utils.notificacoes.listar.invalidate();
    },
  });

  const marcarTodasMutation = trpc.notificacoes.marcarTodasLidas.useMutation({
    onSuccess: () => {
      utils.notificacoes.contarNaoLidas.invalidate();
      utils.notificacoes.listar.invalidate();
    },
  });

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const count = typeof unreadCount === "number" ? unreadCount : 0;

  function getNotifIcon(tipo: string) {
    if (tipo === "premiado") return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (tipo === "resultado") return <Target className="w-4 h-4 text-blue-500" />;
    return <Info className="w-4 h-4 text-gray-400" />;
  }

  function timeAgo(date: Date | string) {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "agora";
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          dark ? "text-white/80 hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"
        } ${shaking ? "animate-bell-shake" : ""}`}
        title="Notificações"
      >
        <div className="relative">
          <Bell className={`w-5 h-5 transition-all duration-300 ${glowing ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" : ""}`} />
          {count > 0 && (
            <span className={`absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 ${
              glowing ? "animate-ping-once" : "animate-pulse"
            }`}>
              {count > 99 ? "99+" : count}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[460px] bg-white rounded-xl border border-gray-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#0d1b3e]/5 to-transparent">
            <h3 className="text-sm font-bold text-[#0d1b3e]">Notificações</h3>
            <div className="flex items-center gap-2">
              {/* Sound toggle */}
              <button
                onClick={toggleSound}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                title={soundEnabled ? "Silenciar notificações" : "Ativar som"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
              {count > 0 && (
                <button
                  onClick={() => marcarTodasMutation.mutate()}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  disabled={marcarTodasMutation.isPending}
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Marcar lidas
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[370px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : !notificacoes || notificacoes.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">Nenhuma notificação</p>
                <p className="text-[11px] text-gray-300 mt-1">Seus resultados aparecerão aqui</p>
              </div>
            ) : (
              notificacoes.map((notif: any) => {
                const meta = notif.loteriaSlug ? LOTERIA_META[notif.loteriaSlug] : null;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 transition-all duration-200 cursor-pointer ${
                      notif.lida ? "bg-white hover:bg-gray-50" : "bg-blue-50/60 hover:bg-blue-50"
                    }`}
                    onClick={() => {
                      if (!notif.lida) marcarLidaMutation.mutate({ id: notif.id });
                    }}
                  >
                    <div className={`mt-0.5 shrink-0 p-1.5 rounded-full ${
                      notif.tipo === "premiado" ? "bg-yellow-50" : notif.tipo === "resultado" ? "bg-blue-50" : "bg-gray-50"
                    }`}>
                      {getNotifIcon(notif.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${notif.lida ? "text-gray-600" : "text-[#0d1b3e] font-semibold"}`}>
                        {notif.titulo}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notif.mensagem}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {meta && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                          >
                            {meta.emoji} {meta.nome}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">{timeAgo(notif.createdAt)}</span>
                        {!notif.lida && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50">
            <Link href="/clube/carteira" onClick={() => setOpen(false)}>
              <span className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                Ver minha carteira →
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes bell-shake {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-12deg); }
          30% { transform: rotate(10deg); }
          40% { transform: rotate(-8deg); }
          50% { transform: rotate(6deg); }
          60% { transform: rotate(-4deg); }
          70% { transform: rotate(2deg); }
          80% { transform: rotate(-1deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-bell-shake {
          animation: bell-shake 0.8s ease-in-out;
          transform-origin: top center;
        }
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-ping-once {
          animation: ping-once 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}
