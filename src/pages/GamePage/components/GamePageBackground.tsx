/**
 * GamePageBackground
 *
 * Full-viewport animated backdrop tailored to each individual game.
 *
 * Layers (back → front):
 *   1. Blurred/faded cover art  – ambient colour wash unique to each game
 *   2. Readability overlay      – darkens/lightens for legible text
 *   3. Game-specific SVG motif  – low-opacity animated shapes from the game's universe
 *   4. Edge vignette            – draws the eye inward
 *
 * "page"   mode → position:fixed   (covers viewport, behind AppShell content)
 * "widget" mode → position:absolute (fills the widget container)
 */
import { Box } from "@mui/material";
import type { Game } from "../../../lib/types";
import { getGameAccent } from "../../../lib/gameTheme";

// ── Motif catalogue ──────────────────────────────────────────────────────────
type MotifType =
  | "crosshair" // 007 First Light  – spy targeting reticle
  | "storm_eye" // Fortnite          – expanding storm rings
  | "digital_rain" // Cyberpunk         – neon code falling columns
  | "radiation" // Fallout 5         – rotating trefoil symbol
  | "diamond_spike" // VALORANT          – expanding spike diamonds
  | "hex_grid" // Overwatch 2       – hexagonal UI honeycomb
  | "ring_close" // Apex Legends      – the ring converging arcs
  | "tech_mandala" // Warframe          – Orokin rotary tech circles
  | "pokeball" // Pokémon           – Pokéball geometry
  | "city_grid" // GTA VI            – perspective city-street grid
  | "arcane_star" // Dota 2            – hexagram / magic circle
  | "concentric_rings" // season / dlc fallback
  | "circuit" // update fallback
  | "sparkles" // event fallback
  | "orbs"; // default / full_game fallback

const GAME_MOTIFS: Record<string, MotifType> = {
  "gta-vi": "city_grid",
  "007-first-light": "crosshair",
  "cyberpunk-sequel": "digital_rain",
  "fallout-5": "radiation",
  "fortnite-season-next": "storm_eye",
  "overwatch-2-season-next": "hex_grid",
  "apex-legends-season-next": "ring_close",
  "valorant-next-act": "diamond_spike",
  "warframe-next-major-update": "tech_mandala",
  "dota-2-season-next": "arcane_star",
  "pokemon-pokopia": "pokeball",
};

const CATEGORY_MOTIFS: Record<string, MotifType> = {
  full_game: "orbs",
  dlc: "concentric_rings",
  season: "concentric_rings",
  event: "sparkles",
  update: "circuit",
  store_reset: "concentric_rings",
  other: "orbs",
};

// All CSS keyframes – prefixed rr- to avoid naming collisions
const KEYFRAMES = `
  @keyframes rr-cw    { to   { transform:rotate(360deg);  } }
  @keyframes rr-ccw   { to   { transform:rotate(-360deg); } }
  @keyframes rr-pulse { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:1;transform:scale(1.07)} }
  @keyframes rr-storm { 0%{transform:scale(.04);opacity:.85} 100%{transform:scale(1);opacity:0} }
  @keyframes rr-rain  { 0%{transform:translateY(-60px);opacity:0} 15%,85%{opacity:1} 100%{transform:translateY(230px);opacity:0} }
  @keyframes rr-dia   { 0%{transform:scale(.04)rotate(45deg);opacity:.9} 100%{transform:scale(1)rotate(45deg);opacity:0} }
  @keyframes rr-hex   { 0%,100%{opacity:.07} 50%{opacity:.5} }
  @keyframes rr-ring  { 0%{stroke-dashoffset:565} 100%{stroke-dashoffset:0} }
  @keyframes rr-spark { 0%,100%{opacity:0;transform:scale(0)rotate(0deg)} 50%{opacity:.9;transform:scale(1)rotate(72deg)} }
  @keyframes rr-orb-a { 0%{transform:translate(0,0)scale(1)} 33%{transform:translate(5%,8%)scale(1.07)} 66%{transform:translate(-3%,4%)scale(.95)} 100%{transform:translate(0,0)scale(1)} }
  @keyframes rr-orb-b { 0%{transform:translate(0,0)scale(1)} 33%{transform:translate(-6%,-5%)scale(1.06)} 66%{transform:translate(3%,-7%)scale(.93)} 100%{transform:translate(0,0)scale(1)} }
  @keyframes rr-orb-c { 0%{transform:translate(0,0)scale(1)} 33%{transform:translate(4%,-5%)scale(1.09)} 66%{transform:translate(-4%,3%)scale(.96)} 100%{transform:translate(0,0)scale(1)} }
  @keyframes rr-rings { 0%,100%{opacity:.38;transform:scale(1)} 50%{opacity:.65;transform:scale(1.02)} }
  @keyframes rr-circuit { 0%{stroke-dashoffset:260} 100%{stroke-dashoffset:0} }
  @keyframes rr-bgdrift { 0%{transform:scale(1)translate(0,0)} 33%{transform:scale(1.04)translate(-1%,1%)} 66%{transform:scale(1.06)translate(1%,-1%)} 100%{transform:scale(1.04)translate(-.5%,.5%)} }
`;

// ── SVG geometry helpers ─────────────────────────────────────────────────────
const d2r = (deg: number) => (deg * Math.PI) / 180;

/** Flat-top hexagon polygon points string centred at (cx, cy) with radius r */
function hexPts(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = d2r(30 + i * 60);
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

// ── Per-game SVG motif content ────────────────────────────────────────────────

function CrosshairSVG({ c }: { c: string }) {
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = d2r(i * 15);
    const r1 = i % 6 === 0 ? 75 : i % 3 === 0 ? 80 : 83;
    return (
      <line
        key={i}
        x1={100 + r1 * Math.cos(a)}
        y1={100 + r1 * Math.sin(a)}
        x2={100 + 87 * Math.cos(a)}
        y2={100 + 87 * Math.sin(a)}
        stroke={c}
        strokeWidth={i % 6 === 0 ? 1.8 : 0.8}
      />
    );
  });
  return (
    <>
      <g
        style={{
          transformBox: "view-box" as const,
          transformOrigin: "100px 100px",
          animation: "rr-cw 50s linear infinite",
        }}
      >
        <circle cx={100} cy={100} r={87} stroke={c} strokeWidth={0.7} fill="none" />
        {ticks}
      </g>
      <line x1={100} y1={2} x2={100} y2={198} stroke={c} strokeWidth={0.5} strokeDasharray="3 5" />
      <line x1={2} y1={100} x2={198} y2={100} stroke={c} strokeWidth={0.5} strokeDasharray="3 5" />
      <circle cx={100} cy={100} r={22} stroke={c} strokeWidth={0.8} fill="none" />
      <g
        style={{
          transformBox: "view-box" as const,
          transformOrigin: "100px 100px",
          animation: "rr-ccw 25s linear infinite",
        }}
      >
        <circle
          cx={100}
          cy={100}
          r={55}
          stroke={c}
          strokeWidth={0.5}
          strokeDasharray="6 5"
          fill="none"
        />
      </g>
      <g
        style={{
          transformBox: "view-box" as const,
          transformOrigin: "100px 100px",
          animation: "rr-pulse 3s ease-in-out infinite",
        }}
      >
        <circle cx={100} cy={100} r={5} fill={c} />
        <circle cx={100} cy={100} r={2.5} fill={c} opacity={0.5} />
      </g>
    </>
  );
}

function StormEyeSVG({ c }: { c: string }) {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle
          key={i}
          cx={100}
          cy={100}
          r={90}
          stroke={c}
          strokeWidth={2}
          fill="none"
          style={{
            transformBox: "view-box" as const,
            transformOrigin: "100px 100px",
            animation: `rr-storm 6s ease-out ${i}s infinite`,
          }}
        />
      ))}
      <circle cx={100} cy={100} r={20} stroke={c} strokeWidth={1.5} fill="none" />
      <circle cx={100} cy={100} r={8} stroke={c} strokeWidth={1} fill="none" />
      <circle cx={100} cy={100} r={3} fill={c} />
    </>
  );
}

function DigitalRainSVG({ c }: { c: string }) {
  const cols = [10, 35, 60, 85, 110, 135, 160, 185];
  return (
    <>
      {cols.map((x, ci) => (
        <g
          key={ci}
          style={{ animation: `rr-rain ${4 + ci * 0.65}s linear ${ci * -1.1}s infinite` }}
        >
          {Array.from({ length: 7 }, (_, si) => (
            <rect
              key={si}
              x={x - 3}
              y={-10 + si * 30}
              width={6}
              height={16}
              rx={1}
              fill={c}
              opacity={Math.max(0.1, 0.65 - si * 0.07)}
            />
          ))}
        </g>
      ))}
      <g style={{ animation: "rr-rain 9s linear infinite" }}>
        <rect x={0} y={0} width={200} height={2} fill={c} opacity={0.9} />
      </g>
    </>
  );
}

function RadiationSVG({ c }: { c: string }) {
  // Annular sector blade: outer pts at 240° and 300° (r=78), inner pts (r=22), cx=cy=100
  const blade = "M 61,32 A 78,78 0 0 1 139,32 L 111,81 A 22,22 0 0 0 89,81 Z";
  return (
    <>
      {[55, 72, 90].map((r, i) => (
        <circle
          key={i}
          cx={100}
          cy={100}
          r={r}
          stroke={c}
          strokeWidth={0.7}
          fill="none"
          opacity={0.4}
          style={{
            transformBox: "view-box" as const,
            transformOrigin: "100px 100px",
            animation: `rr-storm 4.5s ease-out ${i * 1.5}s infinite`,
          }}
        />
      ))}
      <g
        style={{
          transformBox: "view-box" as const,
          transformOrigin: "100px 100px",
          animation: "rr-cw 22s linear infinite",
        }}
      >
        <path d={blade} fill={c} />
        <path d={blade} fill={c} transform="rotate(120 100 100)" />
        <path d={blade} fill={c} transform="rotate(240 100 100)" />
        <circle cx={100} cy={100} r={12} fill={c} />
      </g>
    </>
  );
}

function DiamondSpikeSVG({ c }: { c: string }) {
  const circ = 2 * Math.PI * 45;
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={100 - 85}
          y={100 - 85}
          width={170}
          height={170}
          fill="none"
          stroke={c}
          strokeWidth={1.2}
          style={{
            transformBox: "view-box" as const,
            transformOrigin: "100px 100px",
            animation: `rr-dia 5s ease-out ${i * 1.25}s infinite`,
          }}
        />
      ))}
      <rect
        x={100 - 82}
        y={100 - 82}
        width={164}
        height={164}
        fill="none"
        stroke={c}
        strokeWidth={0.7}
        transform="rotate(45 100 100)"
      />
      <circle
        cx={100}
        cy={100}
        r={45}
        stroke={c}
        strokeWidth={1}
        fill="none"
        strokeDasharray={`${circ}`}
        style={{
          transformBox: "view-box" as const,
          transformOrigin: "100px 100px",
          animation: "rr-ring 4s ease-in-out infinite",
        }}
      />
      <line x1={100} y1={35} x2={100} y2={165} stroke={c} strokeWidth={0.7} />
      <line x1={35} y1={100} x2={165} y2={100} stroke={c} strokeWidth={0.7} />
      <rect x={95} y={95} width={10} height={10} fill={c} transform="rotate(45 100 100)" />
    </>
  );
}

function HexGridSVG({ c }: { c: string }) {
  const r = 26;
  const dist = r * Math.sqrt(3);
  const centres: [number, number][] = [
    [100, 100],
    [100 + dist, 100],
    [100 + dist * 0.5, 100 + dist * 0.866],
    [100 - dist * 0.5, 100 + dist * 0.866],
    [100 - dist, 100],
    [100 - dist * 0.5, 100 - dist * 0.866],
    [100 + dist * 0.5, 100 - dist * 0.866],
  ];
  return (
    <>
      {centres.map(([cx, cy], i) => (
        <polygon
          key={i}
          points={hexPts(cx, cy, r)}
          fill={c}
          stroke={c}
          strokeWidth={0.8}
          style={{ animation: `rr-hex ${2.5 + i * 0.65}s ease-in-out ${i * -0.9}s infinite` }}
        />
      ))}
      <polygon
        points={hexPts(100, 100, r * 0.45)}
        fill={c}
        opacity={0.3}
        style={{ animation: "rr-pulse 4s ease-in-out infinite" }}
      />
    </>
  );
}

function RingCloseSVG({ c }: { c: string }) {
  const c88 = 2 * Math.PI * 88;
  const c65 = 2 * Math.PI * 65;
  const c45 = 2 * Math.PI * 45;
  return (
    <>
      <circle
        cx={100}
        cy={100}
        r={88}
        stroke={c}
        strokeWidth={2.5}
        fill="none"
        strokeDasharray={`${c88 * 0.78} ${c88 * 0.22}`}
        style={{
          transformBox: "view-box" as const,
          transformOrigin: "100px 100px",
          animation: "rr-cw 18s linear infinite",
        }}
      />
      <circle
        cx={100}
        cy={100}
        r={65}
        stroke={c}
        strokeWidth={1.5}
        fill="none"
        strokeDasharray={`${c65 * 0.6} ${c65 * 0.4}`}
        style={{
          transformBox: "view-box" as const,
          transformOrigin: "100px 100px",
          animation: "rr-ccw 13s linear infinite",
        }}
      />
      <circle
        cx={100}
        cy={100}
        r={45}
        stroke={c}
        strokeWidth={1}
        fill="none"
        strokeDasharray={`${c45}`}
        style={{
          transformBox: "view-box" as const,
          transformOrigin: "100px 100px",
          animation: "rr-ring 7s ease-in-out infinite",
        }}
      />
      {[0, 90, 180, 270].map((angle) => {
        const a = d2r(angle);
        return (
          <circle
            key={angle}
            cx={100 + 88 * Math.cos(a)}
            cy={100 + 88 * Math.sin(a)}
            r={3}
            fill={c}
          />
        );
      })}
    </>
  );
}

function TechMandalaSVG({ c }: { c: string }) {
  const outerTicks = Array.from({ length: 36 }, (_, i) => {
    const a = d2r(i * 10);
    const r1 = i % 9 === 0 ? 75 : i % 3 === 0 ? 79 : 82;
    return (
      <line
        key={i}
        x1={100 + r1 * Math.cos(a)}
        y1={100 + r1 * Math.sin(a)}
        x2={100 + 86 * Math.cos(a)}
        y2={100 + 86 * Math.sin(a)}
        stroke={c}
        strokeWidth={i % 9 === 0 ? 1.6 : 0.7}
      />
    );
  });
  const innerTicks = Array.from({ length: 12 }, (_, i) => {
    const a = d2r(i * 30);
    return (
      <line
        key={i}
        x1={100 + 35 * Math.cos(a)}
        y1={100 + 35 * Math.sin(a)}
        x2={100 + 44 * Math.cos(a)}
        y2={100 + 44 * Math.sin(a)}
        stroke={c}
        strokeWidth={1}
      />
    );
  });
  return (
    <>
      <circle cx={100} cy={100} r={86} stroke={c} strokeWidth={0.6} fill="none" />
      {outerTicks}
      <g
        style={{
          transformBox: "view-box" as const,
          transformOrigin: "100px 100px",
          animation: "rr-ccw 35s linear infinite",
        }}
      >
        <circle
          cx={100}
          cy={100}
          r={65}
          stroke={c}
          strokeWidth={0.6}
          fill="none"
          strokeDasharray="4 4"
        />
      </g>
      <g
        style={{
          transformBox: "view-box" as const,
          transformOrigin: "100px 100px",
          animation: "rr-cw 22s linear infinite",
        }}
      >
        <circle cx={100} cy={100} r={44} stroke={c} strokeWidth={0.8} fill="none" />
        {innerTicks}
        {Array.from({ length: 6 }, (_, i) => {
          const a = d2r(i * 60);
          return (
            <line
              key={i}
              x1={100 + 20 * Math.cos(a)}
              y1={100 + 20 * Math.sin(a)}
              x2={100 + 36 * Math.cos(a)}
              y2={100 + 36 * Math.sin(a)}
              stroke={c}
              strokeWidth={2.8}
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle cx={100} cy={100} r={6} stroke={c} strokeWidth={1} fill="none" />
      <circle cx={100} cy={100} r={2.5} fill={c} />
    </>
  );
}

function PokeballSVG({ c }: { c: string }) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = d2r(i * 30);
    return (
      <line
        key={i}
        x1={100 + 83 * Math.cos(a)}
        y1={100 + 83 * Math.sin(a)}
        x2={100 + 88 * Math.cos(a)}
        y2={100 + 88 * Math.sin(a)}
        stroke={c}
        strokeWidth={1.2}
      />
    );
  });
  return (
    <g
      style={{
        transformBox: "view-box" as const,
        transformOrigin: "100px 100px",
        animation: "rr-cw 60s linear infinite",
      }}
    >
      <circle cx={100} cy={100} r={88} stroke={c} strokeWidth={1.5} fill="none" />
      {ticks}
      <line x1={12} y1={100} x2={188} y2={100} stroke={c} strokeWidth={1.5} />
      <circle cx={100} cy={100} r={22} stroke={c} strokeWidth={1.5} fill="none" />
      <circle cx={100} cy={100} r={10} stroke={c} strokeWidth={1} fill="none" />
      <circle cx={100} cy={100} r={5} fill={c} />
    </g>
  );
}

function CityGridSVG({ c }: { c: string }) {
  // Perspective city-street grid – fan lines from vanishing point (100,58)
  const vx = 100,
    vy = 58;
  const fanXs = [0, 25, 50, 75, 100, 125, 150, 175, 200];
  const streetY = [85, 108, 132, 158, 188];
  const fanX = (bx: number, y: number) => vx + ((bx - vx) * (y - vy)) / (200 - vy);
  return (
    <g
      style={{
        transformBox: "view-box" as const,
        transformOrigin: "100px 100px",
        animation: "rr-cw 120s linear infinite",
      }}
    >
      {fanXs.map((bx, i) => (
        <line key={i} x1={vx} y1={vy} x2={bx} y2={200} stroke={c} strokeWidth={0.6} />
      ))}
      {streetY.map((y, i) => (
        <line
          key={i}
          x1={fanX(0, y)}
          y1={y}
          x2={fanX(200, y)}
          y2={y}
          stroke={c}
          strokeWidth={0.6}
        />
      ))}
      <circle cx={vx} cy={vy} r={2.5} fill={c} />
    </g>
  );
}

function ArcaneStarSVG({ c }: { c: string }) {
  // Hexagram: two equilateral triangles inscribed in radius=80, centred at (100,100)
  return (
    <>
      {[40, 60, 80].map((r, i) => (
        <circle
          key={i}
          cx={100}
          cy={100}
          r={r}
          stroke={c}
          strokeWidth={0.6}
          fill="none"
          strokeDasharray={i === 1 ? "4 3" : undefined}
        />
      ))}
      <g
        style={{
          transformBox: "view-box" as const,
          transformOrigin: "100px 100px",
          animation: "rr-cw 40s linear infinite",
        }}
      >
        <polygon points="100,20 169,140 31,140" fill="none" stroke={c} strokeWidth={1.2} />
        <polygon points="100,180 31,60 169,60" fill="none" stroke={c} strokeWidth={1.2} />
      </g>
      <circle cx={100} cy={100} r={8} stroke={c} strokeWidth={1} fill="none" />
      <circle cx={100} cy={100} r={3} fill={c} />
    </>
  );
}

function ConcentricRingsSVG({ c }: { c: string }) {
  return (
    <>
      {[25, 42, 58, 73, 86].map((r, i) => (
        <circle
          key={i}
          cx={100}
          cy={100}
          r={r}
          stroke={c}
          strokeWidth={0.8}
          fill="none"
          style={{
            transformBox: "view-box" as const,
            transformOrigin: "100px 100px",
            animation: `rr-rings ${3 + i * 0.6}s ease-in-out ${i * -0.5}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function CircuitSVG({ c }: { c: string }) {
  const paths = [
    "M 30,100 L 60,100 L 60,60 L 100,60",
    "M 170,100 L 140,100 L 140,140 L 100,140",
    "M 100,30 L 100,60",
    "M 100,170 L 100,140",
    "M 60,100 L 60,140 L 100,140",
    "M 140,100 L 140,60 L 100,60",
  ];
  const nodes: [number, number][] = [
    [60, 100],
    [140, 100],
    [60, 60],
    [140, 60],
    [60, 140],
    [140, 140],
    [100, 60],
    [100, 140],
  ];
  return (
    <>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={c}
          strokeWidth={1.2}
          fill="none"
          strokeDasharray={80}
          style={{ animation: `rr-circuit 4s ease-in-out ${i * 0.6}s infinite` }}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={3}
          fill={c}
          style={{ animation: `rr-pulse ${2 + (i % 3) * 0.4}s ease-in-out ${i * -0.3}s infinite` }}
        />
      ))}
    </>
  );
}

function SparklesSVG({ c }: { c: string }) {
  const stars: [number, number, number, number][] = [
    [40, 40, 12, 0],
    [160, 50, 8, 0.8],
    [80, 160, 10, 1.6],
    [150, 155, 13, 2.4],
    [100, 80, 7, 1.2],
    [50, 110, 9, 3.0],
  ];
  const starPath = (r: number) => {
    const s = r * 0.4;
    return `M 0,${-r} L ${s},${-s} L ${r},0 L ${s},${s} L 0,${r} L ${-s},${s} L ${-r},0 L ${-s},${-s} Z`;
  };
  return (
    <>
      {stars.map(([cx, cy, r, delay], i) => (
        <g key={i} transform={`translate(${cx},${cy})`}>
          <path
            d={starPath(r)}
            fill={c}
            style={{
              transformBox: "fill-box" as const,
              transformOrigin: "center",
              animation: `rr-spark ${2.5 + (i % 3) * 0.4}s ease-in-out ${delay}s infinite`,
            }}
          />
        </g>
      ))}
    </>
  );
}

function OrbsSVG({ c }: { c: string }) {
  return (
    <>
      <defs>
        <radialGradient id="rr-og" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c} stopOpacity={1} />
          <stop offset="100%" stopColor={c} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle
        cx={30}
        cy={30}
        r={90}
        fill="url(#rr-og)"
        style={{
          transformBox: "fill-box" as const,
          transformOrigin: "center",
          animation: "rr-orb-a 28s ease-in-out infinite",
        }}
      />
      <circle
        cx={170}
        cy={170}
        r={75}
        fill="url(#rr-og)"
        style={{
          transformBox: "fill-box" as const,
          transformOrigin: "center",
          animation: "rr-orb-b 22s ease-in-out infinite",
        }}
      />
      <circle
        cx={110}
        cy={90}
        r={55}
        fill="url(#rr-og)"
        style={{
          transformBox: "fill-box" as const,
          transformOrigin: "center",
          animation: "rr-orb-c 17s ease-in-out infinite",
        }}
      />
    </>
  );
}

function MotifSVG({ motif, c }: { motif: MotifType; c: string }) {
  switch (motif) {
    case "crosshair":
      return <CrosshairSVG c={c} />;
    case "storm_eye":
      return <StormEyeSVG c={c} />;
    case "digital_rain":
      return <DigitalRainSVG c={c} />;
    case "radiation":
      return <RadiationSVG c={c} />;
    case "diamond_spike":
      return <DiamondSpikeSVG c={c} />;
    case "hex_grid":
      return <HexGridSVG c={c} />;
    case "ring_close":
      return <RingCloseSVG c={c} />;
    case "tech_mandala":
      return <TechMandalaSVG c={c} />;
    case "pokeball":
      return <PokeballSVG c={c} />;
    case "city_grid":
      return <CityGridSVG c={c} />;
    case "arcane_star":
      return <ArcaneStarSVG c={c} />;
    case "concentric_rings":
      return <ConcentricRingsSVG c={c} />;
    case "circuit":
      return <CircuitSVG c={c} />;
    case "sparkles":
      return <SparklesSVG c={c} />;
    default:
      return <OrbsSVG c={c} />;
  }
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  game: Game;
  coverUrl: string | null;
  isDark: boolean;
  mode?: "page" | "widget";
}

export function GamePageBackground({ game, coverUrl, isDark, mode = "page" }: Props) {
  const isFixed = mode === "page";
  const accent = getGameAccent(game);
  const motif: MotifType = GAME_MOTIFS[game.id] ?? CATEGORY_MOTIFS[game.category.type] ?? "orbs";

  const coverOpacity = isDark ? 0.13 : 0.07;
  const motifOpacity = isDark ? 0.14 : 0.09;
  const overlayBg = isDark
    ? "linear-gradient(180deg,rgba(10,10,15,0.74) 0%,rgba(10,10,15,0.58) 100%)"
    : "linear-gradient(180deg,rgba(255,255,255,0.80) 0%,rgba(255,255,255,0.68) 100%)";

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: isFixed ? "fixed" : "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Inject all keyframes once */}
      <style>{KEYFRAMES}</style>

      {/* ── Layer 1: faded cover art ─────────────────────────────────────── */}
      {coverUrl ? (
        <>
          <Box
            sx={{
              position: "absolute",
              inset: "-10%",
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center 20%",
              filter: "blur(48px) saturate(1.3) brightness(0.9)",
              opacity: coverOpacity,
              animation: "rr-bgdrift 40s ease-in-out infinite alternate",
            }}
          />
          <Box sx={{ position: "absolute", inset: 0, background: overlayBg }} />
        </>
      ) : (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? `radial-gradient(ellipse 140% 80% at 50% -10%,${accent}14 0%,transparent 70%)`
              : `radial-gradient(ellipse 140% 80% at 50% -10%,${accent}0d 0%,transparent 70%)`,
          }}
        />
      )}

      {/* ── Layer 2: game-specific SVG motif ─────────────────────────────── */}
      <Box sx={{ position: "absolute", inset: 0, opacity: motifOpacity }}>
        <svg
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid slice"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <MotifSVG motif={motif} c={accent} />
        </svg>
      </Box>

      {/* ── Layer 3: edge vignette ────────────────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: isDark
            ? "radial-gradient(ellipse 100% 100% at 50% 50%,transparent 40%,rgba(0,0,0,0.40) 100%)"
            : "radial-gradient(ellipse 100% 100% at 50% 50%,transparent 40%,rgba(255,255,255,0.35) 100%)",
        }}
      />
    </Box>
  );
}
