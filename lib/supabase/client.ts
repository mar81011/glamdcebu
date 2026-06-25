import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let defaultClient: SupabaseClient | null = null;

function getAuthStorage(rememberMe: boolean) {
  if (typeof window === "undefined") return undefined;
  return rememberMe ? window.localStorage : window.sessionStorage;
}

export function createClient(options?: { rememberMe?: boolean }) {
  const rememberMe = options?.rememberMe ?? true;

  if (rememberMe && !options) {
    if (!defaultClient) {
      defaultClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            storage: getAuthStorage(true),
          },
        },
      );
    }
    return defaultClient;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: getAuthStorage(rememberMe),
      },
    },
  );
}
