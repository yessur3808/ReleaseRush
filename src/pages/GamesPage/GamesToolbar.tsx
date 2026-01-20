import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import type { StatusFilter, SortKey } from "./gamesSorting";

import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import SortIcon from "@mui/icons-material/Sort";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

export type GamesFiltersState = {
  query: string;
  status: StatusFilter;
  tag: string; // "all" or tag name
  sort: SortKey;
};

type Props = {
  value: GamesFiltersState;
  onChange: (next: GamesFiltersState) => void;

  allTags: string[];
  resultsText: string;

  /** Optional: call when the user hits Enter in search */
  onSubmitSearch?: () => void;
};

function isDefault(v: GamesFiltersState) {
  return (
    v.query === "" && v.status === "all" && v.tag === "all" && v.sort === "az"
  );
}

export function GamesToolbar({
  value,
  onChange,
  allTags,
  resultsText,
  onSubmitSearch,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [expanded, setExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const set = (patch: Partial<GamesFiltersState>) =>
    onChange({ ...value, ...patch });

  const clearAll = () =>
    onChange({ query: "", status: "all", tag: "all", sort: "az" });

  const activeChips: Array<{
    key: string;
    label: string;
    onDelete: () => void;
  }> = [];

  if (value.status !== "all") {
    activeChips.push({
      key: "status",
      label:
        value.status === "announced_date"
          ? t("game.filter_release_date")
          : value.status === "recurring_daily"
            ? t("game.filter_daily_reset")
            : t("game.filter_tba"),
      onDelete: () => set({ status: "all" }),
    });
  }

  if (value.tag !== "all") {
    activeChips.push({
      key: "tag",
      label: `${t("common.tag")}: ${value.tag}`,
      onDelete: () => set({ tag: "all" }),
    });
  }

  if (value.sort !== "az") {
    activeChips.push({
      key: "sort",
      label:
        value.sort === "soonest"
          ? t("common.sort_soonest")
          : value.sort === "latest"
            ? t("common.sort_latest")
            : t("common.sort_daily_first"),
      onDelete: () => set({ sort: "az" }),
    });
  }

  const FiltersContent = (
    <Stack spacing={1.5} sx={{ pt: 0.5 }}>
      {/* Status */}
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {(
          [
            ["all", t("common.all")],
            ["announced_date", t("game.filter_release_date")],
            ["recurring_daily", t("game.filter_daily_reset")],
            ["tba", t("game.filter_tba")],
          ] as Array<[StatusFilter, string]>
        ).map(([k, label]) => (
          <Chip
            key={k}
            label={label}
            clickable
            onClick={() => set({ status: k })}
            color={value.status === k ? "primary" : "default"}
            variant={value.status === k ? "filled" : "outlined"}
            sx={{ borderRadius: 999 }}
          />
        ))}
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        {/* Tag */}
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

        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: 220, flex: 1 }}>
          <InputLabel>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
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

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={clearAll}
          disabled={isDefault(value)}
          sx={{ borderRadius: 3 }}
        >
          {t("common.clear")}
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <>
      {/* Sticky, compact toolbar */}
      <Paper
        variant="outlined"
        sx={{
          position: "sticky",
          top: 8,
          zIndex: 10,
          borderRadius: 4,
          px: 1.5,
          py: 1.25,
          backdropFilter: "blur(10px)",
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={1}>
          {/* Row 1: search + buttons + count */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              value={value.query}
              onChange={(e) => set({ query: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmitSearch?.();
              }}
              size="small"
              placeholder={t("common.search_placeholder")}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: value.query ? (
                  <InputAdornment position="end">
                    <Tooltip title={t("common.clear")}>
                      <IconButton
                        size="small"
                        onClick={() => set({ query: "" })}
                        aria-label={t("common.clear")}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : undefined,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                },
              }}
            />

            {/* Filter toggle (desktop collapse) / drawer (mobile) */}
            <Tooltip title="Filters">
              <IconButton
                onClick={() => {
                  if (isMobile) setDrawerOpen(true);
                  else setExpanded((v) => !v);
                }}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
                aria-label="Filters"
              >
                <TuneIcon />
              </IconButton>
            </Tooltip>

            {/* Quick clear when anything active */}
            {!isDefault(value) ? (
              <Tooltip title={t("common.clear")}>
                <IconButton
                  onClick={clearAll}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                  aria-label={t("common.clear")}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>

          {/* Row 2: active filter chips + result count */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {activeChips.map((c) => (
                <Chip
                  key={c.key}
                  label={c.label}
                  onDelete={c.onDelete}
                  variant="outlined"
                  sx={{ borderRadius: 999 }}
                />
              ))}
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {resultsText}
            </Typography>
          </Stack>

          {/* Desktop: collapsible filters */}
          {!isMobile ? (
            <Collapse in={expanded} timeout={220} unmountOnExit>
              <Divider sx={{ my: 1 }} />
              {FiltersContent}
            </Collapse>
          ) : null}
        </Stack>
      </Paper>

      {/* Mobile: drawer filters */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            p: 2,
          },
        }}
      >
        <Stack spacing={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={800}>
              Filters
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {resultsText}
          </Typography>

          <Divider />
          {FiltersContent}
        </Stack>
      </Drawer>
    </>
  );
}
