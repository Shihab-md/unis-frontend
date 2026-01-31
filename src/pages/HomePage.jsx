// src/pages/Public/HomePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getBaseUrl, showSwalAlert } from "../utils/CommonHelper";

// ✅ Charts (frontend only)
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip as ReTooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

/* ----------------------------- Helpers ----------------------------- */

const COLORS = [
    "#14b8a6", // teal
    "#6366f1", // indigo
    "#f59e0b", // amber
    "#ef4444", // red
    "#22c55e", // green
    "#0ea5e9", // sky
    "#a855f7", // purple
    "#f97316", // orange
];

// ✅ REQUIRED ORDER (always)
const EDUCATION_TYPE_ORDER = [
    "Deeniyath Education",
    "Islamic Home Science",
    "School Education",
    "College Education",
    "Vocational Courses",
];

const sortByEducationTypeOrder = (arr = []) => {
    const rank = new Map(EDUCATION_TYPE_ORDER.map((t, i) => [t, i]));
    return arr
        .slice()
        .sort((a, b) => {
            const ra = rank.has(a.type) ? rank.get(a.type) : 999;
            const rb = rank.has(b.type) ? rank.get(b.type) : 999;
            if (ra !== rb) return ra - rb;
            return String(a.type || "").localeCompare(String(b.type || ""));
        });
};

// ✅ Count-up animation for numbers
const useCountUp = (target, durationMs = 900) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const to = Number.isFinite(Number(target)) ? Number(target) : 0;
        let raf = 0;
        const start = performance.now();
        const from = 0;

        const tick = (now) => {
            const t = Math.min((now - start) / durationMs, 1);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            const v = Math.round(from + (to - from) * eased);
            setValue(v);
            if (t < 1) raf = requestAnimationFrame(tick);
        };

        setValue(0);
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, durationMs]);

    return value;
};

/* ----------------------------- UI Components ----------------------------- */

// ✅ Colorful stats card
const StatCard = ({ title, value, loading, colorClass, icon }) => {
    const animated = useCountUp(loading ? 0 : value, 950);

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border bg-white/80 backdrop-blur p-5 shadow-sm ${colorClass}`}
        >
            {/* Decorative blob */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/35 blur-xl" />

            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-white/90">
                        {title}
                    </div>
                    <div className="mt-2 text-4xl font-extrabold text-white drop-shadow">
                        {loading ? "0" : animated}
                    </div>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/25 text-2xl text-white shadow-sm">
                    {icon}
                </div>
            </div>
        </div>
    );
};

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload;
    return (
        <div className="rounded-lg border bg-white p-3 text-sm shadow">
            <div className="font-bold text-slate-900">{p?.courseName || p?.name}</div>
            <div className="text-slate-600">Students: {p?.count ?? p?.value ?? 0}</div>
        </div>
    );
};

const TogglePill = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`rounded-full px-3 py-1 text-xs font-bold transition ${active
                ? "bg-teal-600 text-white shadow"
                : "bg-white/70 backdrop-blur text-slate-800 hover:bg-white/90 border"
            }`}
    >
        {children}
    </button>
);

const TypeCharts = ({ group, showCharts }) => {
    const courses = (group?.courses || [])
        .filter((c) => (c?.courseName || "").trim())
        .map((c, i) => ({
            name: c.courseName,
            courseName: c.courseName,
            count: c.count ?? 0,
            _color: COLORS[i % COLORS.length],
        }))
        .sort((a, b) => b.count - a.count);

    if (!courses.length) return null;

    const total = group?.total ?? courses.reduce((s, c) => s + c.count, 0);

    return (
        <div className="rounded-xl border bg-white/60 backdrop-blur p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-base font-extrabold text-slate-900">{group.type}</div>
                <div className="w-fit rounded-full bg-white/80 backdrop-blur px-3 py-1 text-sm font-bold text-slate-800 shadow-sm">
                    Total: {total}
                </div>
            </div>

            {showCharts && (
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {/* PIE */}
                    <div className="rounded-xl bg-white/85 backdrop-blur p-3 shadow-sm lg:col-span-5">
                        <div className="text-sm font-bold text-slate-900">
                            Pie: Course distribution
                        </div>
                        <div className="mt-2 h-60 sm:h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={courses}
                                        dataKey="count"
                                        nameKey="name"
                                        innerRadius={50}
                                        outerRadius={85}
                                        paddingAngle={2}
                                    >
                                        {courses.map((entry, i) => (
                                            <Cell key={i} fill={entry._color} />
                                        ))}
                                    </Pie>
                                    <ReTooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* BAR */}
                    <div className="rounded-xl bg-white/85 backdrop-blur p-3 shadow-sm lg:col-span-7">
                        <div className="text-sm font-bold text-slate-900">
                            Bar: Students per course
                        </div>
                        <div className="mt-2 h-60 sm:h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={courses}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                        interval={0}
                                        angle={courses.length > 4 ? -20 : 0}
                                        height={courses.length > 4 ? 50 : 30}
                                    />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <ReTooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count">
                                        {courses.map((entry, i) => (
                                            <Cell key={i} fill={entry._color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* table (always show) */}
            <div className="mt-4 overflow-auto rounded-xl bg-white/85 backdrop-blur shadow-sm">
                <table className="w-full min-w-[420px] border-collapse">
                    <thead>
                        <tr className="border-b bg-white/70 text-left text-sm text-slate-700">
                            <th className="p-2 sm:p-3">Course</th>
                            <th className="p-2 sm:p-3">Students</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((c) => (
                            <tr key={c.name} className="border-b">
                                <td className="p-2 sm:p-3 font-semibold text-slate-800">
                                    {c.courseName}
                                </td>
                                <td className="p-2 sm:p-3 text-slate-700">{c.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* ------------------------ Gallery (Swipe + Fullscreen) ------------------------ */

const PhotoCarousel = ({ images = [], autoMs = 3500 }) => {
    const [idx, setIdx] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const startX = useRef(null);
    const startY = useRef(null);

    const clampIndex = (n) => {
        if (!images.length) return 0;
        return (n + images.length) % images.length;
    };

    const prev = () => setIdx((p) => clampIndex(p - 1));
    const next = () => setIdx((p) => clampIndex(p + 1));

    useEffect(() => {
        if (!images.length) return;
        if (isOpen) return;

        const t = setInterval(() => setIdx((p) => clampIndex(p + 1)), autoMs);
        return () => clearInterval(t);
    }, [images, autoMs, isOpen]);

    const onTouchStart = (e) => {
        const t = e.touches?.[0];
        if (!t) return;
        startX.current = t.clientX;
        startY.current = t.clientY;
    };

    const onTouchEnd = (e) => {
        const t = e.changedTouches?.[0];
        if (!t) return;

        const dx = t.clientX - (startX.current ?? t.clientX);
        const dy = t.clientY - (startY.current ?? t.clientY);

        startX.current = null;
        startY.current = null;

        if (Math.abs(dy) > Math.abs(dx)) return;
        if (dx > 50) prev();
        else if (dx < -50) next();
    };

    if (!images.length) return null;

    return (
        <>
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-4 sm:p-6 shadow-sm md:p-10">
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Gallery</h2>
                        <p className="mt-1 text-sm text-slate-700">
                            A glimpse of our activities and campus.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={prev}
                            className="rounded-lg border bg-white/70 backdrop-blur px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white/90"
                            aria-label="Previous"
                        >
                            ◀
                        </button>
                        <button
                            onClick={next}
                            className="rounded-lg border bg-white/70 backdrop-blur px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-white/90"
                            aria-label="Next"
                        >
                            ▶
                        </button>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12">
                    <div className="md:col-span-8">
                        <div
                            className="relative overflow-hidden rounded-2xl"
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                            role="button"
                            tabIndex={0}
                            onClick={() => setIsOpen(true)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") setIsOpen(true);
                            }}
                            aria-label="Open fullscreen gallery"
                            title="Tap to view fullscreen"
                        >
                            <img
                                src={images[idx]}
                                alt={`Gallery ${idx + 1}`}
                                className="h-[220px] w-full cursor-pointer object-cover sm:h-[260px] md:h-[360px]"
                                loading="lazy"
                            />
                            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                                {idx + 1} / {images.length}
                            </div>
                            <div className="absolute bottom-3 left-3 rounded-full bg-white/80 backdrop-blur px-3 py-1 text-xs font-semibold text-slate-800">
                                Tap fullscreen • Swipe
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-4">
                        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-2">
                            {images.slice(0, 6).map((src, i) => {
                                const active = i === idx;
                                return (
                                    <button
                                        key={src}
                                        onClick={() => setIdx(i)}
                                        className={`overflow-hidden rounded-xl border bg-white/75 backdrop-blur ${active ? "ring-2 ring-teal-600" : "hover:bg-white/90"
                                            }`}
                                        title={`Photo ${i + 1}`}
                                    >
                                        <img
                                            src={src}
                                            alt={`Thumb ${i + 1}`}
                                            className="h-16 sm:h-20 w-full object-cover"
                                            loading="lazy"
                                        />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setIdx(i)}
                                    className={`h-2.5 w-2.5 rounded-full ${i === idx
                                            ? "bg-teal-600"
                                            : "bg-slate-300 hover:bg-slate-400"
                                        }`}
                                    aria-label={`Go to photo ${i + 1}`}
                                />
                            ))}
                        </div>

                        <div className="mt-4 text-xs text-slate-700">
                            Tip: Swipe on main photo (mobile) or use arrows.
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <FullscreenGallery
                    images={images}
                    startIndex={idx}
                    onClose={() => setIsOpen(false)}
                    onIndexChange={setIdx}
                />
            )}
        </>
    );
};

const FullscreenGallery = ({ images, startIndex = 0, onClose, onIndexChange }) => {
    const [idx, setIdx] = useState(startIndex);
    const startX = useRef(null);
    const startY = useRef(null);

    const clampIndex = (n) => (n + images.length) % images.length;
    const prev = () => setIdx((p) => clampIndex(p - 1));
    const next = () => setIdx((p) => clampIndex(p + 1));

    useEffect(() => onIndexChange?.(idx), [idx, onIndexChange]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = prevOverflow);
    }, []);

    const onTouchStart = (e) => {
        const t = e.touches?.[0];
        if (!t) return;
        startX.current = t.clientX;
        startY.current = t.clientY;
    };
    const onTouchEnd = (e) => {
        const t = e.changedTouches?.[0];
        if (!t) return;

        const dx = t.clientX - (startX.current ?? t.clientX);
        const dy = t.clientY - (startY.current ?? t.clientY);
        startX.current = null;
        startY.current = null;

        if (Math.abs(dy) > Math.abs(dx)) return;
        if (dx > 50) prev();
        else if (dx < -50) next();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90">
            <div className="absolute left-3 top-3 sm:left-4 sm:top-4 flex items-center gap-3">
                <button
                    onClick={onClose}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
                >
                    ✕ Close
                </button>
                <div className="text-sm text-white/80">
                    {idx + 1} / {images.length}
                </div>
            </div>

            <button
                onClick={prev}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white hover:bg-white/20"
                aria-label="Previous"
            >
                ◀
            </button>
            <button
                onClick={next}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-4 py-3 text-white hover:bg-white/20"
                aria-label="Next"
            >
                ▶
            </button>

            <div
                className="mx-auto flex h-full max-w-6xl items-center justify-center px-2 sm:px-4"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <img
                    src={images[idx]}
                    alt={`Fullscreen ${idx + 1}`}
                    className="max-h-[85vh] w-full select-none rounded-xl object-contain"
                    draggable={false}
                />
            </div>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIdx(i)}
                            className={`h-2.5 w-2.5 rounded-full ${i === idx ? "bg-white" : "bg-white/40 hover:bg-white/70"
                                }`}
                            aria-label={`Go to photo ${i + 1}`}
                        />
                    ))}
                </div>
                <div className="mt-2 text-center text-xs text-white/70">
                    Swipe • Arrow keys • ESC to close
                </div>
            </div>
        </div>
    );
};

/* ---------------- Latest News (Scroll Up + Popup + Swipe + Mobile Fix) ---------------- */

const TAG_STYLE = (tag) => {
    const t = String(tag || "").toLowerCase().trim();
    if (t === "exam") return "bg-rose-600/15 text-rose-700 border-rose-200";
    if (t === "meeting") return "bg-indigo-600/15 text-indigo-700 border-indigo-200";
    if (t === "event") return "bg-amber-600/15 text-amber-700 border-amber-200";
    if (t === "training") return "bg-teal-600/15 text-teal-700 border-teal-200";
    if (t === "admissions") return "bg-emerald-600/15 text-emerald-700 border-emerald-200";
    return "bg-slate-600/10 text-slate-700 border-slate-200";
};

const NewsPopup = ({ open, onClose, items = [], index = 0, setIndex }) => {
    const count = items?.length || 0;
    if (!open || count === 0) return null;

    const item = items[index] || items[0];

    // ESC + arrows
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
            if (e.key === "ArrowLeft") setIndex?.((p) => (p - 1 + count) % count);
            if (e.key === "ArrowRight") setIndex?.((p) => (p + 1) % count);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, setIndex, count]);

    // Swipe left/right inside popup
    const startX = useRef(null);
    const startY = useRef(null);

    const onTouchStart = (e) => {
        const t = e.touches?.[0];
        if (!t) return;
        startX.current = t.clientX;
        startY.current = t.clientY;
    };

    const onTouchEnd = (e) => {
        const t = e.changedTouches?.[0];
        if (!t) return;

        const dx = t.clientX - (startX.current ?? t.clientX);
        const dy = t.clientY - (startY.current ?? t.clientY);

        startX.current = null;
        startY.current = null;

        // ✅ keep vertical scroll working
        if (Math.abs(dy) > Math.abs(dx)) return;

        if (dx > 50) setIndex?.((p) => (p - 1 + count) % count);
        else if (dx < -50) setIndex?.((p) => (p + 1) % count);
    };

    return (
        <div className="fixed inset-0 z-[9999]">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70" />

            {/* Click-to-close wrapper (also scroll container) */}
            <div
                // className="absolute inset-0 overflow-y-auto overscroll-contain p-3 sm:p-6 flex items-start justify-center"
                className="absolute inset-0 overflow-y-auto overscroll-contain mt-10 p-5 flex items-start justify-center"
                style={{ WebkitOverflowScrolling: "touch" }}
                onClick={onClose}
                role="presentation"
            >
                <div
                    className="mt-0 w-full max-w-xl min-h-[100vh] sm:min-h-0 sm:max-h-[92vh] overflow-hidden rounded-none sm:rounded-2xl border bg-white/95 backdrop-blur shadow-2xl flex flex-col"
                    //className="my-6 w-full max-w-xl max-h-[92vh] overflow-hidden rounded-2xl border bg-white/95 backdrop-blur shadow-2xl flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-teal-500 to-amber-500" />

                    {/* Header (always visible) */}
                    <div className="flex items-start justify-between gap-3 border-b bg-white/90 backdrop-blur px-4 py-3 sm:px-5">
                        <div className="min-w-0">
                            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                                Event Details
                            </div>
                            <div className="mt-0.5 truncate text-lg sm:text-xl font-extrabold text-slate-900">
                                {item.title}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {item.tag ? (
                                    <span
                                        className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${TAG_STYLE(
                                            item.tag
                                        )}`}
                                    >
                                        {item.tag}
                                    </span>
                                ) : null}

                                <span className="text-xs font-bold text-slate-600">
                                    {item.date || "—"}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-xs sm:text-sm font-extrabold text-white shadow hover:bg-slate-800 active:scale-[0.98]"
                            aria-label="Close event popup"
                        >
                            ✕ Close
                        </button>
                    </div>

                    {/* Body (scrolls) */}
                    <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-4 py-4 sm:px-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border bg-white/85 p-4">
                                <div className="text-xs font-bold text-slate-600">Event</div>
                                <div className="mt-1 text-sm font-extrabold text-slate-900">
                                    {item.title || "—"}
                                </div>
                            </div>

                            <div className="rounded-xl border bg-white/85 p-4">
                                <div className="text-xs font-bold text-slate-600">Venue</div>
                                <div className="mt-1 text-sm font-extrabold text-slate-900">
                                    {item.venue || "—"}
                                </div>
                            </div>

                            <div className="rounded-xl border bg-white/85 p-4 sm:col-span-2">
                                <div className="text-xs font-bold text-slate-600">Date</div>
                                <div className="mt-1 text-sm font-extrabold text-slate-900">
                                    {item.date || "—"}
                                </div>
                            </div>

                            {item.description ? (
                                <div className="rounded-xl border bg-white/85 p-4 sm:col-span-2">
                                    <div className="text-xs font-bold text-slate-600">Notes</div>
                                    <div className="mt-1 text-sm text-slate-800 whitespace-pre-line">
                                        {item.description}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Footer controls */}
                        <div className="mt-4 flex items-center justify-between gap-2">
                            <button
                                type="button"
                                onClick={() => setIndex?.((p) => (p - 1 + count) % count)}
                                className="rounded-lg border bg-white/70 px-3 py-2 text-sm font-bold text-slate-800 hover:bg-white/90"
                            >
                                ◀ Prev
                            </button>

                            <div className="text-xs font-semibold text-slate-700">
                                {index + 1} / {count} • Swipe left/right
                            </div>

                            <button
                                type="button"
                                onClick={() => setIndex?.((p) => (p + 1) % count)}
                                className="rounded-lg border bg-white/70 px-3 py-2 text-sm font-bold text-slate-800 hover:bg-white/90"
                            >
                                Next ▶
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LatestNewsTicker = ({ items = [] }) => {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    // ✅ Scroll lock (safe on web + mobile): lock background, keep modal scroll working
    const scrollLockRef = useRef({ bodyOverflow: "" });

    useEffect(() => {
        // capture original once
        scrollLockRef.current.bodyOverflow = document.body.style.overflow || "";
    }, []);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            return;
        }
        document.body.style.overflow = scrollLockRef.current.bodyOverflow;
    }, [open]);

    useEffect(() => {
        return () => {
            document.body.style.overflow = scrollLockRef.current.bodyOverflow;
        };
    }, []);

    const list = items?.length ? [...items, ...items] : [];

    const openAt = (originalIndex) => {
        setActiveIndex(originalIndex);
        setOpen(true);
    };

    return (
        <div className="rounded-2xl border bg-white/70 backdrop-blur p-4 sm:p-6 shadow-sm md:p-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Latest News & Events</h2>
                    <p className="mt-1 text-sm text-slate-700">
                        Upcoming activities and important announcements.
                    </p>
                </div>

                <span className="w-fit rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 px-3 py-1 text-xs font-extrabold text-white shadow">
                    LIVE
                </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border bg-white/75 backdrop-blur">
                <style>{`
          @keyframes unisScrollUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          .unis-ticker {
            animation: unisScrollUp 18s linear infinite;
            will-change: transform;
          }
          .unis-ticker:hover {
            animation-play-state: paused;
          }
        `}</style>

                <div className="relative h-56 sm:h-64">
                    {list.length ? (
                        <div className="unis-ticker absolute inset-x-0 top-0">
                            {list.map((n, idx) => {
                                const originalIndex = items.length ? idx % items.length : 0;

                                return (
                                    <button
                                        type="button"
                                        key={`${originalIndex}-${idx}`}
                                        onClick={() => openAt(originalIndex)}
                                        className="w-full text-left"
                                        title="Click to view full details"
                                    >
                                        <div className="flex items-start gap-3 border-b px-4 py-3 sm:px-5 hover:bg-white/70 transition">
                                            <div className="shrink-0 rounded-xl bg-gradient-to-br from-amber-500 to-red-400 px-3 py-2 text-center text-white shadow">
                                                <div className="text-[10px] font-bold uppercase tracking-wide">
                                                    {n.dayLabel || "Day"}
                                                </div>
                                                <div className="text-lg font-extrabold leading-none">
                                                    {n.day || "--"}
                                                </div>
                                                <div className="text-[11px] font-bold">{n.month || "--"}</div>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="truncate text-sm font-extrabold text-slate-900">
                                                        {n.title}
                                                    </div>

                                                    {n.tag ? (
                                                        <span
                                                            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-extrabold ${TAG_STYLE(
                                                                n.tag
                                                            )}`}
                                                        >
                                                            {n.tag}
                                                        </span>
                                                    ) : null}

                                                    <span className="ml-auto hidden sm:inline text-[11px] font-bold text-teal-700">
                                                        Click for details →
                                                    </span>
                                                </div>

                                                <div className="mt-1 text-xs text-slate-700">
                                                    <span className="font-bold text-slate-800">Venue:</span>{" "}
                                                    {n.venue || "—"}
                                                </div>

                                                {n.time ? (
                                                    <div className="mt-0.5 text-xs text-slate-600">
                                                        <span className="font-bold text-slate-800">Time:</span>{" "}
                                                        {n.time}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-700">
                            No announcements yet.
                        </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/95 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/95 to-transparent" />
                </div>
            </div>

            <div className="mt-3 text-xs text-slate-600">
                Tip: Tap a news item to open details. Hover/touch the list to pause scrolling.
            </div>

            <NewsPopup
                open={open}
                onClose={() => setOpen(false)}
                items={items}
                index={activeIndex}
                setIndex={setActiveIndex}
            />
        </div>
    );
};

/* -------------------------------- Home Page ------------------------------- */

export default function HomePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // ✅ Toggles / filters
    const [showCharts, setShowCharts] = useState(true);
    const [selectedType, setSelectedType] = useState("ALL"); // ALL or one type

    const [stats, setStats] = useState({
        supervisorsCount: 0,
        schoolsCount: 0,
        studentsCount: 0,
        courseWiseByType: [],
    });

    // ✅ Latest News (static for now; you can later load from API)
    const newsItems = useMemo(
        () => [
            {
                tag: "Exam",
                dayLabel: "Day",
                day: "05",
                month: "Feb",
                fullDate: "05 Feb 2026",
                title: "Monthly Exam - Makthab",
                venue: "Niswan Campus",
                time: "10:00 AM",
                description: "Students must bring ID card. Reporting time: 9:30 AM.",
            },
            {
                tag: "Meeting",
                dayLabel: "Day",
                day: "12",
                month: "Feb",
                fullDate: "12 Feb 2026",
                title: "Supervisors Meeting",
                venue: "HQ Auditorium",
                time: "02:30 PM",
                description: "Agenda: Niswan performance review and upcoming plans.",
            },
            {
                tag: "Event",
                dayLabel: "Day",
                day: "20",
                month: "Feb",
                fullDate: "20 Feb 2026",
                title: "Annual Community Program",
                venue: "Main Ground",
                time: "04:00 PM",
                description: "Public welcome. Cultural programs and awards ceremony.",
            },
        ],
        []
    );

    // ✅ Update with your real images
    const galleryImages = useMemo(
        () => [
            "/gallery/1.jpg",
            "/gallery/2.jpg",
            "/gallery/3.jpg",
            "/gallery/4.jpg",
            "/gallery/5.jpg",
            "/gallery/6.jpg",
            "/gallery/7.jpg",
        ],
        []
    );

    useEffect(() => {
        let alive = true;

        const load = async () => {
            try {
                const base = await getBaseUrl();
                const url = new URL("public/stats", base).toString(); // ✅ correct join

                const token = localStorage.getItem("token"); // optional
                const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

                const res = await axios.get(url, { headers, timeout: 15000 });

                if (!res.data?.success) {
                    showSwalAlert("Error!", res.data?.error || "Unable to load stats", "error");
                    return;
                }

                if (alive) setStats(res.data.stats);
            } catch (err) {
                console.log("STATS API ERROR", {
                    message: err?.message,
                    status: err?.response?.status,
                    data: err?.response?.data,
                    url: err?.config?.url,
                });

                const msg =
                    err?.response?.data?.error ||
                    (err?.response
                        ? `Server error (${err.response.status})`
                        : "Network/CORS error");
                showSwalAlert("Error!", msg, "error");
            } finally {
                if (alive) setLoading(false);
            }
        };

        load();
        return () => {
            alive = false;
        };
    }, []);

    // ✅ ALWAYS required order (not by total)
    const sortedTypes = useMemo(() => {
        const ordered = sortByEducationTypeOrder(stats.courseWiseByType || []);
        if (selectedType === "ALL") return ordered;
        return ordered.filter((g) => g.type === selectedType);
    }, [stats.courseWiseByType, selectedType]);

    // ✅ dropdown options always in required order (and include unknown)
    const typeOptions = useMemo(() => {
        const list = sortByEducationTypeOrder(stats.courseWiseByType || []);
        const known = new Set(EDUCATION_TYPE_ORDER);
        const unknown = (list || [])
            .map((x) => x.type)
            .filter((t) => t && !known.has(t));
        return ["ALL", ...EDUCATION_TYPE_ORDER, ...unknown];
    }, [stats.courseWiseByType]);

    return (
        <div id="top" className="min-h-screen bg-[url(/bg-img.jpg)] bg-fixed bg-cover bg-center bg-repeat">
            {/* ✅ Attractive Top Bar (Glass + Gradient + CTA) */}
            <header className="sticky top-0 z-20">
                <div className="border-b bg-white/65 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-4 py-3">
                        {/* Left: Brand */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-teal-400 to-amber-400 blur-md opacity-60" />
                                <img
                                    src="/Logo - UNIS.PNG"
                                    alt="UNIS"
                                    className="relative h-11 w-11 rounded-md border border-white/60 bg-white/70 p-1 shadow"
                                />
                            </div>

                            <div className="leading-tight">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="text-lg font-bold tracking-wide text-slate-900">
                                        <span className="text-blue-700">UNIS ACADEMY</span>
                                    </div>
                                </div>

                                <div className="mt-0.5 text-xs font-semibold text-emerald-700">
                                    إيمان : تقوى : حياء : أخلاق : دعاء : دعوة
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => navigate("/login")}
                                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                            >
                                <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-white/10" />
                                <span className="relative flex items-center gap-2">
                                    <span>Login</span>
                                    <span className="hidden lg:block text-white/90">→</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="mx-auto max-w-6xl px-3 sm:px-4 py-8 sm:py-10">
                <div className="grid grid-cols-1 gap-6 rounded-2xl border bg-white/70 backdrop-blur p-5 sm:p-6 shadow-sm md:grid-cols-2 md:p-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                            Empowering students through knowledge & values
                        </h1>
                        <p className="mt-4 text-slate-700">
                            UNIS Academy supports education with structured learning programs,
                            strong community support, and responsible administration.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <a
                                href="#stats"
                                className="rounded-lg border bg-white/60 backdrop-blur px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white/80"
                            >
                                Live Stats
                            </a>
                            <a
                                href="#gallery"
                                className="rounded-lg border bg-white/60 backdrop-blur px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white/80"
                            >
                                Gallery
                            </a>
                            <a
                                href="#contact"
                                className="rounded-lg border bg-white/60 backdrop-blur px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white/80"
                            >
                                Contact
                            </a>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-[url(/bg-img.jpg)] bg-cover bg-center p-5 sm:p-6">
                        <div className="rounded-xl bg-white/85 backdrop-blur p-5">
                            <div className="text-sm font-bold text-slate-900">Mission</div>
                            <p className="mt-2 text-slate-700">
                                Provide accessible, quality education with strong discipline, moral values,
                                and academic excellence.
                            </p>
                            <div className="mt-4 text-sm font-bold text-slate-900">Vision</div>
                            <p className="mt-2 text-slate-700">
                                Build a community of confident learners who contribute positively to society
                                and live with purpose.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section id="stats" className="mx-auto max-w-6xl px-3 sm:px-4 pb-10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Live Statistics</h2>
                    <div className="text-xs text-slate-700">{loading ? "Loading..." : "Updated just now"}</div>
                </div>

                {/* ✅ Colorful + Animated */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
                    <StatCard
                        title="Active Supervisors"
                        value={stats.supervisorsCount}
                        loading={loading}
                        colorClass="bg-gradient-to-br from-indigo-600 to-sky-500"
                        icon="📌"
                    />
                    <StatCard
                        title="Active Niswans"
                        value={stats.schoolsCount}
                        loading={loading}
                        colorClass="bg-gradient-to-br from-emerald-600 to-teal-500"
                        icon="🏛️"
                    />
                    <StatCard
                        title="Active Students"
                        value={stats.studentsCount}
                        loading={loading}
                        colorClass="bg-gradient-to-br from-amber-500 to-red-400"
                        icon="📊"
                    />
                </div>

                {/* Type totals + toggles + charts */}
                <div className="mt-6 rounded-xl border bg-white/70 backdrop-blur p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Course-wise Active Students</h3>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                            <div className="flex flex-wrap gap-2">
                                <TogglePill active={showCharts} onClick={() => setShowCharts(true)}>
                                    Show Charts
                                </TogglePill>
                                <TogglePill active={!showCharts} onClick={() => setShowCharts(false)}>
                                    Hide Charts
                                </TogglePill>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-800">Type:</span>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="rounded-lg border bg-white/70 backdrop-blur px-3 py-2 text-sm font-semibold text-slate-800"
                                >
                                    {typeOptions.map((t) => (
                                        <option key={t} value={t}>
                                            {t === "ALL" ? "All Types" : t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {sortedTypes.length === 0 ? (
                        <div className="mt-3 text-slate-700">{loading ? "Loading..." : "No data"}</div>
                    ) : (
                        <div className="mt-6 space-y-5">
                            {sortedTypes.map((g) => (
                                <TypeCharts key={g.type} group={g} showCharts={showCharts} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ✅ Latest News (above Gallery) */}
            <section className="mx-auto max-w-6xl px-3 sm:px-4 pb-10">
                <LatestNewsTicker items={newsItems} />
            </section>

            {/* Gallery */}
            <section id="gallery" className="mx-auto max-w-6xl px-3 sm:px-4 pb-10">
                <PhotoCarousel images={galleryImages} autoMs={3500} />
            </section>

            {/* Contact */}
            <section id="contact" className="mx-auto max-w-6xl px-3 sm:px-4 pb-12">
                <div className="rounded-2xl border bg-white/70 backdrop-blur p-5 sm:p-6 shadow-sm md:p-10">
                    <h2 className="text-xl font-bold text-slate-900">Contact</h2>
                    <p className="mt-2 text-slate-700">For enquiries, please contact HQ administration.</p>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                        <div className="rounded-xl bg-white/85 backdrop-blur p-5 shadow-sm">
                            <div className="text-sm font-bold text-slate-900">Phone</div>
                            <div className="mt-2 text-slate-700">+91 XXXXX XXXXX</div>
                        </div>
                        <div className="rounded-xl bg-white/85 backdrop-blur p-5 shadow-sm">
                            <div className="text-sm font-bold text-slate-900">Email</div>
                            <div className="mt-2 text-slate-700">info@unisacademy.com</div>
                        </div>
                        <div className="rounded-xl bg-white/85 backdrop-blur p-5 shadow-sm">
                            <div className="text-sm font-bold text-slate-900">Address</div>
                            <div className="mt-2 text-slate-700">HQ Address line...</div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            onClick={() => navigate("/login")}
                            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-700"
                        >
                            Login to Portal
                        </button>
                        <a
                            href="#top"
                            className="rounded-lg border bg-white/60 backdrop-blur px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white/80"
                        >
                            Back to top
                        </a>
                    </div>
                </div>
            </section>

            <footer className="border-t bg-white/70 backdrop-blur">
                <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 text-sm text-slate-700">
                    © {new Date().getFullYear()} UNIS Academy. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
