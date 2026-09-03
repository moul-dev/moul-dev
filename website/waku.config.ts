import tailwindcss from "@tailwindcss/vite";
import mdx from "fumadocs-mdx/vite";
import { esmExternalRequirePlugin, perEnvironmentPlugin } from "vite";
import { defineConfig } from "waku/config";

export default defineConfig({
  unstable_adapter: "waku/adapters/node",
  vite: {
    resolve: {
      tsconfigPaths: true,
      dedupe: ["react", "react-dom", "waku"],
    },
    build: {
      target: "esnext",
    },
    ssr: {
      noExternal: [
        "react-aria-components",
        "react-aria",
        "react-stately",
        /@react-aria/,
        /@react-stately/,
      ],
    },

    plugins: [
      tailwindcss(),
      mdx(),
      {
        name: "shim-import-meta-url",
        transform(code: any, id: any, options: any) {
          const isSSR =
            options?.ssr ||
            (this.environment && this.environment.name !== "client");
          if (isSSR && code.includes("import.meta.url")) {
            return {
              code: code.replaceAll("import.meta.url", '"file:///index.js"'),
              map: null,
            };
          }
        },
      },
    ],
  },
});
