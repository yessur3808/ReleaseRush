import React from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { msLeftForGame, releaseMetaLabel } from "../../utils";
import type { Game } from "../../lib/types";
import { NiceCountdown } from "./NiceCountdown";

interface SuggestedCountdownsIslandProps {
  games: Game[];
  nowMs: number;
  onOpen: (id: string) => void;
}

type SuggestedCountdownRowProps = {
  game: Game;
  nowMs: number;
  onOpen: (id: string) => void;
};

const SuggestedCountdownRow = ({
  game,
  nowMs,
  onOpen,
}: SuggestedCountdownRowProps) => {
  const ms = msLeftForGame(game, nowMs);

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
            onClick={() => onOpen(game.id)}
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
}: SuggestedCountdownsIslandProps) => {
  if (games.length === 0) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 4,
        p: { xs: 2, sm: 3 },
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
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};
