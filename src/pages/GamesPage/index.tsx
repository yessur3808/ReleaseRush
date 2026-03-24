import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGames } from "../../lib/useGames";
import { useFavorites } from "../../lib/useFavorites";
import { Alert, Box, CircularProgress, Paper, Stack, Typography, Divider } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { useTranslation } from "react-i18next";

import { useDebouncedValue } from "./useDebouncedValue";
import { releaseSortValue } from "./gamesSorting";
import { GamesToolbar, DEFAULT_FILTERS, type GamesFiltersState } from "./GamesToolbar";
import { QuickFilters } from "./QuickFilters";
import { GameCard } from "./GameCard";
import type { Game } from "../../lib/types";

export function GamesPage() {
  const { t } = useTranslation();
  const { doc, loading, error } = useGames();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [filters, setFilters] = useState<GamesFiltersState>(DEFAULT_FILTERS);

  const debouncedQuery = useDebouncedValue(filters.query, 250);

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const g of doc?.games ?? []) {
      for (const tg of g.tags ?? []) set.add(tg);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [doc]);

  const collator = useMemo(() => new Intl.Collator(undefined, { sensitivity: "base" }), []);

  const sortGames = useMemo(() => {
    return (a: Game, b: Game) => {
      if (filters.sort === "az") return collator.compare(a.name, b.name);

      if (filters.sort === "daily_first") {
        const aDaily = a.release.status === "recurring_daily" ? 0 : 1;
        const bDaily = b.release.status === "recurring_daily" ? 0 : 1;
        if (aDaily !== bDaily) return aDaily - bDaily;

        const av = releaseSortValue(a, nowMs) ?? 0;
        const bv = releaseSortValue(b, nowMs) ?? 0;
        if (av !== bv) return av - bv;

        return collator.compare(a.name, b.name);
      }

      const av = releaseSortValue(a, nowMs) ?? 0;
      const bv = releaseSortValue(b, nowMs) ?? 0;

      if (filters.sort === "soonest") {
        if (av !== bv) return av - bv;
        return collator.compare(a.name, b.name);
      }

      // latest
      if (av !== bv) return bv - av;
      return collator.compare(a.name, b.name);
    };
  }, [collator, filters.sort, nowMs]);

  const allSortedGames = useMemo(() => {
    const games = doc?.games ?? [];
    return [...games].sort(sortGames);
  }, [doc, sortGames]);

  // Use explicit UTC components so the "releasing today" badge is consistent
  // with the UTC-midnight countdown calculation regardless of viewer timezone.
  const todayISO = useMemo(() => {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const filteredAndSortedGames = useMemo(() => {
    const games = doc?.games ?? [];
    const q = debouncedQuery.trim().toLowerCase();

    const filtered = games.filter((g) => {
      if (filters.status !== "all" && g.release.status !== filters.status) return false;

      if (filters.tag !== "all" && !(g.tags ?? []).includes(filters.tag)) return false;

      if (filters.categoryType !== "all" && g.category.type !== filters.categoryType) return false;

      if (filters.favoritesOnly && !isFavorite(g.id)) return false;

      if (!q) return true;

      const haystack = `${g.name ?? ""} ${(g.tags ?? []).join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });

    return [...filtered].sort(sortGames);
  }, [
    doc,
    debouncedQuery,
    filters.status,
    filters.tag,
    filters.categoryType,
    filters.favoritesOnly,
    isFavorite,
    sortGames,
  ]);

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress aria-label={t("common.loading")} />
      </Stack>
    );
  }

  if (error || !doc) {
    return <Alert severity="error">{error ?? t("common.failed_load")}</Alert>;
  }

  const resultsText = t("common.results_count", {
    shown: filteredAndSortedGames.length,
    total: doc.games.length,
  });

  const noMatches = filteredAndSortedGames.length === 0;

  const gamesToRender = noMatches ? allSortedGames : filteredAndSortedGames;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.02em" }}>
          {t("game.all_games")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("common.all_games_subtitle")}
        </Typography>
      </Box>

      {/* Quick filter presets */}
      <QuickFilters filters={filters} onChange={setFilters} defaultFilters={DEFAULT_FILTERS} />

      <Divider sx={{ opacity: 0.4 }} />

      <GamesToolbar
        value={filters}
        onChange={setFilters}
        allTags={allTags}
        resultsText={resultsText}
      />

      {noMatches ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {t("common.no_results")}
          </Typography>
        </Paper>
      ) : null}

      {/* Results */}
      <Grid container spacing={2}>
        {gamesToRender.map((g) => {
          const isToday = g.release.status === "announced_date" && g.release.dateISO === todayISO;
          return (
            <Grid item xs={12} sm={6} md={4} key={g.id}>
              <GameCard
                game={g}
                isToday={isToday}
                isFavorite={isFavorite(g.id)}
                onToggleFavorite={() => toggleFavorite(g.id)}
                onView={() => navigate(`/game/${g.id}`)}
                t={t}
              />
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
