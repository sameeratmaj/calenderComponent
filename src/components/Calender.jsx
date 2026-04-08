import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CalenderGrid from "./CalenderGrid";
import NotesSidebar from "./NotesSidebar";
import "../styles/Calender.css";

const MONTH_NAMES = [
  "January","February","March","April","May","June","July",
  "August","September","October","November","December",
];

const MONTH_QUOTES = [
  "New beginnings grow strongest when they are rooted in quiet discipline.",
  "Love becomes meaningful when it is practiced in patience and presence.",
  "Growth often starts the moment we choose courage over comfort.",
  "Let hope be the light you carry through uncertain days.",
  "A gentle heart and steady effort can change the course of a life.",
  "Joy is not found in rushing, but in fully living the moment you are in.",
  "Strength is built each time you continue, even when the path feels long.",
  "The life you want is shaped by the habits you protect every day.",
  "Peace arrives when you honor your pace instead of chasing another's.",
  "Change is not a loss when it leads you closer to who you actually are.",
  "Gratitude turns ordinary days into chapters worth remembering.",
  "Even the smallest light can guide you through the darkest season.",
];

const MONTH_FACTS = [
  "January is named after Janus, the Roman god of beginnings, gates, and transitions.",
  "February is the shortest month and the only one with fewer than 30 days.",
  "March was once the first month of the year in the ancient Roman calendar.",
  "April's name is often linked to the Latin word aperire, meaning to open, like spring blooms.",
  "May is named after Maia, a Roman goddess associated with growth and fertility.",
  "June is traditionally linked to Juno, the Roman goddess of marriage and family.",
  "July was renamed in honor of Julius Caesar after calendar reforms in ancient Rome.",
  "August was named after Emperor Augustus and was given 31 days to match July.",
  "September comes from septem, meaning seven, because it was once the seventh month.",
  "October comes from octo, meaning eight, reflecting its place in the old Roman calendar.",
  "November comes from novem, meaning nine, from the earlier ten-month Roman year.",
  "December comes from decem, meaning ten, even though it is now the twelfth month.",
];

const DEFAULT_ZOOM = 65;

const HERO_IMAGES = {
  spring:
    "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=1200&q=80",
  summer:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  monsoon:
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
  autumn:
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  winter:
    "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=1200&q=80",
};

const SEASON_THEMES = {
  spring: {
    name: "Spring",
    accent: "#5c8f62",
    soft: "rgba(92, 143, 98, 0.18)",
    tint: "from-emerald-100 via-lime-50 to-white",
    ribbon: "from-emerald-500 to-lime-400",
  },
  summer: {
    name: "Summer",
    accent: "#dd8c2d",
    soft: "rgba(221, 140, 45, 0.18)",
    tint: "from-amber-100 via-orange-50 to-white",
    ribbon: "from-amber-500 to-orange-400",
  },
  monsoon: {
    name: "Monsoon",
    accent: "#4a86b8",
    soft: "rgba(74, 134, 184, 0.18)",
    tint: "from-sky-100 via-cyan-50 to-white",
    ribbon: "from-sky-500 to-cyan-400",
  },
  autumn: {
    name: "Autumn",
    accent: "#9f5b38",
    soft: "rgba(159, 91, 56, 0.18)",
    tint: "from-orange-100 via-amber-50 to-white",
    ribbon: "from-orange-500 to-amber-500",
  },
  winter: {
    name: "Winter",
    accent: "#6f7ca8",
    soft: "rgba(111, 124, 168, 0.18)",
    tint: "from-slate-100 via-blue-50 to-white",
    ribbon: "from-slate-500 to-blue-400",
  },
};




function Calendar() {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [direction, setDirection] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [rangeNotes, setRangeNotes] = useState(() => readStorage("wall-calendar-range-notes"));
  const [monthMemos, setMonthMemos] = useState(() => readStorage("wall-calendar-month-memos"));
  const [draftMonthlyMemo, setDraftMonthlyMemo] = useState("");
  const [draftSpecificNote, setDraftSpecificNote] = useState("");

  const monthKey = useMemo(() => formatMonthKey(visibleMonth), [visibleMonth]);
  const seasonTheme = useMemo(() => getSeasonTheme(visibleMonth.getMonth()), [visibleMonth]);
  const heroImage = useMemo(() => HERO_IMAGES[seasonTheme.key], [seasonTheme.key]);
  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const monthQuote = useMemo(() => MONTH_QUOTES[visibleMonth.getMonth()], [visibleMonth]);
  const monthFact = useMemo(() => MONTH_FACTS[visibleMonth.getMonth()], [visibleMonth]);

  const normalizedRange = useMemo(() => {
    if (!startDate || !endDate) return null;
    return normalizeRange(startDate, endDate);
  }, [startDate, endDate]);

  const selectedRangeKey = useMemo(() => {
    if (!normalizedRange) return "";
    return buildRangeKey(normalizedRange.start, normalizedRange.end);
  }, [normalizedRange]);

  const selectedRangeLabel = normalizedRange
    ? `${formatShortDate(normalizedRange.start)} to ${formatShortDate(normalizedRange.end)}`
    : "";

  useEffect(() => {
    window.localStorage.setItem("wall-calendar-range-notes", JSON.stringify(rangeNotes));
  }, [rangeNotes]);

  useEffect(() => {
    window.localStorage.setItem("wall-calendar-month-memos", JSON.stringify(monthMemos));
  }, [monthMemos]);

  useEffect(() => {
    setDraftMonthlyMemo(monthMemos[monthKey] ?? "");
  }, [monthKey, monthMemos]);

  useEffect(() => {
    if (!selectedRangeKey) {
      setDraftSpecificNote("");
      return;
    }

    setDraftSpecificNote(rangeNotes[selectedRangeKey] ?? "");
  }, [rangeNotes, selectedRangeKey]);

  const handleDayClick = (date) => {
    if (!isSameMonth(date, visibleMonth)) return;

    if (startDate && !endDate && isSameDay(date, startDate)) {
      setStartDate(null);
      return;
    }

    if (startDate && endDate && isSameDay(startDate, endDate) && isSameDay(date, startDate)) {
      setStartDate(null);
      setEndDate(null);
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
      return;
    }

    if (isSameDay(date, startDate)) {
      setEndDate(date);
      return;
    }

    if (date < startDate) {
      setEndDate(startDate);
      setStartDate(date);
      return;
    }

    setEndDate(date);
  };

  const changeMonth = (step) => {
    setDirection(step);
    setVisibleMonth((current) => addMonths(current, step));
  };

  const handleMemoChange = (value) => {
    setDraftMonthlyMemo(value);
  };

  const handleSaveMonthlyMemo = () => {
    setMonthMemos((current) => ({
      ...current,
      [monthKey]: draftMonthlyMemo,
    }));
  };

  const handleSpecificNoteChange = (value) => {
    setDraftSpecificNote(value);
  };

  const handleSaveSpecificNote = () => {
    if (!selectedRangeKey) return;

    setRangeNotes((current) => ({
      ...current,
      [selectedRangeKey]: draftSpecificNote,
    }));
  };

  const handleWheelZoom = (event) => {
    if (!event.ctrlKey) return;

    event.preventDefault();

    setZoomLevel((current) => {
      const zoomDelta = -event.deltaY * 0.08;
      const next = current + zoomDelta;
      return Math.min(200, Math.max(DEFAULT_ZOOM, next));
    });
  };

  return (
    <section
      className="calendar-shell border-stone-200/80 bg-white/90 text-stone-800"
      onWheel={handleWheelZoom}
      style={{
        zoom: `${zoomLevel}%`,
      }}
    >
      <BindingRings />
      <div className="calendar-shell-topshade bg-gradient-to-b from-stone-200/90 via-stone-100/80 to-transparent" />

      <div className="calendar-shell-layout">
        <HeroImage
          image={heroImage}
          month={MONTH_NAMES[visibleMonth.getMonth()]}
          year={visibleMonth.getFullYear()}
          quote={monthQuote}
          fact={monthFact}
          seasonTheme={seasonTheme}
        />

        <div className={`calendar-panel bg-gradient-to-br ${seasonTheme.tint}`}>
          <div className="calendar-panel-inner border-white/80 bg-white/80">
            <CalendarHeader
              visibleMonth={visibleMonth}
              seasonTheme={seasonTheme}
              onPrevious={() => changeMonth(-1)}
              onNext={() => changeMonth(1)}
            />

            <div className="mt-6" style={{ perspective: "1800px" }}>
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={monthKey}
                  custom={direction}
                  initial={{
                    opacity: 0,
                    rotateY: direction > 0 ? -65 : 65,
                    x: direction > 0 ? 32 : -32,
                    transformOrigin: direction > 0 ? "left center" : "right center",
                  }}
                  animate={{
                    opacity: 1,
                    rotateY: 0,
                    x: 0,
                    transformOrigin: direction > 0 ? "left center" : "right center",
                  }}
                  exit={{
                    opacity: 0,
                    rotateY: direction > 0 ? 55 : -55,
                    x: direction > 0 ? -28 : 28,
                    transformOrigin: direction > 0 ? "right center" : "left center",
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="origin-center"
                >
                  <CalenderGrid
                    days={days}
                    visibleMonth={visibleMonth}
                    seasonTheme={seasonTheme}
                    startDate={startDate}
                    endDate={endDate}
                    onDayClick={handleDayClick}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <NotesSidebar
              monthLabel={`${MONTH_NAMES[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`}
              monthlyMemo={draftMonthlyMemo}
              specificNote={draftSpecificNote}
              seasonTheme={seasonTheme}
              selectedRangeLabel={selectedRangeLabel}
              hasSelectedRange={Boolean(normalizedRange)}
              onMonthlyMemoChange={handleMemoChange}
              onSaveMonthlyMemo={handleSaveMonthlyMemo}
              onSpecificNoteChange={handleSpecificNoteChange}
              onSaveSpecificNote={handleSaveSpecificNote}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function BindingRings() {
  return (
    <div className="calendar-binding">
      {Array.from({ length: 18 }).map((_, index) => (
        <div
          key={index}
          className="calendar-binding-ring border-stone-700/70"
        />
      ))}
    </div>
  );
}

function HeroImage({ image, month, year, quote, fact, seasonTheme }) {
  return (
    <div className="calendar-hero">
      <img
        src={image}
        alt={`${seasonTheme.name} landscape for ${month} ${year}`}
        className="calendar-hero-image"
      />
      <div className="calendar-hero-overlay bg-gradient-to-b from-black/10 via-black/20 to-black/45" />
      <div className={`calendar-hero-ribbon bg-gradient-to-r ${seasonTheme.ribbon} opacity-90`} />
      <div className="calendar-hero-content">
        <div className="calendar-hero-topbar">
          <div className="calendar-hero-badge border-white/40 bg-white/15 text-white/90">
            Curated print edition
          </div>
          <div className="calendar-hero-season-badge border-white/40 bg-black/15 text-white/90">
            {seasonTheme.name}
          </div>
        </div>

        <div className="calendar-hero-bottombar">
          <div className="calendar-hero-quote text-white/70">
            <p className="text-base tracking-[0.02em] sm:text-lg">{quote}</p>
          </div>

          <div className="calendar-hero-meta">
            <div className="calendar-hero-copy text-white">
              <div className="calendar-hero-month-block">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">{month}</h2>
                <p className="calendar-hero-description hidden text-sm leading-6 text-white/80 sm:block sm:text-base">
                  {fact}
                </p>
              </div>
            </div>

            <div className="calendar-hero-year text-right text-white">
              <div className="text-sm uppercase tracking-[0.4em] text-white/70">Edition</div>
              <div className="mt-2 text-4xl font-semibold sm:text-5xl">{year}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarHeader({ visibleMonth, seasonTheme, onPrevious, onNext }) {
  return (
    <div className="calendar-header">
      <div className="calendar-header-copy">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-500">Desk view</p>
        <h3 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
          {MONTH_NAMES[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
        </h3>
      </div>

      <div className="calendar-header-actions">
        <button
          type="button"
          onClick={onPrevious}
          className="calendar-header-button border-stone-200 bg-white text-stone-700 hover:-translate-y-0.5 hover:border-stone-300 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ "--tw-ring-color": seasonTheme.accent }}
          aria-label="Go to previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          className="calendar-header-button border-stone-200 bg-white text-stone-700 hover:-translate-y-0.5 hover:border-stone-300 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ "--tw-ring-color": seasonTheme.accent }}
          aria-label="Go to next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function buildCalendarDays(monthDate) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const startOffset = (start.getDay() + 6) % 7;
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - startOffset);

  const endOffset = 6 - ((end.getDay() + 6) % 7);
  const gridEnd = new Date(end);
  gridEnd.setDate(end.getDate() + endOffset);

  const days = [];
  for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor.setDate(cursor.getDate() + 1)) {
    days.push(new Date(cursor));
  }

  return days;
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function isSameMonth(first, second) {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
}

function normalizeRange(first, second) {
  return first <= second ? { start: first, end: second } : { start: second, end: first };
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildRangeKey(start, end) {
  return `${toISODate(start)}_${toISODate(end)}`;
}

function toISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function formatShortDate(date) {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}`;
}

function readStorage(key) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : {};
  } catch {
    return {};
  }
}

function getSeasonTheme(monthIndex) {
  if (monthIndex >= 1 && monthIndex <= 3) {
    return { key: "spring", ...SEASON_THEMES.spring };
  }
  if (monthIndex >= 4 && monthIndex <= 5) {
    return { key: "summer", ...SEASON_THEMES.summer };
  }
  if (monthIndex >= 6 && monthIndex <= 8) {
    return { key: "monsoon", ...SEASON_THEMES.monsoon };
  }
  if (monthIndex >= 9 && monthIndex <= 10) {
    return { key: "autumn", ...SEASON_THEMES.autumn };
  }
  return { key: "winter", ...SEASON_THEMES.winter };
}

export default Calendar;
