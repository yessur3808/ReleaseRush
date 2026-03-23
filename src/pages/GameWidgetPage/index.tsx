import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Stack, Typography, CssBaseline, useMediaQuery } from "@mui/material";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { useGames } from "../../lib/useGames";
import { msLeftForGame, formatISODateTime } from "../../utils";
import { GameDoc } from "../../lib/types";
import {
  pickCoverUrl,
  pickSourcesForDisplay,
  pickTopSources,
  pickTrailers,
} from "../GamePage/helpers";
import {
  CountdownHeader,
  GameError,
  GameHero,
  GameLinks,
  GameLoading,
  GameNotFound,
  SuggestedCountdownsIsland,
} from "../GamePage/components";
import { useTranslation } from "react-i18next";

function getBool(v: string | null, def = false) {
  if (v == null) return def;
  return v === "1" || v === "true" || v === "yes";
}

export const GameWidgetPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { doc, loading, error } = useGames() as {
    doc: GameDoc | null;
    loading: boolean;
    error: string | null;
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const it = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(it);
  }, []);

  const countdownAnchorRef = useRef<HTMLDivElement | null>(null);
  const [showFloatingCountdown, setShowFloatingCountdown] = useState(false);

  useEffect(() => {
    let obs: IntersectionObserver | null = null;
    let raf = 0;

    const tryAttach = () => {
      const el = countdownAnchorRef.current;
      if (!el) {
        raf = window.requestAnimationFrame(tryAttach);
        return;
      }

      obs = new IntersectionObserver(
        ([entry]) => setShowFloatingCountdown(!entry.isIntersecting),
        {
          root: null,
          threshold: 0,
        },
      );

      obs.observe(el);
    };

    tryAttach();

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      obs?.disconnect();
    };
  }, []);

  const game = useMemo(() => {
    if (!doc) return null;
    return doc.games.find((g) => g.id === id) ?? null;
  }, [doc, id]);

  const sources = useMemo(() => {
    if (!doc || loading || error || !game) return [];
    return pickSourcesForDisplay(game);
  }, [doc, loading, error, game]);

  const topSources = useMemo(() => pickTopSources(sources, 4), [sources]);

  if (loading) return <GameLoading />;
  if (error || !doc)
    return <GameError message={error ?? t("pages.game.failed_load")} />;

  if (!game) {
    return (
      <GameNotFound
        onBack={() => navigate("/games")}
        labelBack={t("pages.game.all_games")}
        message={t("pages.game.game_not_found")}
      />
    );
  }

  const msLeft = msLeftForGame(game, nowMs) ?? null;
  const suggested = doc.games.filter((g) => g.id !== game.id).slice(0, 6);

  const coverUrl = pickCoverUrl(game);
  const trailers = pickTrailers(game);

  const showCountdown =
    game.release.status === "announced_date" ||
    game.release.status === "recurring_daily" ||
    game.release.status === "recurring_weekly";

  const studioWebsite = game.studio?.website;
  const studioName = game.studio?.name ?? t("pages.game.unknown") ?? "Unknown";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack
        sx={{
          minHeight: "100vh",
          p: 1,
          boxSizing: "border-box",
          bgcolor: "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CountdownHeader
          game={game}
          coverUrl={coverUrl}
          msLeft={msLeft}
          showCountdown={showCountdown}
          isMobile={isMobile}
          onBack={() => navigate("/games")}
          t={t}
          countdownAnchorRef={countdownAnchorRef}
        />

        <GameHero
          game={game}
          coverUrl={coverUrl}
          isMobile={isMobile}
          studioName={studioName}
          studioWebsite={studioWebsite}
          t={t}
        />

        <GameLinks
          trailers={trailers}
          coverUrl={coverUrl}
          sources={sources}
          topSources={topSources}
          isMobile={isMobile}
          t={t}
        />

        <Typography variant="caption" color="text.secondary">
          {t("pages.game.last_gen_date", { date: formatISODateTime(doc.generatedAt) })}
        </Typography>
      </Stack>
    </ThemeProvider>
  );
};
