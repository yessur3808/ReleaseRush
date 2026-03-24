import React from "react";
import { Box, Button, Stack, Typography, useTheme } from "@mui/material";
import { Game } from "../../../lib/types";
import { NiceCountdown } from "./NiceCountdown";
import { formatDateISO } from "../../../utils";
import { getGameAccent } from "../../../lib/gameTheme";

export const CountdownHeader = ({
  game,
  coverUrl,
  msLeft,
  showCountdown,
  isMobile,
  countdownAnchorRef,
  onBack,
  t,
  onTrack, // <-- NEW (optional)
}: {
  game: Game;
  coverUrl: string | null;
  msLeft: number | null;
  showCountdown: boolean;
  isMobile: boolean;
  onBack: () => void;
  t: (k: string, opts?: Record<string, unknown>) => string;
  countdownAnchorRef: React.RefObject<HTMLDivElement | null>;
  onTrack?: (eventName: string, params?: Record<string, unknown>) => void;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const accent = getGameAccent(game);

  const handleBackClick = () => {
    // optional tracking hook (keeps this component decoupled from GA4)
    onTrack?.("game_back_to_list", {
      from: "countdown_header",
      game_id: game.id,
      game_name: game.name ?? "(unknown)",
      release_status: game.release.status,
    });

    onBack();
  };

  return (
    <Stack
      spacing={1.25}
      sx={{
        pt: { xs: 3.5, sm: 5 },
        position: "relative",
      }}
    >
      {/* Blurred cover art ambient background */}
      {coverUrl ? (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "-10%",
            right: "-10%",
            bottom: 0,
            backgroundImage: `url("${coverUrl}")`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            filter: "blur(60px) saturate(1.5)",
            opacity: isDark ? 0.1 : 0.06,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ) : null}

      {/* Accent glow behind countdown */}
      <Box
        sx={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          height: "60%",
          background: `radial-gradient(ellipse, ${accent}${isDark ? "22" : "14"} 0%, transparent 70%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "baseline" }}
        justifyContent="space-between"
        spacing={1.25}
        sx={{ position: "relative", zIndex: 1 }}
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
                date: formatDateISO(game.release.dateISO),
              })}
            </Typography>
          ) : null}

          {game.release.status === "released" ? (
            <Typography variant="body2" color="text.secondary">
              {t("pages.game.released_on", {
                date: formatDateISO(game.release.dateISO),
              }) ?? `Released on ${formatDateISO(game.release.dateISO)}`}
            </Typography>
          ) : null}
        </Box>

        <Button
          variant="outlined"
          onClick={handleBackClick}
          sx={{
            borderRadius: 2,
            borderColor: `${accent}66`,
            color: isDark ? accent : "inherit",
            "&:hover": {
              borderColor: accent,
              bgcolor: `${accent}11`,
            },
          }}
        >
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
            position: "relative",
            zIndex: 1,
            "& *": {
              fontSize: isMobile ? "1.15em" : "1.45em",
            },
            // Tint the countdown digits with the accent color
            "& .countdown-segment-value": {
              color: accent,
              textShadow: isDark ? `0 0 30px ${accent}66` : `0 2px 12px ${accent}44`,
            },
          }}
        >
          <NiceCountdown msLeft={msLeft} compact={false} />
        </Box>
      ) : (
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            fontWeight: 900,
            lineHeight: 1.1,
            position: "relative",
            zIndex: 1,
          }}
        >
          {t("pages.game.no_countdown")}
        </Typography>
      )}
    </Stack>
  );
};
