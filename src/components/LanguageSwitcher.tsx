import { useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (code: string) => {
    void i18n.changeLanguage(code);
    handleClose();
  };

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ??
    SUPPORTED_LANGUAGES.find((l) => l.code === "en")!;

  return (
    <Box>
      <Tooltip title={t("language.select_aria")}>
        <IconButton
          onClick={handleOpen}
          aria-label={t("language.select_aria")}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          size="small"
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            borderRadius: 999,
            px: 1,
            py: 0.5,
            gap: 0.5,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.01em",
            transition: "color 180ms ease, background 180ms ease",
            "&:hover": {
              color: theme.palette.text.primary,
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.05)",
            },
          })}
        >
          <LanguageIcon sx={{ fontSize: 18 }} />
          <Typography
            component="span"
            variant="caption"
            sx={{ fontWeight: 700, display: { xs: "none", sm: "inline" } }}
          >
            {currentLang.code.toUpperCase()}
          </Typography>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 200,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = i18n.resolvedLanguage === lang.code;
          return (
            <MenuItem
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              selected={isSelected}
              sx={{
                borderRadius: 1,
                mx: 0.5,
                my: 0.25,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={isSelected ? 700 : 500}>
                  {lang.nativeLabel}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {lang.label}
                </Typography>
              </Box>
              {isSelected && (
                <CheckIcon fontSize="small" sx={{ color: "primary.main", flexShrink: 0 }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}
