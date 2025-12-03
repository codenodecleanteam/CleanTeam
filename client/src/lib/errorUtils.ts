export function getReadableErrorMessage(
  error: unknown,
  fallback = "Ocorreu um erro inesperado."
): string {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;

    if (typeof err.message === "string" && err.message.trim().length > 0) {
      return err.message;
    }

    if (
      typeof err.error_description === "string" &&
      err.error_description.trim().length > 0
    ) {
      return err.error_description;
    }

    if (typeof err.details === "string" && err.details.trim().length > 0) {
      return err.details;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
