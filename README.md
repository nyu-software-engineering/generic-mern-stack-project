# StockSim

StockSim is a mobile web app for practicing investing with virtual money, without putting real savings at risk.

## Product Vision

We're building StockSim for college students and young adults aged 18-28 who are curious about investing but don't know where to start. Our goal is to give beginners a safe place to make investing decisions, see how those decisions affect a portfolio, and learn the concepts behind them. The app is intended to be mobile-first and explain unfamiliar terms without assuming prior investing experience.

## Proposed Experience

The original proposal includes:

- Starting with $10,000 in simulated cash.
- Browsing stock and ETF prices, charts, and company information.
- Practicing buying and selling stocks with virtual money.
- Tracking holdings, portfolio value, gains, and losses.
- Learning investing concepts through short, contextual lessons.
- An optional leaderboard and achievement badges.


## Project Origin

StockSim was proposed by Abhishek. In principle, many people are afraid of losing real money, so they never try investing at all. StockSim lets them practice with virtual cash first, without that fear.

See the [original StockSim proposal](https://github.com/Zho29/project-proposal/blob/main/README.md) for the initial concept and proposed scope.

## Team

Sprint 0 roles:

- Hanzalah Siraj - Product Owner, GitHub: [hanza-siraj](https://github.com/hanza-siraj)
- Abhishek Subedi - Scrum Master, GitHub: [zho29](https://github.com/zho29)
- Brittany (Yutong) Liu - GitHub: [brittany660016](https://github.com/brittany660016)
- Sam Fiallos - GitHub: [samthropic](https://github.com/samthropic)

Sprint 1 roles:

- Sam Fiallos - Product Owner, GitHub: [samthropic](https://github.com/samthropic)
- Brittany (Yutong) Liu - Scrum Master, GitHub: [brittany660016](https://github.com/brittany660016)
- Hanzalah Siraj - GitHub: [hanza-siraj](https://github.com/hanza-siraj)
- Abhishek Subedi - GitHub: [zho29](https://github.com/zho29)


## Contributing

Read our [contribution guide](CONTRIBUTING.md) for the team's process and contribution rules.

## Project Links

- [Shared project repository](https://github.com/agile-students-fall2026/StockSim)
- [Original proposal](https://github.com/Zho29/project-proposal/blob/main/README.md)

## Run the frontend locally

Use Node.js 24 or newer. From the repository root:

```bash
cd front-end
npm ci
npm run dev -- --host 127.0.0.1
```

Open the URL Vite prints, then visit `/market`. Run checks from `front-end/`:

```bash
node --test tests/*.test.js
npm run lint
npm run build
```

### Market demo (#69–#71)

- `/market`: browse fictional investments; search by ticker or company name.
- `/market/NOVA`: inspect a stock and switch between Day, Week, and All
  chart periods. Tap the chart or use the labeled slider to
  inspect a historical price. Unknown tickers show an unavailable state.
- `/market/watchlist`: view saved investments. Add from stock details; removal
  requires confirmation and can be canceled.
- `/market/NOVA/buy` and `/market/NOVA/sell`: enter whole shares, review an
  estimate, then confirm a simulated trade. Insufficient cash, invalid quantities,
  and selling more shares than owned are rejected. Confirmation updates virtual
  cash and holdings and produces a receipt.

Market data comes from `front-end/public/mock/market.json`, a seeded, generated
fixture served as a mock endpoint. Companies, prices, and history are fictional;
there are no live quotes, API keys, or real trades. Future backend integration
should replace this endpoint and the practice account adapter.

The compact fixture keeps the same six investments and current quotes, with
14 daily points and 4 intraday samples per investment (108 points total).
Day uses the intraday samples, Week uses the last 7 daily points, and All means
all 14 available days, not a full year. Each point occupies one readable JSON line.

The demo starts with $10,000 and no holdings. Watchlist, virtual balance, holdings,
and trade records persist in this browser's `stocksim-practice-v1` localStorage
entry. This is a single demo account, not authenticated or isolated by user;
use one tab at a time. If storage is unavailable, a notice explains that changes
last only for the current page session. Portfolio summary, holding details,
transaction history, transaction details, and the current Performance totals use
this same account and market quotes. Holding Buy/Sell links open the selected
investment's ticket. Completed trades link to Portfolio and their transaction.
Average purchase price is reconstructed from the saved trades using weighted
average cost; incomplete purchase history is shown as unavailable. Missing market
quotes show an error instead of silently understating the portfolio value.

The Performance chart remains the team's separate sample historical series,
clearly labeled as such; it is not a history of this account. Account and
leaderboard sample data are not synchronized with trading. Live quote refresh,
server execution, pending/unknown order states, and contextual learning overlays
are not implemented in this demo.

## Run the backend locally

Use Node.js 24 or newer. From the repository root:

```bash
cd back-end
npm ci
npm run dev
```

The Express API runs on port `3001` by default. To change it, copy
`back-end/.env.example` to `back-end/.env` and set `PORT`. Node loads this
optional file automatically. Use `npm start` to run without watching files.

Check that the server is running:

```bash
curl http://localhost:3001/api/health
```

The health route returns `200` with `{"status":"ok"}`. Authentication routes
are scaffolded for the next implementation steps:

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| POST | `/api/auth/forgot-password` | Request a reset link |
| POST | `/api/auth/reset-password` | Set a new password |

These five routes currently return `501` with a JSON `NOT_IMPLEMENTED` error.
They do not create accounts, authenticate users, send email, or store data.
The frontend login remains its existing demo flow. User validation, password
hashing, authorization, reset tokens, and frontend integration are later steps;
database implementation is outside this setup.

Requests use JSON with a 10 KB body limit. Malformed JSON, oversized bodies,
and unknown routes return JSON errors with statuses `400`, `413`, and `404`.

Run backend checks from `back-end/`:

```bash
npm run lint
npm test
npm run test:coverage
```

Tests use Mocha, Chai, and Supertest. The c8 command reports coverage for all
backend source files, writes an HTML report to `back-end/coverage/index.html`,
and enforces the course's minimum 10% coverage requirement.
