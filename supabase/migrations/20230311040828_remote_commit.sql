alter table "public"."competitionround" add column "teams_remaining" integer;

alter table "public"."poolrule_redraft" add column "redraft_order" smallint default '-1'::smallint;

alter table "public"."stats_player_precompetitionsnapshot_basketball" add column "additional_player_stats" jsonb;

alter table "public"."stats_team_precompetitionsnapshot_basketball" drop column "total_games";

alter table "public"."stats_team_precompetitionsnapshot_basketball" add column "additional_team_stats" jsonb;

alter table "public"."stats_team_precompetitionsnapshot_basketball" add column "games_played" integer not null;

alter table "public"."team_competition" add column "round_started" smallint;


