# Wall Calendar Template

A reusable React wall calendar component with:

- paper-style calendar layout
- seasonal hero image treatment
- click range selection
- desktop right-click drag range selection
- touch long-press drag range selection
- month/year jump dropdowns
- monthly memos and range-based notes
- `localStorage` persistence

## Project Structure

```text
src/
  components/
    Calendar.jsx
    CalendarGrid.jsx
    NotesSidebar.jsx
  lib/
    calendarConstants.js
    calendarUtils.js
  styles/
    Calendar.css
    CalendarGrid.css
    NotesSidebar.css
  index.js
  App.jsx
  App.css
```

## Reusable Entry

Use the exported component from [src/index.js](./src/index.js):

```jsx
import { Calendar } from "./src";

export default function Example() {
  return <Calendar />;
}
```

## Demo Shell

[src/App.jsx](./src/App.jsx) is only a demo wrapper for page positioning and background styling.
The reusable calendar logic lives in:

- [src/components/Calendar.jsx](./src/components/Calendar.jsx)
- [src/components/CalendarGrid.jsx](./src/components/CalendarGrid.jsx)
- [src/components/NotesSidebar.jsx](./src/components/NotesSidebar.jsx)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Next Step For Publishing

If you want to distribute this globally as a package, the next step would be:

1. Move the demo app into an `example/` folder or separate app.
2. Add prop-driven configuration for images, quotes, facts, storage, and timings.
3. Add a library build entry in Vite for package output.
4. Publish the component under a package name of your choice.
