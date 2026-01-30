import React from "react";
import { Box, Link, Stack, Typography, useTheme } from "@mui/material";
import { Source, TrailerLink } from "../../../lib/types";
import { sourceIcon } from "../helpers";
import { Cover } from "./Cover";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getTrailerMeta, TrailerLinkWithCover } from "../utils";

export const GameLinks = ({
  trailers,
  coverUrl,
  sources,
  topSources,
  isMobile,
  t,
}: {
  trailers: TrailerLink[];
  coverUrl: string | null;
  sources: Source[];
  topSources: Source[];
  isMobile: boolean;
  t: (k: string, opts?: Record<string, unknown>) => string;
}) => {
  const theme = useTheme();

  if (trailers.length === 0 && topSources.length === 0) return null;

  const clickableSx = {
    textDecoration: "none",
    color: "inherit",
    outline: "none",
    "&:hover .clickHint": { opacity: 1 },
    "&:focus-visible": {
      boxShadow: `0 0 0 3px ${theme.palette.action.focus}`,
      borderRadius: 12,
    },
  } as const;

  return (
    <Box
      sx={{
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        p: theme.spacing(4, 6),
      }}
    >
      <Stack spacing={2.25}>
        {/* Trailers */}
        {trailers.length > 0 && (
          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              {t("pages.game.trailers") ?? "Trailers"}
            </Typography>

            <Stack
              direction="row"
              spacing={1.25}
              flexWrap="wrap"
              useFlexGap
              sx={{ alignItems: "stretch" }}
            >
              {trailers.slice(0, 4).map((tr, idx) => {
                const meta = getTrailerMeta(
                  tr as TrailerLinkWithCover,
                  idx,
                  t,
                  coverUrl,
                );
                const hasCover = Boolean(meta.thumbUrl);

                return (
                  <Link
                    key={`${meta.url}-${idx}`}
                    href={meta.url}
                    target="_blank"
                    rel="noreferrer"
                    underline="none"
                    aria-label={meta.label}
                    sx={{
                      ...clickableSx,
                      width: { xs: "100%", sm: 220 },
                      borderRadius: 3,
                    }}
                  >
                    <Box
                      sx={{
                        height: hasCover ? 250 : 170,
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        overflow: "hidden",
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(0,0,0,0.015)",
                        transition:
                          "transform 120ms ease, box-shadow 120ms ease",
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow:
                            theme.palette.mode === "dark"
                              ? "0 6px 18px rgba(0,0,0,0.35)"
                              : "0 6px 18px rgba(0,0,0,0.12)",
                        },
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {hasCover ? (
                        <>
                          <Cover
                            src={meta.thumbUrl!}
                            alt={meta.label}
                            height={isMobile ? 140 : 120}
                          />

                          <Box sx={{ p: 2 }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="flex-start"
                              sx={{ minWidth: 0 }}
                            >
                              {/* Allow wrapping + clamp to 2 lines */}
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 800,
                                  lineHeight: 1.2,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  minWidth: 0,
                                  flex: 1,
                                }}
                              >
                                {meta.label}
                              </Typography>

                              <Box
                                className="clickHint"
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  color: "text.secondary",
                                  opacity: 0.7,
                                  flexShrink: 0,
                                  pt: 0.25,
                                }}
                              >
                                <OpenInNewIcon fontSize="small" />
                              </Box>
                            </Stack>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {meta.provider === "youtube"
                                ? "YouTube"
                                : meta.provider === "vimeo"
                                  ? "Vimeo"
                                  : (t("pages.game.video") ?? "Video")}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        // No-cover: centered text, padded, no CTA/button area
                        <Box
                          sx={{
                            flex: 1,
                            px: 2.5,
                            py: 2.25,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            gap: 0.75,
                            background:
                              theme.palette.mode === "dark"
                                ? "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))"
                                : "linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.01))",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            justifyContent="center"
                            sx={{ color: "text.secondary" }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 800, letterSpacing: 0.3 }}
                            >
                              {t("pages.game.trailer") ?? "Trailer"}
                            </Typography>

                            {meta.provider !== "other" ? (
                              <Typography variant="caption" noWrap>
                                ·{" "}
                                {meta.provider === "youtube"
                                  ? "YouTube"
                                  : "Vimeo"}
                              </Typography>
                            ) : null}
                          </Stack>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 900,
                              lineHeight: 1.2,
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {meta.label}
                          </Typography>

                          <Box
                            className="clickHint"
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              color: "text.secondary",
                              opacity: 0.65,
                            }}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Link>
                );
              })}
            </Stack>
          </Stack>
        )}

        {/* Sources */}
        {topSources.length > 0 && (
          <Stack>
            <Typography variant="overline" color="text.secondary">
              {t("pages.game.sources") ?? "Sources"}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gap: 1,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                alignItems: "stretch",
              }}
            >
              {topSources.map((s, idx) => {
                const RowInner = (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      borderRadius: 2,
                      width: "100%",
                      px: 2.5,
                      py: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(0,0,0,0.015)",
                      transition: "background-color 120ms ease",
                      "&:hover": s.url
                        ? {
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.04)"
                                : "rgba(0,0,0,0.03)",
                          }
                        : undefined,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: "text.secondary",
                      }}
                    >
                      {sourceIcon(s)}
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700 }}
                        noWrap
                      >
                        {s.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {(s.isOfficial ? "Official" : "Community/press") +
                          (s.type ? ` · ${s.type}` : "")}
                      </Typography>
                    </Box>

                    {s.url ? (
                      <Box
                        className="clickHint"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          color: "text.secondary",
                          opacity: 0.65,
                          flexShrink: 0,
                        }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </Box>
                    ) : null}
                  </Stack>
                );

                return s.url ? (
                  <Link
                    key={`${s.url ?? s.name}-${idx}`}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    underline="none"
                    aria-label={`${t("pages.game.open") ?? "Open"}: ${s.name}`}
                    sx={{
                      ...clickableSx,
                      display: "block",
                      borderRadius: 3,
                      height: "100%",
                    }}
                  >
                    {RowInner}
                  </Link>
                ) : (
                  <Box
                    key={`${s.url ?? s.name}-${idx}`}
                    sx={{ opacity: 0.85, height: "100%" }}
                  >
                    {RowInner}
                  </Box>
                );
              })}
            </Box>

            {sources.length > topSources.length ? (
              <Typography variant="caption" color="text.secondary">
                {t("pages.game.more_sources", {
                  count: sources.length - topSources.length,
                }) ?? `+${sources.length - topSources.length} more`}
              </Typography>
            ) : null}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};
