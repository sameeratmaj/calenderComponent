import { memo } from "react";
import {
  formatLongDate,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinRange,
  normalizeRange,
  toISODate,
} from "../lib/calendarUtils";
import "../styles/CalendarGrid.css";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarGrid({
  days,
  visibleMonth,
  seasonTheme,
  startDate,
  endDate,
  previewRange,
  onDayClick,
  onDayMouseDown,
  onDayMouseEnter,
  onDayTouchStart,
}) {
  const finalizedRange = startDate && endDate ? normalizeRange(startDate, endDate) : null;
  const activeRange = previewRange ?? finalizedRange;

  return (
    <div className="calendar-grid-shell border-stone-200/80">
      <div className="calendar-grid-weekdays">
        {DAY_NAMES.map((day) => (
          <div key={day} className="calendar-grid-weekday text-stone-400">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid-days">
        {days.map((date) => {
          const inMonth = isSameMonth(date, visibleMonth);
          const isStart = startDate ? isSameDay(date, startDate) : false;
          const isEnd = endDate ? isSameDay(date, endDate) : false;
          const isPreviewStart = activeRange ? isSameDay(date, activeRange.start) : false;
          const isPreviewEnd = activeRange ? isSameDay(date, activeRange.end) : false;
          const isTodayValue = isToday(date);
          const inRange = finalizedRange
            ? isWithinRange(date, finalizedRange.start, finalizedRange.end)
            : false;
          const inPreviewRange = activeRange
            ? isWithinRange(date, activeRange.start, activeRange.end)
            : false;
          const middleRange = inRange && !isStart && !isEnd;
          const previewMiddleRange =
            inPreviewRange && !isPreviewStart && !isPreviewEnd && !middleRange;
          const isPreviewEdge = (isPreviewStart || isPreviewEnd) && !isStart && !isEnd;

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onDayClick(date)}
              onMouseDown={(event) => onDayMouseDown(event, date)}
              onMouseEnter={() => onDayMouseEnter(date)}
              onTouchStart={(event) => onDayTouchStart(event, date)}
              onContextMenu={(event) => event.preventDefault()}
              data-calendar-date={toISODate(date)}
              disabled={!inMonth}
              aria-pressed={inRange || inPreviewRange}
              aria-label={`${formatLongDate(date)}${
                inPreviewRange ? ", selection preview" : inRange ? ", selected" : ""
              }`}
              className={[
                "calendar-grid-day focus:ring-2 focus:ring-offset-2",
                inMonth ? "text-stone-800 calendar-grid-day-current" : "text-stone-300 opacity-55",
                middleRange || previewMiddleRange ? "rounded-none" : "",
                previewMiddleRange ? "calendar-grid-day-preview" : "",
              ].join(" ")}
              style={{
                backgroundColor: middleRange
                  ? seasonTheme.soft
                  : previewMiddleRange
                    ? seasonTheme.soft
                    : isStart || isEnd
                      ? seasonTheme.accent
                      : isPreviewEdge
                        ? seasonTheme.soft
                        : "transparent",
                color: isStart || isEnd ? "#ffffff" : undefined,
                borderTopLeftRadius:
                  (isStart && !isEnd) || (isPreviewStart && !isPreviewEnd && !isStart)
                    ? "1rem"
                    : undefined,
                borderBottomLeftRadius:
                  (isStart && !isEnd) || (isPreviewStart && !isPreviewEnd && !isStart)
                    ? "1rem"
                    : undefined,
                borderTopRightRadius:
                  (isEnd && !isStart) || (isPreviewEnd && !isPreviewStart && !isEnd)
                    ? "1rem"
                    : undefined,
                borderBottomRightRadius:
                  (isEnd && !isStart) || (isPreviewEnd && !isPreviewStart && !isEnd)
                    ? "1rem"
                    : undefined,
                "--tw-ring-color": seasonTheme.accent,
              }}
            >
              {(middleRange || previewMiddleRange) && (
                <span
                  className="absolute inset-y-1 -left-1 -right-1 rounded-md"
                  style={{
                    backgroundColor: seasonTheme.soft,
                    opacity: previewMiddleRange ? 0.75 : 1,
                  }}
                />
              )}

              <span className="relative z-10 block">{date.getDate()}</span>

              {isTodayValue && (
                <span
                  className="relative z-10 mx-auto mt-1 block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: isStart || isEnd ? "#ffffff" : seasonTheme.accent }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(CalendarGrid);
