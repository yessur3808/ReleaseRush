import { useCallback, useRef, useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import LinkIcon from "@mui/icons-material/Link";
import WidgetsIcon from "@mui/icons-material/Widgets";
import CodeIcon from "@mui/icons-material/Code";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { trackEvent } from "../analytics/ga4";

type Props = {
  gameId: string;
  gameName: string;
};

type CopiedKey = "page" | "widget" | "embed" | null;

function buildPageUrl(gameId: string): string {
  return `${window.location.origin}/game/${encodeURIComponent(gameId)}`;
}

function buildWidgetUrl(gameId: string): string {
  return `${window.location.origin}/embed/game/${encodeURIComponent(gameId)}`;
}

function buildEmbedCode(gameId: string, gameName: string): string {
  const src = buildWidgetUrl(gameId);
  return `<iframe src="${src}" width="400" height="220" title="${gameName} countdown" style="border:0" loading="lazy"></iframe>`;
}

export function ShareButton({ gameId, gameName }: Props) {
  const { t } = useTranslation();
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<CopiedKey>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const copyToClipboard = useCallback(
    async (key: Exclude<CopiedKey, null>, text: string, method: string) => {
      handleClose();
      try {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        trackEvent("game_share", { method, game_id: gameId });
      } catch {
        // Clipboard unavailable — do nothing
      }
    },
    [gameId],
  );

  const handleSharePage = useCallback(async () => {
    const url = buildPageUrl(gameId);
    if (navigator.share !== undefined) {
      try {
        await navigator.share({ title: gameName, url });
        trackEvent("game_share", { method: "native_page", game_id: gameId });
        handleClose();
        return;
      } catch {
        // User cancelled or share not supported — fall through to clipboard
      }
    }
    await copyToClipboard("page", url, "clipboard_page");
  }, [gameId, gameName, copyToClipboard]);

  const handleShareWidget = useCallback(async () => {
    await copyToClipboard("widget", buildWidgetUrl(gameId), "clipboard_widget");
  }, [gameId, copyToClipboard]);

  const handleCopyEmbed = useCallback(async () => {
    await copyToClipboard(
      "embed",
      buildEmbedCode(gameId, gameName),
      "clipboard_embed",
    );
  }, [gameId, gameName, copyToClipboard]);

  const snackbarMessage =
    copiedKey === "embed"
      ? t("common.embed_code_copied")
      : copiedKey === "widget"
        ? t("common.widget_url_copied")
        : t("common.link_copied");

  return (
    <>
      <Tooltip title={t("common.share")}>
        <IconButton
          ref={anchorRef}
          onClick={handleOpen}
          aria-label={t("common.share")}
          aria-haspopup="menu"
          size="small"
          sx={(theme) => ({
            borderRadius: 999,
            border: `1px solid ${
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.10)"
            }`,
            color:
              copiedKey !== null
                ? theme.palette.primary.main
                : theme.palette.text.secondary,
            transition: "color 200ms ease, border-color 200ms ease",
            "&:hover": {
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
            },
          })}
        >
          {copiedKey !== null ? (
            <CheckIcon fontSize="small" />
          ) : (
            <ShareIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 230, p: 0.5 },
        }}
      >
        <Box sx={{ px: 1.5, pt: 1.25, pb: 0.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}
          >
            {t("common.share")}
          </Typography>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <List dense disablePadding>
          <ListItemButton onClick={handleSharePage} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LinkIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t("common.share_page")}
              secondary={t("common.share_page_desc")}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItemButton>

          <ListItemButton onClick={handleShareWidget} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <WidgetsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t("common.share_widget")}
              secondary={t("common.share_widget_desc")}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItemButton>

          <ListItemButton onClick={handleCopyEmbed} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CodeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t("common.copy_embed_code")}
              secondary={t("common.copy_embed_code_desc")}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItemButton>
        </List>
      </Popover>

      <Snackbar
        open={copiedKey !== null}
        autoHideDuration={2000}
        onClose={() => setCopiedKey(null)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
