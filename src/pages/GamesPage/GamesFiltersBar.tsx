import React from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import SortIcon from "@mui/icons-material/Sort";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { useTranslation } from "react-i18next";
import type { StatusFilter, SortKey } from "./gamesSorting";

export type GamesFiltersState = {
  query: string;
  status: StatusFilter;
  tag: string; // "all" or a tag value
  sort: SortKey;
};

type Props = {
  value: GamesFiltersState;
  onChange: (next: GamesFiltersState) => void;
  allTags: string[];
  resultsText: string; // e.g. "12 / 50"
};

export function GamesFiltersBar({
  value,
  onChange,
  allTags,
  resultsText,
}: Props) {
  const { t } = useTranslation();

  const set = (patch: Partial<GamesFiltersState>) =>
    onChange({ ...value, ...patch });

  const statusOptions: Array<{ key: StatusFilter; label: string }> = [
    { key: "all", label: t("common.all") },
    { key: "announced_date", label: t("game.filter_release_date") },
    { key: "recurring_daily", label: t("game.filter_daily_reset") },
    { key: "tba", label: t("game.filter_tba") },
  ];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 4,
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={1.5}>
        {/* Top row: search + count + reset */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <TextField
            value={value.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder={t("common.search_placeholder")}
            label={t("common.search")}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: value.query ? (
                <InputAdornment position="end">
                  <Button
                    onClick={() => set({ query: "" })}
                    size="small"
                    variant="text"
                    sx={{ minWidth: 0, px: 1, borderRadius: 2 }}
                    aria-label={t("common.clear")}
                  >
                    <ClearIcon fontSize="small" />
                  </Button>
                </InputAdornment>
              ) : undefined,
            }}
          />

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            sx={{ flex: "0 0 auto" }}
          >
            <Typography variant="body2" color="text.secondary">
              {resultsText}
            </Typography>

            <Button
              variant="outlined"
              onClick={() =>
                onChange({ query: "", status: "all", tag: "all", sort: "az" })
              }
              sx={{ borderRadius: 3, whiteSpace: "nowrap" }}
            >
              {t("common.clear")}
            </Button>
          </Stack>
        </Stack>

        {/* Status chips */}
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {statusOptions.map((opt) => (
            <Chip
              key={opt.key}
              label={opt.label}
              clickable
              onClick={() => set({ status: opt.key })}
              color={value.status === opt.key ? "primary" : "default"}
              variant={value.status === opt.key ? "filled" : "outlined"}
              sx={{ borderRadius: 999 }}
            />
          ))}
        </Stack>

        {/* Tag + sort */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          {allTags.length > 0 ? (
            <FormControl size="small" sx={{ minWidth: 220, flex: 1 }}>
              <InputLabel>
                <Box
                  sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
                >
                  <LocalOfferOutlinedIcon fontSize="small" />
                  {t("common.tag")}
                </Box>
              </InputLabel>
              <Select
                label={t("common.tag")}
                value={value.tag}
                onChange={(e) => set({ tag: String(e.target.value) })}
              >
                <MenuItem value="all">{t("common.all_tags")}</MenuItem>
                {allTags.map((tg) => (
                  <MenuItem key={tg} value={tg}>
                    {tg}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}

          <FormControl size="small" sx={{ minWidth: 220, flex: 1 }}>
            <InputLabel>
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
              >
                <SortIcon fontSize="small" />
                {t("common.sort_by")}
              </Box>
            </InputLabel>
            <Select
              label={t("common.sort_by")}
              value={value.sort}
              onChange={(e) => set({ sort: e.target.value as SortKey })}
            >
              <MenuItem value="az">{t("common.sort_az")}</MenuItem>
              <MenuItem value="soonest">{t("common.sort_soonest")}</MenuItem>
              <MenuItem value="latest">{t("common.sort_latest")}</MenuItem>
              <MenuItem value="daily_first">
                {t("common.sort_daily_first")}
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Paper>
  );
}
