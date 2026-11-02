# ApplyTrack front-end

React + Vite app for ApplyTrack.

- How to install and run it: see [Building and Testing](../README.md#building-and-testing) in the main README.

```
src/
  api/          mock back-end (pages get all data from here)
  components/   shared UI components (buttons, inputs, dialogs, cards...)
  constants/    shared lists: statuses, job types, event types, sort options...
  context/      theme and login state
  hooks/        useApi, useAuth, useTheme
  pages/        one file per screen, grouped by area
  styles/       theme.css (colors, fonts, spacing for light and dark) and base.css
  utils/        date and time formatting
public/
  mock-data/    JSON mock data
  icons/, favicon.*, apple-touch-icon.png, manifest.webmanifest   app icons
```
