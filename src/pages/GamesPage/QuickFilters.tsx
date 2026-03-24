import { Box, Chip, Stack, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { GamesFiltersState } from "./GamesToolbar";
import type { CategoryType } from "../../lib/types";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ExtensionIcon from "@mui/icons-material/Extension";
import EventIcon from "@mui/icons-material/Event";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import type { ReactNode } from "react";

type QuickFilterPreset = {
  id: string;
  labelKey: string;
  icon: ReactNode;
  accent: string;
  apply: Partial<GamesFiltersState>;
};

const QUICK_FILTER_PRESETS: QuickFilterPreset[] = [
  {
    id: "new_seasons",
    labelKey: "common.quick_new_seasons",
    icon: <AutorenewIcon fontSize="small" />,
    accent: "#8b5cf6",
    apply: { categoryType: "season" as CategoryType, sort: "soonest" },
  },
  {
    id: "new_games",
    labelKey: "common.quick_new_games",
    icon: <NewReleasesIcon fontSize="small" />,
    accent: "#6366f1",
    apply: { categoryType: "full_game" as CategoryType, sort: "soonest" },
  },
  {
    id: "dlc",
    labelKey: "common.quick_dlc",
    icon: <ExtensionIcon fontSize="small" />,
    accent: "#ec4899",
    apply: { categoryType: "dlc" as CategoryType },
  },
  {
    id: "events",
    labelKey: "common.quick_events",
    icon: <EventIcon fontSize="small" />,
    accent: "#f59e0b",
    apply: { categoryType: "event" as CategoryType },
  },
  {
    id: "updates",
    labelKey: "common.quick_updates",
    icon: <SystemUpdateAltIcon fontSize="small" />,
    accent: "#22c55e",
    apply: { categoryType: "update" as CategoryType },
  },
  {
    id: "store_resets",
    labelKey: "common.quick_store_resets",
    icon: <StorefrontIcon fontSize="small" />,
    accent: "#06b6d4",
    apply: { categoryType: "store_reset" as CategoryType },
  },
  {
    id: "live_service",
    labelKey: "common.quick_live_service",
    icon: <LiveTvIcon fontSize="small" />,
    accent: "#f97316",
    apply: { tag: "live_service", sort: "soonest" },
  },
  {
    id: "daily_resets",
    labelKey: "common.quick_daily_resets",
    icon: <SportsEsportsIcon fontSize="small" />,
    accent: "#14b8a6",
    apply: { status: "recurring_daily" },
  },
];

interface QuickFiltersProps {
  filters: GamesFiltersState;
  onChange: (next: GamesFiltersState) => void;
  defaultFilters: GamesFiltersState;
}

export function QuickFilters({ filters, onChange, defaultFilters }: QuickFiltersProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const isPresetActive = (preset: QuickFilterPreset): boolean => {
    const a = preset.apply;
    return (
      (a.categoryType === undefined || filters.categoryType === a.categoryType) &&
      (a.tag === undefined || filters.tag === a.tag) &&
      (a.status === undefined || filters.status === a.status) &&
      (a.sort === undefined || filters.sort === a.sort)
    );
  };

  const handlePreset = (preset: QuickFilterPreset) => {
    if (isPresetActive(preset)) {
      // deactivate – reset only the fields this preset touches
      const reset: Partial<GamesFiltersState> = {};
      if (preset.apply.categoryType !== undefined) reset.categoryType = defaultFilters.categoryType;
      if (preset.apply.tag !== undefined) reset.tag = defaultFilters.tag;
      if (preset.apply.status !== undefined) reset.status = defaultFilters.status;
      if (preset.apply.sort !== undefined) reset.sort = defaultFilters.sort;
      onChange({ ...filters, ...reset });
    } else {
      onChange({ ...filters, ...preset.apply });
    }
  };

  return (
    <Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ mb: 1, display: "block", letterSpacing: "0.08em" }}
      >
        {t("common.quick_filters")}
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {QUICK_FILTER_PRESETS.map((preset) => {
          const active = isPresetActive(preset);
          return (
            <Chip
              key={preset.id}
              icon={
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    color: active ? theme.palette.getContrastText(preset.accent) : preset.accent,
                    ml: "8px !important",
                  }}
                >
                  {preset.icon}
                </Box>
              }
              label={t(preset.labelKey)}
              clickable
              onClick={() => handlePreset(preset)}
              sx={(theme) => ({
                height: 36,
                fontWeight: 650,
                letterSpacing: "-0.01em",
                borderRadius: 999,
                transition:
                  "transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms cubic-bezier(0.16,1,0.3,1), background-color 200ms ease",
                "&:active": { transform: "scale(0.97)" },
                ...(active
                  ? {
                      bgcolor: preset.accent,
                      color: theme.palette.getContrastText(preset.accent),
                      border: "1px solid transparent",
                      boxShadow: isDark
                        ? `0 8px 20px ${preset.accent}55, 0 4px 10px rgba(0,0,0,0.4)`
                        : `0 6px 16px ${preset.accent}44, 0 3px 8px rgba(0,0,0,0.12)`,
                      "&:hover": {
                        bgcolor: preset.accent,
                        filter: "brightness(1.1)",
                      },
                      "& .MuiChip-icon": { color: "inherit" },
                    }
                  : {
                      bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"}`,
                      color: "text.secondary",
                      "&:hover": {
                        bgcolor: isDark ? `${preset.accent}22` : `${preset.accent}18`,
                        borderColor: preset.accent,
                        color: preset.accent,
                      },
                    }),
              })}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
