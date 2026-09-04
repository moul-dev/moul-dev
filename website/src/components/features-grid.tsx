"use client";

import {
  Activity,
  ArrowRight,
  Bot,
  Check,
  CloudUpload,
  Copy,
  Cpu,
  Database,
  KeyRound,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Terminal,
  ToggleRight,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Feature Card Wrapper with Spotlight Hover effect
function FeatureCard({
  children,
  className = "",
  spotlightHue = 198,
}: {
  children: React.ReactNode;
  className?: string;
  spotlightHue?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`liquid-glass-card group flex flex-col justify-between ${className}`}
      style={
        {
          "--brand-hue": spotlightHue,
        } as React.CSSProperties
      }
    >
      <div className="liquid-glass-inner p-6 sm:p-7 flex flex-col justify-between h-full relative z-10">
        <div className="liquid-glass-glow" />
        <div className="relative z-10 flex flex-col h-full">{children}</div>
      </div>
    </div>
  );
}

// 1. Dynamic REST API Micro-Preview
function DynamicApiPreview() {
  const [activeTab, setActiveTab] = useState<"curl" | "schema" | "rules">(
    "curl",
  );
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    curl: `curl -X POST https://api.moul.dev/api/moul/posts \\
  -H "Authorization: Bearer $MOUL_TOKEN" \\
  -d '{"title": "Hello World", "published": true}'`,
    schema: `{
  "name": "posts",
  "fields": [
    { "name": "title", "type": "text", "required": true },
    { "name": "published", "type": "bool", "default": false }
  ]
}`,
    rules: `@request.auth.id != "" &&
@collection.posts.author_id = @request.auth.id`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-fd-border/70 bg-fd-card/60 backdrop-blur-md shadow-inner text-xs font-mono">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-fd-border/60 bg-fd-muted/30">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("curl")}
            className={`px-2 py-0.5 rounded transition-all ${
              activeTab === "curl"
                ? "bg-fd-primary/20 text-fd-primary font-medium"
                : "text-fd-muted-foreground hover:text-fd-foreground"
            }`}
          >
            cURL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("schema")}
            className={`px-2 py-0.5 rounded transition-all ${
              activeTab === "schema"
                ? "bg-fd-primary/20 text-fd-primary font-medium"
                : "text-fd-muted-foreground hover:text-fd-foreground"
            }`}
          >
            Schema
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`px-2 py-0.5 rounded transition-all ${
              activeTab === "rules"
                ? "bg-fd-primary/20 text-fd-primary font-medium"
                : "text-fd-muted-foreground hover:text-fd-foreground"
            }`}
          >
            Rules
          </button>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code snippet"
          className="p-1 rounded text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-muted/50 transition-colors"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>

      {/* Code snippet */}
      <div className="p-3 text-[11px] leading-relaxed text-fd-foreground/90 overflow-x-auto whitespace-pre">
        {codeSnippets[activeTab]}
      </div>

      {/* Response Preview */}
      <div className="px-3 py-1.5 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400">
        <span className="flex items-center gap-1 font-medium">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          201 Created • 1.2ms
        </span>
        <span className="opacity-80">Zero-Config CRUD</span>
      </div>
    </div>
  );
}

// 2. Background Worker Engine Micro-Preview
function WorkerEnginePreview() {
  const [activeQueue, setActiveQueue] = useState<
    "critical" | "default" | "low"
  >("critical");
  const [jobs, setJobs] = useState([
    {
      id: "job_9a82",
      queue: "critical",
      worker: "SendWelcomeEmail",
      status: "completed",
      attempts: "1/3",
    },
    {
      id: "job_4c11",
      queue: "critical",
      worker: "ProcessStripeWebhook",
      status: "running",
      attempts: "1/5",
    },
    {
      id: "job_7f30",
      queue: "default",
      worker: "GeneratePdfReport",
      status: "enqueued",
      attempts: "0/3",
    },
  ]);

  // Simple cycle simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setJobs((prev) =>
        prev.map((job) => {
          if (job.status === "running") return { ...job, status: "completed" };
          if (job.status === "enqueued") return { ...job, status: "running" };
          if (job.status === "completed") return { ...job, status: "enqueued" };
          return job;
        }),
      );
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-4 rounded-xl border border-fd-border/70 bg-fd-card/60 backdrop-blur-md shadow-inner text-xs font-mono overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-fd-border/60 bg-fd-muted/30">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-fd-muted-foreground font-sans text-[11px]">
            Queues:
          </span>
          {(["critical", "default", "low"] as const).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setActiveQueue(q)}
              className={`px-1.5 py-0.5 rounded capitalize text-[10px] transition-all ${
                activeQueue === q
                  ? "bg-fd-primary/20 text-fd-primary font-medium"
                  : "text-fd-muted-foreground hover:text-fd-foreground"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-fd-muted-foreground flex items-center gap-1">
          <Zap className="size-3 text-amber-500" /> Engine
        </span>
      </div>

      <div className="divide-y divide-fd-border/40 text-[11px]">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between px-3 py-2 hover:bg-fd-muted/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className={`size-1.5 rounded-full ${
                  job.status === "running"
                    ? "bg-amber-400 animate-ping"
                    : job.status === "completed"
                      ? "bg-emerald-500"
                      : "bg-blue-400"
                }`}
              />
              <span className="font-medium text-fd-foreground truncate max-w-[130px] sm:max-w-[170px]">
                {job.worker}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-fd-muted-foreground">{job.attempts}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold tracking-wider ${
                  job.status === "running"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : job.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                }`}
              >
                {job.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Multi-Factor Auth Micro-Preview
function AuthPreview() {
  const [selectedMethod, setSelectedMethod] = useState<
    "passkey" | "otp" | "oauth"
  >("passkey");

  return (
    <div className="mt-4 rounded-xl border border-fd-border/70 bg-fd-card/60 backdrop-blur-md p-3 text-xs flex flex-col gap-2.5">
      <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-fd-muted/40 font-mono text-[10px]">
        {(["passkey", "otp", "oauth"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setSelectedMethod(m)}
            className={`py-1 rounded text-center capitalize transition-all ${
              selectedMethod === m
                ? "bg-fd-background text-fd-foreground font-semibold shadow-xs"
                : "text-fd-muted-foreground hover:text-fd-foreground"
            }`}
          >
            {m === "passkey"
              ? "Passkeys"
              : m === "otp"
                ? "Email OTP"
                : "OAuth2"}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-fd-border/60 bg-fd-muted/20 p-2.5 flex items-center justify-between text-[11px] font-mono">
        {selectedMethod === "passkey" && (
          <>
            <span className="flex items-center gap-1.5 text-fd-foreground">
              <KeyRound className="size-3.5 text-fd-primary" /> WebAuthn FIDO2
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="size-3" /> Passwordless
            </span>
          </>
        )}
        {selectedMethod === "otp" && (
          <>
            <span className="flex items-center gap-1.5 text-fd-foreground">
              <Sparkles className="size-3.5 text-fd-primary" /> 6-digit Code
            </span>
            <span className="text-[10px] text-fd-primary font-semibold">
              300s Expiry
            </span>
          </>
        )}
        {selectedMethod === "oauth" && (
          <>
            <span className="flex items-center gap-1.5 text-fd-foreground">
              <ShieldCheck className="size-3.5 text-fd-primary" /> GitHub /
              Google
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Device Flow
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// 4. Analytics Micro-Preview
function AnalyticsPreview() {
  return (
    <div className="mt-4 rounded-xl border border-fd-border/70 bg-fd-card/60 backdrop-blur-md p-3 text-xs flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] font-medium text-fd-foreground">
            _visits & _requests
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
          0.0ms overhead
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-[11px]">
        <div className="rounded-lg border border-fd-border/60 bg-fd-muted/20 p-2">
          <div className="text-[9px] text-fd-muted-foreground uppercase">
            Batched Events
          </div>
          <div className="text-sm font-bold text-fd-foreground mt-0.5">
            14,290/m
          </div>
        </div>
        <div className="rounded-lg border border-fd-border/60 bg-fd-muted/20 p-2">
          <div className="text-[9px] text-fd-muted-foreground uppercase">
            GeoIP & UTM
          </div>
          <div className="text-sm font-bold text-fd-primary mt-0.5">
            Automated
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. SSE Streaming Micro-Preview
function SsePreview() {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => (p + 1) % 4);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const events = [
    { type: "create", col: "orders", record: "ord_882", time: "now" },
    { type: "update", col: "users", record: "usr_104", time: "1s ago" },
  ];

  return (
    <div className="mt-4 rounded-xl border border-fd-border/70 bg-fd-card/60 backdrop-blur-md p-3 text-xs flex flex-col gap-2 font-mono">
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 text-fd-foreground">
          <Radio className="size-3.5 text-fd-primary animate-pulse" />
          GET /api/moul/:col/subscribe
        </span>
        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
          CONNECTED
        </span>
      </div>

      <div className="space-y-1.5 text-[10px]">
        {events.map((ev, idx) => (
          <div
            key={ev.record}
            className={`flex items-center justify-between p-1.5 rounded border border-fd-border/40 bg-fd-muted/20 transition-all duration-300 ${
              idx === 0 && pulse % 2 === 0
                ? "border-fd-primary/50 bg-fd-primary/10"
                : ""
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="px-1 py-0.2 rounded text-[8px] uppercase font-bold bg-fd-primary/20 text-fd-primary">
                {ev.type}
              </span>
              <span className="text-fd-foreground">
                {ev.col}/{ev.record}
              </span>
            </div>
            <span className="text-fd-muted-foreground">{ev.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. Feature Flags Micro-Preview
function FeatureFlagsPreview() {
  const [flagState, setFlagState] = useState(true);
  const rollout = 75;

  return (
    <div className="mt-4 rounded-xl border border-fd-border/70 bg-fd-card/60 backdrop-blur-md p-3 text-xs flex flex-col gap-2 font-mono">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-fd-foreground">
          v2_checkout_flow
        </span>
        <button
          type="button"
          onClick={() => setFlagState(!flagState)}
          aria-label="Toggle feature flag"
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
            flagState ? "bg-fd-primary" : "bg-fd-muted"
          }`}
        >
          <span
            className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${
              flagState ? "translate-x-4.5" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="rounded-lg border border-fd-border/60 bg-fd-muted/20 p-2 text-[10px]">
        <div className="flex justify-between text-fd-muted-foreground mb-1">
          <span>Percentage Rollout</span>
          <span className="text-fd-primary font-bold">{rollout}%</span>
        </div>
        <div className="w-full bg-fd-border rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-fd-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${rollout}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// 7. MCP Server Micro-Preview
function McpPreview() {
  return (
    <div className="mt-4 rounded-xl border border-fd-border/70 bg-fd-card/60 backdrop-blur-md p-3 text-xs flex flex-col gap-2 font-mono">
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 text-fd-foreground">
          <Bot className="size-3.5 text-fd-primary" /> Model Context Protocol
        </span>
        <span className="text-[9px] text-fd-primary bg-fd-primary/10 px-1.5 py-0.5 rounded font-semibold">
          stdio + SSE
        </span>
      </div>

      <div className="rounded-lg border border-fd-border/60 bg-fd-muted/20 p-2 text-[10px] space-y-1">
        <div className="flex items-center justify-between text-fd-muted-foreground">
          <span>AI Tool Endpoints</span>
          <span className="text-emerald-500 font-bold">14 Tools</span>
        </div>
        <div className="text-[9px] text-fd-foreground/80 truncate">
          Claude / Cursor ↔ <span className="text-fd-primary">moul mcp</span>
        </div>
      </div>
    </div>
  );
}

// 8. Litestream S3 Disaster Recovery Micro-Preview
function LitestreamPreview() {
  return (
    <div className="mt-4 rounded-xl border border-fd-border/70 bg-fd-card/60 backdrop-blur-md p-3 text-xs flex flex-col gap-2 font-mono">
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 text-fd-foreground">
          <CloudUpload className="size-3.5 text-fd-primary" /> SQLite WAL → S3
        </span>
        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
          <RefreshCw className="size-2.5 animate-spin" /> Continuous
        </span>
      </div>

      <div className="rounded-lg border border-fd-border/60 bg-fd-muted/20 p-2 text-[10px] flex items-center justify-between">
        <div>
          <div className="text-[9px] text-fd-muted-foreground uppercase">
            Replication Lag
          </div>
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            &lt; 1 Second
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-fd-muted-foreground uppercase">
            Target
          </div>
          <div className="text-[11px] font-medium text-fd-foreground">
            S3 / R2 / MinIO
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesGrid({ lang = "en" }: { lang?: string } = {}) {
  const isKm = lang === "km";
  const [bannerCopied, setBannerCopied] = useState(false);
  const installCmd = "curl -fsSL https://moul.dev/install.sh | sh";

  const copyInstall = () => {
    navigator.clipboard.writeText(installCmd);
    setBannerCopied(true);
    setTimeout(() => setBannerCopied(false), 2000);
  };

  return (
    <section className="relative px-6 py-20 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono font-medium leading-6 text-fd-primary ring-1 ring-fd-primary/30 backdrop-blur-sm bg-fd-primary/10 mb-4">
          <Sparkles className="size-3" />
          <span>{isKm ? "រួមបញ្ចូលស្រេច" : "BATTERIES INCLUDED"}</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-fd-foreground mb-4 leading-tight">
          {isKm ? (
            <>
              អ្វីៗគ្រប់យ៉ាងដែលអ្នកត្រូវការ នៅក្នុង{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, oklch(0.72 calc(0.17 * var(--brand-chroma-multiplier, 1)) calc(var(--brand-hue, 198) - 5)), oklch(0.78 calc(0.16 * var(--brand-chroma-multiplier, 1)) calc(var(--brand-hue, 198) + 10)), oklch(0.72 calc(0.14 * var(--brand-chroma-multiplier, 1)) calc(var(--brand-hue, 198) - 15)))",
                }}
              >
                Binary តែមួយគត់
              </span>
            </>
          ) : (
            <>
              Everything you need in a{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, oklch(0.72 calc(0.17 * var(--brand-chroma-multiplier, 1)) calc(var(--brand-hue, 198) - 5)), oklch(0.78 calc(0.16 * var(--brand-chroma-multiplier, 1)) calc(var(--brand-hue, 198) + 10)), oklch(0.72 calc(0.14 * var(--brand-chroma-multiplier, 1)) calc(var(--brand-hue, 198) - 15)))",
                }}
              >
                single binary
              </span>
            </>
          )}
        </h2>
        <p className="text-base sm:text-lg text-fd-muted-foreground leading-relaxed">
          {isKm
            ? "គ្មានការពឹងផ្អែកខាងក្រៅឡើយ។ មូលដ្ឋានទិន្នន័យ SQLite បែបឌីណាមិក ជួរការងារ worker អសមកាលកម្ម ប្រព័ន្ធផ្ទៀងផ្ទាត់ភាពត្រឹមត្រូវ ការធ្វើសមកាលកម្មពេលវេលាជាក់ស្ដែង និងប្រព័ន្ធ AI រួមបញ្ចូលដោយផ្ទាល់ក្នុងម៉ាស៊ីនបម្រើរបស់អ្នក។"
            : "Zero external dependencies. Dynamic SQLite database, asynchronous worker queues, auth, real-time sync, and AI protocols built directly into your server."}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* 1. Hero Bento Tile: Dynamic REST API (Col Span 7) */}
        <FeatureCard spotlightHue={198} className="lg:col-span-7 min-h-[340px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-fd-primary/10 text-fd-primary border border-fd-primary/20">
                <Database className="size-5" />
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-fd-muted text-fd-muted-foreground">
                {isKm ? "ទម្រង់ឌីណាមិក & CRUD" : "Dynamic Schema & CRUD"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-fd-foreground mb-2">
              {isKm
                ? "ម៉ាស៊ីន REST API និងទម្រង់ទិន្នន័យឌីណាមិក"
                : "Dynamic REST API & Schema Engine"}
            </h3>
            <p className="text-sm text-fd-muted-foreground leading-relaxed">
              {isKm
                ? "បង្កើត និងរៀបចំទម្រង់បណ្ដុំទិន្នន័យ (Collections) ពេលកំពុងដំណើរការតាមរយៈ HTTP ឬ TUI។ ផ្ដល់ជូនភ្លាមៗនូវ Endpoints ប្រភេទ CRUD ប្រកបដោយសុវត្ថិភាពប្រភេទកូដ (Type-safe) ជាមួយវិធានកំណត់សិទ្ធិដូច HCL ទំនាក់ទំនងទិន្នន័យស្វ័យប្រវត្តិ និងឯកសារ OpenAPI រួមបញ្ចូលស្រេច។"
                : "Define collections at runtime via HTTP or TUI. Instant type-safe CRUD endpoints with HCL-style authorization rules, automated relations, and built-in OpenAPI docs."}
            </p>
          </div>
          <DynamicApiPreview />
        </FeatureCard>

        {/* 2. Hero Bento Tile: Background Worker Engine (Col Span 5) */}
        <FeatureCard spotlightHue={55} className="lg:col-span-5 min-h-[340px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Cpu className="size-5" />
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {isKm ? "ទម្រង់បែប Oban" : "Oban-Style"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-fd-foreground mb-2">
              {isKm
                ? "ម៉ាស៊ីនដំណើរការការងារផ្ទៃខាងក្រោយ"
                : "Background Worker Engine"}
            </h3>
            <p className="text-sm text-fd-muted-foreground leading-relaxed">
              {isKm
                ? "ជួរការងារអសមកាលកម្មសមត្ថភាពខ្ពស់លើ SQLite សុទ្ធ។ គ្រប់គ្រងជួរការងារតាមលំដាប់អាទិភាព ការសាកល្បងម្ដងទៀតតាម Exponential Backoff និងការបញ្ជូនការងារក្នុង Transaction ដោយមិនបាច់ពឹងផ្អែកលើ Redis។"
                : "High-throughput async job queues in pure SQLite. Priority queues, exponential backoff retries, and transactional dispatch without Redis."}
            </p>
          </div>
          <WorkerEnginePreview />
        </FeatureCard>

        {/* 3. Auth (Col Span 4) */}
        <FeatureCard spotlightHue={250} className="lg:col-span-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-fd-primary/10 text-fd-primary border border-fd-primary/20">
                <ShieldCheck className="size-5" />
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-fd-muted text-fd-muted-foreground">
                {isKm ? "MFA & បណ្ដាញសង្គម" : "MFA & Social"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-fd-foreground mb-1.5">
              {isKm
                ? "ការផ្ទៀងផ្ទាត់ភាពត្រឹមត្រូវទំនើប & ពហុកត្តា"
                : "Multi-Factor & Modern Auth"}
            </h3>
            <p className="text-xs text-fd-muted-foreground leading-relaxed">
              {isKm
                ? "WebAuthn Passkeys, Email OTP, OAuth2 (GitHub, Google, Apple) និង Device Flow រួមជាមួយសម័យ JWT (JWT sessions)។"
                : "WebAuthn Passkeys, Email OTP, OAuth2 (GitHub, Google, Apple), and Device Flow with JWT sessions."}
            </p>
          </div>
          <AuthPreview />
        </FeatureCard>

        {/* 4. First-Party Analytics (Col Span 4) */}
        <FeatureCard spotlightHue={145} className="lg:col-span-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Activity className="size-5" />
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {isKm ? "គ្មានភាពយឺតយ៉ាវ" : "Zero-Latency"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-fd-foreground mb-1.5">
              {isKm
                ? "ប្រព័ន្ធតាមដាន និងវិភាគទិន្នន័យផ្ទាល់ខ្លួន"
                : "First-Party Analytics & Tracking"}
            </h3>
            <p className="text-xs text-fd-muted-foreground leading-relaxed">
              {isKm
                ? "ការបន្សុទ្ធសម័យទិន្នន័យ និងការប្រមូលរង្វាស់សំណើជាក្រុមបែបអសមកាលកម្ម ជាមួយការកំណត់ទីតាំង GeoIP និង UTM ដោយស្វ័យប្រវត្តិ។"
                : "Session deduplication and async request metrics batching with automated GeoIP and UTM resolution."}
            </p>
          </div>
          <AnalyticsPreview />
        </FeatureCard>

        {/* 5. Real-Time SSE (Col Span 4) */}
        <FeatureCard spotlightHue={215} className="lg:col-span-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                <Radio className="size-5" />
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                {isKm ? "ការផ្សាយ SSE" : "SSE Streams"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-fd-foreground mb-1.5">
              {isKm
                ? "ការជាវទិន្នន័យពេលវេលាជាក់ស្ដែង"
                : "Real-Time Record Subscriptions"}
            </h3>
            <p className="text-xs text-fd-muted-foreground leading-relaxed">
              {isKm
                ? "បញ្ជូនបម្រែបម្រួលទិន្នន័យបន្តផ្ទាល់ទៅកាន់ផ្ទាំងខាងមុខ (Frontend) តាមរយៈ Server-Sent Events ប្រកបដោយការផ្ទៀងផ្ទាត់វិធានសុវត្ថិភាព។"
                : "Stream live database mutations directly to frontends over Server-Sent Events with rule validation."}
            </p>
          </div>
          <SsePreview />
        </FeatureCard>

        {/* 6. Feature Flags (Col Span 4) */}
        <FeatureCard spotlightHue={290} className="lg:col-span-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500 border border-violet-500/20">
                <ToggleRight className="size-5" />
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
                OpenFeature
              </span>
            </div>
            <h3 className="text-lg font-bold text-fd-foreground mb-1.5">
              {isKm
                ? "Feature Flags និងការដាក់ឱ្យប្រើជាដំណាក់កាល"
                : "Feature Flags & Rollouts"}
            </h3>
            <p className="text-xs text-fd-muted-foreground leading-relaxed">
              {isKm
                ? "OpenFeature Go SDK provider ជាមួយវិធានក្រុមឌីណាមិក ការដាក់ឱ្យប្រើតាមភាគរយ និងការគណនាដោយទាញពីឃ្លាំងសម្ងាត់ (Cache)។"
                : "OpenFeature Go SDK provider with dynamic group rules, percentage rollouts, and cached evaluations."}
            </p>
          </div>
          <FeatureFlagsPreview />
        </FeatureCard>

        {/* 7. Built-in MCP Server (Col Span 4) */}
        <FeatureCard spotlightHue={25} className="lg:col-span-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Bot className="size-5" />
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {isKm ? "ទ្រទ្រង់ AI Agent ស្រេច" : "AI Agent Native"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-fd-foreground mb-1.5">
              {isKm ? "ម៉ាស៊ីនបម្រើ MCP រួមបញ្ចូលស្រេច" : "Native MCP Server"}
            </h3>
            <p className="text-xs text-fd-muted-foreground leading-relaxed">
              {isKm
                ? "ម៉ាស៊ីនបម្រើ Model Context Protocol សម្រាប់ AI Assistants (Claude Desktop, Cursor) តាមរយៈ stdio និង HTTP SSE។"
                : "Model Context Protocol server for AI assistants (Claude Desktop, Cursor) over stdio and HTTP SSE."}
            </p>
          </div>
          <McpPreview />
        </FeatureCard>

        {/* 8. Litestream S3 Backups (Col Span 4) */}
        <FeatureCard spotlightHue={185} className="lg:col-span-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500 border border-teal-500/20">
                <CloudUpload className="size-5" />
              </div>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                {isKm ? "RPO ក្រោមមួយវិនាទី" : "Sub-Second RPO"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-fd-foreground mb-1.5">
              {isKm
                ? "ការចម្លងទិន្នន័យទៅកាន់ S3 ជាមួយ Litestream"
                : "Litestream S3 Replication"}
            </h3>
            <p className="text-xs text-fd-muted-foreground leading-relaxed">
              {isKm
                ? "ការចម្លង SQLite WAL ទៅកាន់ S3, Cloudflare R2, MinIO ឬ Tigris ជាបន្តបន្ទាប់រៀងរាល់វិនាទី។"
                : "Continuous per-second SQLite WAL replication to S3, Cloudflare R2, MinIO, or Tigris."}
            </p>
          </div>
          <LitestreamPreview />
        </FeatureCard>
      </div>

      {/* Bottom Callout Bar */}
      <div className="mt-14 rounded-2xl liquid-glass-card">
        <div className="liquid-glass-inner p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-fd-foreground mb-2">
              {isKm
                ? "ត្រៀមខ្លួនគ្រប់គ្រង Backend របស់អ្នកដោយផ្ទាល់ហើយឬនៅ?"
                : "Ready to take complete control of your backend?"}
            </h3>
            <p className="text-sm text-fd-muted-foreground max-w-xl">
              {isKm
                ? "ដំឡើង binary ដែលមានទម្ងន់ស្រាលលើម៉ាស៊ីនបម្រើ, VM ឬកុំព្យូទ័ររបស់អ្នកក្នុងរយៈពេលប៉ុន្មានវិនាទី។"
                : "Install the lightweight binary on any server, VM, or local machine in seconds."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={copyInstall}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-medium border border-fd-border/80 bg-fd-card/80 hover:bg-fd-accent transition-all shadow-xs cursor-pointer text-fd-foreground"
            >
              {bannerCopied ? (
                <>
                  <Check className="size-4 text-emerald-500" />
                  <span>{isKm ? "បានចម្លងពាក្យបញ្ជា!" : "Copied command!"}</span>
                </>
              ) : (
                <>
                  <Terminal className="size-4 text-fd-primary" />
                  <span className="truncate max-w-[200px] sm:max-w-none">
                    curl -fsSL https://moul.dev/install.sh | sh
                  </span>
                  <Copy className="size-3.5 text-fd-muted-foreground ml-1" />
                </>
              )}
            </button>

            <a
              href="/devlog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90 transition-all shadow-md"
            >
              <span>{isKm ? "អានកំណត់ហេតុអភិវឌ្ឍន៍" : "Read Devlog"}</span>
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
