"use client";

import type { Tool, UIMessage } from "ai";
import {
  type ComponentProps,
  createContext,
  lazy,
  type ReactNode,
  Suspense,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import { cn } from "../../lib/cn";

export type ChatUIMessage = UIMessage<
  never,
  {
    client: {
      location: string;
    };
  }
>;

export type SearchTool = Tool<{ query: string; limit: number }>;

interface AISearchContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Context = createContext<AISearchContextValue | null>(null);

export function useAISearchContext() {
  const ctx = use(Context);
  if (!ctx) throw new Error("useAISearchContext must be used within AISearch");
  return ctx;
}

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Context.Provider value={useMemo(() => ({ open, setOpen }), [open])}>
      {children}
    </Context.Provider>
  );
}

export function AISearchTrigger({
  position = "default",
  className,
  ...props
}: ComponentProps<"button"> & { position?: "default" | "float" }) {
  const { open, setOpen } = useAISearchContext();

  return (
    <button
      type="button"
      data-state={open ? "open" : "closed"}
      className={cn(
        position === "float" && [
          "fixed bottom-4 gap-3 w-24 inset-e-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] shadow-lg z-20 transition-[translate,opacity]",
          open && "translate-y-10 opacity-0",
        ],
        className,
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function useHotKey() {
  const { open, setOpen } = useAISearchContext();

  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      setOpen(false);
      e.preventDefault();
    }

    if (e.key === "/" && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    return () => window.removeEventListener("keydown", onKeyPress);
  }, []);
}

const LazySearchPanel = lazy(() => import("./search-panel"));

export function AISearchPanel() {
  const { open } = useAISearchContext();
  const [hasOpened, setHasOpened] = useState(false);
  useHotKey();

  if (open && !hasOpened) {
    setHasOpened(true);
  }

  if (!hasOpened) return null;

  return (
    <Suspense fallback={null}>
      <LazySearchPanel />
    </Suspense>
  );
}
