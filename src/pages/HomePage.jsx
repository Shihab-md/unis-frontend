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

const Spinner = () => (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
        Loading...
    </div>
);

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
                    <div className="text-xs font-bold uppercase tracking-wide text-white/90">{title}</div>
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

const TypeTotalCard = ({ title, value }) => (
    <div className="rounded-xl border bg-white/85 backdrop-blur p-5 shadow-sm">
        <div className="text-sm text-slate-600">{title}</div>
        <div className="mt-2 text-2xl font-extrabold text-slate-900">{value ?? 0}</div>
    </div>
);

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
                        <div className="text-sm font-bold text-slate-900">Pie: Course distribution</div>
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
                        <div className="text-sm font-bold text-slate-900">Bar: Students per course</div>
                        <div className="mt-2 h-60 sm:h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={courses} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
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
                                <td className="p-2 sm:p-3 font-semibold text-slate-800">{c.courseName}</td>
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
                        <p className="mt-1 text-sm text-slate-700">A glimpse of our activities and campus.</p>
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
                                    className={`h-2.5 w-2.5 rounded-full ${i === idx ? "bg-teal-600" : "bg-slate-300 hover:bg-slate-400"
                                        }`}
                                    aria-label={`Go to photo ${i + 1}`}
                                />
                            ))}
                        </div>

                        <div className="mt-4 text-xs text-slate-700">Tip: Swipe on main photo (mobile) or use arrows.</div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <FullscreenGallery images={images} startIndex={idx} onClose={() => setIsOpen(false)} onIndexChange={setIdx} />
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
                            className={`h-2.5 w-2.5 rounded-full ${i === idx ? "bg-white" : "bg-white/40 hover:bg-white/70"}`}
                            aria-label={`Go to photo ${i + 1}`}
                        />
                    ))}
                </div>
                <div className="mt-2 text-center text-xs text-white/70">Swipe • Arrow keys • ESC to close</div>
            </div>
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

    // ✅ Update with your real images
    const galleryImages = useMemo(
        () => ["/gallery/1.jpg", "/gallery/2.jpg", "/gallery/3.jpg", "/gallery/4.jpg", "/gallery/5.jpg", "/gallery/6.jpg", "/gallery/7.jpg"],
        []
    );

    useEffect(() => {
        let alive = true;

        const load = async () => {
            try {
                const base = await getBaseUrl();
                const res = await axios.get(`${base}public/stats`);
                if (!alive) return;

                if (!res.data?.success) {
                    showSwalAlert("Error", res.data?.error || "Unable to load stats", "error");
                    setLoading(false);
                    return;
                }

                setStats(res.data.stats);
            } catch (e) {
                if (!alive) return;
                showSwalAlert("Error", "Unable to load stats", "error");
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
        const unknown = (list || []).map((x) => x.type).filter((t) => t && !known.has(t));
        return ["ALL", ...EDUCATION_TYPE_ORDER, ...unknown];
    }, [stats.courseWiseByType]);

    return (
        <div className="min-h-screen bg-[url(/bg-img.jpg)] bg-fixed bg-cover bg-center bg-repeat">
            {/* Top Bar */}
            <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-3">
                        <img src="/Logo - UNIS.PNG" alt="UNIS" className="h-10 w-10 rounded-md border" />
                        <div>
                            <div className="text-lg font-bold text-blue-700">UNIS ACADEMY</div>
                            <div className="text-xs text-green-600">إيمان : تقوى : حياء : أخلاق : دعاء : دعوة</div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/login")}
                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-700"
                    >
                        Login
                    </button>
                </div>
            </header>

            {/* Hero */}
            <section className="mx-auto max-w-6xl px-3 sm:px-4 py-8 sm:py-10">
                <div className="grid grid-cols-1 gap-6 rounded-2xl border bg-white/70 backdrop-blur p-5 sm:p-6 shadow-sm md:grid-cols-2 md:p-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
                            Empowering students through knowledge & values
                        </h1>
                        <p className="mt-4 text-slate-700">
                            UNIS Academy supports education with structured learning programs, strong community support,
                            and responsible administration.
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
                                Provide accessible, quality education with strong discipline, moral values, and academic excellence.
                            </p>
                            <div className="mt-4 text-sm font-bold text-slate-900">Vision</div>
                            <p className="mt-2 text-slate-700">
                                Build a community of confident learners who contribute positively to society and live with purpose.
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
                        icon="🏫"
                    />
                    <StatCard
                        title="Active Schools"
                        value={stats.schoolsCount}
                        loading={loading}
                        colorClass="bg-gradient-to-br from-emerald-600 to-teal-500"
                        icon="🏫"
                    />
                    <StatCard
                        title="Active Students"
                        value={stats.studentsCount}
                        loading={loading}
                        colorClass="bg-gradient-to-br from-amber-500 to-red-400"
                        icon="🏫"
                    />
                </div>

                {/* Type totals + toggles + charts */}
                <div className="mt-6 rounded-xl border bg-white/70 backdrop-blur p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Education Type • Course-wise Active Students</h3>

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
                        <>
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {sortedTypes.map((g) => (
                                    <TypeTotalCard key={g.type} title={g.type} value={g.total ?? 0} />
                                ))}
                            </div>

                            <div className="mt-6 space-y-5">
                                {sortedTypes.map((g) => (
                                    <TypeCharts key={g.type} group={g} showCharts={showCharts} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
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
