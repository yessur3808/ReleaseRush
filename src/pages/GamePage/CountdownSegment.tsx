import { Paper, Stack, Typography } from "@mui/material";

interface CountdownSegmentProps {
  label: string;
  value: string;
  compact?: boolean;
}

export const CountdownSegment = ({
  label,
  value,
  compact,
}: CountdownSegmentProps) => {
  return (
    <Stack
      spacing={0.75}
      alignItems="center"
      sx={{ minWidth: compact ? 56 : 76 }}
    >
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
          variant={compact ? "h5" : "h3"}
          fontWeight={950}
          sx={{
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: 1,
          }}
        >
          {value}
        </Typography>
      </Paper>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ letterSpacing: 0.9 }}
      >
        {label.toUpperCase()}
      </Typography>
    </Stack>
  );
};
