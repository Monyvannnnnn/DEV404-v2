export const MODEL_OPTIONS = [
  {
    id: "gemini-2.5-flash",
    label: "gemini-2.5-flash",
    providerModel: "google/gemini-2.5-flash",
    icon: "zap",
  },
  {
    id: "gemini-2.5-pro",
    label: "gemini-2.5-pro",
    providerModel: "google/gemini-2.5-pro",
    icon: "sparkles",
  },
  {
    id: "gemini-2.0-flash",
    label: "gemini-2.0-flash",
    providerModel: "google/gemini-2.0-flash",
    icon: "brain",
  },
] as const;

export type AIModel = (typeof MODEL_OPTIONS)[number]["id"];

export const DEFAULT_AI_MODEL: AIModel = "gemini-2.5-flash";

export const MODEL_LABELS: Record<AIModel, string> = Object.fromEntries(
  MODEL_OPTIONS.map((model) => [model.id, model.label]),
) as Record<AIModel, string>;

export const MODEL_MAP: Record<AIModel, string> = Object.fromEntries(
  MODEL_OPTIONS.map((model) => [model.id, model.providerModel]),
) as Record<AIModel, string>;

export const MODEL_BY_ID: Record<AIModel, (typeof MODEL_OPTIONS)[number]> = Object.fromEntries(
  MODEL_OPTIONS.map((model) => [model.id, model]),
) as Record<AIModel, (typeof MODEL_OPTIONS)[number]>;
