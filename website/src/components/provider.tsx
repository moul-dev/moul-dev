"use client";
import { i18nProvider } from "fumadocs-ui/i18n";
import { RootProvider } from "fumadocs-ui/provider/waku";
import { type ReactNode, useEffect } from "react";
import { useRouter } from "waku/router/client";
import { i18n } from "@/lib/i18n";
import { translations } from "@/lib/layout.shared";

export function Provider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const firstSegment = router.path.split("/")[1];
  const lang = firstSegment === "km" ? "km" : i18n.defaultLanguage;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <RootProvider
      search={{ enabled: true }}
      i18n={{
        ...i18nProvider(translations, lang),
        onLocaleChange(newLang) {
          const segments = router.path.split("/").filter((v) => v.length > 0);
          const currentIsKm = segments[0] === "km";

          if (newLang === "km") {
            if (!currentIsKm) {
              if (segments.length === 0) {
                router.push("/km");
              } else if (segments[0] === "docs") {
                router.push(`/km/${segments.join("/")}`);
              } else {
                router.push("/km");
              }
            }
          } else {
            // English (default - no prefix)
            if (currentIsKm) {
              const remaining = segments.slice(1).join("/");
              router.push(remaining ? `/${remaining}` : "/");
            }
          }
        },
      }}
    >
      {children}
    </RootProvider>
  );
}
