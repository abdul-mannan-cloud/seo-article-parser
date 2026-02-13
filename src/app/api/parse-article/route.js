import { fetchPublicGoogleDoc } from "@/lib/fetchGoogleDoc";
import { parseArticleHTML } from "@/lib/parseArticle";
import { runQualityChecks } from "@/lib/qualityChecks";

export async function POST(req) {
    const { docId } = await req.json();

    const html = await fetchPublicGoogleDoc(docId);

    console.log('html', html);

    const article = parseArticleHTML(html);
    const quality = runQualityChecks(article);

    return Response.json({
        article,
        quality,
    });
}
