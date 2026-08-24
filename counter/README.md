# Completion counter

A single Cloudflare Worker backing the "N people have taken this" line on the page.
Static hosting cannot keep a number, so this is the one piece of state.

- `GET  /count` returns `{ count }`
- `POST /count` increments and returns `{ count, counted }`, at most once per IP per day

## Privacy

The caller's IP is never stored. It is combined with a salt and the current date, hashed
with SHA-256, and the hash is kept for 24 hours purely to stop the same visitor counting
twice. No cookies, no logs, no per-visitor rows. The only durable value is one integer.

## Deploy

```sh
npm install -g wrangler          # once
wrangler login                   # opens a browser, authorises your own account
cd counter
wrangler kv namespace create COUNTER
#   -> copy the printed id into wrangler.toml, replacing REPLACE_WITH_KV_NAMESPACE_ID
wrangler secret put SALT         # paste any long random string
wrangler deploy
```

`wrangler deploy` prints the endpoint, something like
`https://valkompass-counter.<your-subdomain>.workers.dev`.

Then set it in `../index.html`:

```js
const COUNTER_URL = "https://valkompass-counter.<your-subdomain>.workers.dev/count";
```

Commit and push, and the counter goes live. While `COUNTER_URL` is empty the page makes
no request at all and the line stays hidden.

## Notes

- `ALLOWED_ORIGINS` in `src/worker.js` restricts CORS to the Pages origin. Add a custom
  domain there if the page moves.
- `MIN_SHOW` in `index.html` hides the number until it passes 50, so the page never
  advertises a low count.
- The count is approximate by design. KV is eventually consistent, so two simultaneous
  completions can collide and register as one. Per-IP-per-day dedupe stops casual
  inflation but a determined person can still call the endpoint repeatedly.
