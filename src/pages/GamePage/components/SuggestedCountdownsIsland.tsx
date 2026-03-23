import React from "react";
import { Box, Button, Paper, Stack, Typography, useTheme } from "@mui/material";
import { msLeftForGame, releaseMetaLabel } from "../../../utils";
import type { Game } from "../../../lib/types";
import { NiceCountdown } from "./NiceCountdown";

interface SuggestedCountdownsIslandProps {
  games: Game[];
  nowMs: number;
  onOpen: (id: string) => void;
  onTrack?: (eventName: string, params?: Record<string, unknown>) => void;
  fromGameId?: string; // <-- optional context (if you have it)
}

type SuggestedCountdownRowProps = {
  game: Game;
  nowMs: number;
  onOpen: (id: string) => void;
  onTrack?: (eventName: string, params?: Record<string, unknown>) => void;
  fromGameId?: string; // <-- NEW
};

const SuggestedCountdownRow = ({
  game,
  nowMs,
  onOpen,
  onTrack,
  fromGameId,
}: SuggestedCountdownRowProps) => {
  const ms = msLeftForGame(game, nowMs) ?? null;

  const handleOpen = () => {
    onTrack?.("suggested_open_game", {
      source: "suggested_countdowns_island",
      from_game_id: fromGameId ?? "(unknown)",
      to_game_id: game.id,
      to_game_name: game.name ?? "(unknown)",
      release_meta: releaseMetaLabel(game),
      ms_left_bucket:
        ms == null
          ? "null"
          : ms <= 60_000
            ? "<=1m"
            : ms <= 5 * 60_000
              ? "<=5m"
              : ms <= 60 * 60_000
                ? "<=1h"
                : ms <= 24 * 60 * 60_000
                  ? "<=24h"
                  : ">24h",
    });

    onOpen(game.id);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: { xs: 1.5, sm: 2 },
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {game.coverUrl ? (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                flex: "0 0 auto",
                bgcolor: "background.paper",
              }}
            >
              <Box
                component="img"
                src={game.coverUrl}
                alt={game.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          ) : null}

          <Stack spacing={0.25}>
            <Typography fontWeight={900}>{game.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {releaseMetaLabel(game)}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="flex-end"
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", sm: "flex-end" },
            }}
          >
            <NiceCountdown msLeft={ms} compact />
          </Box>

          <Button
            onClick={handleOpen}
            variant="contained"
            sx={{
              borderRadius: 2,
              alignSelf: { xs: "stretch", sm: "auto" },
            }}
          >
            Open
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export const SuggestedCountdownsIsland = ({
  games,
  nowMs,
  onOpen,
  onTrack,
  fromGameId,
}: SuggestedCountdownsIslandProps) => {
  const theme = useTheme();
  if (games.length === 0) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: theme.spacing(4, 6),
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2}>
        <Stack spacing={0.25}>
          <Typography variant="h6" fontWeight={950}>
            Suggested countdowns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            More timers you might want to track.
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {games.map((game) => (
            <SuggestedCountdownRow
              key={game.id}
              game={game}
              nowMs={nowMs}
              onOpen={onOpen}
              onTrack={onTrack}
              fromGameId={fromGameId}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};
