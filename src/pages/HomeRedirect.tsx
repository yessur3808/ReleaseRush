import React from "react";
import { Navigate } from "react-router-dom";
import { useGames } from "../lib/useGames";
import { Alert, CircularProgress, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

export function HomeRedirect() {
  const { t } = useTranslation();
  const { doc, loading, error } = useGames();

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress aria-label={t("common.loading")} />
      </Stack>
    );
  }

  if (error || !doc || doc.games.length === 0) {
    return (
      <Alert severity="error">{error ?? t("common.no_games_found")}</Alert>
    );
  }

  const first = doc.games[0];
  return <Navigate to={`/game/${first.id}`} replace />;
}
