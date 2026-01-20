import React from "react";
import { Paper, Stack, Button, Box } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { useTranslation } from "react-i18next";

type NavKey = "home" | "games" | "about";

const ITEMS: Array<{
  key: NavKey;
  labelKey: "nav.home" | "nav.games" | "nav.about";
  icon: React.ReactNode;
}> = [
  { key: "home", labelKey: "nav.home", icon: <HomeRoundedIcon /> },
  { key: "games", labelKey: "nav.games", icon: <GridViewRoundedIcon /> },
  { key: "about", labelKey: "nav.about", icon: <InfoRoundedIcon /> },
];

interface FloatingTopNavProps {
  value: NavKey;
  onChange: (key: NavKey) => void;
  logo?: React.ReactNode;
  logoWidth?: number;
}

export const FloatingTopNav = ({
  value,
  onChange,
  logo,
  logoWidth = 180,
}: FloatingTopNavProps) => {
  const { t } = useTranslation();

  const activeIndex = Math.max(
    0,
    ITEMS.findIndex((i) => i.key === value)
  );

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        mx: "auto",
        maxWidth: 980,
        borderRadius: 999,
        px: 1,
        py: 1,
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(14px)",
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
      })}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 0.5 }}>
        {logo ? (
          <Box
            sx={(theme) => ({
              width: logoWidth,
              minWidth: logoWidth,
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.75,
              borderRadius: 999,
              userSelect: "none",
              color: theme.palette.text.primary,
              opacity: 1,
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            })}
          >
            {/* use the passed logo node */}
            {logo}
          </Box>
        ) : null}

        {/* Nav area */}
        <Box sx={{ position: "relative", flex: 1, minWidth: 0 }}>
          {/* Sliding active pill */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              pointerEvents: "none",
              px: 0.5,
              py: 0.5,
            }}
          >
            <Box
              sx={(theme) => ({
                position: "absolute",
                top: 4,
                bottom: 4,
                left: 4,
                width: `calc((100% - 8px) / ${ITEMS.length})`,
                transform: `translateX(${activeIndex * 100}%)`,
                transition: "transform 260ms cubic-bezier(.2,.9,.2,1)",
                borderRadius: 999,
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))"
                    : "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.04))",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow:
                  "0 10px 22px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)",
              })}
            />
          </Box>

          <Stack direction="row" spacing={0} alignItems="stretch">
            {ITEMS.map((item) => {
              const isActive = item.key === value;

              return (
                <Button
                  key={item.key}
                  onClick={() => onChange(item.key)}
                  startIcon={item.icon}
                  disableElevation
                  variant="text"
                  sx={(theme) => ({
                    flex: 1,
                    py: 1.1,
                    borderRadius: 999,
                    position: "relative",
                    zIndex: 1,
                    color: isActive
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                    fontWeight: isActive ? 900 : 800,
                    textTransform: "none",
                    "& .MuiButton-startIcon": {
                      marginRight: 1,
                      transition: "transform 200ms ease, opacity 200ms ease",
                      opacity: isActive ? 1 : 0.85,
                    },
                    transition:
                      "transform 160ms ease, color 160ms ease, background-color 160ms ease",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.06)",
                      transform: "translateY(-1px)",
                      "& .MuiButton-startIcon": {
                        transform: "translateY(-1px)",
                      },
                    },
                    "&:active": { transform: "translateY(0px) scale(0.98)" },
                    "&:focus-visible": {
                      outline: "none",
                      boxShadow: `0 0 0 3px rgba(255,255,255,0.16), 0 0 0 6px ${theme.palette.primary.main}33`,
                    },
                  })}
                >
                  {t(item.labelKey)}
                </Button>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};
