import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CalendarGrid from "./CalendarGrid";
import NotesSidebar from "./NotesSidebar";
import {
  AUTO_PAGE_DELAY,
  DEFAULT_ZOOM,
  HERO_IMAGES,
  LONG_PRESS_DURATION,
  MONTH_FACTS,
  MONTH_NAMES,
  MONTH_QUOTES,
} from "../lib/calendarConstants";
import {
  addMonths,
  buildCalendarDays,
  buildRangeKey,
  formatMonthKey,
  formatShortDate,
  getSeasonTheme,
  isSameDay,
  isSameMonth,
  normalizeRange,
  parseISODateKey,
  readStorage,
} from "../lib/calendarUtils";
import "../styles/Calendar.css";

function Calendar() {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchHoldActive, setIsTouchHoldActive] = useState(false);
  const [tempRange, setTempRange] = useState(null);
  const [direction, setDirection] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
  const [rangeNotes, setRangeNotes] = useState(() => readStorage("wall-calendar-range-notes"));
  const [monthMemos, setMonthMemos] = useState(() => readStorage("wall-calendar-month-memos"));
  const [draftMonthlyMemo, setDraftMonthlyMemo] = useState("");
  const [draftSpecificNote, setDraftSpecificNote] = useState("");
  const dragStartRef = useRef(null);
  const dragCurrentRef = useRef(null);
  const autoPageTimerRef = useRef(null);
  const touchHoldTimerRef = useRef(null);
  const touchOriginRef = useRef(null);
  const suppressClickRef = useRef(false);

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

  const previewRange = tempRange ?? normalizedRange;

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

  const handleDayClick = useCallback((date) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

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
  }, [endDate, startDate, visibleMonth]);

  const changeMonth = useCallback((step) => {
    setDirection(step);
    setVisibleMonth((current) => addMonths(current, step));
  }, []);

  const stopAutoPagination = useCallback(() => {
    if (autoPageTimerRef.current) {
      window.clearTimeout(autoPageTimerRef.current);
      autoPageTimerRef.current = null;
    }
  }, []);

  const stopTouchHoldTimer = useCallback(() => {
    if (touchHoldTimerRef.current) {
      window.clearTimeout(touchHoldTimerRef.current);
      touchHoldTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    if (isDragging || isTouchHoldActive) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isDragging, isTouchHoldActive]);

  const finalizeDragSelection = useCallback(() => {
    stopAutoPagination();
    stopTouchHoldTimer();

    if (!dragStartRef.current) {
      setIsDragging(false);
      setIsTouchHoldActive(false);
      setTempRange(null);
      touchOriginRef.current = null;
      return;
    }

    const end = dragCurrentRef.current ?? dragStartRef.current;
    const finalRange = normalizeRange(dragStartRef.current, end);

    setStartDate(finalRange.start);
    setEndDate(finalRange.end);
    setIsDragging(false);
    setIsTouchHoldActive(false);
    setTempRange(null);
    dragStartRef.current = null;
    dragCurrentRef.current = null;
    touchOriginRef.current = null;
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }, [stopAutoPagination, stopTouchHoldTimer]);

  useEffect(() => {
    const handleMouseUp = (event) => {
      if (event.button !== 2 || !isDragging) return;
      finalizeDragSelection();
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [finalizeDragSelection, isDragging]);

  useEffect(() => {
    return () => {
      stopAutoPagination();
      stopTouchHoldTimer();
    };
  }, [stopAutoPagination, stopTouchHoldTimer]);

  const handleSaveMonthlyMemo = () => {
    setMonthMemos((current) => ({
      ...current,
      [monthKey]: draftMonthlyMemo,
    }));
  };

  const handleSaveSpecificNote = () => {
    if (!selectedRangeKey) return;

    setRangeNotes((current) => ({
      ...current,
      [selectedRangeKey]: draftSpecificNote,
    }));
  };

  const handleWheelZoom = useCallback((event) => {
    if (!event.ctrlKey) return;

    event.preventDefault();

    setZoomLevel((current) => {
      const zoomDelta = -event.deltaY * 0.08;
      const next = current + zoomDelta;
      return Math.min(200, Math.max(DEFAULT_ZOOM, next));
    });
  }, []);

  const handleMonthSelect = useCallback((monthIndex) => {
    setDirection(monthIndex >= visibleMonth.getMonth() ? 1 : -1);
    setVisibleMonth((current) => new Date(current.getFullYear(), monthIndex, 1));
  }, [visibleMonth]);

  const handleYearSelect = useCallback((year) => {
    setDirection(year >= visibleMonth.getFullYear() ? 1 : -1);
    setVisibleMonth((current) => new Date(year, current.getMonth(), 1));
  }, [visibleMonth]);

  const handleRightDragStart = useCallback((event, date) => {
    if (event.button !== 2 || !isSameMonth(date, visibleMonth)) return;

    event.preventDefault();
    stopAutoPagination();
    dragStartRef.current = date;
    dragCurrentRef.current = date;
    setIsDragging(true);
    setTempRange(normalizeRange(date, date));
  }, [stopAutoPagination, visibleMonth]);

  const handleRightDragEnter = useCallback((date) => {
    if (!isDragging || !dragStartRef.current || !isSameMonth(date, visibleMonth)) return;

    dragCurrentRef.current = date;
    setTempRange(normalizeRange(dragStartRef.current, date));
  }, [isDragging, visibleMonth]);

  const handleNavigationDragHover = useCallback((step) => {
    if (!isDragging || autoPageTimerRef.current) return;

    autoPageTimerRef.current = window.setTimeout(() => {
      autoPageTimerRef.current = null;
      changeMonth(step);
    }, AUTO_PAGE_DELAY);
  }, [changeMonth, isDragging]);

  const handleNavigationDragLeave = useCallback(() => {
    stopAutoPagination();
  }, [stopAutoPagination]);

  const updateDragTargetFromPoint = useCallback((clientX, clientY) => {
    const hoveredElement = document.elementFromPoint(clientX, clientY);
    if (!hoveredElement) {
      stopAutoPagination();
      return;
    }

    const navigationTarget = hoveredElement.closest("[data-calendar-nav-step]");
    if (navigationTarget) {
      handleNavigationDragHover(Number(navigationTarget.dataset.calendarNavStep));
      return;
    }

    stopAutoPagination();

    const dateTarget = hoveredElement.closest("[data-calendar-date]");
    if (!dateTarget || !dragStartRef.current) return;

    const hoveredDate = parseISODateKey(dateTarget.dataset.calendarDate);
    if (!hoveredDate || !isSameMonth(hoveredDate, visibleMonth)) return;

    dragCurrentRef.current = hoveredDate;
    setTempRange(normalizeRange(dragStartRef.current, hoveredDate));
  }, [handleNavigationDragHover, stopAutoPagination, visibleMonth]);

  const handleDayTouchStart = useCallback((event, date) => {
    if (!isSameMonth(date, visibleMonth) || event.touches.length !== 1) return;

    const touch = event.touches[0];
    stopTouchHoldTimer();
    setIsTouchHoldActive(true);
    touchOriginRef.current = { x: touch.clientX, y: touch.clientY };

    touchHoldTimerRef.current = window.setTimeout(() => {
      dragStartRef.current = date;
      dragCurrentRef.current = date;
      setIsDragging(true);
      setTempRange(normalizeRange(date, date));
      touchHoldTimerRef.current = null;
      suppressClickRef.current = true;
    }, LONG_PRESS_DURATION);
  }, [stopTouchHoldTimer, visibleMonth]);

  const handleTouchMove = useCallback((event) => {
    const touch = event.touches[0];
    if (!touch) return;

    if (!isDragging && touchHoldTimerRef.current && touchOriginRef.current) {
      event.preventDefault();
      const deltaX = touch.clientX - touchOriginRef.current.x;
      const deltaY = touch.clientY - touchOriginRef.current.y;

      if (Math.hypot(deltaX, deltaY) > 10) {
        stopTouchHoldTimer();
        setIsTouchHoldActive(false);
        touchOriginRef.current = null;
      }
      return;
    }

    if (!isDragging || !dragStartRef.current) return;

    event.preventDefault();
    updateDragTargetFromPoint(touch.clientX, touch.clientY);
  }, [isDragging, stopTouchHoldTimer, updateDragTargetFromPoint]);

  const handleTouchEnd = useCallback(() => {
    stopTouchHoldTimer();
    setIsTouchHoldActive(false);

    if (isDragging) {
      finalizeDragSelection();
      return;
    }

    touchOriginRef.current = null;
  }, [finalizeDragSelection, isDragging, stopTouchHoldTimer]);

  const handleTouchCancel = useCallback(() => {
    stopTouchHoldTimer();
    stopAutoPagination();
    setIsDragging(false);
    setIsTouchHoldActive(false);
    setTempRange(null);
    dragStartRef.current = null;
    dragCurrentRef.current = null;
    touchOriginRef.current = null;
  }, [stopAutoPagination, stopTouchHoldTimer]);

  return (
    <section
      className="calendar-shell border-stone-200/80 bg-white/90 text-stone-800"
      onWheel={handleWheelZoom}
      onContextMenu={(event) => {
        if (isDragging) {
          event.preventDefault();
        }
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{
        zoom: `${zoomLevel}%`,
        touchAction: isDragging || isTouchHoldActive ? "none" : "manipulation",
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
              isDragging={isDragging}
              onNavigationDragHover={handleNavigationDragHover}
              onNavigationDragLeave={handleNavigationDragLeave}
              onMonthSelect={handleMonthSelect}
              onYearSelect={handleYearSelect}
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
                  <CalendarGrid
                    days={days}
                    visibleMonth={visibleMonth}
                    seasonTheme={seasonTheme}
                    startDate={startDate}
                    endDate={endDate}
                    previewRange={previewRange}
                    onDayClick={handleDayClick}
                    onDayMouseDown={handleRightDragStart}
                    onDayMouseEnter={handleRightDragEnter}
                    onDayTouchStart={handleDayTouchStart}
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
              onMonthlyMemoChange={setDraftMonthlyMemo}
              onSaveMonthlyMemo={handleSaveMonthlyMemo}
              onSpecificNoteChange={setDraftSpecificNote}
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
        <div key={index} className="calendar-binding-ring border-stone-700/70" />
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

function CalendarHeader({
  visibleMonth,
  seasonTheme,
  isDragging,
  onNavigationDragHover,
  onNavigationDragLeave,
  onMonthSelect,
  onYearSelect,
  onPrevious,
  onNext,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const headerRef = useRef(null);

  const yearOptions = useMemo(() => {
    const centerYear = visibleMonth.getFullYear();
    return Array.from({ length: 21 }, (_, index) => centerYear - 10 + index);
  }, [visibleMonth]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="calendar-header" ref={headerRef}>
      <div className="calendar-header-copy">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-500">Desk view</p>
        <div className="calendar-header-title-row text-2xl font-semibold text-stone-900 sm:text-3xl">
          <div className="calendar-header-dropdown">
            <button
              type="button"
              className="calendar-header-trigger"
              onClick={() => setOpenMenu((current) => (current === "month" ? null : "month"))}
              aria-haspopup="listbox"
              aria-expanded={openMenu === "month"}
            >
              {MONTH_NAMES[visibleMonth.getMonth()]}
            </button>

            {openMenu === "month" && (
              <div className="calendar-header-menu border-stone-200 bg-white/95 shadow-xl shadow-stone-950/10">
                {MONTH_NAMES.map((monthName, index) => (
                  <button
                    key={monthName}
                    type="button"
                    className={`calendar-header-menu-item ${index === visibleMonth.getMonth() ? "is-active" : ""}`}
                    onClick={() => {
                      onMonthSelect(index);
                      setOpenMenu(null);
                    }}
                  >
                    {monthName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="calendar-header-dropdown">
            <button
              type="button"
              className="calendar-header-trigger"
              onClick={() => setOpenMenu((current) => (current === "year" ? null : "year"))}
              aria-haspopup="listbox"
              aria-expanded={openMenu === "year"}
            >
              {visibleMonth.getFullYear()}
            </button>

            {openMenu === "year" && (
              <div className="calendar-header-menu calendar-header-year-menu border-stone-200 bg-white/95 shadow-xl shadow-stone-950/10">
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={`calendar-header-menu-item ${year === visibleMonth.getFullYear() ? "is-active" : ""}`}
                    onClick={() => {
                      onYearSelect(year);
                      setOpenMenu(null);
                    }}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="calendar-header-actions">
        <button
          type="button"
          onClick={onPrevious}
          onMouseEnter={() => onNavigationDragHover(-1)}
          onMouseLeave={onNavigationDragLeave}
          onContextMenu={(event) => event.preventDefault()}
          data-calendar-nav-step="-1"
          className="calendar-header-button border-stone-200 bg-white text-stone-700 hover:-translate-y-0.5 hover:border-stone-300 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ "--tw-ring-color": seasonTheme.accent }}
          aria-label="Go to previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          onMouseEnter={() => onNavigationDragHover(1)}
          onMouseLeave={onNavigationDragLeave}
          onContextMenu={(event) => event.preventDefault()}
          data-calendar-nav-step="1"
          className="calendar-header-button border-stone-200 bg-white text-stone-700 hover:-translate-y-0.5 hover:border-stone-300 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ "--tw-ring-color": seasonTheme.accent }}
          aria-label="Go to next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {isDragging && (
        <p className="calendar-header-drag-hint text-xs text-stone-500">
          Right-drag, or long-press for 2 seconds on touch, then hover the arrows briefly to continue into another month.
        </p>
      )}
    </div>
  );
}

export default Calendar;
