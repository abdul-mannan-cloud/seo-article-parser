import * as cheerio from "cheerio";

function looksLikeImageUrl(url) {
    if (!url) return false;
    return (
        /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url) ||
        url.includes("googleusercontent.com")
    );
}

function unwrapGoogleRedirect(url) {
    if (!url) return "";
    if (!url.startsWith("https://www.google.com/url")) return url;
    try {
        const parsed = new URL(url);
        const target = parsed.searchParams.get("q");
        return target ? decodeURIComponent(target) : url;
    } catch {
        return url;
    }
}

function extractDriveId(url) {
    if (!url) return "";
    const patterns = [
        /drive\.google\.com\/file\/d\/([^/]+)/i,
        /drive\.google\.com\/open\?id=([^&]+)/i,
        /drive\.google\.com\/uc\?[^#]*id=([^&]+)/i,
        /drive\.google\.com\/thumbnail\?[^#]*id=([^&]+)/i,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return "";
}

function toDriveDirectView(url) {
    if (!url) return url;
    if (!url.includes("drive.google.com")) return url;
    const id = extractDriveId(url);
    if (!id) return url;
    return `https://drive.google.com/file/d/${id}/view`;
}

function extractAltFromText(text) {
    if (!text) return "";
    const match =
        text.match(/Alt tag:\s*“([^”]+)”/i) ||
        text.match(/Alt tag:\s*"([^"]+)"/i) ||
        text.match(/Alt tag:\s*'([^']+)'/i) ||
        text.match(/Alt tag:\s*([^.\n]+)/i);
    return match ? match[1].trim() : "";
}

function extractAltFromContext($, anchorEl) {
    const parent = $(anchorEl).parent();
    const candidates = [
        parent,
        parent.next(),
        parent.prev(),
        $(anchorEl).next(),
        $(anchorEl).prev(),
        parent.parent(),
        parent.parent().next(),
        parent.parent().prev(),
    ];

    for (const candidate of candidates) {
        if (!candidate || !candidate.length) continue;
        const alt = extractAltFromText(candidate.text());
        if (alt) return alt;
    }

    return "";
}

function extractLabeledValue($, label) {
    const el = $(`p:contains("${label}")`).first();
    if (!el.length) return "";
    const text = el.text().replace(/\s+/g, " ").trim();
    const regex = new RegExp(`${label}\\s*`, "i");
    return text.replace(regex, "").trim();
}

export function parseArticleHTML(html) {
    const $ = cheerio.load(html);

    const metaTitleFromDoc = extractLabeledValue($, "Meta Title:");
    const metaDescriptionFromDoc = extractLabeledValue($, "Meta Description:");

    const articleTitle = $("h1").first().text().trim() || "No Title Found";
    const metaTitle =
        metaTitleFromDoc ||
        $("title").first().text().trim() ||
        articleTitle;
    const metaDescription =
        metaDescriptionFromDoc ||
        $("p")
            .toArray()
            .map((el) => $(el).text().trim())
            .find(
                (text) =>
                    text &&
                    !text.includes("Meta Title:") &&
                    !text.includes("Meta Description:")
            ) ||
        "";

    const images = [];
    $("img").each((i, el) => {
        const src = $(el).attr("src");
        images.push({
            src,
            alt: $(el).attr("alt") || "",
        });
    });

    const imageSrcSet = new Set(images.map((img) => img.src).filter(Boolean));

    const links = [];
    $("a").each((i, el) => {
        const rawHref = $(el).attr("href");
        const href = toDriveDirectView(unwrapGoogleRedirect(rawHref));
        if (href) {
            links.push(href);
        }

        const anchorText = $(el).text().trim();
        const paragraphText = $(el).closest("p").text();
        const parentText = $(el).parent().text();

        if (
            (anchorText.match(/IMAGE\s*\d+/i) ||
                paragraphText.match(/IMAGE\s*\d+/i)) &&
            !imageSrcSet.has(href)
        ) {
            const alt = extractAltFromText(paragraphText || parentText);
            images.push({
                src: href,
                alt,
            });
            imageSrcSet.add(href);
        } else if (looksLikeImageUrl(href) && !imageSrcSet.has(href)) {
            const alt = extractAltFromContext($, el);
            images.push({
                src: href,
                alt,
            });
            imageSrcSet.add(href);
        }
    });

    $("p").each((i, el) => {
        const text = $(el).text();
        if (!/IMAGE\s*\d+/i.test(text)) return;
        const alt = extractAltFromText(text);
        $(el)
            .find("a")
            .each((j, anchor) => {
                const rawHref = $(anchor).attr("href");
                const href = toDriveDirectView(unwrapGoogleRedirect(rawHref));
                if (!href || imageSrcSet.has(href)) return;
                images.push({
                    src: href,
                    alt,
                });
                imageSrcSet.add(href);
            });
    });

    const formatting = {
        h2Count: $("h2").length,
        h3Count: $("h3").length,
        paragraphCount: $("p").length,
        listCount: $("ul, ol").length,
        boldCount: $("b, strong").length,
        italicCount: $("i, em").length,
        tableCount: $("table").length,
        wordCount: $("body").text().trim().split(/\s+/).filter(Boolean).length,
    };

    const headings = [];
    $("h1, h2, h3").each((i, el) => {
        const level = $(el).get(0).tagName.toUpperCase();
        headings.push({
            level,
            text: $(el).text().trim(),
        });
    });

    // Replace IMAGE link paragraphs with linked <img> tags for editor rendering
    $("p").each((i, el) => {
        const text = $(el).text();
        if (!/IMAGE\s*\d+/i.test(text)) return;
        const alt = extractAltFromText(text);
        const linkEl = $(el).find("a").first();
        if (!linkEl.length) return;
        const rawHref = linkEl.attr("href");
        const originalHref = unwrapGoogleRedirect(rawHref);
        const href = toDriveDirectView(originalHref);
        if (!href) return;
        const figure = $("<figure></figure>");
        const img = $("<img />");
        img.attr("src", href);
        if (alt) img.attr("alt", alt);
        if (originalHref) {
            const anchor = $("<a></a>");
            anchor.attr("href", originalHref);
            anchor.attr("target", "_blank");
            anchor.attr("rel", "noopener noreferrer");
            anchor.append(img);
            figure.append(anchor);
        } else {
            figure.append(img);
        }
        $(el).replaceWith(figure);
    });

    // Full HTML content for WordPress
    const articleHTML = $("body").html();

    return {
        articleTitle,
        metaTitle,
        metaDescription,
        images,
        links,
        formatting,
        headings,
        articleHTML,
    };
}
