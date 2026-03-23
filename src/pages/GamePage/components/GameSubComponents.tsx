import { Alert, Button, CircularProgress, Stack } from "@mui/material";

export const GameNotFound = ({
  onBack,
  labelBack,
  message,
  onTrack, // <-- NEW (optional)
}: {
  onBack: () => void;
  labelBack: string;
  message: string;
  onTrack?: (eventName: string, params?: Record<string, unknown>) => void;
}) => {
  const handleBack = () => {
    onTrack?.("game_not_found_back", {
      from: "game_not_found",
      label: labelBack,
    });
    onBack();
  };

  return (
    <Alert severity="warning" action={<Button onClick={handleBack}>{labelBack}</Button>}>
      {message}
    </Alert>
  );
};

export const GameLoading = () => {
  return (
    <Stack alignItems="center" sx={{ py: 8 }}>
      <CircularProgress />
    </Stack>
  );
};

export const GameError = ({
  message,
  onTrack, // <-- NEW (optional)
}: {
  message: string;
  onTrack?: (eventName: string, params?: Record<string, unknown>) => void;
}) => {
  onTrack?.("game_error_shown", {
    from: "game_error",
    message_present: Boolean(message),
  });

  return <Alert severity="error">{message}</Alert>;
};
