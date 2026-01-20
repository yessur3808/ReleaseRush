import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGames } from "../../lib/useGames";
import {
  Alert,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  Divider,
  Chip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { GameDoc } from "../../lib/types";
import { msLeftForGame, releaseMetaLabel } from "../../utils";
import { NiceCountdown } from "./NiceCountdown";
import { SuggestedCountdownsIsland } from "./SuggestedCountdownsIsland";
import { Cover } from "./Cover";

export function GamePage() {
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
    const t = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(t);
  }, []);

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error || !doc) {
    return <Alert severity="error">{error ?? "Failed to load games."}</Alert>;
  }

  const game = doc.games.find((g) => g.id === id);

  if (!game) {
    return (
      <Alert
        severity="warning"
        action={<Button onClick={() => navigate("/games")}>All Games</Button>}
      >
        Game not found.
      </Alert>
    );
  }

  const msLeft = msLeftForGame(game, nowMs) ?? null;

  const suggested = doc.games.filter((g) => g.id !== game.id).slice(0, 6);

  return (
    <Stack spacing={{ xs: 2.5, sm: 3 }}>
      {/* HERO */}
      <Stack spacing={{ xs: 2, sm: 2.5 }}>
        {/* Only show cover if we have it */}
        {game.coverUrl ? (
          <Cover
            src={game.coverUrl}
            alt={game.name}
            height={isMobile ? 220 : 340}
          />
        ) : null}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack spacing={0.5}>
            <Typography variant="h4" fontWeight={950} sx={{ lineHeight: 1.1 }}>
              {game.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {releaseMetaLabel(game)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={
                game.release.status === "announced_date"
                  ? "Release"
                  : game.release.status === "recurring_daily"
                    ? "Daily reset"
                    : "TBA"
              }
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            <Button
              variant="outlined"
              onClick={() => navigate("/games")}
              sx={{ borderRadius: 2 }}
            >
              All games
            </Button>
          </Stack>
        </Stack>
      </Stack>

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
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              {game.release.status === "announced_date"
                ? "Time until release"
                : game.release.status === "recurring_daily"
                  ? "Next reset"
                  : "Release date"}
            </Typography>

            {game.release.status === "announced_date" && (
              <Typography variant="body2" color="text.secondary">
                Date: {game.release.dateISO} (day precision)
              </Typography>
            )}
          </Stack>

          <NiceCountdown msLeft={msLeft} compact={false} />

          <Divider />

          <Typography variant="body2" color="text.secondary">
            Tip: Add a cover by setting <code>coverUrl</code> for this game in
            your data.
          </Typography>
        </Stack>
      </Paper>

      {/* Suggested island */}
      <SuggestedCountdownsIsland
        games={suggested}
        nowMs={nowMs}
        onOpen={(gameId) => navigate(`/game/${gameId}`)}
      />

      <Typography variant="caption" color="text.secondary">
        Data last generated: {doc.generatedAt}
      </Typography>
    </Stack>
  );
}
