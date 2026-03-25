import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "@mui/material/styles";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";
import { createAppTheme } from "./theme";
import { isRtlLanguage } from "./utils/rtl";

const ltrCache = createCache({ key: "muiltr", prepend: true });
const rtlCache = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
  prepend: true,
});

export function RtlProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const languageTag = i18n.resolvedLanguage ?? i18n.language ?? "";
  const isRtl = isRtlLanguage(languageTag);

  const theme = useMemo(() => createAppTheme(isRtl ? "rtl" : "ltr"), [isRtl]);
  const cache = isRtl ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
}
