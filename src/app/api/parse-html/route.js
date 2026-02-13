import { parseArticleHTML } from "@/lib/parseArticle";
import { runQualityChecks } from "@/lib/qualityChecks";

export async function POST(req) {
  const { html } = await req.json();

  const article = parseArticleHTML(html || "");
  const quality = runQualityChecks(article);

  return Response.json({
    article,
    quality,
  });
}
