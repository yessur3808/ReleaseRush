import { createTheme, alpha } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#070B0D", // near-black graphite
      paper: "#0B1115", // surface 1
    },
    primary: { main: "#37E8C0" }, // calmer mint
    secondary: { main: "#89B6FF" }, // softer blue
    error: { main: "#FF5A7A" },
    text: {
      primary: "#EAF2F2",
      secondary: "rgba(234,242,242,0.70)",
    },
    divider: "rgba(234,242,242,0.10)",
  },

  shape: { borderRadius: 12 },

  typography: {
    fontFamily:
      'Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
    h4: { fontWeight: 900, letterSpacing: -0.8 },
    h6: { fontWeight: 800, letterSpacing: -0.2 },
    button: { fontWeight: 800, textTransform: "none" },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(1100px 600px at 10% -10%, rgba(55,232,192,0.10), transparent 60%)," +
            "radial-gradient(900px 520px at 100% 0%, rgba(137,182,255,0.08), transparent 60%)," +
            "linear-gradient(180deg, #070B0D 0%, #050708 100%)",
          backgroundAttachment: "fixed",
        },
      },
    },

    // Make outlined surfaces look crisp instead of faint
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          borderColor: alpha(theme.palette.common.white, 0.1),
        }),
      },
    },

    // Inputs: sleeker borders + better hover
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
          backgroundColor: alpha(theme.palette.common.white, 0.03),
          transition: "background-color 160ms ease, border-color 160ms ease",
          "&:hover": {
            backgroundColor: alpha(theme.palette.common.white, 0.05),
          },
          "&.Mui-focused": {
            backgroundColor: alpha(theme.palette.common.white, 0.04),
          },
        }),
        notchedOutline: ({ theme }) => ({
          borderColor: alpha(theme.palette.common.white, 0.1),
        }),
      },
    },

    // Buttons: less “blob”, more premium
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 999,
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
        }),
        contained: () => ({
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        }),
        outlined: ({ theme }) => ({
          borderColor: alpha(theme.palette.common.white, 0.16),
          "&:hover": {
            borderColor: alpha(theme.palette.common.white, 0.22),
            backgroundColor: alpha(theme.palette.common.white, 0.04),
          },
        }),
      },
    },

    // Chips: modern pill chips that don’t look chunky
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 999,
          backgroundColor: alpha(theme.palette.common.white, 0.03),
          borderColor: alpha(theme.palette.common.white, 0.1),
        }),
      },
    },

    // Cards/panels: subtle depth
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius:
            typeof theme.shape.borderRadius === "number"
              ? theme.shape.borderRadius + 8
              : theme.shape.borderRadius,
          backgroundImage: "none",
        }),
      },
    },
  },
});
