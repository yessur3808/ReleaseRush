import { Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface CountdownSegmentProps {
  labelKey: string;
  labelShortKey: string;
  value: string;
  compact?: boolean;
  minimal?: boolean;
}

export const CountdownSegment = ({
  labelKey,
  labelShortKey,
  value,
  compact,
  minimal = false,
}: CountdownSegmentProps) => {
  const { t } = useTranslation();
  const label = compact ? t(labelShortKey) : t(labelKey).toUpperCase();

  return (
    <Stack spacing={compact ? 0.2 : 0.75} alignItems="center" sx={{ minWidth: compact ? 32 : 76 }}>
      {minimal ? (
        <Typography
          variant={compact ? "body1" : "h3"}
          fontWeight={compact ? 700 : 950}
          sx={{
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: 1,
          }}
        >
          {value}
        </Typography>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            px: compact ? 1.25 : 2,
            py: compact ? 0.75 : 1.1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography
            variant={compact ? "body1" : "h3"}
            fontWeight={compact ? 700 : 950}
            sx={{
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: 1,
            }}
          >
            {value}
          </Typography>
        </Paper>
      )}
      <Typography
        variant={compact ? "subtitle2" : "caption"}
        color="text.secondary"
        sx={{
          letterSpacing: compact ? 0.1 : 0.9,
          fontSize: compact ? 10 : 12,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};
