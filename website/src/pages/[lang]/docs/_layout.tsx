import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { MessageCircleIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
} from "@/components/ai/search";
import { cn } from "@/lib/cn";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({
  children,
  lang = "km",
}: {
  children: ReactNode;
  lang?: string;
}) {
  const isKm = lang === "km";
  return (
    <DocsLayout {...baseOptions(lang)} tree={source.getPageTree(lang)}>
      <AISearch>
        <AISearchPanel />
        <AISearchTrigger
          position="float"
          className={cn(
            buttonVariants({
              variant: "secondary",
              className: "text-fd-muted-foreground rounded-2xl",
            }),
          )}
        >
          <MessageCircleIcon className="size-4.5" />
          {isKm ? "សួរ AI" : "Ask AI"}
        </AISearchTrigger>
      </AISearch>

      {children}
    </DocsLayout>
  );
}

export async function getConfig() {
  return {
    render: "static",
  } as const;
}
