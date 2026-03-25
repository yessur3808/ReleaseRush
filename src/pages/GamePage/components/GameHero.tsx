import { Box, Button, Chip, Stack, Typography, useTheme } from "@mui/material";
import { Game } from "../../../lib/types";
import { Cover } from "./Cover";
import {
  categoryText,
  platformIcon,
  platformLabel,
  releasePrimaryChipLabel,
  releaseSecondaryLine,
} from "../helpers";
import { releaseMetaLabel } from "../../../utils";
import { getGameAccent, getGameHeroGradient } from "../../../lib/gameTheme";
import LaunchIcon from "@mui/icons-material/Launch";

export const GameHero = ({
  game,
  coverUrl,
  isMobile,
  studioName,
  studioWebsite,
  t,
}: {
  game: Game;
  coverUrl: string | null;
  isMobile: boolean;
  studioName: string;
  studioWebsite?: string | null;
  t: (k: string, opts?: Record<string, unknown>) => string;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const accent = getGameAccent(game);
  const heroGradient = getGameHeroGradient(accent, isDark);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${accent}44`,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)",
        // Subtle top glow line in the accent color
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          zIndex: 1,
          pointerEvents: "none",
        },
      }}
    >
      {/* Accent gradient tint overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: heroGradient,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {coverUrl ? (
        <Box sx={{ position: "relative", zIndex: 1 }}>
          {/* Blurred background version of the cover for ambient color */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("${coverUrl}")`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              filter: "blur(32px) saturate(1.4)",
              transform: "scale(1.1)",
              opacity: isDark ? 0.18 : 0.1,
            }}
          />
          <Cover src={coverUrl} alt={game.name} height={isMobile ? 220 : 340} />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.0) 55%, rgba(0,0,0,0.25) 100%)",
              pointerEvents: "none",
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            height: isMobile ? 0 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxSizing: "border-box",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t("pages.game.hero.no_cover")}
          </Typography>
        </Box>
      )}

      <Stack spacing={1.5} sx={{ p: 3, position: "relative", zIndex: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight={950}
              sx={{ lineHeight: 1.1, wordBreak: "break-word" }}
            >
              {game.name}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
              <Chip
                label={releasePrimaryChipLabel(game, t)}
                size="small"
                variant="filled"
                sx={{
                  borderRadius: 3,
                  bgcolor: `${accent}33`,
                  color: isDark ? accent : "inherit",
                  fontWeight: 700,
                  border: `1px solid ${accent}55`,
                }}
              />
              <Chip
                label={categoryText(game)}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
              <Chip
                label={
                  game.release.isOfficial
                    ? t("pages.game.hero.official")
                    : t("pages.game.hero.unofficial")
                }
                size="small"
                color={game.release.isOfficial ? "success" : "warning"}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
              <Chip
                label={`${t("pages.game.hero.confidence")}: ${game.release.confidence}`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </Stack>

            {game.title && game.title.trim().toLowerCase() !== game.name.trim().toLowerCase() ? (
              <Typography variant="body2" color="text.secondary">
                {t("pages.game.hero.title_label")}: {game.title}
              </Typography>
            ) : null}

            <Typography variant="body2" color="text.secondary">
              {releaseMetaLabel(game)}
              {releaseSecondaryLine(game) ? ` · ${releaseSecondaryLine(game)}` : ""}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 2 }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          {/* Platforms */}
          <Stack spacing={0.75} sx={{ width: "100%" }}>
            <Typography variant="overline" color="text.secondary">
              {t("pages.game.hero.platforms")}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {game.platforms?.length && game.platforms?.length > 0 ? (
                game.platforms
                  .slice(0, 10)
                  .map((p) => (
                    <Chip
                      key={p}
                      icon={platformIcon(p)}
                      label={platformLabel(p)}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  ))
              ) : (
                <Chip
                  label={t("pages.game.hero.platforms_unknown")}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
              )}
            </Stack>
          </Stack>

          {/* Studio */}
          <Stack spacing={0.75} sx={{ width: "100%" }}>
            <Typography variant="overline" color="text.secondary">
              {t("pages.game.hero.studio")}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip label={studioName} size="small" variant="outlined" sx={{ borderRadius: 2 }} />

              {studioWebsite ? (
                <Button
                  size="small"
                  variant="text"
                  endIcon={<LaunchIcon fontSize="small" />}
                  href={studioWebsite}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ borderRadius: 2 }}
                >
                  {t("pages.game.hero.website")}
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
