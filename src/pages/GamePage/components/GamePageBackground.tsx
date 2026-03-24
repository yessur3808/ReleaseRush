/**
 * GamePageBackground
 *
 * Renders an animated, game-specific backdrop that sits behind the page/widget
 * content. It combines:
 *  1. A large, heavily-blurred + faded version of the game cover art (if any)
 *     — giving each game page a unique visual identity.
 *  2. Three slow-drifting, semi-transparent orbs in the game's accent colour
 *     — providing subtle motion without being distracting.
 *
 * For the full GamePage the layer is `position: fixed` (covers the whole
 * viewport, doesn't scroll).  For the widget embed it is `position: absolute`
 * (fills the nearest positioned ancestor, i.e. the widget container).
 */
import { Box } from "@mui/material";

interface Props {
  /** URL of the game cover image – can be null when no cover is available */
  coverUrl: string | null;
  /** Brand accent colour for this game, e.g. "#f97316" */
  accent: string;
  /** Whether the current MUI theme is dark */
  isDark: boolean;
  /**
   * "page"   – fixed position, covers the entire viewport (GamePage)
   * "widget" – absolute position, fills the widget container
   */
  mode?: "page" | "widget";
}

export function GamePageBackground({ coverUrl, accent, isDark, mode = "page" }: Props) {
  const isFixed = mode === "page";

  // ── opacity tuning ──────────────────────────────────────────────────────────
  const coverOpacity = isDark ? 0.13 : 0.07;
  const orbOpacity = isDark ? 0.18 : 0.11;
  // ── overlay darkens/lightens the cover so text stays readable ───────────────
  const overlayBg = isDark
    ? "linear-gradient(180deg, rgba(10,10,15,0.72) 0%, rgba(10,10,15,0.55) 100%)"
    : "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.65) 100%)";

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
      {/* ── 1. Faded cover art ─────────────────────────────────────────────── */}
      {coverUrl ? (
        <>
          {/* Base blurred cover */}
          <Box
            sx={{
              position: "absolute",
              inset: "-10%", // slightly oversized so blur edges don't show
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center 20%",
              filter: "blur(48px) saturate(1.3) brightness(0.9)",
              opacity: coverOpacity,
              // Slow, subtle drift/zoom animation
              animation: "bgDrift 40s ease-in-out infinite alternate",
              "@keyframes bgDrift": {
                "0%": { transform: "scale(1.0) translate(0%, 0%)" },
                "33%": { transform: "scale(1.04) translate(-1%, 1%)" },
                "66%": { transform: "scale(1.06) translate(1%, -1%)" },
                "100%": { transform: "scale(1.04) translate(-0.5%, 0.5%)" },
              },
            }}
          />
          {/* Readability overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: overlayBg,
            }}
          />
        </>
      ) : (
        /* No cover – just the readability overlay so it doesn't look bare */
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? `radial-gradient(ellipse 140% 80% at 50% -10%, ${accent}12 0%, transparent 70%)`
              : `radial-gradient(ellipse 140% 80% at 50% -10%, ${accent}0c 0%, transparent 70%)`,
          }}
        />
      )}

      {/* ── 2. Floating accent orbs ────────────────────────────────────────── */}

      {/* Orb A – large, top-left, slowest */}
      <Box
        sx={{
          position: "absolute",
          width: "55vw",
          height: "55vw",
          maxWidth: 700,
          maxHeight: 700,
          borderRadius: "50%",
          top: "-15%",
          left: "-10%",
          background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
          opacity: orbOpacity,
          filter: "blur(60px)",
          animation: "orbA 28s ease-in-out infinite alternate",
          "@keyframes orbA": {
            "0%": { transform: "translate(0%, 0%) scale(1)" },
            "50%": { transform: "translate(6%, 8%) scale(1.08)" },
            "100%": { transform: "translate(-4%, 4%) scale(0.95)" },
          },
        }}
      />

      {/* Orb B – medium, bottom-right, medium speed */}
      <Box
        sx={{
          position: "absolute",
          width: "45vw",
          height: "45vw",
          maxWidth: 560,
          maxHeight: 560,
          borderRadius: "50%",
          bottom: "-10%",
          right: "-8%",
          background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
          opacity: orbOpacity * 0.8,
          filter: "blur(70px)",
          animation: "orbB 22s ease-in-out infinite alternate",
          "@keyframes orbB": {
            "0%": { transform: "translate(0%, 0%) scale(1)" },
            "40%": { transform: "translate(-7%, -5%) scale(1.06)" },
            "100%": { transform: "translate(3%, -8%) scale(0.92)" },
          },
        }}
      />

      {/* Orb C – small, centre, faster */}
      <Box
        sx={{
          position: "absolute",
          width: "30vw",
          height: "30vw",
          maxWidth: 380,
          maxHeight: 380,
          borderRadius: "50%",
          top: "35%",
          left: "38%",
          background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
          opacity: orbOpacity * 0.55,
          filter: "blur(50px)",
          animation: "orbC 17s ease-in-out infinite alternate",
          "@keyframes orbC": {
            "0%": { transform: "translate(0%, 0%) scale(1)" },
            "50%": { transform: "translate(-5%, 6%) scale(1.1)" },
            "100%": { transform: "translate(5%, -4%) scale(0.9)" },
          },
        }}
      />

      {/* ── 3. Subtle noise texture overlay to soften the orbs ─────────────── */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          // Very subtle vignette at the edges
          background: isDark
            ? "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)"
            : "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(255,255,255,0.30) 100%)",
        }}
      />
    </Box>
  );
}
