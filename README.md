# Valkompass — Stockholm County, 2026

An election compass for the 2026 Swedish general election, covering the parliamentary
ballot (valtyp RD) in Stockholm County (constituency 2).

**Live:** https://douglasmgstark.github.io/valkompass/

## What it does

28 statements, answered on a five-point scale with an optional double weighting per
question. It then produces a match percentage against every party on that ballot that
has a published political platform, and plots you on a two-axis compass
(left–right, liberal–authoritarian). Available in Swedish and English.

## Scope and honesty

169 parties stand on this ballot. 32 have a published platform and are scored. The
remaining 137 are one-person lists, joke parties and newly registered parties with no
published programme; producing a match percentage against them would mean inventing
their politics, so they are listed in full instead of scored.

Party positions are compiled from the parties' own programmes and public statements.
They are an interpretation, **not** the parties' own survey answers. A party with no
stated position on a question is not counted for that question, and parties with thin
coverage are pulled toward 50% by Bayesian shrinkage so a single-issue party cannot
top the list on one answer.

Inclusion of a party is not an endorsement. Every registered party on the ballot is shown.

## Scoring: raw match vs the percentage

Two different questions, both shown on every row.

**Raw match** is plain weighted agreement, counted only over the questions where that
party has a stated position:

    raw = SUM w * (1 - |your answer - party position| / 4) / SUM w

It answers: where this party has spoken, how often do we agree? It says nothing about
how many questions that was.

**The percentage** is the same figure with six units of prior weight pinned at 50%
added in (Bayesian shrinkage), so thin coverage is pulled toward the middle:

    pct = (SUM w * sim + 6 * 0.5) / (SUM w + 6)

It answers: how confident should I be that this party is a good match overall?

| Party has a position on | Raw | Shown % |
| --- | --- | --- |
| 25 of your 28 answers, perfect agreement | 100% | 90% |
| all 28, perfect agreement | 100% | 91% |
| 1 question only, perfect agreement | 100% | 57% |
| 25 questions, total disagreement | 0% | 10% |
| any coverage, half agreement | 50% | 50% |

Three consequences:

- **100% is unreachable.** A party agreeing on all 28 tops out at 91%. The score is a
  confidence-weighted estimate, not a tally, so 90% does not mean 10% disagreement.
- **50% is the fixed point.** Shrinkage lifts the floor as much as it caps the ceiling.
- **Ranking uses the percentage, not raw.** That is the point. A single-issue party can
  agree 100% of the time it has an opinion; sorting by raw would put every such party
  above the parties with a full platform.

Marking a question extra important doubles its weight `w`, which raises both the
numerator and the coverage weight, so it also slightly reduces shrinkage for parties
that have a position on it.

`m = 6` is a chosen constant, not a derived one: it treats each party as starting with
six questions' worth of neutral evidence. Lower it and single-issue parties climb;
raise it and everything compresses toward 50% and broad platforms win on coverage alone.

## Completion counter

An optional "N people have taken this" line, backed by a Cloudflare Worker in
[`counter/`](counter/) because static hosting cannot keep a number. It counts
completions, not page views: one increment when results first render, deduped per
browser and capped per IP per day. It is shown in the top right of the masthead, read on page load and
updated when you finish a run. The visitor's IP is hashed with a salt and kept 24 hours purely for that
dedupe, never stored.

It is off until `COUNTER_URL` is set in `index.html`; while empty the page makes no
request at all. See [`counter/README.md`](counter/README.md) to deploy.

## Source

Party list retrieved from the Swedish Election Authority's election presentation,
election type RD, area 2, on 2026-08-23:
https://data.val.se/val2026/partier/valsedlar/valtyp/RD/omrade/2

## Build

A single self-contained `index.html`. No build step, no dependencies, no tracking.
Non-ASCII characters are escaped so the page renders correctly regardless of how a
host configures its charset.
