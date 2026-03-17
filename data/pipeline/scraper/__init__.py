# ABOUTME: Public API for the basketball-reference scraper
# ABOUTME: Vendored from sportsipy ncaab module — parsing only, no HTTP transport

from pipeline.scraper.ncaab.teams import Teams, Team
from pipeline.scraper.ncaab.roster import Roster
from pipeline.scraper.ncaab.player import Player

__all__ = ["Teams", "Team", "Roster", "Player"]
