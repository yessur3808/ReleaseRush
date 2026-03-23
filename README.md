# ReleaseRush

A countdown hub for games: track upcoming releases and recurring daily resets in one place. Quickly search, filter, and open a dedicated countdown page for any title.

---

## Highlights

- **All games list** with fast search
- **Filters & sorting** to find what you want quickly
- **Countdown pages** for each game
- Supports:
  - **Release dates**
  - **Daily resets**
  - **TBA** entries
- **Modern, responsive UI** that looks great on desktop and mobile

---

## Screenshots

Add screenshots to `assets/` and reference them here:

![All games](assets/screenshot-all-games.png)

---

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

`npm run dev` generates `public/env.json` from `.env.local`.

- Set `GAMES_API_URL` to a valid `http://` or `https://` backend URL to use live data.
- Leave `GAMES_API_URL` empty to use bundled static `games.json` fallback data.

Build for production:

```bash
npm run build
```

## Troubleshooting

If you see `Unexpected token '<', "<!doctype "... is not valid JSON`:

1. Open your browser Network tab and inspect the failing request.
2. If the response starts with HTML, your API URL is likely invalid or unresolved.
3. Verify `.env.local` exists and `GAMES_API_URL` is either a valid URL or empty.
4. Restart `npm run dev` so `public/env.json` is regenerated.

## How to use

Open All games
Use the search bar to find a game by name (and tags, if enabled)
Open Filters to narrow results (release date / daily reset / TBA, etc.)
Click View countdown to see the dedicated countdown page

## Roadmap

- [ ] Favorites / pinned countdowns
- [ ] Shareable links (URL‑synced search + filters)
- [ ] Quick links section
- [ ] Polish + animations

<!-- License
MIT (or your preferred license)

Contact
GitHub: [your profile] -->
