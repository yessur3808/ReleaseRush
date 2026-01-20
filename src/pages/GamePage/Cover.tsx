import { Box } from "@mui/material";

interface CoverProps {
  src: string;
  alt: string;
  height?: number;
}

export const Cover = ({ src, alt, height }: CoverProps) => {
  return (
    <Box
      sx={{
        width: "100%",
        height,
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        position: "relative",
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.0) 60%)",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
};
