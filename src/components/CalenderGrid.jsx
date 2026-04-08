import "../styles/CalenderGrid.css";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function CalenderGrid({ days, visibleMonth, seasonTheme, startDate, endDate, onDayClick }) {
  const normalizedRange = startDate && endDate ? normalizeRange(startDate, endDate) : null;

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
          const isTodayValue = isToday(date);
          const inRange = normalizedRange
            ? isWithinRange(date, normalizedRange.start, normalizedRange.end)
            : false;
          const middleRange = inRange && !isStart && !isEnd;

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onDayClick(date)}
              disabled={!inMonth}
              aria-pressed={inRange}
              aria-label={`${formatLongDate(date)}${inRange ? ", selected" : ""}`}
              className={[
                "calendar-grid-day focus:ring-2 focus:ring-offset-2",
                inMonth
                  ? "text-stone-800 calendar-grid-day-current"
                  : "text-stone-300 opacity-55",
                middleRange ? "rounded-none" : "",
              ].join(" ")}
              style={{
                backgroundColor: middleRange
                  ? seasonTheme.soft
                  : isStart || isEnd
                    ? seasonTheme.accent
                    : "transparent",
                color: isStart || isEnd ? "#ffffff" : undefined,
                borderTopLeftRadius: isStart && !isEnd ? "1rem" : undefined,
                borderBottomLeftRadius: isStart && !isEnd ? "1rem" : undefined,
                borderTopRightRadius: isEnd && !isStart ? "1rem" : undefined,
                borderBottomRightRadius: isEnd && !isStart ? "1rem" : undefined,
                "--tw-ring-color": seasonTheme.accent,
              }}
            >
              {middleRange && (
                <span
                  className="absolute inset-y-1 -left-1 -right-1 rounded-md"
                  style={{ backgroundColor: seasonTheme.soft }}
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

function normalizeRange(first, second) {
  return first <= second ? { start: first, end: second } : { start: second, end: first };
}

function isWithinRange(date, start, end) {
  return stripTime(date) >= stripTime(start) && stripTime(date) <= stripTime(end);
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
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

function isToday(date) {
  const today = new Date();
  return isSameDay(date, today);
}

function formatLongDate(date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default CalenderGrid;
