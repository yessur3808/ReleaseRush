import React from "react";
import { Stack, styled, Typography } from "@mui/material";
import { CountdownSegment } from "./CountdownSegment";
import { pad2, splitMs } from "../../../utils";
import { useTranslation } from "react-i18next";

type SeparatorProps = {
  compact?: boolean;
};

const Separator = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "compact",
})<SeparatorProps>(({ compact }) => ({
  marginTop: compact ? 1.05 : 1.35,
  color: "text.secondary",
  fontWeight: 700,
  opacity: 0.7,
}));

interface NiceCountdownProps {
  msLeft: number | null;
  compact?: boolean;
  minimal?: boolean;
}

export const NiceCountdown = ({ msLeft, compact, minimal }: NiceCountdownProps) => {
  const { t } = useTranslation();

  if (msLeft === null) {
    return (
      <Stack spacing={0.5}>
        <Typography variant={compact ? "h6" : "h4"} fontWeight={950}>
          {t("pages.game.countdown.tba")}
        </Typography>
        {!compact && (
          <Typography variant="body2" color="text.secondary">
            {t("pages.game.countdown.no_release_window")}
          </Typography>
        )}
      </Stack>
    );
  }

  if (msLeft <= 0) {
    return (
      <Stack spacing={0.5}>
        <Typography variant={compact ? "h6" : "h4"} fontWeight={950}>
          {t("pages.game.countdown.released")}
        </Typography>
        {!compact && (
          <Typography variant="body2" color="text.secondary">
            {t("pages.game.countdown.reached_zero")}
          </Typography>
        )}
      </Stack>
    );
  }

  const { d, h, m, s } = splitMs(msLeft);

  return (
    <Stack direction="row" spacing={compact ? 1 : 1.5} alignItems="flex-start" flexWrap="wrap">
      <CountdownSegment
        labelKey="pages.game.countdown.days"
        labelShortKey="pages.game.countdown.days_short"
        value={String(d)}
        compact={compact}
        minimal={minimal}
      />
      <Separator aria-hidden compact={compact}>
        :
      </Separator>
      <CountdownSegment
        labelKey="pages.game.countdown.hours"
        labelShortKey="pages.game.countdown.hours_short"
        value={pad2(h)}
        compact={compact}
        minimal={minimal}
      />
      <Separator aria-hidden compact={compact}>
        :
      </Separator>
      <CountdownSegment
        labelKey="pages.game.countdown.minutes"
        labelShortKey="pages.game.countdown.minutes_short"
        value={pad2(m)}
        compact={compact}
        minimal={minimal}
      />
      <Separator aria-hidden compact={compact}>
        :
      </Separator>
      <CountdownSegment
        labelKey="pages.game.countdown.seconds"
        labelShortKey="pages.game.countdown.seconds_short"
        value={pad2(s)}
        compact={compact}
        minimal={minimal}
      />
    </Stack>
  );
};
