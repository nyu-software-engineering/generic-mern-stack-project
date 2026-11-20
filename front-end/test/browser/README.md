# Optional mobile browser regression

`mobile-focus.mjs` starts the real app and Express API with synthetic fixtures. It needs no Mockaroo key or live records. It checks native Tab and Shift+Tab through six affected views at 320 by 500, 390 by 500, and 320 by 203px. A focused control must have a visible portion above the fixed phone bar.

Install Playwright outside the project if it is not already available:

```sh
npm install --prefix /tmp/dormshare-browser playwright
/tmp/dormshare-browser/node_modules/.bin/playwright install chromium
```

From the repository root:

```sh
PLAYWRIGHT_MODULE=/tmp/dormshare-browser/node_modules/playwright/index.mjs node front-end/test/browser/mobile-focus.mjs
```

`PLAYWRIGHT_MODULE` can point to another installed Playwright module. `FRONTEND_ROOT` can point to a disposable combined frontend checkout. The check starts and stops its own loopback servers and browser. It does not change the normal `npm test` command or project dependencies.

This is a focused regression for fully obscured keyboard focus. It does not establish physical-keyboard behavior, screen-reader support, full textarea visibility, a complete accessibility audit, or real 400% browser zoom. The broader audit evidence is recorded separately under `docs/design/`.
