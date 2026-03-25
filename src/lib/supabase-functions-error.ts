import { FunctionsHttpError } from "@supabase/supabase-js";

export async function resolveInvokeErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const response = error.context as Response;
      const text = await response.text();
      if (text) {
        try {
          const payload = JSON.parse(text) as { error?: unknown };
          if (typeof payload?.error === "string" && payload.error.trim()) {
            return payload.error.trim();
          }
        } catch {
          return text.trim();
        }
      }
    } catch {
    }
  }

  return error instanceof Error ? error.message : "Generation failed";
}
