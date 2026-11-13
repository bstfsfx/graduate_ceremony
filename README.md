# Master’s Graduation Memories

A responsive graduation-memory microsite built with native HTML, CSS, and JavaScript.

## Run locally

From this directory, run `python3 -m http.server 3000`, then open `http://localhost:3000`.

## Customize

- Update the target in the `data-target` attribute on `#countdown` in `index.html` to change the countdown date and time. It is currently set to June 12, 2027 at 09:00 (UTC+08:00), the next future milestone relative to the reference class year.
- Guestbook entries are validated and stored in this browser's `localStorage` (up to 80 entries); they are not shared or synchronized between visitors or devices.
- Photo assets are served from the project's managed image storage paths.
