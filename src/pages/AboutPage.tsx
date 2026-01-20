import { Paper, Stack, Typography } from "@mui/material";

export function AboutPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={900}>
        About
      </Typography>

      <Paper sx={{ p: 2.5, borderRadius: 4 }}>
        <Stack spacing={1}>
          <Typography fontWeight={700}>What this site does</Typography>
          <Typography color="text.secondary">
            A simple countdown hub for game releases and recurring resets. Built
            to stay fast, minimal, and source-driven.
          </Typography>
          <Typography color="text.secondary">
            Phase 2 will add a source submission flow and improved “last
            updated” tracking.
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}
