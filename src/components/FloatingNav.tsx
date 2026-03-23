import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Paper,
  Stack,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Portal,
  useMediaQuery,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { useTranslation } from "react-i18next";

type NavKey = "home" | "games" | "about";

const ITEMS: Array<{
  key: NavKey;
  labelKey: "nav.home" | "nav.games" | "nav.about";
  icon: ReactNode;
}> = [
  { key: "home", labelKey: "nav.home", icon: <HomeRoundedIcon /> },
  { key: "games", labelKey: "nav.games", icon: <GridViewRoundedIcon /> },
  { key: "about", labelKey: "nav.about", icon: <InfoRoundedIcon /> },
];

interface FloatingTopNavProps {
  value: NavKey;
  onChange: (key: NavKey) => void;
  logo?: ReactNode;
  logoWidth?: number;
  dock?: "top" | "bottom";
  offsetPx?: number;
}

type PillMeasure = { x: number; y: number; w: number; h: number };
type NavMetrics = {
  fontSizePx: number;
  iconPx: number;
  gapPx: number;
  px: number;
  py: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const FloatingNav = ({
  value,
  onChange,
  logo,
  logoWidth = 180,
  dock = "top",
  offsetPx = 12,
}: FloatingTopNavProps) => {
  const { t } = useTranslation();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const rootRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);

  const btnRefs = useRef<Record<NavKey, HTMLButtonElement | null>>({
    home: null,
    games: null,
    about: null,
  });

  const [pill, setPill] = useState<PillMeasure | null>(null);
  const frameRef = useRef<number | null>(null);

  const easing = useMemo(() => "cubic-bezier(0.22, 1, 0.36, 1)", []);
  const pillEasing = useMemo(() => "cubic-bezier(0.2, 0.9, 0.2, 1.05)", []);
  const hoverEasing = useMemo(() => "cubic-bezier(0.16, 1, 0.3, 1)", []);
  const dur = useMemo(
    () => ({
      expand: 240,
      pill: 240,
      fade: 130,
    }),
    [],
  );

  const [isHover, setIsHover] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const expanded = isHover || isFocusWithin;

  const [metrics, setMetrics] = useState<NavMetrics>({
    fontSizePx: 14,
    iconPx: 22,
    gapPx: 8,
    px: 14,
    py: 10,
  });

  const areMetricsEqual = (a: NavMetrics, b: NavMetrics) =>
    Math.abs(a.fontSizePx - b.fontSizePx) < 0.01 &&
    Math.abs(a.iconPx - b.iconPx) < 0.01 &&
    Math.abs(a.gapPx - b.gapPx) < 0.01 &&
    Math.abs(a.px - b.px) < 0.01 &&
    Math.abs(a.py - b.py) < 0.01;

  const arePillsEqual = (a: PillMeasure | null, b: PillMeasure) => {
    if (!a) return false;
    return (
      Math.abs(a.x - b.x) < 0.5 &&
      Math.abs(a.y - b.y) < 0.5 &&
      Math.abs(a.w - b.w) < 0.5 &&
      Math.abs(a.h - b.h) < 0.5
    );
  };

  const updateMetrics = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;

    const w = el.getBoundingClientRect().width;

    const fontSizePx = clamp(12.5 + (w - 360) / 180, 12.5, 14.5);

    const iconPx = clamp(20 + (w - 360) / 180, 20, 26);

    const gapPx = clamp(6 + (w - 360) / 220, 6, 10);
    const px = clamp(10 + (w - 360) / 120, 10, 16);
    const py = clamp(8 + (w - 360) / 260, 8, 11);

    const nextMetrics = { fontSizePx, iconPx, gapPx, px, py };
    setMetrics((prev) => (areMetricsEqual(prev, nextMetrics) ? prev : nextMetrics));
  }, []);

  const measurePill = useCallback(() => {
    const wrapEl = groupRef.current;
    const btnEl = btnRefs.current[value];
    if (!wrapEl || !btnEl) return;

    const wrapBox = wrapEl.getBoundingClientRect();
    const btnBox = btnEl.getBoundingClientRect();

    const nextPill = {
      x: btnBox.left - wrapBox.left,
      y: btnBox.top - wrapBox.top,
      w: btnBox.width,
      h: btnBox.height,
    };

    setPill((prev) => (arePillsEqual(prev, nextPill) ? prev : nextPill));
  }, [value]);

  const scheduleMeasure = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      updateMetrics();
      measurePill();
    });
  }, [measurePill, updateMetrics]);

  useLayoutEffect(() => {
    scheduleMeasure();
  }, [scheduleMeasure, value, expanded]);

  useLayoutEffect(() => {
    scheduleMeasure();
  }, [scheduleMeasure, metrics.fontSizePx, metrics.iconPx, metrics.gapPx, metrics.px, metrics.py]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    const rootEl = rootRef.current;
    const groupEl = groupRef.current;
    let resizeRaf = 0;

    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        scheduleMeasure();
      });
    };

    const onTransitionEnd = (event: TransitionEvent) => {
      if (
        event.propertyName === "width" ||
        event.propertyName === "min-width" ||
        event.propertyName === "max-width" ||
        event.propertyName.startsWith("padding")
      ) {
        scheduleMeasure();
      }
    };

    scheduleMeasure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => onResize());
      if (rootEl) ro.observe(rootEl);
      if (groupEl) ro.observe(groupEl);
    } else {
      window.addEventListener("resize", onResize);
    }

    groupEl?.addEventListener("transitionend", onTransitionEnd);

    const fontsReady = document?.fonts?.ready as unknown as Promise<void> | undefined;
    if (fontsReady) fontsReady.then(() => scheduleMeasure()).catch(() => {});

    return () => {
      if (!ro) window.removeEventListener("resize", onResize);
      groupEl?.removeEventListener("transitionend", onTransitionEnd);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      ro?.disconnect();
    };
  }, [scheduleMeasure]);

  const pillStyle = useMemo(() => {
    if (!pill) return null;
    return {
      transform: `translate3d(${pill.x}px, ${pill.y}px, 0)`,
      width: pill.w,
      height: pill.h,
    };
  }, [pill]);

  const navWidthStyle = useMemo(() => {
    const showLogo = Boolean(logo);
    const minCollapsed = showLogo ? 320 : 220;
    const minExpanded = showLogo ? 520 : 420;

    return {
      width: { xs: "calc(100vw - 24px)", sm: "fit-content" },
      maxWidth: { xs: "calc(100vw - 24px)", sm: "calc(100vw - 32px)", md: "100%" },
      minWidth: { xs: 0, sm: expanded ? minExpanded : minCollapsed },
      px: { xs: 1, sm: 1.25 },
      transition: prefersReducedMotion ? "none" : `min-width ${dur.expand}ms ${easing}`,
      willChange: "min-width",
      contain: "layout style",
    } as const;
  }, [logo, expanded, dur.expand, easing, prefersReducedMotion]);

  const iconSx = useMemo(() => ({ fontSize: `${metrics.iconPx}px` }), [metrics.iconPx]);

  const btnPx = expanded ? metrics.px : Math.max(8, Math.round(metrics.px * 0.55));
  const internalGap = expanded ? metrics.gapPx : 0;

  const iconBox = useMemo(() => {
    const size = clamp(metrics.iconPx + 10, 30, 38);
    return { w: size, h: size };
  }, [metrics.iconPx]);

  return (
    <Portal>
      <Paper
        ref={rootRef}
        elevation={0}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onFocus={() => setIsFocusWithin(true)}
        onBlurCapture={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && rootRef.current?.contains(next)) return;
          setIsFocusWithin(false);
        }}
        sx={(theme) => {
          const isDark = theme.palette.mode === "dark";
          const accent = isDark ? "rgba(120, 255, 214, 0.40)" : "rgba(0, 150, 120, 0.28)";

          const dockPos =
            dock === "top"
              ? { top: `calc(env(safe-area-inset-top, 0px) + ${offsetPx}px)` }
              : {
                  bottom: `calc(env(safe-area-inset-bottom, 0px) + ${offsetPx}px)`,
                };

          return {
            position: "fixed",
            zIndex: theme.zIndex.appBar + 1,
            ...dockPos,

            left: "50%",
            right: "auto",
            transform: "translateX(-50%)",

            mx: 0,
            ...navWidthStyle,

            borderRadius: 999,
            py: 1,
            height: "auto",

            overflow: "hidden",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",

            background: isDark
              ? "linear-gradient(180deg, rgba(18,20,24,0.88), rgba(18,20,24,0.72))"
              : "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.72))",
            backgroundImage: "none",

            border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.08)",

            boxShadow: isDark
              ? `0 18px 50px rgba(0,0,0,0.55), 0 0 0 1px ${accent}`
              : `0 18px 50px rgba(0,0,0,0.16), 0 0 0 1px ${accent}`,

            transition: prefersReducedMotion
              ? "none"
              : `transform 180ms ${hoverEasing}, box-shadow 180ms ${hoverEasing}`,

            "@media (hover: hover) and (pointer: fine)": {
              "&:hover": {
                transform: "translateX(-50%) translateY(-1px)",
                boxShadow: isDark
                  ? `0 22px 60px rgba(0,0,0,0.65), 0 0 0 1px ${accent}, 0 0 0 6px rgba(120,255,214,0.08)`
                  : `0 22px 60px rgba(0,0,0,0.20), 0 0 0 1px ${accent}, 0 0 0 6px rgba(0,150,120,0.10)`,
              },
            },
          };
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 0.5 }}>
          {logo ? (
            <Box
              sx={(theme) => ({
                width: logoWidth,
                minWidth: logoWidth,
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                px: 1,
                py: 0.75,
                borderRadius: 999,
                userSelect: "none",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                backgroundColor:
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                border:
                  theme.palette.mode === "dark"
                    ? "1px solid rgba(255,255,255,0.10)"
                    : "1px solid rgba(0,0,0,0.08)",
                opacity: expanded ? 1 : 0,
                transform: expanded ? "translate3d(0,0,0)" : "translate3d(-6px,0,0)",
                pointerEvents: expanded ? "auto" : "none",
                transition: prefersReducedMotion
                  ? "none"
                  : `opacity ${dur.fade}ms ${easing}, transform ${dur.fade}ms ${easing}`,
                willChange: "opacity, transform",
              })}
            >
              <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>{logo}</Box>
            </Box>
          ) : null}

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              ref={groupRef}
              sx={{
                position: "relative",
                borderRadius: 999,
                padding: 4 / 8,
                overflow: "visible",
              }}
            >
              <Box
                aria-hidden
                sx={(theme) => ({
                  position: "absolute",
                  left: 0,
                  top: 0,
                  borderRadius: 999,
                  pointerEvents: "none",

                  ...(pillStyle
                    ? pillStyle
                    : { transform: "translate3d(0,0,0)", width: 0, height: 0 }),

                  transition: prefersReducedMotion
                    ? "none"
                    : [
                        `transform ${dur.pill}ms ${pillEasing}`,
                        `width ${dur.pill}ms ${pillEasing}`,
                        `height ${dur.pill}ms ${pillEasing}`,
                        `opacity ${dur.fade}ms ${easing}`,
                      ].join(", "),
                  willChange: "transform, width, height, opacity",
                  opacity: pill ? 1 : 0,

                  background:
                    theme.palette.mode === "dark"
                      ? "linear-gradient(180deg, rgba(120,170,255,0.22), rgba(255,255,255,0.08))"
                      : "linear-gradient(180deg, rgba(120,170,255,0.18), rgba(255,255,255,0.70))",
                  border:
                    theme.palette.mode === "dark"
                      ? "1px solid rgba(180,210,255,0.18)"
                      : "1px solid rgba(60,140,255,0.14)",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 16px 28px rgba(0,0,0,0.30), 0 12px 24px rgba(60,140,255,0.18), inset 0 1px 0 rgba(255,255,255,0.12)"
                      : "0 12px 20px rgba(0,0,0,0.10), 0 12px 24px rgba(60,140,255,0.12), inset 0 1px 0 rgba(255,255,255,0.70)",
                })}
              />

              <ToggleButtonGroup
                exclusive
                value={value}
                onChange={(_, next: NavKey | null) => {
                  if (next) onChange(next);
                }}
                aria-label="Top navigation"
                sx={{
                  position: "relative",
                  zIndex: 1,
                  borderRadius: 999,
                  gap: 0.5,
                  "& .MuiToggleButtonGroup-grouped": {
                    border: 0,
                    borderRadius: 999,
                    margin: 0,
                  },
                }}
              >
                {ITEMS.map((item) => (
                  <ToggleButton
                    key={item.key}
                    value={item.key}
                    disableRipple
                    ref={(el) => {
                      btnRefs.current[item.key] = el;
                    }}
                    sx={(theme) => ({
                      borderRadius: 999,
                      px: `${btnPx}px`,
                      py: `${metrics.py}px`,
                      minHeight: 40,
                      textTransform: "none",
                      color: theme.palette.text.secondary,
                      backgroundColor: "transparent",
                      transition: prefersReducedMotion
                        ? "none"
                        : `transform 200ms ${hoverEasing}, color 200ms ${hoverEasing}, padding ${dur.expand}ms ${easing}`,
                      willChange: "transform, padding",
                      "@media (hover: hover) and (pointer: fine)": {
                        "&:hover": {
                          backgroundColor: "transparent",
                          transform: "translate3d(0,-1px,0)",
                          color: theme.palette.text.primary,
                        },
                      },
                      "&:active": {
                        transform: "translate3d(0,0,0) scale(0.99)",
                      },
                      "&.Mui-selected": {
                        color: theme.palette.text.primary,
                        backgroundColor: "transparent",
                      },
                      "&.Mui-selected .nav-icon-shell": {
                        transform: "translate3d(0,-0.5px,0) scale(1.03)",
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.10)"
                            : "rgba(60,140,255,0.14)",
                      },
                      "&:focus-visible": {
                        outline: "none",
                        boxShadow: `0 0 0 3px ${theme.palette.primary.main}33`,
                      },
                    })}
                  >
                    <Stack direction="row" spacing={0} alignItems="center">
                      <Box
                        className="nav-icon-shell"
                        sx={(theme) => ({
                          display: "grid",
                          placeItems: "center",
                          width: iconBox.w,
                          height: iconBox.h,
                          borderRadius: 999,
                          color: "inherit",
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(0,0,0,0.03)",
                          transition: prefersReducedMotion
                            ? "none"
                            : `transform 220ms ${hoverEasing}, background-color 220ms ${hoverEasing}`,
                        })}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            placeItems: "center",
                            "& svg": iconSx,
                          }}
                        >
                          {item.icon}
                        </Box>
                      </Box>

                      <Box
                        aria-hidden
                        sx={{
                          width: `${internalGap}px`,
                          transition: prefersReducedMotion
                            ? "none"
                            : `width ${dur.expand}ms ${easing}`,
                          willChange: "width",
                        }}
                      />

                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: `${metrics.fontSizePx}px`,
                          fontWeight: 850,
                          letterSpacing: "-0.01em",
                          display: { xs: "none", sm: "block" },
                          whiteSpace: "nowrap",
                          lineHeight: 1,
                          maxWidth: expanded ? 160 : 0,
                          opacity: expanded ? 0.92 : 0,
                          transform: expanded ? "translate3d(0,0,0)" : "translate3d(-6px,0,0)",
                          overflow: "hidden",
                          transition: prefersReducedMotion
                            ? "none"
                            : `max-width ${dur.expand}ms ${easing}, opacity ${dur.fade}ms ${easing}, transform ${dur.fade}ms ${easing}`,
                          willChange: "max-width, opacity, transform",
                        }}
                      >
                        {t(item.labelKey)}
                      </Typography>
                    </Stack>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Stack>
      </Paper>
    </Portal>
  );
};
