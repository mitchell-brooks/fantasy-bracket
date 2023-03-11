--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.1 (Debian 15.1-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."group" (
    "group_id" integer NOT NULL,
    "admin_user_id" "uuid" NOT NULL,
    "group_name" "text" NOT NULL
);


ALTER TABLE "public"."group" OWNER TO "postgres";

--
-- Name: Group_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."Group_group_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."Group_group_id_seq" OWNER TO "postgres";

--
-- Name: Group_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."Group_group_id_seq" OWNED BY "public"."group"."group_id";


--
-- Name: competition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."competition" (
    "competition_id" integer NOT NULL,
    "competition_unique" "text" NOT NULL,
    "season" "text",
    "identifier" "text",
    "round_count" integer NOT NULL,
    "daterange" "daterange" NOT NULL
);


ALTER TABLE "public"."competition" OWNER TO "postgres";

--
-- Name: competition_competition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."competition_competition_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."competition_competition_id_seq" OWNER TO "postgres";

--
-- Name: competition_competition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."competition_competition_id_seq" OWNED BY "public"."competition"."competition_id";


--
-- Name: competitionmeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."competitionmeta" (
    "competition_unique" "text" NOT NULL,
    "league_unique" "text" NOT NULL,
    "official_name" "text" NOT NULL,
    "display_name" "text" NOT NULL
);


ALTER TABLE "public"."competitionmeta" OWNER TO "postgres";

--
-- Name: competitionround; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."competitionround" (
    "round_num" integer NOT NULL,
    "competition_id" integer NOT NULL,
    "round_name" "text",
    "round_start" timestamp without time zone NOT NULL,
    "round_end" timestamp without time zone NOT NULL
);


ALTER TABLE "public"."competitionround" OWNER TO "postgres";

--
-- Name: competitionround_competition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."competitionround_competition_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."competitionround_competition_id_seq" OWNER TO "postgres";

--
-- Name: competitionround_competition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."competitionround_competition_id_seq" OWNED BY "public"."competitionround"."competition_id";


--
-- Name: conference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."conference" (
    "conference_unique" "text" NOT NULL,
    "league_unique" "text" NOT NULL,
    "conference_name" "text" NOT NULL
);


ALTER TABLE "public"."conference" OWNER TO "postgres";

--
-- Name: game; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."game" (
    "game_id" integer NOT NULL,
    "game_date" "date" NOT NULL,
    "team_1_id" "text" NOT NULL,
    "team_2_id" "text" NOT NULL,
    "game_time" time without time zone,
    "round_num" integer NOT NULL,
    "competition_id" integer NOT NULL,
    "winner" "text" NOT NULL,
    "league_unique" "text" NOT NULL,
    "league_unique_1" "text" NOT NULL
);


ALTER TABLE "public"."game" OWNER TO "postgres";

--
-- Name: game_competition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."game_competition_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."game_competition_id_seq" OWNER TO "postgres";

--
-- Name: game_competition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."game_competition_id_seq" OWNED BY "public"."game"."competition_id";


--
-- Name: game_game_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."game_game_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."game_game_id_seq" OWNER TO "postgres";

--
-- Name: game_game_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."game_game_id_seq" OWNED BY "public"."game"."game_id";


--
-- Name: league; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."league" (
    "league_unique" "text" NOT NULL,
    "league_name" "text" NOT NULL,
    "sport" "text" NOT NULL,
    "womens" boolean
);


ALTER TABLE "public"."league" OWNER TO "postgres";

--
-- Name: player; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."player" (
    "player_unique" "text" NOT NULL,
    "player_name" "text" NOT NULL,
    "position" "text",
    "birthdate" "date"
);


ALTER TABLE "public"."player" OWNER TO "postgres";

--
-- Name: player_competition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."player_competition" (
    "player_unique" "text" NOT NULL,
    "competition_id" integer NOT NULL,
    "team_unique" "text" NOT NULL,
    "inactive" boolean NOT NULL,
    "note" "text",
    "league_unique" "text" NOT NULL
);


ALTER TABLE "public"."player_competition" OWNER TO "postgres";

--
-- Name: player_competition_competition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."player_competition_competition_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."player_competition_competition_id_seq" OWNER TO "postgres";

--
-- Name: player_competition_competition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."player_competition_competition_id_seq" OWNED BY "public"."player_competition"."competition_id";


--
-- Name: player_game; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."player_game" (
    "player_unique" "text" NOT NULL,
    "game_id" integer NOT NULL,
    "points" integer NOT NULL,
    "rebounds" integer NOT NULL,
    "assists" integer NOT NULL,
    "blocks" integer NOT NULL
);


ALTER TABLE "public"."player_game" OWNER TO "postgres";

--
-- Name: player_game_game_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."player_game_game_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."player_game_game_id_seq" OWNER TO "postgres";

--
-- Name: player_game_game_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."player_game_game_id_seq" OWNED BY "public"."player_game"."game_id";


--
-- Name: pool; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."pool" (
    "pool_id" integer NOT NULL,
    "group_id" integer NOT NULL,
    "competition_id" integer NOT NULL,
    "pool_name" "text" NOT NULL,
    "point_value" bigint NOT NULL,
    "currency" "text" NOT NULL,
    "roster_count" integer NOT NULL,
    "draft_time" timestamp without time zone NOT NULL
);


ALTER TABLE "public"."pool" OWNER TO "postgres";

--
-- Name: pool_competition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."pool_competition_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."pool_competition_id_seq" OWNER TO "postgres";

--
-- Name: pool_competition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."pool_competition_id_seq" OWNED BY "public"."pool"."competition_id";


--
-- Name: pool_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."pool_group_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."pool_group_id_seq" OWNER TO "postgres";

--
-- Name: pool_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."pool_group_id_seq" OWNED BY "public"."pool"."group_id";


--
-- Name: pool_pool_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."pool_pool_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."pool_pool_id_seq" OWNER TO "postgres";

--
-- Name: pool_pool_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."pool_pool_id_seq" OWNED BY "public"."pool"."pool_id";


--
-- Name: poolrule_mvp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."poolrule_mvp" (
    "mvp_round_start" integer NOT NULL,
    "mvp_round_end" integer NOT NULL,
    "pool_id" integer NOT NULL,
    "out_money" boolean NOT NULL
);


ALTER TABLE "public"."poolrule_mvp" OWNER TO "postgres";

--
-- Name: poolrule_prizesplit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."poolrule_prizesplit" (
    "recipient" "text" NOT NULL,
    "pool_id" integer NOT NULL,
    "percent_split" integer NOT NULL
);


ALTER TABLE "public"."poolrule_prizesplit" OWNER TO "postgres";

--
-- Name: poolrule_redraft; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."poolrule_redraft" (
    "round_num" integer NOT NULL,
    "pool_id" integer NOT NULL,
    "redraft_count" integer NOT NULL,
    "redraft_time" timestamp without time zone NOT NULL
);


ALTER TABLE "public"."poolrule_redraft" OWNER TO "postgres";

--
-- Name: poolrule_redraft_pool_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."poolrule_redraft_pool_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."poolrule_redraft_pool_id_seq" OWNER TO "postgres";

--
-- Name: poolrule_redraft_pool_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."poolrule_redraft_pool_id_seq" OWNED BY "public"."poolrule_redraft"."pool_id";


--
-- Name: roster; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."roster" (
    "roster_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "pool_id" integer NOT NULL,
    "roster_name" "text" NOT NULL,
    "draft_order" integer NOT NULL
);


ALTER TABLE "public"."roster" OWNER TO "postgres";

--
-- Name: roster_player; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."roster_player" (
    "roster_id" integer NOT NULL,
    "player_unique" "text" NOT NULL,
    "round_start" integer NOT NULL,
    "round_end" integer NOT NULL
);


ALTER TABLE "public"."roster_player" OWNER TO "postgres";

--
-- Name: roster_player_roster_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."roster_player_roster_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."roster_player_roster_id_seq" OWNER TO "postgres";

--
-- Name: roster_player_roster_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."roster_player_roster_id_seq" OWNED BY "public"."roster_player"."roster_id";


--
-- Name: roster_pool_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."roster_pool_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."roster_pool_id_seq" OWNER TO "postgres";

--
-- Name: roster_pool_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."roster_pool_id_seq" OWNED BY "public"."roster"."pool_id";


--
-- Name: roster_roster_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."roster_roster_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."roster_roster_id_seq" OWNER TO "postgres";

--
-- Name: roster_roster_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."roster_roster_id_seq" OWNED BY "public"."roster"."roster_id";


--
-- Name: rosterranking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."rosterranking" (
    "roster_id" integer NOT NULL,
    "player_unique" "text" NOT NULL,
    "draft_num" integer NOT NULL,
    "ranking" integer NOT NULL
);


ALTER TABLE "public"."rosterranking" OWNER TO "postgres";

--
-- Name: stats_player_precompetitionsnapshot_basketball; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."stats_player_precompetitionsnapshot_basketball" (
    "player_unique" "text" NOT NULL,
    "competition_id" integer NOT NULL,
    "games_played" integer NOT NULL,
    "points" integer NOT NULL,
    "rebounds" integer NOT NULL,
    "assists" integer NOT NULL,
    "blocks" integer NOT NULL,
    "thru" "date" NOT NULL
);


ALTER TABLE "public"."stats_player_precompetitionsnapshot_basketball" OWNER TO "postgres";

--
-- Name: stats_team_precompetitionsnapshot_basketball; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."stats_team_precompetitionsnapshot_basketball" (
    "team_unique" "text" NOT NULL,
    "competition_id" integer NOT NULL,
    "league_unique" "text" NOT NULL,
    "total_games" integer NOT NULL,
    "conference_unique" "text" NOT NULL,
    "wins" integer NOT NULL,
    "losses" integer NOT NULL,
    "ties" integer,
    "conference_wins" integer NOT NULL,
    "conference_losses" integer NOT NULL,
    "thru" "date" NOT NULL
);


ALTER TABLE "public"."stats_team_precompetitionsnapshot_basketball" OWNER TO "postgres";

--
-- Name: team; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."team" (
    "team_unique" "text" NOT NULL,
    "league_unique" "text" NOT NULL,
    "team_name" "text" NOT NULL
);


ALTER TABLE "public"."team" OWNER TO "postgres";

--
-- Name: team_competition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."team_competition" (
    "team_unique" "text" NOT NULL,
    "competition_id" integer NOT NULL,
    "league_unique" "text" NOT NULL,
    "seed" integer NOT NULL,
    "overall_seed" integer,
    "region" "text",
    "round_eliminated" integer
);


ALTER TABLE "public"."team_competition" OWNER TO "postgres";

--
-- Name: team_competition_competition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE "public"."team_competition_competition_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."team_competition_competition_id_seq" OWNER TO "postgres";

--
-- Name: team_competition_competition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE "public"."team_competition_competition_id_seq" OWNED BY "public"."team_competition"."competition_id";


--
-- Name: user_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."user_group" (
    "group_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."user_group" OWNER TO "postgres";

--
-- Name: user_pool; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."user_pool" (
    "user_id" "uuid" NOT NULL,
    "pool_id" integer NOT NULL
);


ALTER TABLE "public"."user_pool" OWNER TO "postgres";

--
-- Name: userprofile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "public"."userprofile" (
    "user_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."userprofile" OWNER TO "postgres";

--
-- Name: competition competition_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."competition" ALTER COLUMN "competition_id" SET DEFAULT "nextval"('"public"."competition_competition_id_seq"'::"regclass");


--
-- Name: competitionround competition_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."competitionround" ALTER COLUMN "competition_id" SET DEFAULT "nextval"('"public"."competitionround_competition_id_seq"'::"regclass");


--
-- Name: game game_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."game" ALTER COLUMN "game_id" SET DEFAULT "nextval"('"public"."game_game_id_seq"'::"regclass");


--
-- Name: game competition_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."game" ALTER COLUMN "competition_id" SET DEFAULT "nextval"('"public"."game_competition_id_seq"'::"regclass");


--
-- Name: group group_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."group" ALTER COLUMN "group_id" SET DEFAULT "nextval"('"public"."Group_group_id_seq"'::"regclass");


--
-- Name: player_competition competition_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."player_competition" ALTER COLUMN "competition_id" SET DEFAULT "nextval"('"public"."player_competition_competition_id_seq"'::"regclass");


--
-- Name: player_game game_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."player_game" ALTER COLUMN "game_id" SET DEFAULT "nextval"('"public"."player_game_game_id_seq"'::"regclass");


--
-- Name: pool pool_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."pool" ALTER COLUMN "pool_id" SET DEFAULT "nextval"('"public"."pool_pool_id_seq"'::"regclass");


--
-- Name: pool group_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."pool" ALTER COLUMN "group_id" SET DEFAULT "nextval"('"public"."pool_group_id_seq"'::"regclass");


--
-- Name: pool competition_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."pool" ALTER COLUMN "competition_id" SET DEFAULT "nextval"('"public"."pool_competition_id_seq"'::"regclass");


--
-- Name: poolrule_redraft pool_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."poolrule_redraft" ALTER COLUMN "pool_id" SET DEFAULT "nextval"('"public"."poolrule_redraft_pool_id_seq"'::"regclass");


--
-- Name: roster roster_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."roster" ALTER COLUMN "roster_id" SET DEFAULT "nextval"('"public"."roster_roster_id_seq"'::"regclass");


--
-- Name: roster pool_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."roster" ALTER COLUMN "pool_id" SET DEFAULT "nextval"('"public"."roster_pool_id_seq"'::"regclass");


--
-- Name: roster_player roster_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."roster_player" ALTER COLUMN "roster_id" SET DEFAULT "nextval"('"public"."roster_player_roster_id_seq"'::"regclass");


--
-- Name: team_competition competition_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_competition" ALTER COLUMN "competition_id" SET DEFAULT "nextval"('"public"."team_competition_competition_id_seq"'::"regclass");


--
-- Name: competition pk_competition_competitionid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."competition"
    ADD CONSTRAINT "pk_competition_competitionid" PRIMARY KEY ("competition_id");


--
-- Name: competitionmeta pk_competitiondetails_competitionshort; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."competitionmeta"
    ADD CONSTRAINT "pk_competitiondetails_competitionshort" PRIMARY KEY ("competition_unique");


--
-- Name: competitionround pk_competitionround_roundnumcompetitionid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."competitionround"
    ADD CONSTRAINT "pk_competitionround_roundnumcompetitionid" PRIMARY KEY ("round_num", "competition_id");


--
-- Name: conference pk_conference_conferenceunique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."conference"
    ADD CONSTRAINT "pk_conference_conferenceunique" PRIMARY KEY ("conference_unique");


--
-- Name: game pk_game_gameid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."game"
    ADD CONSTRAINT "pk_game_gameid" PRIMARY KEY ("game_id");


--
-- Name: group pk_group_groupid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."group"
    ADD CONSTRAINT "pk_group_groupid" PRIMARY KEY ("group_id");


--
-- Name: league pk_league_leagueunique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."league"
    ADD CONSTRAINT "pk_league_leagueunique" PRIMARY KEY ("league_unique");


--
-- Name: player pk_player_playerunique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."player"
    ADD CONSTRAINT "pk_player_playerunique" PRIMARY KEY ("player_unique");


--
-- Name: player_competition pk_playercompetition_playerunique_competitionid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."player_competition"
    ADD CONSTRAINT "pk_playercompetition_playerunique_competitionid" PRIMARY KEY ("player_unique", "competition_id");


--
-- Name: player_game pk_playergame_playerid_gameid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."player_game"
    ADD CONSTRAINT "pk_playergame_playerid_gameid" PRIMARY KEY ("player_unique", "game_id");


--
-- Name: pool pk_pool_poolid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."pool"
    ADD CONSTRAINT "pk_pool_poolid" PRIMARY KEY ("pool_id");


--
-- Name: poolrule_mvp pk_poolrulemvp_roundstart_roundend_poolid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."poolrule_mvp"
    ADD CONSTRAINT "pk_poolrulemvp_roundstart_roundend_poolid" PRIMARY KEY ("mvp_round_start", "mvp_round_end", "pool_id");


--
-- Name: poolrule_prizesplit pk_poolruleprizesplit_recipient_poolid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."poolrule_prizesplit"
    ADD CONSTRAINT "pk_poolruleprizesplit_recipient_poolid" PRIMARY KEY ("recipient", "pool_id");


--
-- Name: poolrule_redraft pk_poolruleredraft_roundnumpoolid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."poolrule_redraft"
    ADD CONSTRAINT "pk_poolruleredraft_roundnumpoolid" PRIMARY KEY ("round_num", "pool_id");


--
-- Name: roster pk_roster_rosterid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."roster"
    ADD CONSTRAINT "pk_roster_rosterid" PRIMARY KEY ("roster_id");


--
-- Name: roster_player pk_rosterplayer_rosterid_playerunique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."roster_player"
    ADD CONSTRAINT "pk_rosterplayer_rosterid_playerunique" PRIMARY KEY ("roster_id", "player_unique");


--
-- Name: rosterranking pk_rosterranking_rosteridplayeruniquedraftnum; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."rosterranking"
    ADD CONSTRAINT "pk_rosterranking_rosteridplayeruniquedraftnum" PRIMARY KEY ("roster_id", "player_unique", "draft_num");


--
-- Name: stats_player_precompetitionsnapshot_basketball pk_statsplayerprecompetitionsnapshotbasketball_playeruniquecomp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."stats_player_precompetitionsnapshot_basketball"
    ADD CONSTRAINT "pk_statsplayerprecompetitionsnapshotbasketball_playeruniquecomp" PRIMARY KEY ("player_unique", "competition_id");


--
-- Name: stats_team_precompetitionsnapshot_basketball pk_statsplayerprecompetitionsnapshotbasketball_teamidcompetitio; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."stats_team_precompetitionsnapshot_basketball"
    ADD CONSTRAINT "pk_statsplayerprecompetitionsnapshotbasketball_teamidcompetitio" PRIMARY KEY ("team_unique", "competition_id", "league_unique");


--
-- Name: team pk_team_teamid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team"
    ADD CONSTRAINT "pk_team_teamid" PRIMARY KEY ("team_unique", "league_unique");


--
-- Name: team_competition pk_teamcompetition_teamid_competitionid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_competition"
    ADD CONSTRAINT "pk_teamcompetition_teamid_competitionid" PRIMARY KEY ("team_unique", "competition_id", "league_unique");


--
-- Name: user_group pk_usergroup_groupid_userid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_group"
    ADD CONSTRAINT "pk_usergroup_groupid_userid" PRIMARY KEY ("group_id", "user_id");


--
-- Name: user_pool pk_userpool_userid_poolid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_pool"
    ADD CONSTRAINT "pk_userpool_userid_poolid" PRIMARY KEY ("user_id", "pool_id");


--
-- Name: userprofile userprofile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."userprofile"
    ADD CONSTRAINT "userprofile_pkey" PRIMARY KEY ("user_id");


--
-- Name: userprofile userprofile_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."userprofile"
    ADD CONSTRAINT "userprofile_username_key" UNIQUE ("username");


--
-- Name: ix_competition_competitionshort; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_competition_competitionshort" ON "public"."competition" USING "btree" ("competition_unique");


--
-- Name: ix_competitiondetails_leagueshort; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_competitiondetails_leagueshort" ON "public"."competitionmeta" USING "btree" ("league_unique");


--
-- Name: ix_competitionround_competitionid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_competitionround_competitionid" ON "public"."competitionround" USING "btree" ("competition_id");


--
-- Name: ix_conference_leagueunique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_conference_leagueunique" ON "public"."conference" USING "btree" ("league_unique");


--
-- Name: ix_game_roundnum_competitionid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_game_roundnum_competitionid" ON "public"."game" USING "btree" ("round_num", "competition_id");


--
-- Name: ix_game_team1id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_game_team1id" ON "public"."game" USING "btree" ("team_1_id", "league_unique_1");


--
-- Name: ix_game_team2id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_game_team2id" ON "public"."game" USING "btree" ("team_2_id", "league_unique");


--
-- Name: ix_group_adminuserid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_group_adminuserid" ON "public"."group" USING "btree" ("admin_user_id");


--
-- Name: ix_playercompetition_competitionid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_playercompetition_competitionid" ON "public"."player_competition" USING "btree" ("competition_id");


--
-- Name: ix_playercompetition_playerunique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_playercompetition_playerunique" ON "public"."player_competition" USING "btree" ("player_unique");


--
-- Name: ix_playercompetition_teamid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_playercompetition_teamid" ON "public"."player_competition" USING "btree" ("team_unique", "league_unique");


--
-- Name: ix_playergame_gameid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_playergame_gameid" ON "public"."player_game" USING "btree" ("game_id");


--
-- Name: ix_playergame_playerid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_playergame_playerid" ON "public"."player_game" USING "btree" ("player_unique");


--
-- Name: ix_pool_competitionid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_pool_competitionid" ON "public"."pool" USING "btree" ("competition_id");


--
-- Name: ix_pool_groupid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_pool_groupid" ON "public"."pool" USING "btree" ("group_id");


--
-- Name: ix_poolrulemvp_poolid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_poolrulemvp_poolid" ON "public"."poolrule_mvp" USING "btree" ("pool_id");


--
-- Name: ix_poolruleprizesplit_poolid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_poolruleprizesplit_poolid" ON "public"."poolrule_prizesplit" USING "btree" ("pool_id");


--
-- Name: ix_poolruleredraft_poolid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_poolruleredraft_poolid" ON "public"."poolrule_redraft" USING "btree" ("pool_id");


--
-- Name: ix_roster_poolid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_roster_poolid" ON "public"."roster" USING "btree" ("pool_id");


--
-- Name: ix_roster_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_roster_userid" ON "public"."roster" USING "btree" ("user_id");


--
-- Name: ix_rosterplayer_playerunique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_rosterplayer_playerunique" ON "public"."roster_player" USING "btree" ("player_unique");


--
-- Name: ix_rosterplayer_rosterid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_rosterplayer_rosterid" ON "public"."roster_player" USING "btree" ("roster_id");


--
-- Name: ix_rosterranking_playerunique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_rosterranking_playerunique" ON "public"."rosterranking" USING "btree" ("player_unique");


--
-- Name: ix_rosterranking_rosterid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_rosterranking_rosterid" ON "public"."rosterranking" USING "btree" ("roster_id");


--
-- Name: ix_statsplayerprecompetitionsnapshotbasketball_playeruniquecomp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_statsplayerprecompetitionsnapshotbasketball_playeruniquecomp" ON "public"."stats_player_precompetitionsnapshot_basketball" USING "btree" ("player_unique", "competition_id");


--
-- Name: ix_statsteamprecompetitionsnapshotbasketball_conferenceunique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_statsteamprecompetitionsnapshotbasketball_conferenceunique" ON "public"."stats_team_precompetitionsnapshot_basketball" USING "btree" ("conference_unique");


--
-- Name: ix_statsteamprecompetitionsnapshotbasketball_teamidcompetitioni; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_statsteamprecompetitionsnapshotbasketball_teamidcompetitioni" ON "public"."stats_team_precompetitionsnapshot_basketball" USING "btree" ("team_unique", "competition_id", "league_unique");


--
-- Name: ix_team_leagueunique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_team_leagueunique" ON "public"."team" USING "btree" ("league_unique");


--
-- Name: ix_teamcompetition_competitionid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_teamcompetition_competitionid" ON "public"."team_competition" USING "btree" ("competition_id");


--
-- Name: ix_teamcompetition_teamid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_teamcompetition_teamid" ON "public"."team_competition" USING "btree" ("team_unique", "league_unique");


--
-- Name: ix_usergroup_groupid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_usergroup_groupid" ON "public"."user_group" USING "btree" ("group_id");


--
-- Name: ix_usergroup_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_usergroup_userid" ON "public"."user_group" USING "btree" ("user_id");


--
-- Name: ix_userpool_poolid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_userpool_poolid" ON "public"."user_pool" USING "btree" ("pool_id");


--
-- Name: ix_userpool_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ix_userpool_userid" ON "public"."user_pool" USING "btree" ("user_id");


--
-- Name: pool competition_isbetonby_pool_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."pool"
    ADD CONSTRAINT "competition_isbetonby_pool_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("competition_id");


--
-- Name: team_competition competition_iscompetedinby_team_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_competition"
    ADD CONSTRAINT "competition_iscompetedinby_team_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("competition_id");


--
-- Name: competitionround competition_isdividedinto_round_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."competitionround"
    ADD CONSTRAINT "competition_isdividedinto_round_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("competition_id");


--
-- Name: player_competition competition_isplayedby_player_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."player_competition"
    ADD CONSTRAINT "competition_isplayedby_player_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("competition_id");


--
-- Name: competition competitionmeta_instantiates_competition_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."competition"
    ADD CONSTRAINT "competitionmeta_instantiates_competition_fk" FOREIGN KEY ("competition_unique") REFERENCES "public"."competitionmeta"("competition_unique");


--
-- Name: stats_team_precompetitionsnapshot_basketball conference_factorsinto_stats_team_precompetitionsnapshot_basket; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."stats_team_precompetitionsnapshot_basketball"
    ADD CONSTRAINT "conference_factorsinto_stats_team_precompetitionsnapshot_basket" FOREIGN KEY ("conference_unique") REFERENCES "public"."conference"("conference_unique");


--
-- Name: player_game game_isplayedby_players_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."player_game"
    ADD CONSTRAINT "game_isplayedby_players_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("game_id");


--
-- Name: group group_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."group"
    ADD CONSTRAINT "group_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "public"."userprofile"("user_id");


--
-- Name: pool group_hosts_pool_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."pool"
    ADD CONSTRAINT "group_hosts_pool_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("group_id");


--
-- Name: user_group group_iscomprisedof_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_group"
    ADD CONSTRAINT "group_iscomprisedof_user_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("group_id");


--
-- Name: competitionmeta league_determines_competitiondetails_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."competitionmeta"
    ADD CONSTRAINT "league_determines_competitiondetails_fk" FOREIGN KEY ("league_unique") REFERENCES "public"."league"("league_unique");


--
-- Name: conference league_isdividedby_conference_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."conference"
    ADD CONSTRAINT "league_isdividedby_conference_fk" FOREIGN KEY ("league_unique") REFERENCES "public"."league"("league_unique");


--
-- Name: team league_isgoverningbodyof_team_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team"
    ADD CONSTRAINT "league_isgoverningbodyof_team_fk" FOREIGN KEY ("league_unique") REFERENCES "public"."league"("league_unique");


--
-- Name: roster_player player_comprises_roster_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."roster_player"
    ADD CONSTRAINT "player_comprises_roster_fk" FOREIGN KEY ("player_unique") REFERENCES "public"."player"("player_unique");


--
-- Name: rosterranking player_isrankedin_ranking_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."rosterranking"
    ADD CONSTRAINT "player_isrankedin_ranking_fk" FOREIGN KEY ("player_unique") REFERENCES "public"."player"("player_unique");


--
-- Name: player_competition player_playsin_competition_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."player_competition"
    ADD CONSTRAINT "player_playsin_competition_fk" FOREIGN KEY ("player_unique") REFERENCES "public"."player"("player_unique");


--
-- Name: player_game player_playsin_game_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."player_game"
    ADD CONSTRAINT "player_playsin_game_fk" FOREIGN KEY ("player_unique") REFERENCES "public"."player"("player_unique");


--
-- Name: stats_player_precompetitionsnapshot_basketball playercompetition_isinformedby_statsplayerprecompetitionsnapsho; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."stats_player_precompetitionsnapshot_basketball"
    ADD CONSTRAINT "playercompetition_isinformedby_statsplayerprecompetitionsnapsho" FOREIGN KEY ("player_unique", "competition_id") REFERENCES "public"."player_competition"("player_unique", "competition_id");


--
-- Name: poolrule_prizesplit pool_determines_prizesplit_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."poolrule_prizesplit"
    ADD CONSTRAINT "pool_determines_prizesplit_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pool"("pool_id");


--
-- Name: poolrule_mvp pool_determinesrulesfor_mvp_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."poolrule_mvp"
    ADD CONSTRAINT "pool_determinesrulesfor_mvp_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pool"("pool_id");


--
-- Name: poolrule_redraft pool_enacts_redraft_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."poolrule_redraft"
    ADD CONSTRAINT "pool_enacts_redraft_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pool"("pool_id");


--
-- Name: roster pool_iscomprisedof_roster_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."roster"
    ADD CONSTRAINT "pool_iscomprisedof_roster_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pool"("pool_id");


--
-- Name: user_pool pool_isparticipatedinby_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_pool"
    ADD CONSTRAINT "pool_isparticipatedinby_user_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."pool"("pool_id");


--
-- Name: roster_player roster_iscomprisedof_player_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."roster_player"
    ADD CONSTRAINT "roster_iscomprisedof_player_fk" FOREIGN KEY ("roster_id") REFERENCES "public"."roster"("roster_id");


--
-- Name: rosterranking roster_isdeterminedby_ranking_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."rosterranking"
    ADD CONSTRAINT "roster_isdeterminedby_ranking_fk" FOREIGN KEY ("roster_id") REFERENCES "public"."roster"("roster_id");


--
-- Name: game round_iscomprisedof_game_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."game"
    ADD CONSTRAINT "round_iscomprisedof_game_fk" FOREIGN KEY ("round_num", "competition_id") REFERENCES "public"."competitionround"("round_num", "competition_id");


--
-- Name: game team1_playsin_game_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."game"
    ADD CONSTRAINT "team1_playsin_game_fk" FOREIGN KEY ("team_2_id", "league_unique") REFERENCES "public"."team"("team_unique", "league_unique");


--
-- Name: game team2_playsin_game_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."game"
    ADD CONSTRAINT "team2_playsin_game_fk" FOREIGN KEY ("team_1_id", "league_unique_1") REFERENCES "public"."team"("team_unique", "league_unique");


--
-- Name: team_competition team_competesin_competition_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_competition"
    ADD CONSTRAINT "team_competesin_competition_fk" FOREIGN KEY ("team_unique", "league_unique") REFERENCES "public"."team"("team_unique", "league_unique");


--
-- Name: player_competition team_plays_player_competition_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."player_competition"
    ADD CONSTRAINT "team_plays_player_competition_fk" FOREIGN KEY ("team_unique", "league_unique") REFERENCES "public"."team"("team_unique", "league_unique");


--
-- Name: stats_team_precompetitionsnapshot_basketball teamcompetition_isinformedby_stats_team_precompetitionsnapshot_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."stats_team_precompetitionsnapshot_basketball"
    ADD CONSTRAINT "teamcompetition_isinformedby_stats_team_precompetitionsnapshot_" FOREIGN KEY ("team_unique", "competition_id", "league_unique") REFERENCES "public"."team_competition"("team_unique", "competition_id", "league_unique");


--
-- Name: user_group user_comprises_group_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_group"
    ADD CONSTRAINT "user_comprises_group_fk" FOREIGN KEY ("user_id") REFERENCES "public"."userprofile"("user_id");


--
-- Name: roster user_drafts_roster_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."roster"
    ADD CONSTRAINT "user_drafts_roster_fk" FOREIGN KEY ("user_id") REFERENCES "public"."userprofile"("user_id");


--
-- Name: user_pool user_participatesin_pool_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_pool"
    ADD CONSTRAINT "user_participatesin_pool_fk" FOREIGN KEY ("user_id") REFERENCES "public"."userprofile"("user_id");


--
-- Name: userprofile userprofile_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."userprofile"
    ADD CONSTRAINT "userprofile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: userprofile Public UserProfile are viewable by everyone.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public UserProfile are viewable by everyone." ON "public"."userprofile" FOR SELECT USING (true);


--
-- Name: userprofile Users can insert their own profile.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own profile." ON "public"."userprofile" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: userprofile Users can update own profile.; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile." ON "public"."userprofile" FOR UPDATE USING (("auth"."uid"() = "user_id"));


--
-- Name: userprofile; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."userprofile" ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."algorithm_sign"("signables" "text", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "armor"("bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."armor"("bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea") TO "dashboard_user";


--
-- Name: FUNCTION "armor"("bytea", "text"[], "text"[]); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."armor"("bytea", "text"[], "text"[]) FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea", "text"[], "text"[]) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."armor"("bytea", "text"[], "text"[]) TO "dashboard_user";


--
-- Name: FUNCTION "crypt"("text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."crypt"("text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."crypt"("text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."crypt"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "dearmor"("text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."dearmor"("text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."dearmor"("text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."dearmor"("text") TO "dashboard_user";


--
-- Name: FUNCTION "decrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."decrypt"("bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."decrypt"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."decrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "decrypt_iv"("bytea", "bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."decrypt_iv"("bytea", "bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."decrypt_iv"("bytea", "bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."decrypt_iv"("bytea", "bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "digest"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."digest"("bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."digest"("bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."digest"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "digest"("text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."digest"("text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."digest"("text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."digest"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "encrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."encrypt"("bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."encrypt"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."encrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "encrypt_iv"("bytea", "bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."encrypt_iv"("bytea", "bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."encrypt_iv"("bytea", "bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."encrypt_iv"("bytea", "bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "gen_random_bytes"(integer); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."gen_random_bytes"(integer) FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."gen_random_bytes"(integer) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."gen_random_bytes"(integer) TO "dashboard_user";


--
-- Name: FUNCTION "gen_random_uuid"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."gen_random_uuid"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."gen_random_uuid"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."gen_random_uuid"() TO "dashboard_user";


--
-- Name: FUNCTION "gen_salt"("text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."gen_salt"("text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text") TO "dashboard_user";


--
-- Name: FUNCTION "gen_salt"("text", integer); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."gen_salt"("text", integer) FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text", integer) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."gen_salt"("text", integer) TO "dashboard_user";


--
-- Name: FUNCTION "hmac"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."hmac"("bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."hmac"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."hmac"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "hmac"("text", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."hmac"("text", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."hmac"("text", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."hmac"("text", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision) FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements"("showtext" boolean, OUT "userid" "oid", OUT "dbid" "oid", OUT "toplevel" boolean, OUT "queryid" bigint, OUT "query" "text", OUT "plans" bigint, OUT "total_plan_time" double precision, OUT "min_plan_time" double precision, OUT "max_plan_time" double precision, OUT "mean_plan_time" double precision, OUT "stddev_plan_time" double precision, OUT "calls" bigint, OUT "total_exec_time" double precision, OUT "min_exec_time" double precision, OUT "max_exec_time" double precision, OUT "mean_exec_time" double precision, OUT "stddev_exec_time" double precision, OUT "rows" bigint, OUT "shared_blks_hit" bigint, OUT "shared_blks_read" bigint, OUT "shared_blks_dirtied" bigint, OUT "shared_blks_written" bigint, OUT "local_blks_hit" bigint, OUT "local_blks_read" bigint, OUT "local_blks_dirtied" bigint, OUT "local_blks_written" bigint, OUT "temp_blks_read" bigint, OUT "temp_blks_written" bigint, OUT "blk_read_time" double precision, OUT "blk_write_time" double precision, OUT "temp_blk_read_time" double precision, OUT "temp_blk_write_time" double precision, OUT "wal_records" bigint, OUT "wal_fpi" bigint, OUT "wal_bytes" numeric, OUT "jit_functions" bigint, OUT "jit_generation_time" double precision, OUT "jit_inlining_count" bigint, OUT "jit_inlining_time" double precision, OUT "jit_optimization_count" bigint, OUT "jit_optimization_time" double precision, OUT "jit_emission_count" bigint, OUT "jit_emission_time" double precision) TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone) FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_info"(OUT "dealloc" bigint, OUT "stats_reset" timestamp with time zone) TO "dashboard_user";


--
-- Name: FUNCTION "pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint) FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint) TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pg_stat_statements_reset"("userid" "oid", "dbid" "oid", "queryid" bigint) TO "dashboard_user";


--
-- Name: FUNCTION "pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_armor_headers"("text", OUT "key" "text", OUT "value" "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_key_id"("bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_key_id"("bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_key_id"("bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_key_id"("bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt"("bytea", "bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt"("bytea", "bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_decrypt_bytea"("bytea", "bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt"("text", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt"("text", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt"("text", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt_bytea"("bytea", "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_pub_encrypt_bytea"("bytea", "bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_pub_encrypt_bytea"("bytea", "bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt_bytea"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_decrypt_bytea"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_decrypt_bytea"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt"("text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt"("text", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt"("text", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt_bytea"("bytea", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text") TO "dashboard_user";


--
-- Name: FUNCTION "pgp_sym_encrypt_bytea"("bytea", "text", "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text", "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text", "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."pgp_sym_encrypt_bytea"("bytea", "text", "text") TO "dashboard_user";


--
-- Name: FUNCTION "sign"("payload" "json", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."sign"("payload" "json", "secret" "text", "algorithm" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."sign"("payload" "json", "secret" "text", "algorithm" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."sign"("payload" "json", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "try_cast_double"("inp" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."try_cast_double"("inp" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."try_cast_double"("inp" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."try_cast_double"("inp" "text") TO "dashboard_user";


--
-- Name: FUNCTION "url_decode"("data" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."url_decode"("data" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."url_decode"("data" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."url_decode"("data" "text") TO "dashboard_user";


--
-- Name: FUNCTION "url_encode"("data" "bytea"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."url_encode"("data" "bytea") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."url_encode"("data" "bytea") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."url_encode"("data" "bytea") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v1"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_generate_v1"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v1mc"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_generate_v1mc"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1mc"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v1mc"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v3"("namespace" "uuid", "name" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_generate_v3"("namespace" "uuid", "name" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v4"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_generate_v4"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v4"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v4"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_generate_v5"("namespace" "uuid", "name" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_generate_v5"("namespace" "uuid", "name" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "dashboard_user";


--
-- Name: FUNCTION "uuid_nil"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_nil"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_nil"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_nil"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_dns"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_ns_dns"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_dns"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_dns"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_oid"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_ns_oid"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_oid"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_oid"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_url"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_ns_url"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_url"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_url"() TO "dashboard_user";


--
-- Name: FUNCTION "uuid_ns_x500"(); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."uuid_ns_x500"() FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_x500"() TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."uuid_ns_x500"() TO "dashboard_user";


--
-- Name: FUNCTION "verify"("token" "text", "secret" "text", "algorithm" "text"); Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON FUNCTION "extensions"."verify"("token" "text", "secret" "text", "algorithm" "text") FROM "postgres";
-- GRANT ALL ON FUNCTION "extensions"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON FUNCTION "extensions"."verify"("token" "text", "secret" "text", "algorithm" "text") TO "dashboard_user";


--
-- Name: FUNCTION "comment_directive"("comment_" "text"); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."comment_directive"("comment_" "text") TO "service_role";


--
-- Name: FUNCTION "exception"("message" "text"); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."exception"("message" "text") TO "service_role";


--
-- Name: FUNCTION "get_schema_version"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."get_schema_version"() TO "service_role";


--
-- Name: FUNCTION "increment_schema_version"(); Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "postgres";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "anon";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql"."increment_schema_version"() TO "service_role";


--
-- Name: FUNCTION "graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb"); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "postgres";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "anon";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "authenticated";
-- GRANT ALL ON FUNCTION "graphql_public"."graphql"("operationName" "text", "query" "text", "variables" "jsonb", "extensions" "jsonb") TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_decrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea") TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea"); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_encrypt"("message" "bytea", "additional" "bytea", "key_uuid" "uuid", "nonce" "bytea") TO "service_role";


--
-- Name: FUNCTION "crypto_aead_det_keygen"(); Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

-- GRANT ALL ON FUNCTION "pgsodium"."crypto_aead_det_keygen"() TO "service_role";


--
-- Name: TABLE "pg_stat_statements"; Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON TABLE "extensions"."pg_stat_statements" FROM "postgres";
-- GRANT ALL ON TABLE "extensions"."pg_stat_statements" TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON TABLE "extensions"."pg_stat_statements" TO "dashboard_user";


--
-- Name: TABLE "pg_stat_statements_info"; Type: ACL; Schema: extensions; Owner: postgres
--

-- REVOKE ALL ON TABLE "extensions"."pg_stat_statements_info" FROM "postgres";
-- GRANT ALL ON TABLE "extensions"."pg_stat_statements_info" TO "postgres" WITH GRANT OPTION;
-- GRANT ALL ON TABLE "extensions"."pg_stat_statements_info" TO "dashboard_user";


--
-- Name: SEQUENCE "seq_schema_version"; Type: ACL; Schema: graphql; Owner: supabase_admin
--

-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "postgres";
-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "anon";
-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "authenticated";
-- GRANT ALL ON SEQUENCE "graphql"."seq_schema_version" TO "service_role";


--
-- Name: TABLE "decrypted_key"; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "pgsodium"."decrypted_key" TO "pgsodium_keyholder";


--
-- Name: TABLE "masking_rule"; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "pgsodium"."masking_rule" TO "pgsodium_keyholder";


--
-- Name: TABLE "mask_columns"; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

-- GRANT ALL ON TABLE "pgsodium"."mask_columns" TO "pgsodium_keyholder";


--
-- Name: TABLE "group"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."group" TO "anon";
GRANT ALL ON TABLE "public"."group" TO "authenticated";
GRANT ALL ON TABLE "public"."group" TO "service_role";


--
-- Name: SEQUENCE "Group_group_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."Group_group_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Group_group_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Group_group_id_seq" TO "service_role";


--
-- Name: TABLE "competition"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."competition" TO "anon";
GRANT ALL ON TABLE "public"."competition" TO "authenticated";
GRANT ALL ON TABLE "public"."competition" TO "service_role";


--
-- Name: SEQUENCE "competition_competition_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."competition_competition_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."competition_competition_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."competition_competition_id_seq" TO "service_role";


--
-- Name: TABLE "competitionmeta"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."competitionmeta" TO "anon";
GRANT ALL ON TABLE "public"."competitionmeta" TO "authenticated";
GRANT ALL ON TABLE "public"."competitionmeta" TO "service_role";


--
-- Name: TABLE "competitionround"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."competitionround" TO "anon";
GRANT ALL ON TABLE "public"."competitionround" TO "authenticated";
GRANT ALL ON TABLE "public"."competitionround" TO "service_role";


--
-- Name: SEQUENCE "competitionround_competition_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."competitionround_competition_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."competitionround_competition_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."competitionround_competition_id_seq" TO "service_role";


--
-- Name: TABLE "conference"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."conference" TO "anon";
GRANT ALL ON TABLE "public"."conference" TO "authenticated";
GRANT ALL ON TABLE "public"."conference" TO "service_role";


--
-- Name: TABLE "game"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."game" TO "anon";
GRANT ALL ON TABLE "public"."game" TO "authenticated";
GRANT ALL ON TABLE "public"."game" TO "service_role";


--
-- Name: SEQUENCE "game_competition_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."game_competition_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."game_competition_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."game_competition_id_seq" TO "service_role";


--
-- Name: SEQUENCE "game_game_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."game_game_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."game_game_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."game_game_id_seq" TO "service_role";


--
-- Name: TABLE "league"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."league" TO "anon";
GRANT ALL ON TABLE "public"."league" TO "authenticated";
GRANT ALL ON TABLE "public"."league" TO "service_role";


--
-- Name: TABLE "player"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."player" TO "anon";
GRANT ALL ON TABLE "public"."player" TO "authenticated";
GRANT ALL ON TABLE "public"."player" TO "service_role";


--
-- Name: TABLE "player_competition"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."player_competition" TO "anon";
GRANT ALL ON TABLE "public"."player_competition" TO "authenticated";
GRANT ALL ON TABLE "public"."player_competition" TO "service_role";


--
-- Name: SEQUENCE "player_competition_competition_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."player_competition_competition_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."player_competition_competition_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."player_competition_competition_id_seq" TO "service_role";


--
-- Name: TABLE "player_game"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."player_game" TO "anon";
GRANT ALL ON TABLE "public"."player_game" TO "authenticated";
GRANT ALL ON TABLE "public"."player_game" TO "service_role";


--
-- Name: SEQUENCE "player_game_game_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."player_game_game_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."player_game_game_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."player_game_game_id_seq" TO "service_role";


--
-- Name: TABLE "pool"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."pool" TO "anon";
GRANT ALL ON TABLE "public"."pool" TO "authenticated";
GRANT ALL ON TABLE "public"."pool" TO "service_role";


--
-- Name: SEQUENCE "pool_competition_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."pool_competition_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pool_competition_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pool_competition_id_seq" TO "service_role";


--
-- Name: SEQUENCE "pool_group_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."pool_group_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pool_group_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pool_group_id_seq" TO "service_role";


--
-- Name: SEQUENCE "pool_pool_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."pool_pool_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pool_pool_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pool_pool_id_seq" TO "service_role";


--
-- Name: TABLE "poolrule_mvp"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."poolrule_mvp" TO "anon";
GRANT ALL ON TABLE "public"."poolrule_mvp" TO "authenticated";
GRANT ALL ON TABLE "public"."poolrule_mvp" TO "service_role";


--
-- Name: TABLE "poolrule_prizesplit"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."poolrule_prizesplit" TO "anon";
GRANT ALL ON TABLE "public"."poolrule_prizesplit" TO "authenticated";
GRANT ALL ON TABLE "public"."poolrule_prizesplit" TO "service_role";


--
-- Name: TABLE "poolrule_redraft"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."poolrule_redraft" TO "anon";
GRANT ALL ON TABLE "public"."poolrule_redraft" TO "authenticated";
GRANT ALL ON TABLE "public"."poolrule_redraft" TO "service_role";


--
-- Name: SEQUENCE "poolrule_redraft_pool_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."poolrule_redraft_pool_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."poolrule_redraft_pool_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."poolrule_redraft_pool_id_seq" TO "service_role";


--
-- Name: TABLE "roster"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."roster" TO "anon";
GRANT ALL ON TABLE "public"."roster" TO "authenticated";
GRANT ALL ON TABLE "public"."roster" TO "service_role";


--
-- Name: TABLE "roster_player"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."roster_player" TO "anon";
GRANT ALL ON TABLE "public"."roster_player" TO "authenticated";
GRANT ALL ON TABLE "public"."roster_player" TO "service_role";


--
-- Name: SEQUENCE "roster_player_roster_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."roster_player_roster_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roster_player_roster_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roster_player_roster_id_seq" TO "service_role";


--
-- Name: SEQUENCE "roster_pool_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."roster_pool_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roster_pool_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roster_pool_id_seq" TO "service_role";


--
-- Name: SEQUENCE "roster_roster_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."roster_roster_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roster_roster_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roster_roster_id_seq" TO "service_role";


--
-- Name: TABLE "rosterranking"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."rosterranking" TO "anon";
GRANT ALL ON TABLE "public"."rosterranking" TO "authenticated";
GRANT ALL ON TABLE "public"."rosterranking" TO "service_role";


--
-- Name: TABLE "stats_player_precompetitionsnapshot_basketball"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."stats_player_precompetitionsnapshot_basketball" TO "anon";
GRANT ALL ON TABLE "public"."stats_player_precompetitionsnapshot_basketball" TO "authenticated";
GRANT ALL ON TABLE "public"."stats_player_precompetitionsnapshot_basketball" TO "service_role";


--
-- Name: TABLE "stats_team_precompetitionsnapshot_basketball"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."stats_team_precompetitionsnapshot_basketball" TO "anon";
GRANT ALL ON TABLE "public"."stats_team_precompetitionsnapshot_basketball" TO "authenticated";
GRANT ALL ON TABLE "public"."stats_team_precompetitionsnapshot_basketball" TO "service_role";


--
-- Name: TABLE "team"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."team" TO "anon";
GRANT ALL ON TABLE "public"."team" TO "authenticated";
GRANT ALL ON TABLE "public"."team" TO "service_role";


--
-- Name: TABLE "team_competition"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."team_competition" TO "anon";
GRANT ALL ON TABLE "public"."team_competition" TO "authenticated";
GRANT ALL ON TABLE "public"."team_competition" TO "service_role";


--
-- Name: SEQUENCE "team_competition_competition_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE "public"."team_competition_competition_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."team_competition_competition_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."team_competition_competition_id_seq" TO "service_role";


--
-- Name: TABLE "user_group"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."user_group" TO "anon";
GRANT ALL ON TABLE "public"."user_group" TO "authenticated";
GRANT ALL ON TABLE "public"."user_group" TO "service_role";


--
-- Name: TABLE "user_pool"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."user_pool" TO "anon";
GRANT ALL ON TABLE "public"."user_pool" TO "authenticated";
GRANT ALL ON TABLE "public"."user_pool" TO "service_role";


--
-- Name: TABLE "userprofile"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."userprofile" TO "anon";
GRANT ALL ON TABLE "public"."userprofile" TO "authenticated";
GRANT ALL ON TABLE "public"."userprofile" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";


--
-- PostgreSQL database dump complete
--

RESET ALL;
