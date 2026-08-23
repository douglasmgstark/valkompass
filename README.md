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

## Source

Party list retrieved from the Swedish Election Authority's election presentation,
election type RD, area 2, on 2026-08-23:
https://data.val.se/val2026/partier/valsedlar/valtyp/RD/omrade/2

## Build

A single self-contained `index.html`. No build step, no dependencies, no tracking.
Non-ASCII characters are escaped so the page renders correctly regardless of how a
host configures its charset.
