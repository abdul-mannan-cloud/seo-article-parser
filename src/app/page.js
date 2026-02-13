"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Component as GradientBackground } from "@/components/ui/gradient-backgrounds";
import SearchHeader from "@/components/SearchHeader";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function Home() {
  const [docIdInput, setDocIdInput] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [articleHtml, setArticleHtml] = useState("");
  const [editedHtml, setEditedHtml] = useState("");
  const [view, setView] = useState("overview");
  const [toast, setToast] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [publishPreviewOpen, setPublishPreviewOpen] = useState(false);

  function toDrivePreview(url) {
    if (!url || !url.includes("drive.google.com")) return "";
    const patterns = [
      /drive\.google\.com\/file\/d\/([^/]+)/i,
      /drive\.google\.com\/open\?id=([^&]+)/i,
      /drive\.google\.com\/uc\?[^#]*id=([^&]+)/i,
      /drive\.google\.com\/thumbnail\?[^#]*id=([^&]+)/i,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return "";
  }

  function normalizeDocId(input) {
    const trimmed = input.trim();
    if (!trimmed) return "";
    const match = trimmed.match(/document\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : trimmed;
  }

  async function analyze(overrideValue) {
    const valueToUse = overrideValue ?? docIdInput;
    const normalizedId = normalizeDocId(valueToUse);
    if (!normalizedId) {
      setError("Enter a Google Doc ID or full URL.");
      return;
    }

    setError("");
    setLoading(true);
    setData(null);

    const res = await fetch("/api/parse-article", {
      method: "POST",
      body: JSON.stringify({ docId: normalizedId }),
    });

    const json = await res.json();
    setData(json);
    setArticleHtml(json.article.articleHTML || "");
    setEditedHtml(json.article.articleHTML || "");
    setMetaTitle(json.article.metaTitle || "");
    setMetaDescription(json.article.metaDescription || "");
    setView("overview");
    setLoading(false);
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function publishArticle() {
    setPublishPreviewOpen(true);
  }

  function buildPublishHtml() {
    return `<meta name="title" content="${metaTitle}"/>\n<meta name="description" content="${metaDescription}"/>\n${editedHtml}`;
  }

  async function updateStatsFromEdits() {
    const res = await fetch("/api/parse-html", {
      method: "POST",
      body: JSON.stringify({ html: editedHtml }),
    });
    const json = await res.json();

    json.article.metaTitle = metaTitle;
    json.article.metaDescription = metaDescription;

    setData(json);
    setView("overview");
  }

  return (
    <main className="relative h-screen overflow-hidden text-slate-900">
      <GradientBackground />

      <div className="relative z-10 h-full overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SearchHeader
            onSubmitSearch={(val) => analyze(val)}
            onSearchChange={(val) => setDocIdInput(val)}
            loading={loading}
            hasData={Boolean(data)}
            error={error}
            searchValue={docIdInput}
          />
        </motion.div>

        {data && (
          <section
            className={`mx-auto px-6 pb-10 ${
              view === "editor" ? "max-w-none" : "max-w-6xl"
            }`}
          >
            <div className="h-[calc(100vh-160px)] overflow-y-auto pr-1">
              <AnimatePresence mode="wait">
                {view === "overview" ? (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Article Overview
                      </h2>
                      <button
                        onClick={() => setView("editor")}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5"
                      >
                        Edit & Review Article
                      </button>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="grid gap-4 md:grid-cols-4"
                    >
                      {[
                        { label: "Images", value: data.article.images.length },
                        { label: "Product Links", value: data.quality.linkCount },
                        { label: "Headings", value: data.article.headings.length },
                        { label: "Tables", value: data.article.formatting.tableCount },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_25px_70px_-60px_rgba(15,23,42,0.45)] backdrop-blur"
                        >
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            {stat.label}
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </motion.div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.5)] backdrop-blur"
                      >
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold">SEO Checklist</h2>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              data.quality.seoReady
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {data.quality.seoReady ? "Ready" : "Needs Fixes"}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 text-sm">
                          {[
                            {
                              label: "Meta Title Length",
                              value: `${data.quality.metaTitleLength} chars`,
                              ok:
                                data.quality.metaTitleLength >= 30 &&
                                data.quality.metaTitleLength <= 70,
                            },
                            {
                              label: "Meta Description Length",
                              value: `${data.quality.metaDescriptionLength} chars`,
                              ok:
                                data.quality.metaDescriptionLength >= 70 &&
                                data.quality.metaDescriptionLength <= 160,
                            },
                            {
                              label: "Images Missing Alt",
                              value: data.quality.missingAltCount,
                              ok: data.quality.missingAltCount === 0,
                            },
                            {
                              label: "Non-Google Drive Images",
                              value: data.quality.nonDriveImages,
                              ok: data.quality.nonDriveImages === 0,
                            },
                            {
                              label: "Drive Images Not Public",
                              value: data.quality.nonPublicDriveImages,
                              ok: data.quality.nonPublicDriveImages === 0,
                            },
                            {
                              label: "Image Guidance",
                              value: data.quality.imageWarning,
                              ok: data.quality.imageWarning === "Good",
                            },
                            {
                              label: "Product Link Guidance",
                              value: data.quality.linkWarning,
                              ok: data.quality.linkWarning === "Good",
                            },
                            {
                              label: "Headings Present",
                              value: data.quality.formatting?.hasHeadings ? "Yes" : "No",
                              ok: data.quality.formatting?.hasHeadings,
                            },
                            {
                              label: "Lists or Emphasis",
                              value:
                                data.quality.formatting?.hasLists ||
                                data.quality.formatting?.hasEmphasis
                                  ? "Yes"
                                  : "No",
                              ok:
                                data.quality.formatting?.hasLists ||
                                data.quality.formatting?.hasEmphasis,
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                                item.ok
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              <span>{item.label}</span>
                              <span className="font-semibold">{item.value}</span>
                            </div>
                          ))}
                          {data.quality.issues.length > 0 && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
                              {data.quality.issues.join(" • ")}
                            </div>
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
                        className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.5)] backdrop-blur"
                      >
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold">Headings & Links</h2>
                          <span className="text-xs text-slate-400">
                            {data.article.headings.length} headings •{" "}
                            {data.article.links.length} links
                          </span>
                        </div>
                        <div className="mt-4 grid gap-4">
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Headings
                            </p>
                            <div className="mt-2 space-y-2 text-sm max-h-[140px] overflow-auto pr-2">
                              {data.article.headings.map((heading, index) => (
                                <div
                                  key={`${heading.level}-${index}`}
                                  className="rounded-xl bg-white px-3 py-2"
                                >
                                  <span className="text-xs text-slate-400">
                                    {heading.level}
                                  </span>
                                  <p className="mt-1 text-slate-700">{heading.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              Outbound Links
                            </p>
                            <div className="mt-2 space-y-2 text-sm max-h-[220px] overflow-auto pr-2">
                              {data.article.links.map((link, index) => (
                                <div
                                  key={`${link}-${index}`}
                                  className="rounded-xl bg-white px-3 py-2 break-all"
                                >
                                  {link}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
                      className="mt-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.5)] backdrop-blur"
                    >
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Media Gallery</h2>
                        <span className="text-xs text-slate-400">
                          {data.article.images.length} images
                        </span>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        {data.article.images.map((image, index) => (
                          <div
                            key={`${image.src}-${index}`}
                            className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                          >
                            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                              {toDrivePreview(image.src) ? (
                                <iframe
                                  src={toDrivePreview(image.src)}
                                  title={image.alt || `Image ${index + 1}`}
                                  className="h-full w-full"
                                  loading="lazy"
                                  allow="autoplay"
                                />
                              ) : (
                                <img
                                  src={image.src}
                                  alt={image.alt || `Image ${index + 1}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              )}
                            </div>
                            <p className="mt-3 text-xs text-slate-400">
                              Image {index + 1}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              Alt: {image.alt ? image.alt : "Missing alt text"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="flex h-full flex-col gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          WYSIWYG Editor
                        </p>
                        <h2 className="text-xl font-semibold text-slate-900">
                          Edit Article Content
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setMetaModalOpen(true)}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5"
                        >
                          Edit Meta Tags
                        </button>
                        <button
                          onClick={() => setView("overview")}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5"
                        >
                          Back to Overview
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.5)] backdrop-blur">
                      <div className="h-full overflow-y-auto">
                        <SimpleEditor
                          initialContent={editedHtml}
                          onContentChange={(html) => setEditedHtml(html)}
                        />
                      </div>
                    </div>

                    <div className="shrink-0 grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={publishArticle}
                        className="w-full rounded-full bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
                      >
                        Publish to WordPress
                      </button>
                      <button
                        onClick={updateStatsFromEdits}
                        className="w-full rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5"
                      >
                        Update Stats
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        )}

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="fixed right-6 top-6 z-50 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {metaModalOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Edit Meta Tags</h3>
                  <button
                    onClick={() => setMetaModalOpen(false)}
                    className="text-xs font-semibold text-slate-400"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Meta Title
                    </label>
                    <input
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Meta Description
                    </label>
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="mt-2 min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setMetaModalOpen(false)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setMetaModalOpen(false)}
                    className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {publishPreviewOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="h-[92vh] w-full max-w-6xl rounded-t-3xl bg-white shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Publish Preview
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      WordPress Render
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        buildPublishHtml();
                        setPublishPreviewOpen(false);
                        showToast("Article published to WordPress");
                      }}
                      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Confirm Publish
                    </button>
                    <button
                      onClick={() => setPublishPreviewOpen(false)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="h-[calc(92vh-64px)] overflow-y-auto px-8 py-6">
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: editedHtml }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
