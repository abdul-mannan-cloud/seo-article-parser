function isGoogleDriveImage(url) {
    if (!url) return false;
    return (
        url.includes("googleusercontent.com") ||
        url.includes("drive.google.com") ||
        url.includes("docs.google.com")
    );
}

function isLikelyPublicDriveLink(url) {
    if (!url) return false;
    if (!url.includes("drive.google.com")) return true;
    return (
        url.includes("usp=sharing") ||
        url.includes("sharing") ||
        url.includes("export") ||
        url.includes("uc?")
    );
}

function isProductLink(link) {
    if (!link) return false;
    const normalized = link.toLowerCase();
    return (
        normalized.includes("andar.com/products/") ||
        normalized.includes("andar.com/collections/")
    );
}

export function runQualityChecks(article) {
    const uniqueLinks = Array.from(new Set(article.links));
    const productLinks = uniqueLinks.filter((link) => isProductLink(link));
    const missingAltCount = article.images.filter(img => !img.alt || !img.alt.trim()).length;
    const metaTitleLength = article.metaTitle.trim().length;
    const metaDescriptionLength = article.metaDescription.trim().length;
    const nonDriveImages = article.images.filter(img => !isGoogleDriveImage(img.src)).length;
    const nonPublicDriveImages = article.images.filter(
        img => isGoogleDriveImage(img.src) && !isLikelyPublicDriveLink(img.src)
    ).length;

    const hasHeadings = (article.formatting?.h2Count || 0) + (article.formatting?.h3Count || 0) >= 2;
    const hasLists = (article.formatting?.listCount || 0) > 0;
    const hasEmphasis = (article.formatting?.boldCount || 0) + (article.formatting?.italicCount || 0) > 0;

    const issues = [];
    if (metaTitleLength < 30 || metaTitleLength > 70) {
        issues.push("Meta title should be 30-70 characters");
    }
    if (metaDescriptionLength < 70 || metaDescriptionLength > 160) {
        issues.push("Meta description should be 70-160 characters");
    }
    if (missingAltCount > 0) {
        issues.push("Some images are missing alt tags");
    }
    if (nonDriveImages > 0) {
        issues.push("Some images are not hosted on Google Drive");
    }
    if (nonPublicDriveImages > 0) {
        issues.push("Some Google Drive images may not be publicly shared");
    }
    if (!hasHeadings) {
        issues.push("Article needs more headings (H2/H3)");
    }
    if (!hasLists && !hasEmphasis) {
        issues.push("Add basic formatting (lists or emphasis)");
    }

    return {
        imageCount: article.images.length,
        linkCount: productLinks.length,
        missingAltCount,
        metaTitleLength,
        metaDescriptionLength,
        nonDriveImages,
        nonPublicDriveImages,
        formatting: {
            ...article.formatting,
            hasHeadings,
            hasLists,
            hasEmphasis,
        },
        seoReady: issues.length === 0,
        issues,

        imageWarning:
            article.images.length < 3
                ? "Too few images"
                : article.images.length > 10
                    ? "Too many images"
                    : "Good",

        linkWarning:
            productLinks.length < 2
                ? "Too few product links"
                : productLinks.length > 15
                    ? "Too many product links"
                    : "Good",
    };
}
