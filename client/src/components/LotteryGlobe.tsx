import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";

// Bola de loteria individual com número
function LotteryBall({
  number,
  color,
  size = 36,
  style,
}: {
  number: number;
  color: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 30%, ${color}ee, ${color}99 60%, ${color}44)`,
        boxShadow: `0 2px 8px ${color}88, inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: size * 0.35,
        color: "#fff",
        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
        flexShrink: 0,
        position: "relative",
        ...style,
      }}
    >
      {/* Brilho superior */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "20%",
          width: "35%",
          height: "20%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.55)",
          filter: "blur(1px)",
          transform: "rotate(-20deg)",
        }}
      />
      {number}
    </div>
  );
}

// Globo central 3D realista
function Globe3D({ children }: { children?: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: 180,
        height: 180,
        flexShrink: 0,
      }}
    >
      {/* Anel externo girando */}
      <div
        style={{
          position: "absolute",
          inset: -12,
          borderRadius: "50%",
          border: "2px solid rgba(37,99,235,0.3)",
          animation: "globeRing1 18s linear infinite",
        }}
      />
      {/* Anel médio girando ao contrário */}
      <div
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: "50%",
          border: "1.5px solid rgba(245,166,35,0.4)",
          animation: "globeRing2 12s linear infinite reverse",
        }}
      />

      {/* Esfera principal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 28%, #2a5cd4 0%, #1a3a8f 40%, #0d1b3e 75%, #060e20 100%)",
          boxShadow:
            "0 20px 60px rgba(13,27,62,0.6), 0 0 40px rgba(37,99,235,0.3), inset 0 -15px 30px rgba(0,0,0,0.5), inset 0 10px 20px rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Linhas de latitude (meridianos) */}
        <svg
          viewBox="0 0 180 180"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.15,
          }}
        >
          {/* Equador */}
          <ellipse cx="90" cy="90" rx="88" ry="25" fill="none" stroke="#60a5fa" strokeWidth="0.8" />
          {/* Trópicos */}
          <ellipse cx="90" cy="60" rx="75" ry="18" fill="none" stroke="#60a5fa" strokeWidth="0.6" />
          <ellipse cx="90" cy="120" rx="75" ry="18" fill="none" stroke="#60a5fa" strokeWidth="0.6" />
          {/* Meridianos */}
          <ellipse cx="90" cy="90" rx="20" ry="88" fill="none" stroke="#60a5fa" strokeWidth="0.6" />
          <ellipse cx="90" cy="90" rx="50" ry="88" fill="none" stroke="#60a5fa" strokeWidth="0.6" />
          <ellipse cx="90" cy="90" rx="75" ry="88" fill="none" stroke="#60a5fa" strokeWidth="0.6" />
        </svg>

        {/* Brilho superior esquerdo */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "15%",
            width: "40%",
            height: "25%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, transparent 70%)",
            transform: "rotate(-15deg)",
          }}
        />

        {/* Reflexo inferior */}
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "15%",
            width: "30%",
            height: "15%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(37,99,235,0.3) 0%, transparent 70%)",
          }}
        />

        {/* Logo Valtor no centro */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {/* V geométrico */}
          <svg width="38" height="32" viewBox="0 0 38 32" fill="none">
            <path
              d="M4 4 L19 28 L34 4"
              stroke="#f5a623"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="4" cy="4" r="2.5" fill="#f5a623" />
            <circle cx="34" cy="4" r="2.5" fill="#f5a623" />
          </svg>
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            VALTOR
          </span>
        </div>
      </div>

      {/* Sombra projetada */}
      <div
        style={{
          position: "absolute",
          bottom: -20,
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: 20,
          borderRadius: "50%",
          background: "rgba(13,27,62,0.25)",
          filter: "blur(8px)",
        }}
      />

      {children}
    </div>
  );
}

// Bolas orbitando ao redor do globo
function OrbitingBalls() {
  const balls = [
    { number: 7, color: "#16a34a", angle: 0, radius: 110, speed: 8 },
    { number: 23, color: "#7c3aed", angle: 72, radius: 120, speed: 10 },
    { number: 41, color: "#ea580c", angle: 144, radius: 105, speed: 7 },
    { number: 15, color: "#2563eb", angle: 216, radius: 115, speed: 9 },
    { number: 33, color: "#16a34a", angle: 288, radius: 108, speed: 11 },
  ];

  const [angles, setAngles] = useState(balls.map((b) => b.angle));

  useEffect(() => {
    let frame: number;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setAngles((prev) =>
        prev.map((a, i) => (a + (360 / balls[i].speed) * dt) % 360)
      );
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: -70,
        pointerEvents: "none",
      }}
    >
      {balls.map((ball, i) => {
        const rad = (angles[i] * Math.PI) / 180;
        const cx = 70 + 180 / 2;
        const cy = 70 + 180 / 2;
        const x = cx + Math.cos(rad) * (ball.radius / 2) - 18;
        const y = cy + Math.sin(rad) * (ball.radius / 2.8) - 18;
        const scale = 0.7 + 0.3 * ((Math.sin(rad) + 1) / 2);
        const zIndex = Math.sin(rad) > 0 ? 10 : 1;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              zIndex,
              transform: `scale(${scale})`,
              opacity: 0.5 + 0.5 * scale,
              transition: "none",
            }}
          >
            <LotteryBall number={ball.number} color={ball.color} size={36} />
          </div>
        );
      })}
    </div>
  );
}

// Componente principal exportado
export default function LotteryGlobe() {
  const { data: mega } = trpc.concursos.ultimo.useQuery({ loteriaSlug: "mega-sena" });
  const { data: lotofacil } = trpc.concursos.ultimo.useQuery({ loteriaSlug: "lotofacil" });
  const { data: quina } = trpc.concursos.ultimo.useQuery({ loteriaSlug: "quina" });

  const lotteries = [
    {
      slug: "mega-sena",
      name: "Mega-Sena",
      bg: "linear-gradient(135deg, #16a34a, #15803d)",
      shadow: "0 8px 24px rgba(22,163,74,0.4)",
      schedule: "Ter, Qui e Sáb • 21h00",
      prize: mega?.premioAcumulado
        ? "Acumulado!"
        : mega
        ? formatCurrency((mega.ganhadores as any)?.[0]?.premio ?? 0)
        : "...",
      concurso: mega?.numero,
      icon: "🍀",
    },
    {
      slug: "lotofacil",
      name: "Lotofácil",
      bg: "linear-gradient(135deg, #7c3aed, #6d28d9)",
      shadow: "0 8px 24px rgba(124,58,237,0.4)",
      schedule: "Seg a Sáb • 21h00",
      prize: lotofacil
        ? formatCurrency((lotofacil.ganhadores as any)?.[0]?.premio ?? 0)
        : "...",
      concurso: lotofacil?.numero,
      icon: "🎯",
    },
    {
      slug: "quina",
      name: "Quina",
      bg: "linear-gradient(135deg, #ea580c, #c2410c)",
      shadow: "0 8px 24px rgba(234,88,12,0.4)",
      schedule: "Seg a Sáb • 21h00",
      prize: quina?.premioAcumulado
        ? "Acumulado!"
        : quina
        ? formatCurrency((quina.ganhadores as any)?.[0]?.premio ?? 0)
        : "...",
      concurso: quina?.numero,
      icon: "🎰",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        width: "100%",
        maxWidth: 380,
      }}
    >
      {/* Globo com bolas orbitando */}
      <div style={{ position: "relative", width: 320, height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <OrbitingBalls />
        <Globe3D />
      </div>

      {/* Cards das loterias */}
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        {lotteries.map((lottery) => (
          <Link href={`/${lottery.slug}`} key={lottery.slug} style={{ flex: 1, textDecoration: "none" }}>
            <div
              style={{
                background: lottery.bg,
                boxShadow: lottery.shadow,
                borderRadius: 16,
                padding: "12px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "#fff",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px) scale(1.03)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "none";
              }}
            >
              <span style={{ fontSize: 22, marginBottom: 4 }}>{lottery.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 900, textAlign: "center", lineHeight: 1.2 }}>
                {lottery.name}
              </span>
              <span style={{ fontSize: 9, opacity: 0.8, textAlign: "center", lineHeight: 1.3, marginTop: 2 }}>
                {lottery.schedule}
              </span>
              <div
                style={{
                  marginTop: 8,
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 20,
                  padding: "3px 8px",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {lottery.prize}
                </span>
              </div>
              {lottery.concurso && (
                <span style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>
                  Concurso {lottery.concurso}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* CSS para animações dos anéis */}
      <style>{`
        @keyframes globeRing1 {
          from { transform: rotate(0deg) rotateX(70deg); }
          to { transform: rotate(360deg) rotateX(70deg); }
        }
        @keyframes globeRing2 {
          from { transform: rotate(0deg) rotateX(50deg) rotateY(20deg); }
          to { transform: rotate(360deg) rotateX(50deg) rotateY(20deg); }
        }
      `}</style>
    </div>
  );
}
