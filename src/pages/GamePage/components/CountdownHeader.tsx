import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Game } from "../../../lib/types";
import { NiceCountdown } from "./NiceCountdown";
import { Trans } from "react-i18next";

export const CountdownHeader = ({
  game,
  coverUrl,
  msLeft,
  showCountdown,
  isMobile,
  countdownAnchorRef,
  onBack,
  t,
}: {
  game: Game;
  coverUrl: string | null;
  msLeft: number | null;
  showCountdown: boolean;
  isMobile: boolean;
  onBack: () => void;
  t: (k: string, opts?: Record<string, unknown>) => string;
  countdownAnchorRef: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    <Stack
      spacing={1.25}
      sx={{
        pt: { xs: 3.5, sm: 5 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "baseline" }}
        justifyContent="space-between"
        spacing={1.25}
      >
        <Box>
          <Typography variant="overline" color="text.secondary">
            {game.release.status === "announced_date"
              ? t("pages.game.time_until_release")
              : game.release.status === "recurring_daily" ||
                  game.release.status === "recurring_weekly"
                ? t("pages.game.next_reset")
                : t("pages.game.release_date")}
          </Typography>

          {game.release.status === "announced_date" ? (
            <Typography variant="body2" color="text.secondary">
              {t("pages.game.day_precision_date", {
                date: game.release.dateISO,
              })}
            </Typography>
          ) : null}

          {game.release.status === "released" ? (
            <Typography variant="body2" color="text.secondary">
              {t("pages.game.released_on", { date: game.release.dateISO }) ??
                `Released on ${game.release.dateISO}`}
            </Typography>
          ) : null}
        </Box>

        <Button variant="outlined" onClick={onBack} sx={{ borderRadius: 2 }}>
          {t("pages.game.all_games")}
        </Button>
      </Stack>

      <Box
        ref={countdownAnchorRef}
        sx={{
          height: 1,
          width: 1,
        }}
      />

      {showCountdown ? (
        <Box
          sx={{
            pt: 0.25,
            "& *": {
              fontSize: isMobile ? "1.15em" : "1.45em",
            },
          }}
        >
          <NiceCountdown msLeft={msLeft} compact={false} />
        </Box>
      ) : (
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{ fontWeight: 900, lineHeight: 1.1 }}
        >
          {t("pages.game.no_countdown")}
        </Typography>
      )}
    </Stack>
  );
};
