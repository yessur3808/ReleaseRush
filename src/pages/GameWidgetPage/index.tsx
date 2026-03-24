import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Stack, Typography, CssBaseline, useMediaQuery } from "@mui/material";
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
  GamePageBackground,
} from "../GamePage/components";
import { useTranslation } from "react-i18next";
import { getGameAccent } from "../../lib/gameTheme";

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
  if (error || !doc) return <GameError message={error ?? t("pages.game.failed_load")} />;

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
  // suggested is unused in the widget but kept for potential future use
  const _suggested = doc.games.filter((g) => g.id !== game.id).slice(0, 6);
  void _suggested;

  const coverUrl = pickCoverUrl(game);
  const trailers = pickTrailers(game);

  const showCountdown =
    game.release.status === "announced_date" ||
    game.release.status === "recurring_daily" ||
    game.release.status === "recurring_weekly";

  const studioWebsite = game.studio?.website;
  const studioName = game.studio?.name ?? t("pages.game.unknown") ?? "Unknown";
  const accent = getGameAccent(game);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Outer wrapper: overflow hidden so absolute background can't bleed */}
      <Box
        sx={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Animated background in widget (absolute) mode */}
        <GamePageBackground
          coverUrl={coverUrl}
          accent={accent}
          isDark={theme.palette.mode === "dark"}
          mode="widget"
        />

        {/* Widget content – sits above the background */}
        <Stack
          sx={{
            minHeight: "100vh",
            p: 1,
            boxSizing: "border-box",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
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
      </Box>
    </ThemeProvider>
  );
};
