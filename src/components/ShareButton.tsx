import { useCallback, useState } from "react";
import { IconButton, Snackbar, Tooltip } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { trackEvent } from "../analytics/ga4";

type Props = {
  gameId: string;
  gameName: string;
};

export function ShareButton({ gameId, gameName }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (navigator.share !== undefined) {
      try {
        await navigator.share({ title: gameName, url });
        trackEvent("game_share", { method: "native", game_id: gameId });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      trackEvent("game_share", { method: "clipboard", game_id: gameId });
      setCopied(true);
    } catch {
      // Clipboard unavailable — do nothing
    }
  }, [gameId, gameName]);

  return (
    <>
      <Tooltip title={copied ? t("common.link_copied") : t("common.share")}>
        <IconButton
          onClick={handleShare}
          aria-label={t("common.share")}
          size="small"
          sx={(theme) => ({
            borderRadius: 999,
            border: `1px solid ${
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.10)"
            }`,
            color: copied
              ? theme.palette.primary.main
              : theme.palette.text.secondary,
            transition: "color 200ms ease, border-color 200ms ease",
            "&:hover": {
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
            },
          })}
        >
          {copied ? (
            <CheckIcon fontSize="small" />
          ) : (
            <ShareIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message={t("common.link_copied")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
