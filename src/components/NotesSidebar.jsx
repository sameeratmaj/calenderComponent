import { PencilLine, Pin } from "lucide-react";
import "../styles/NotesSidebar.css";

function NotesSidebar({
  monthLabel,
  monthlyMemo,
  specificNote,
  seasonTheme,
  selectedRangeLabel,
  hasSelectedRange,
  onMonthlyMemoChange,
  onSaveMonthlyMemo,
  onSpecificNoteChange,
  onSaveSpecificNote,
}) {
  return (
    <div className="notes-sidebar-layout">
      <section className="notes-sidebar-card border-stone-200/80">
        <div className="notes-sidebar-header">
          <div
            className="notes-sidebar-icon"
            style={{ backgroundColor: seasonTheme.soft, color: seasonTheme.accent }}
          >
            <PencilLine className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-stone-900">Monthly Memos</h4>
            <p className="text-sm text-stone-500">{monthLabel}</p>
          </div>
        </div>

        <div className="notes-sidebar-textarea-shell border-stone-300">
          <textarea
            value={monthlyMemo}
            onChange={(event) => onMonthlyMemoChange(event.target.value)}
            placeholder="Capture month-level reminders, deadlines, or visual ideas..."
            className="notes-sidebar-textarea text-stone-700 placeholder:text-stone-400"
          />
        </div>
        <button
          type="button"
          onClick={onSaveMonthlyMemo}
          className="notes-sidebar-save-button text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: seasonTheme.accent,
            "--tw-ring-color": seasonTheme.accent,
          }}
        >
          Save Memo
        </button>
      </section>

      <section className="notes-sidebar-card border-stone-200/80">
        <div className="notes-sidebar-header">
          <div
            className="notes-sidebar-icon"
            style={{ backgroundColor: seasonTheme.soft, color: seasonTheme.accent }}
          >
            <Pin className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-stone-900">Specific Note</h4>
            <p className="text-sm text-stone-500">
              {hasSelectedRange ? selectedRangeLabel : "Select a date range to unlock note storage"}
            </p>
          </div>
        </div>

        {hasSelectedRange ? (
          <div className="notes-sidebar-note-stack">
            <textarea
              value={specificNote}
              onChange={(event) => onSpecificNoteChange(event.target.value)}
              placeholder="Write a note tied to this selected range..."
              className="notes-sidebar-specific-textarea border-stone-200 bg-stone-50 text-stone-700 placeholder:text-stone-400 focus:border-transparent focus:ring-2"
              style={{ "--tw-ring-color": seasonTheme.accent }}
            />
            <button
              type="button"
              onClick={onSaveSpecificNote}
              className="notes-sidebar-save-button text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: seasonTheme.accent,
                "--tw-ring-color": seasonTheme.accent,
              }}
            >
              Save Note
            </button>
          </div>
        ) : (
          <div
            className="notes-sidebar-empty-state border-stone-300"
            style={{ backgroundColor: seasonTheme.soft }}
          >
            <div
              className="notes-sidebar-empty-icon bg-white"
              style={{ color: seasonTheme.accent }}
            >
              <Pin className="h-5 w-5" />
            </div>
            <h5 className="text-lg font-semibold text-stone-900">Select a range to add notes</h5>
            <p className="mt-2 max-w-sm text-sm leading-6 text-stone-600">
              Tap a start day and then an end day. The calendar will highlight the span and store
              your note.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default NotesSidebar;
