import { Link, Paper, Stack, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={900}>
        {t("pages.about.title")}
      </Typography>

      <Paper sx={{ p: 2.5, borderRadius: 4 }}>
        <Stack spacing={1}>
          <Typography color="text.secondary">
            <Trans
              i18nKey="pages.about.content"
              values={{ github_url: "https://github.com/yessur3808/zerohour" }}
              components={{
                a: (
                  <Link
                    href="https://github.com/yessur3808/zerohour"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            />
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}
