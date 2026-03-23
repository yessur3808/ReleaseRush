import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Game } from "../../lib/types";
import { formatDateISO } from "../../utils";
import { getGameAccent, getCategoryChipColor } from "../../lib/gameTheme";
import { pickCoverUrl } from "../GamePage/helpers";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

interface GameCardProps {
  game: Game;
  isToday: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onView: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

export function GameCard({
  game,
  isToday,
  isFavorite,
  onToggleFavorite,
  onView,
  t,
}: GameCardProps) {
  const theme = useTheme();
  const { t: _t } = useTranslation();
  void _t; // silence unused warning – we receive t as a prop
  const isDark = theme.palette.mode === "dark";
  const accent = getGameAccent(game);
  const coverUrl = pickCoverUrl(game);

  const statusIcon =
    game.release.status === "recurring_daily" || game.release.status === "recurring_weekly" ? (
      <AutorenewIcon sx={{ fontSize: 14 }} />
    ) : game.release.status === "announced_date" ? (
      <NewReleasesIcon sx={{ fontSize: 14 }} />
    ) : (
      <HelpOutlineIcon sx={{ fontSize: 14 }} />
    );

  const statusLabel =
    game.release.status === "tba"
      ? t("game.release_tba")
      : game.release.status === "announced_date"
        ? t("game.release_date", { date: formatDateISO(game.release.dateISO) })
        : game.release.status === "recurring_daily"
          ? t("game.resets_daily", { time: game.release.timeUTC })
          : null;

  const categoryColor = getCategoryChipColor(game.category.type);

  return (
    <Paper
      onClick={onView}
      sx={(theme) => ({
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)",
        transition: "transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: isDark
            ? `0 12px 36px rgba(0,0,0,0.55), 0 4px 12px ${accent}33`
            : `0 10px 28px rgba(0,0,0,0.12), 0 4px 10px ${accent}22`,
          borderColor: isDark ? `${accent}55` : `${accent}44`,
        },
        // Accent left border
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(180deg, ${accent}, ${accent}88)`,
          borderRadius: "3px 0 0 3px",
        },
        // Subtle accent glow at the top
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`,
          pointerEvents: "none",
        },
        [theme.breakpoints.down("sm")]: {
          "&:hover": { transform: "none" },
        },
      })}
    >
      {/* Cover art strip */}
      {coverUrl ? (
        <Box
          sx={{
            position: "relative",
            height: 120,
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={coverUrl}
            alt={game.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
            }}
          />
          {/* Gradient overlay for text contrast */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: isDark
                ? `linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.75) 100%)`
                : `linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55) 100%)`,
            }}
          />
          {/* Accent tint */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(160deg, ${accent}18 0%, transparent 60%)`,
              pointerEvents: "none",
            }}
          />
          {/* "Today" badge pinned to cover */}
          {isToday ? (
            <Chip
              label={t("common.releasing_today")}
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                fontWeight: 700,
                fontSize: "0.7rem",
                height: 22,
                bgcolor: accent,
                color: "white",
                border: "none",
                animation: "pulse 2s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.7 },
                },
              }}
            />
          ) : null}
        </Box>
      ) : (
        // No cover: just a colored accent band
        <Box
          sx={{
            height: 6,
            background: `linear-gradient(90deg, ${accent}, ${accent}55)`,
          }}
        />
      )}

      {/* Card body */}
      <Stack spacing={1.25} sx={{ p: 2, pl: 2.5 }}>
        {/* Title row */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={750}
              sx={{
                lineHeight: 1.25,
                wordBreak: "break-word",
                letterSpacing: "-0.01em",
              }}
            >
              {game.name}
            </Typography>

            {/* Category + status row */}
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              <Chip
                label={t(`common.category_${game.category.type}`)}
                size="small"
                color={categoryColor}
                variant="outlined"
                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, borderRadius: 1 }}
              />
              {!coverUrl && isToday ? (
                <Chip
                  label={t("common.releasing_today")}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    borderRadius: 1,
                    bgcolor: accent,
                    color: "white",
                    animation: "pulse 2s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1 },
                      "50%": { opacity: 0.7 },
                    },
                  }}
                />
              ) : null}
            </Stack>
          </Stack>

          {/* Favorite button */}
          <Tooltip
            title={isFavorite ? t("common.remove_from_favorites") : t("common.add_to_favorites")}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              aria-label={
                isFavorite ? t("common.remove_from_favorites") : t("common.add_to_favorites")
              }
              sx={{
                color: isFavorite ? "#f87171" : "text.disabled",
                transition: "color 180ms ease, transform 180ms ease",
                flexShrink: 0,
                "&:hover": {
                  color: "#f87171",
                  transform: "scale(1.15)",
                },
              }}
            >
              {isFavorite ? (
                <FavoriteIcon fontSize="small" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Release info */}
        {statusLabel ? (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "text.secondary" }}>
            <Box component="span" sx={{ display: "inline-flex", opacity: 0.7 }}>
              {statusIcon}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {statusLabel}
            </Typography>
          </Stack>
        ) : null}

        {/* View button */}
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mt: 0.25 }}>
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.8rem",
              fontWeight: 700,
              color: accent,
              letterSpacing: "-0.01em",
              opacity: 0.85,
              transition: "opacity 180ms ease, gap 180ms ease",
              ".MuiPaper-root:hover &": {
                opacity: 1,
                gap: 0.75,
              },
            }}
          >
            {t("game.view_countdown")}
            <ArrowForwardIcon sx={{ fontSize: 14 }} />
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}
