import { devlog, docs } from "collections/server";
import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { docsContentRoute, docsRoute } from "./shared";

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
  plugins: [lucideIconsPlugin()],
});

export const devlogSource = loader({
  source: toFumadocsSource(devlog, []),
  baseUrl: "/devlog",
});

export interface OgImageOptions {
  target?: "x" | "facebook";
  hideAuthor?: boolean;
  authorName?: string;
  authorRole?: string;
  avatar?: string;
}

export function getDevlogPageImage(
  title: string,
  description?: string,
  targetOrOptions?: "x" | "facebook" | OgImageOptions,
  hideAuthor = true,
) {
  const options: OgImageOptions =
    typeof targetOrOptions === "string"
      ? { target: targetOrOptions, hideAuthor }
      : { hideAuthor: true, ...targetOrOptions };

  const formattedTitle = title.replace(/\bMoul\b/g, "{Moul|00CEE1}");
  const url = new URL("https://og.moul.dev/devlog");
  url.searchParams.set("title", formattedTitle);
  if (description) {
    url.searchParams.set("subtitle", description);
  }
  if (options.target) {
    url.searchParams.set("target", options.target);
  }
  if (options.hideAuthor ?? true) {
    url.searchParams.set("hide_author", "true");
  } else {
    if (options.authorName) {
      url.searchParams.set("author_name", options.authorName);
    }
    if (options.authorRole) {
      url.searchParams.set("author_role", options.authorRole);
    }
    if (options.avatar) {
      url.searchParams.set("avatar", options.avatar);
    }
  }
  return {
    url: url.toString(),
  };
}

export function getPageImage(
  slugs: string[],
  targetOrOptions?: "x" | "facebook" | OgImageOptions,
) {
  const page = source.getPage(slugs);
  const title = page?.data.title ?? "Moul Documentation";
  const description = page?.data.description;

  return {
    segments: [...slugs, "image.webp"],
    ...getDevlogPageImage(title, description, targetOrOptions, true),
  };
}

export function getPageMarkdownUrl(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "content.md"];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join("/")}`,
  };
}

export async function getLLMText(page: (typeof source)["$inferPage"]) {
  const processed = await page.data.getText("processed");

  return `# ${page.data.title} (${page.url})

${processed}`;
}
