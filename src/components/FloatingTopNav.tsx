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
}

type PillMeasure = { x: number; y: number; w: number; h: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const FloatingTopNav = ({
  value,
  onChange,
  logo,
  logoWidth = 180,
}: FloatingTopNavProps) => {
  const { t } = useTranslation();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);

  const btnRefs = useRef<Record<NavKey, HTMLButtonElement | null>>({
    home: null,
    games: null,
    about: null,
  });

  const [pill, setPill] = useState<PillMeasure | null>(null);

  const easing = useMemo(() => "cubic-bezier(0.16, 1, 0.3, 1)", []);

  const [metrics, setMetrics] = useState<{
    fontSizePx: number;
    iconPx: number;
    gapPx: number;
    px: number;
    py: number;
  }>({
    fontSizePx: 14,
    iconPx: 18,
    gapPx: 8,
    px: 14,
    py: 10,
  });

  const updateMetrics = () => {
    const el = rootRef.current;
    if (!el) return;

    const w = el.getBoundingClientRect().width;

    const fontSizePx = clamp(12.5 + (w - 360) / 180, 12.5, 14.5);
    const iconPx = clamp(16 + (w - 360) / 220, 16, 20);
    const gapPx = clamp(6 + (w - 360) / 220, 6, 10);
    const px = clamp(10 + (w - 360) / 120, 10, 16);
    const py = clamp(8 + (w - 360) / 260, 8, 11);

    setMetrics({ fontSizePx, iconPx, gapPx, px, py });
  };

  const measurePill = useCallback(() => {
    const groupEl = groupRef.current;
    const btnEl = btnRefs.current[value];
    if (!groupEl || !btnEl) return;

    const groupBox = groupEl.getBoundingClientRect();
    const btnBox = btnEl.getBoundingClientRect();

    setPill({
      x: btnBox.left - groupBox.left,
      y: btnBox.top - groupBox.top,
      w: btnBox.width,
      h: btnBox.height,
    });
  }, [value]);

  useLayoutEffect(() => {
    let raf1 = 0;
    let raf2 = 0;

    raf1 = requestAnimationFrame(() => {
      updateMetrics();
      measurePill();
      raf2 = requestAnimationFrame(() => {
        updateMetrics();
        measurePill();
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [measurePill, value]);

  useEffect(() => {
    const onResize = () => {
      updateMetrics();
      measurePill();
    };

    onResize();
    window.addEventListener("resize", onResize);

    const fontsReady = document?.fonts?.ready as unknown as
      | Promise<void>
      | undefined;
    if (fontsReady) fontsReady.then(onResize).catch(() => {});

    return () => window.removeEventListener("resize", onResize);
  }, [measurePill]);

  const pillTransform = useMemo(() => {
    if (!pill) return "translate3d(0px,0px,0) scale3d(0,0,1)";
    const baseW = 100;
    const baseH = 40;
    const sx = pill.w / baseW;
    const sy = pill.h / baseH;
    return `translate3d(${pill.x}px, ${pill.y}px, 0) scale3d(${sx}, ${sy}, 1)`;
  }, [pill]);

  const navWidthStyle = useMemo(() => {
    const showLogo = Boolean(logo);
    const min = showLogo ? 520 : 420;
    return {
      width: "fit-content",
      maxWidth: "100%",
      minWidth: { xs: "100%", sm: min },
      px: { xs: 1, sm: 1.25 },
    } as const;
  }, [logo]);

  const iconSx = useMemo(
    () => ({ fontSize: `${metrics.iconPx}px` }),
    [metrics.iconPx],
  );

  return (
    <Paper
      ref={rootRef}
      elevation={0}
      sx={(theme) => ({
        mx: "auto",
        ...navWidthStyle,
        borderRadius: 999,
        py: 1,
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(16px)",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))"
            : "linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.55))",
        border:
          theme.palette.mode === "dark"
            ? "1px solid rgba(255,255,255,0.10)"
            : "1px solid rgba(0,0,0,0.06)",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 18px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 16px 40px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
      })}
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
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(255,255,255,0.55)",
              border:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "1px solid rgba(0,0,0,0.05)",
            })}
          >
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
              {logo}
            </Box>
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
              backgroundColor: "transparent",
              border: "none",
            }}
          >
            <Box
              aria-hidden
              sx={(theme) => ({
                position: "absolute",
                top: 0,
                left: 0,
                width: 100,
                height: 40,
                borderRadius: 999,
                pointerEvents: "none",
                transformOrigin: "0 0",
                transform: pillTransform,
                transition: `transform 560ms ${easing}, opacity 220ms ${easing}`,
                willChange: "transform",
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
                    px: `${metrics.px}px`,
                    py: `${metrics.py}px`,
                    minHeight: 40,
                    textTransform: "none",
                    color: theme.palette.text.secondary,
                    backgroundColor: "transparent",
                    transition: `transform 240ms ${easing}, color 240ms ${easing}`,
                    willChange: "transform",
                    "&:hover": {
                      backgroundColor: "transparent",
                      transform: "translate3d(0,-1px,0)",
                      color: theme.palette.text.primary,
                    },
                    "&:active": {
                      transform: "translate3d(0,0,0) scale(0.99)",
                    },
                    "&.Mui-selected": {
                      color: theme.palette.text.primary,
                      backgroundColor: "transparent",
                    },
                    "&:focus-visible": {
                      outline: "none",
                      boxShadow: `0 0 0 3px ${theme.palette.primary.main}33`,
                    },
                  })}
                >
                  <Stack direction="row" spacing={0} alignItems="center">
                    <Box
                      sx={(theme) => ({
                        display: "grid",
                        placeItems: "center",
                        width: clamp(24 + (metrics.iconPx - 16), 24, 30),
                        height: clamp(24 + (metrics.iconPx - 16), 24, 30),
                        borderRadius: 999,
                        color: "inherit",
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.03)"
                            : "rgba(0,0,0,0.03)",
                        transition: `transform 240ms ${easing}, background-color 240ms ${easing}`,
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

                    <Box sx={{ width: `${metrics.gapPx}px` }} />

                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: `${metrics.fontSizePx}px`,
                        fontWeight: 850,
                        letterSpacing: "-0.01em",
                        display: { xs: "none", sm: "block" },
                        whiteSpace: "nowrap",
                        opacity: 0.92,
                        lineHeight: 1,
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
  );
};
