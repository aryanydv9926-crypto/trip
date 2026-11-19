# StoryVerse – Your Personal Story Writing Studio

A complete, modern, browser-based story writing and screenplay management application.

## Features

### 1. Dashboard
- Welcome overview with total words, projects, characters, and ideas
- Recent projects with cover-style cards
- Recently edited documents
- Quick-access ideas snapshot
- One-click actions to create projects, open the editor, capture ideas, or add characters

### 2. Writing Editor (Writing Desk)
- Distraction-free contenteditable writing area
- Rich formatting: bold, italic, underline, alignment, font sizes
- Undo / Redo
- Live word & character count
- Auto-save (after ~1.8s of inactivity)
- Manual save (Ctrl/Cmd + S)
- Document title
- Multiple documents per project
- Full-screen writing mode
- Export as TXT, PDF (via print dialog), or DOC (Word-compatible)

### 3. Project Management
- Create Movies, Web Series, or Standalone Stories
- Title, genre, logline, status
- Filter by type
- Beautiful project cards with status pills

### 4. Episodes
- Unlimited episodes linked to projects
- Episode number, title, description, status
- Filter by project

### 5. Character Studio
- Full character profiles: name, age, role, personality, background, strengths, weaknesses, goals, fears, arc, appearance
- Card grid + detailed side drawer
- Edit / Delete

### 6. Dialogue Studio
- Character selection
- Emotional tone
- Scene context
- Dialogue text + notes
- Clean screenplay-style presentation

### 7. Scene Manager
- Scene title, location, INT/EXT, time of day, tone
- Description & purpose
- Ordered list view

### 8. Ideas Vault
- Quick capture of plot, character, dialogue, scene, twist, ending ideas
- Tags and favourites
- Filter chips
- Convert any idea into a new project with one click

### 9. Notes & Research
- Categories: Research, World-building, Location, Reference, Personal, Unused
- Simple notebook-style list

### 10. Design
- Premium minimalist aesthetic (warm ink tones + terracotta accent)
- Inter + Playfair Display typography
- Dark / Light mode toggle
- Responsive desktop-first layout with sidebar navigation
- Smooth modals, cards, and micro-interactions

## How to Run

1. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
2. No build step, no server, no installation required.
3. All data is stored in the browser’s `localStorage` under the key `storyverse_data_v1`.

## First Visit

On first load the app seeds two sample projects, characters, documents, ideas, episodes, a scene, a dialogue, and a research note so you can explore immediately.

## Keyboard Shortcuts

- **Ctrl / Cmd + S** – Save current document (while in Writing Desk)

## Tech Stack

- Pure HTML + CSS + Vanilla JavaScript
- Tailwind CSS (CDN)
- Font Awesome icons
- Google Fonts (Inter, Playfair Display, JetBrains Mono)
- localStorage for persistence

## Project Structure

```
storyverse/
├── index.html          # Main application shell
├── css/
│   └── styles.css      # Custom styles, dark mode, components
├── js/
│   └── app.js          # Full application logic & state management
└── README.md
```

Enjoy writing.
