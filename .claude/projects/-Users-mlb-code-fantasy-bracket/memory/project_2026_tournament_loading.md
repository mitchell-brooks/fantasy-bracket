---
name: 2026 Tournament Data Loading
description: Status and learnings from loading 2026 NCAA tournament data into Supabase
type: project
---

2026 NCAA tournament data loading in progress (Selection Sunday 2026-03-16).

**Competition record:** competition_id = 8, season "2025-26", identifier "2026"

**Data pipeline:** sportsipy fork at ~/code/sportsipy pulls team and player stats from basketball-reference.com via AWS API Gateway IP rotator. Parameterized script at `sportsipy/pull_tournament_data.py` with config at `sportsipy/config_2026.json`.

**Why:** Annual process to load 68 tournament teams + ~1000 players into Supabase before the tournament starts. Rate limiting from basketball-reference is the main obstacle.

**How to apply:**
- The `Teams()` bulk fetch is fragile — patched `ncaab_utils.py` to retry each of the 4 stats pages individually on 403
- Expanded IP rotator from 10 to 20 AWS regions for more IPs
- Individual `Roster()` fetches per team are more reliable than filtering the full Teams() iterator
- Team abbreviation mapping is in config_2026.json — some names differ from common usage (e.g., "Connecticut" not "UConn", "Brigham-Young" not "BYU")
- CSVs land in data/2026/, then load-data.ipynb functions push to Supabase
- WS3 plan covers productionizing this into data/pipeline/data_loading.py
