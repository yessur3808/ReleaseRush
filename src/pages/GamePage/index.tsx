import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGames } from "../../lib/useGames";
import { useFavorites } from "../../lib/useFavorites";
import { Stack, Tooltip, IconButton, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { GameDoc } from "../../lib/types";
import { msLeftForGame, formatISODateTime } from "../../utils";
import { SuggestedCountdownsIsland } from "./components/SuggestedCountdownsIsland";
import { useTranslation } from "react-i18next";
import { pickCoverUrl, pickSourcesForDisplay, pickTopSources, pickTrailers } from "./helpers";
import { GameError, GameLoading, GameNotFound } from "./components/GameSubComponents";
import { CountdownHeader } from "./components/CountdownHeader";
import { GameHero } from "./components/GameHero";
import { GameLinks } from "./components/GameLinks";
import { GamePageBackground } from "./components/GamePageBackground";
import { FloatingCountdownHUD } from "../../components/FloatingCountdownHUD";
import { ShareButton } from "../../components/ShareButton";
import { trackEvent } from "../../analytics/ga4";
import { getGameAccent } from "../../lib/gameTheme";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export const GamePage = () => {
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
  const { isFavorite, toggleFavorite } = useFavorites();

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

      obs = new IntersectionObserver(([entry]) => setShowFloatingCountdown(!entry.isIntersecting), {
        root: null,
        threshold: 0,
      });

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
  if (error || !doc) return <GameError message={error ?? t("pages.game.failed_load")} />;

  if (!game) {
    return (
      <GameNotFound
        onBack={() => {
          trackEvent("game_not_found_back", {
            from: "game_page",
            requested_id: id ?? "(missing)",
          });
          navigate("/games");
        }}
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

  const handleBackToAllGames = () => {
    trackEvent("game_back_to_list", {
      from: "game_page",
      game_id: game.id,
      game_name: game.name ?? "(unknown)",
    });
    navigate("/games");
  };

  const handleOpenSuggested = (gameId: string) => {
    trackEvent("suggested_open_game", {
      from_game_id: game.id,
      from_game_name: game.name ?? "(unknown)",
      to_game_id: gameId,
    });
    navigate(`/game/${gameId}`);
  };

  const handleScrollToCountdown = () => {
    trackEvent("scroll_to_countdown", {
      source: "floating_hud",
      game_id: game.id,
      game_name: game.name ?? "(unknown)",
      release_status: game.release.status,
      is_mobile: isMobile,
    });

    countdownAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "start",
    });
  };

  const favorited = isFavorite(game.id);
  const accent = getGameAccent(game);

  return (
    <>
      {/* Full-viewport animated background – sits behind AppShell content */}
      <GamePageBackground
        coverUrl={coverUrl}
        accent={accent}
        isDark={theme.palette.mode === "dark"}
        mode="page"
      />

      <Stack spacing={{ xs: 2.5, sm: 3.5 }} sx={{ pb: 4, position: "relative", zIndex: 1 }}>
        <CountdownHeader
          game={game}
          coverUrl={coverUrl}
          msLeft={msLeft}
          showCountdown={showCountdown}
          isMobile={isMobile}
          onBack={handleBackToAllGames}
          t={t}
          countdownAnchorRef={countdownAnchorRef}
        />

        {/* Action bar: favorite + share */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip
            title={favorited ? t("common.remove_from_favorites") : t("common.add_to_favorites")}
          >
            <IconButton
              onClick={() => toggleFavorite(game.id)}
              aria-label={
                favorited ? t("common.remove_from_favorites") : t("common.add_to_favorites")
              }
              size="small"
              sx={(theme) => ({
                borderRadius: 999,
                border: `1px solid ${
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)"
                }`,
                color: favorited ? theme.palette.error.light : theme.palette.text.secondary,
                transition: "color 180ms ease, transform 180ms ease",
                "&:hover": {
                  color: theme.palette.error.light,
                  transform: "scale(1.12)",
                },
              })}
            >
              {favorited ? (
                <FavoriteIcon fontSize="small" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <ShareButton gameId={game.id} gameName={game.name ?? ""} />
        </Stack>

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

        <SuggestedCountdownsIsland games={suggested} nowMs={nowMs} onOpen={handleOpenSuggested} />

        <Typography variant="caption" color="text.secondary">
          {t("pages.game.last_gen_date", { date: formatISODateTime(doc.generatedAt) })}
        </Typography>

        <FloatingCountdownHUD
          minimal
          topOffset={12}
          visible={showFloatingCountdown && showCountdown}
          msLeft={msLeft}
          label={game.name ?? ""}
          onClick={handleScrollToCountdown}
        />
      </Stack>
    </>
  );
};
