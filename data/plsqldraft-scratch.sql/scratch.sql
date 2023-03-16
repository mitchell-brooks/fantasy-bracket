CREATE OR REPLACE FUNCTION draft_players(
  draft_input (roster_id INTEGER, rank_num INTEGER, player_unique TEXT)[],
  roster_list INTEGER[],
  player_count INTEGER,
  available_players TEXT[],
  round_start INTEGER,
  round_end INTEGER
)
RETURNS VOID AS $$
DECLARE
  current_round INTEGER := 1;
  current_pick INTEGER := 1;
  roster_count INTEGER := array_length(roster_list, 1);
  pick_num INTEGER := 1;
BEGIN
  WHILE current_round <= player_count LOOP
    FOR i IN 1..roster_count LOOP
      WITH available_players_cte AS (
        SELECT rank_num, player_unique
        FROM unnest(draft_input) AS (roster_id, rank_num, player_unique)
        WHERE roster_id = roster_list[i] AND rank_num = (
          SELECT MIN(rank_num)
          FROM unnest(draft_input)
          WHERE roster_id = roster_list[i]
        ) AND player_unique = ANY(available_players)
      )
      INSERT INTO roster_player(roster_id, player_unique, pick_num, round_start, round_end)
      SELECT roster_list[i], player_unique, pick_num, round_start, round_end
      FROM available_players_cte
      ORDER BY rank_num ASC
      LIMIT 1;
      available_players := array_remove(available_players,
        (SELECT player_unique FROM available_players_cte LIMIT 1)
      );
      pick_num := pick_num + 1;
    END LOOP;
    draft_input := array_remove(draft_input,
      (SELECT (roster_id, rank_num, player_unique) FROM draft_input
       WHERE roster_id = roster_list[current_pick]
       AND rank_num = (SELECT MIN(rank_num) FROM unnest(draft_input) WHERE roster_id = roster_list[current_pick])
      )
    );
    current_pick := current_pick + 1;
    IF current_pick > roster_count THEN
      current_pick := 1;
      roster_list := array_reverse(roster_list);
      current_round := current_round + 1;
      pick_num := 1;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
