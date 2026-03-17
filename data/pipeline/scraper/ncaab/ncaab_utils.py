# ABOUTME: Utility functions for fetching and assembling NCAAB team stat data.
# ABOUTME: Vendored from sportsipy; all transport removed, parsing only.
from .constants import (ADVANCED_OPPONENT_STATS_URL,
                        ADVANCED_STATS_URL,
                        BASIC_OPPONENT_STATS_URL,
                        BASIC_STATS_URL,
                        PARSING_SCHEME)
from pyquery import PyQuery as pq
from pipeline.scraper import utils
import time


def _add_stats_data(teams_list, team_data_dict):
    """
    Add a team's stats row to a dictionary.

    Pass table contents and a stats dictionary of all teams to accumulate all
    stats for each team in a single variable.

    Parameters
    ----------
    teams_list : generator
        A generator of all row items in a given table.
    team_data_dict : {str: {'data': str}} dictionary
        A dictionary where every key is the team's abbreviation and every value
        is another dictionary with a 'data' key which contains the string
        version of the row data for the matched team.

    Returns
    -------
    dictionary
        An updated version of the team_data_dict with the passed table row
        information included.
    """
    for team_data in teams_list:
        if 'class="over_header thead"' in str(team_data) or\
           'class="thead"' in str(team_data):
            continue
        abbr = utils._parse_field(PARSING_SCHEME, team_data, 'abbreviation')
        try:
            team_data_dict[abbr]['data'] += team_data
        except KeyError:
            team_data_dict[abbr] = {'data': team_data}
    return team_data_dict


def _retrieve_all_teams(year, basic_stats=None, basic_opp_stats=None,
                        adv_stats=None, adv_opp_stats=None):
    """
    Find and create Team instances for all teams in the given season.

    For a given season, parses the specified NCAAB stats table and finds all
    requested stats. Each team then has a Team instance created which includes
    all requested stats and a few identifiers, such as the team's name and
    abbreviation. All of the individual Team instances are added to a list.

    Note that this method is called directly once Teams is invoked and does not
    need to be called manually.

    Parameters
    ----------
    year : string
        The requested year to pull stats from.
    basic_stats : string (optional)
        Link with filename to the local basic stats page.
    basic_opp_stats : string (optional)
        Link with filename to the local basic opponent stats page.
    adv_stats : string (optional)
        Link with filename to the local advanved stats page.
    adv_opp_stats : string (optional)
        Link with filename to the local advanced opponents stats page.

    Returns
    -------
    tuple
        Returns a ``tuple`` of the team_data_dict and year which represent all
        stats for all teams, and the given year that should be used to pull
        stats from, respectively.
    """
    team_data_dict = {}

    if not year:
        year = utils._find_year_for_season('ncaab')
        # If stats for the requested season do not exist yet (as is the case
        # right before a new season begins), attempt to pull the previous
        # year's stats. If it exists, use the previous year instead.
        if not utils._url_exists(BASIC_STATS_URL % year) and \
           utils._url_exists(BASIC_STATS_URL % str(int(year) - 1)):
            year = str(int(year) - 1)
    pages = [
        (BASIC_STATS_URL % year, basic_stats, 'table#basic_school_stats'),
        (BASIC_OPPONENT_STATS_URL % year, basic_opp_stats, 'table#basic_opp_stats'),
        (ADVANCED_STATS_URL % year, adv_stats, 'table#adv_school_stats'),
        (ADVANCED_OPPONENT_STATS_URL % year, adv_opp_stats, 'table#adv_opp_stats'),
    ]
    all_stats_lists = []
    for url, local_file, table_id in pages:
        stats_list = None
        for attempt in range(5):
            doc = utils._pull_page(url, local_file)
            stats_list = utils._get_stats_table(doc, table_id)
            if stats_list is not None:
                break
            wait = 10 * (attempt + 1)
            print(f"Retry {attempt+1} for {table_id} in {wait}s...")
            time.sleep(wait)
        all_stats_lists.append(stats_list)
    if not any(all_stats_lists):
        utils._no_data_found()
        return None, None
    for stats_list in all_stats_lists:
        if stats_list is not None:
            team_data_dict = _add_stats_data(stats_list, team_data_dict)
    return team_data_dict, year
