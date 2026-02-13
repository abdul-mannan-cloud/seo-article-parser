"use client";

import { motion } from "motion/react";
import SuggestiveSearch from "@/components/ui/suggestive-search";

export default function SearchHeader({
  onSubmitSearch,
  loading,
  hasData,
  onSearchChange,
  error,
  searchValue,
}) {
  return (
    <div className="relative z-10 w-full">
      <motion.div
        layout
        initial={false}
        animate={{
          paddingTop: hasData ? "2.5rem" : "0rem",
          paddingBottom: hasData ? "1.5rem" : "0rem",
        }}
        className="mx-auto max-w-5xl px-6"
      >
        <motion.div
          layout
          initial={false}
          className={`flex flex-col gap-6 ${
            hasData
              ? "items-center"
              : "items-center justify-center min-h-[70vh] text-center"
          }`}
        >
          {!hasData && (
            <div className="space-y-3 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                SEO Intake
              </span>
              <h1 className="text-4xl md:text-6xl font-semibold text-slate-900">
                Analyze & QA Ecommerce Articles
              </h1>
              <p className="max-w-2xl text-base md:text-lg text-slate-600">
                Paste a Google Doc link or ID. The system extracts metadata, images,
                links, and formatting, then prepares the WordPress payload.
              </p>
            </div>
          )}

          {hasData ? (
            <div className="flex w-full items-center justify-between gap-2 rounded-full bg-white/70 px-2.5 py-1 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.25)] backdrop-blur">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">
                SEO Intake
              </span>
              <div className="flex-1">
                <SuggestiveSearch
                  className="w-full max-w-md shadow-none border-transparent bg-transparent"
                  suggestions={[
                    "Paste Google Doc link or ID",
                    "Search: leather dog collar article",
                    "Analyze article for SEO readiness",
                  ]}
                  effect="typewriter"
                  onChange={onSearchChange}
                  onSubmit={(val) => onSubmitSearch(val)}
                  value={searchValue}
                  size="compact"
                />
              </div>
              <button
                onClick={() => onSubmitSearch()}
                className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          ) : (
            <>
              <div className="w-full">
                <SuggestiveSearch
                  className="w-full max-w-4xl mx-auto"
                  suggestions={[
                    "Paste Google Doc link or ID",
                    "Search: leather dog collar article",
                    "Analyze article for SEO readiness",
                  ]}
                  effect="typewriter"
                  onChange={onSearchChange}
                  onSubmit={(val) => onSubmitSearch(val)}
                  value={searchValue}
                  size="hero"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => onSubmitSearch()}
                  className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
                  disabled={loading}
                >
                  {loading ? "Analyzing..." : "Analyze Article"}
                </button>
                <span className="text-xs text-slate-500">
                  Press Enter in the search bar to run the analysis.
                </span>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </motion.div>
      </motion.div>
    </div>
  );
}
