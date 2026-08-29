/** Ambient types so Edge Functions typecheck in the workspace TypeScript language service. */

declare const Deno: {
  env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): Record<string, string>;
  };
  serve(
    handler: (req: Request) => Response | Promise<Response>,
  ): void;
};

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): Record<string, string>;
  }
}

declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
} | undefined;

declare module "https://esm.sh/@supabase/supabase-js@2.56.0" {
  export * from "@supabase/supabase-js";
}

declare module "https://esm.sh/@supabase/supabase-js@2.49.1" {
  export * from "@supabase/supabase-js";
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
  ): void;
}

declare module "https://esm.sh/fast-xml-parser@4.5.1" {
  export class XMLParser {
    constructor(options?: Record<string, unknown>);
    parse(xml: string): any;
  }
}
