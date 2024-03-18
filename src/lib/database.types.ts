export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      competition: {
        Row: {
          competition_id: number
          competition_unique: string
          daterange: unknown
          identifier: string | null
          round_count: number
          season: string | null
        }
        Insert: {
          competition_id?: number
          competition_unique: string
          daterange: unknown
          identifier?: string | null
          round_count: number
          season?: string | null
        }
        Update: {
          competition_id?: number
          competition_unique?: string
          daterange?: unknown
          identifier?: string | null
          round_count?: number
          season?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitionmeta_instantiates_competition_fk"
            columns: ["competition_unique"]
            isOneToOne: false
            referencedRelation: "competitionmeta"
            referencedColumns: ["competition_unique"]
          }
        ]
      }
      competition_updated: {
        Row: {
          competition_id: number
          current_round: number | null
          scores_updated_at: string
        }
        Insert: {
          competition_id?: number
          current_round?: number | null
          scores_updated_at?: string
        }
        Update: {
          competition_id?: number
          current_round?: number | null
          scores_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_isupdatedduring_round_fk"
            columns: ["competition_id", "current_round"]
            isOneToOne: false
            referencedRelation: "competitionround"
            referencedColumns: ["competition_id", "round_num"]
          },
          {
            foreignKeyName: "competition_updated_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          }
        ]
      }
      competitionmeta: {
        Row: {
          competition_unique: string
          display_name: string
          league_unique: string
          official_name: string
        }
        Insert: {
          competition_unique: string
          display_name: string
          league_unique: string
          official_name: string
        }
        Update: {
          competition_unique?: string
          display_name?: string
          league_unique?: string
          official_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_determines_competitiondetails_fk"
            columns: ["league_unique"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["league_unique"]
          }
        ]
      }
      competitionround: {
        Row: {
          competition_id: number
          round_end: string
          round_name: string | null
          round_num: number
          round_start: string
          teams_remaining: number | null
        }
        Insert: {
          competition_id?: number
          round_end: string
          round_name?: string | null
          round_num: number
          round_start: string
          teams_remaining?: number | null
        }
        Update: {
          competition_id?: number
          round_end?: string
          round_name?: string | null
          round_num?: number
          round_start?: string
          teams_remaining?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isdividedinto_round_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          }
        ]
      }
      conference: {
        Row: {
          conference_name: string
          conference_unique: string
          league_unique: string
        }
        Insert: {
          conference_name: string
          conference_unique: string
          league_unique: string
        }
        Update: {
          conference_name?: string
          conference_unique?: string
          league_unique?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_isdividedby_conference_fk"
            columns: ["league_unique"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["league_unique"]
          }
        ]
      }
      game: {
        Row: {
          competition_id: number
          game_date: string
          game_id: number
          game_time: string | null
          league1_unique: string | null
          league2_unique: string | null
          round_num: number
          team_1_id: string
          team_2_id: string
        }
        Insert: {
          competition_id?: number
          game_date: string
          game_id?: number
          game_time?: string | null
          league1_unique?: string | null
          league2_unique?: string | null
          round_num: number
          team_1_id: string
          team_2_id: string
        }
        Update: {
          competition_id?: number
          game_date?: string
          game_id?: number
          game_time?: string | null
          league1_unique?: string | null
          league2_unique?: string | null
          round_num?: number
          team_1_id?: string
          team_2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "round_iscomprisedof_game_fk"
            columns: ["round_num", "competition_id"]
            isOneToOne: false
            referencedRelation: "competitionround"
            referencedColumns: ["round_num", "competition_id"]
          },
          {
            foreignKeyName: "team1_playsin_game_fk"
            columns: ["league1_unique", "team_1_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["league_unique", "team_unique"]
          },
          {
            foreignKeyName: "team2_playsin_game_fk"
            columns: ["league2_unique", "team_2_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["league_unique", "team_unique"]
          }
        ]
      }
      league: {
        Row: {
          league_name: string
          league_unique: string
          sport: string
          womens: boolean | null
        }
        Insert: {
          league_name: string
          league_unique: string
          sport: string
          womens?: boolean | null
        }
        Update: {
          league_name?: string
          league_unique?: string
          sport?: string
          womens?: boolean | null
        }
        Relationships: []
      }
      player: {
        Row: {
          player_name: string
          player_unique: string
          position: string | null
        }
        Insert: {
          player_name: string
          player_unique: string
          position?: string | null
        }
        Update: {
          player_name?: string
          player_unique?: string
          position?: string | null
        }
        Relationships: []
      }
      player_competition: {
        Row: {
          competition_id: number
          inactive: boolean
          league_unique: string
          note: string | null
          player_stats: Json | null
          player_unique: string
          stats_thru: string | null
          team_unique: string
        }
        Insert: {
          competition_id?: number
          inactive: boolean
          league_unique: string
          note?: string | null
          player_stats?: Json | null
          player_unique: string
          stats_thru?: string | null
          team_unique: string
        }
        Update: {
          competition_id?: number
          inactive?: boolean
          league_unique?: string
          note?: string | null
          player_stats?: Json | null
          player_unique?: string
          stats_thru?: string | null
          team_unique?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_isplayedby_player_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "player_playsin_competition_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          },
          {
            foreignKeyName: "team_plays_player_competition_fk"
            columns: ["team_unique", "league_unique"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["team_unique", "league_unique"]
          }
        ]
      }
      player_game: {
        Row: {
          assists: number
          blocks: number
          game_id: number
          player_unique: string
          points: number
          rebounds: number
        }
        Insert: {
          assists?: number
          blocks?: number
          game_id?: number
          player_unique: string
          points: number
          rebounds?: number
        }
        Update: {
          assists?: number
          blocks?: number
          game_id?: number
          player_unique?: string
          points?: number
          rebounds?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_isplayedby_players_fk"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "game"
            referencedColumns: ["game_id"]
          },
          {
            foreignKeyName: "game_isplayedby_players_fk"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "players_in_games_view"
            referencedColumns: ["game_id"]
          },
          {
            foreignKeyName: "player_playsin_game_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          }
        ]
      }
      pool: {
        Row: {
          competition_id: number
          currency: string
          point_value: number
          pool_id: number
          poolmeta_id: number
        }
        Insert: {
          competition_id?: number
          currency: string
          point_value: number
          pool_id?: number
          poolmeta_id?: number
        }
        Update: {
          competition_id?: number
          currency?: string
          point_value?: number
          pool_id?: number
          poolmeta_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "competition_isbetonby_pool_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "group_hosts_pool_fk"
            columns: ["poolmeta_id"]
            isOneToOne: false
            referencedRelation: "poolmeta"
            referencedColumns: ["poolmeta_id"]
          }
        ]
      }
      poolmeta: {
        Row: {
          admin_user_id: string
          pool_name: string
          poolmeta_id: number
        }
        Insert: {
          admin_user_id: string
          pool_name: string
          poolmeta_id?: number
        }
        Update: {
          admin_user_id?: string
          pool_name?: string
          poolmeta_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "poolmeta_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "userprofile"
            referencedColumns: ["user_id"]
          }
        ]
      }
      poolrule_draft: {
        Row: {
          draft_num: number
          draft_order: number | null
          draft_time: string
          pool_id: number
          roster_count: number
          round_num: number | null
        }
        Insert: {
          draft_num?: number
          draft_order?: number | null
          draft_time: string
          pool_id?: number
          roster_count: number
          round_num?: number | null
        }
        Update: {
          draft_num?: number
          draft_order?: number | null
          draft_time?: string
          pool_id?: number
          roster_count?: number
          round_num?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poolrule_draft_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "poolrule_draft_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "poolrule_draft_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "poolrule_draft_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          }
        ]
      }
      poolrule_mvp: {
        Row: {
          mvp_round_end: number
          mvp_round_start: number
          out_money: boolean
          pool_id: number
        }
        Insert: {
          mvp_round_end: number
          mvp_round_start: number
          out_money: boolean
          pool_id: number
        }
        Update: {
          mvp_round_end?: number
          mvp_round_start?: number
          out_money?: boolean
          pool_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "pool_determinesrulesfor_mvp_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_determinesrulesfor_mvp_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_determinesrulesfor_mvp_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_determinesrulesfor_mvp_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          }
        ]
      }
      poolrule_prizesplit: {
        Row: {
          percent_split: number
          pool_id: number
          recipient: string
        }
        Insert: {
          percent_split: number
          pool_id: number
          recipient: string
        }
        Update: {
          percent_split?: number
          pool_id?: number
          recipient?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_determines_prizesplit_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_determines_prizesplit_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_determines_prizesplit_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_determines_prizesplit_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          }
        ]
      }
      roster: {
        Row: {
          pool_id: number
          roster_id: number
          roster_name: string | null
          user_id: string
        }
        Insert: {
          pool_id?: number
          roster_id?: number
          roster_name?: string | null
          user_id: string
        }
        Update: {
          pool_id?: number
          roster_id?: number
          roster_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "user_drafts_roster_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userprofile"
            referencedColumns: ["user_id"]
          }
        ]
      }
      roster_draftorder: {
        Row: {
          created_at: string | null
          draft_num: number
          draft_order: number
          roster_id: number
        }
        Insert: {
          created_at?: string | null
          draft_num: number
          draft_order: number
          roster_id?: number
        }
        Update: {
          created_at?: string | null
          draft_num?: number
          draft_order?: number
          roster_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "roster_draftorder_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_draftorder_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_full_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_draftorder_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_player_total_scores_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_draftorder_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_total_score_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_draftorder_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_player_game_scores"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_draftorder_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_total_score"
            referencedColumns: ["roster_id"]
          }
        ]
      }
      roster_player: {
        Row: {
          draft_num: number
          pick_number: number
          player_unique: string
          roster_id: number
          round_end: number
          round_start: number
        }
        Insert: {
          draft_num?: number
          pick_number: number
          player_unique: string
          roster_id?: number
          round_end: number
          round_start: number
        }
        Update: {
          draft_num?: number
          pick_number?: number
          player_unique?: string
          roster_id?: number
          round_end?: number
          round_start?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_comprises_roster_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_full_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_player_total_scores_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_total_score_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_player_game_scores"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_total_score"
            referencedColumns: ["roster_id"]
          }
        ]
      }
      rosterranking: {
        Row: {
          draft_num: number
          player_unique: string
          ranking: number
          roster_id: number
        }
        Insert: {
          draft_num: number
          player_unique: string
          ranking: number
          roster_id: number
        }
        Update: {
          draft_num?: number
          player_unique?: string
          ranking?: number
          roster_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_isrankedin_ranking_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_full_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_player_total_scores_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_total_score_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_player_game_scores"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_total_score"
            referencedColumns: ["roster_id"]
          }
        ]
      }
      team: {
        Row: {
          league_unique: string
          team_name: string
          team_unique: string
        }
        Insert: {
          league_unique: string
          team_name: string
          team_unique: string
        }
        Update: {
          league_unique?: string
          team_name?: string
          team_unique?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_isgoverningbodyof_team_fk"
            columns: ["league_unique"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["league_unique"]
          }
        ]
      }
      team_competition: {
        Row: {
          competition_id: number
          league_unique: string
          overall_seed: number | null
          region: string | null
          round_eliminated: number | null
          round_started: number | null
          seed: number
          stats_thru: string | null
          team_stats: Json | null
          team_unique: string
          team_win_loss: Json | null
        }
        Insert: {
          competition_id?: number
          league_unique: string
          overall_seed?: number | null
          region?: string | null
          round_eliminated?: number | null
          round_started?: number | null
          seed: number
          stats_thru?: string | null
          team_stats?: Json | null
          team_unique: string
          team_win_loss?: Json | null
        }
        Update: {
          competition_id?: number
          league_unique?: string
          overall_seed?: number | null
          region?: string | null
          round_eliminated?: number | null
          round_started?: number | null
          seed?: number
          stats_thru?: string | null
          team_stats?: Json | null
          team_unique?: string
          team_win_loss?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_iscompetedinby_team_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "team_competesin_competition_fk"
            columns: ["team_unique", "league_unique"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["team_unique", "league_unique"]
          }
        ]
      }
      userprofile: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          full_name: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          full_name?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          full_name?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "userprofile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      draft_order_view: {
        Row: {
          created_at: string | null
          draft_num: number | null
          draft_order: number | null
          pool_id: number | null
          roster_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "roster_draftorder_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_draftorder_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_full_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_draftorder_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_player_total_scores_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_draftorder_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_total_score_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_draftorder_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_player_game_scores"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_draftorder_roster_id_fkey"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_total_score"
            referencedColumns: ["roster_id"]
          }
        ]
      }
      draft_results_view: {
        Row: {
          competition_id: number | null
          draft_num: number | null
          draft_order: number | null
          pick_number: number | null
          player_name: string | null
          player_unique: string | null
          pool_id: number | null
          roster_id: number | null
          seed: number | null
          team_name: string | null
          team_unique: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isbetonby_pool_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "player_comprises_roster_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_full_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_player_total_scores_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_total_score_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_player_game_scores"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_total_score"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "user_drafts_roster_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userprofile"
            referencedColumns: ["user_id"]
          }
        ]
      }
      draft_view: {
        Row: {
          competition_id: number | null
          draft_num: number | null
          player_unique: string | null
          pool_id: number | null
          ranking: number | null
          roster_id: number | null
          round_eliminated: number | null
          team_unique: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isbetonby_pool_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "player_isrankedin_ranking_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_full_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_player_total_scores_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_total_score_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_player_game_scores"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_total_score"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "user_drafts_roster_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userprofile"
            referencedColumns: ["user_id"]
          }
        ]
      }
      player_total_score_view: {
        Row: {
          competition_id: number | null
          player_unique: string | null
          total_points: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isplayedby_player_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "player_playsin_competition_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          }
        ]
      }
      players_in_games_view: {
        Row: {
          competition_id: number | null
          game_date: string | null
          game_id: number | null
          game_time: string | null
          player_unique: string | null
          round_num: number | null
          team_unique: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_playsin_competition_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          },
          {
            foreignKeyName: "round_iscomprisedof_game_fk"
            columns: ["round_num", "competition_id"]
            isOneToOne: false
            referencedRelation: "competitionround"
            referencedColumns: ["round_num", "competition_id"]
          }
        ]
      }
      pool_full_view: {
        Row: {
          admin_user_id: string | null
          admin_username: string | null
          competition_id: number | null
          competition_unique: string | null
          currency: string | null
          daterange: unknown | null
          display_name: string | null
          identifier: string | null
          league_name: string | null
          league_unique: string | null
          official_name: string | null
          point_value: number | null
          pool_id: number | null
          pool_name: string | null
          poolmeta_id: number | null
          round_count: number | null
          season: string | null
          sport: string | null
          total_draft_count: number | null
          total_roster_count: number | null
          womens: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isbetonby_pool_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "competitionmeta_instantiates_competition_fk"
            columns: ["competition_unique"]
            isOneToOne: false
            referencedRelation: "competitionmeta"
            referencedColumns: ["competition_unique"]
          },
          {
            foreignKeyName: "group_hosts_pool_fk"
            columns: ["poolmeta_id"]
            isOneToOne: false
            referencedRelation: "poolmeta"
            referencedColumns: ["poolmeta_id"]
          },
          {
            foreignKeyName: "league_determines_competitiondetails_fk"
            columns: ["league_unique"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["league_unique"]
          },
          {
            foreignKeyName: "poolmeta_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "userprofile"
            referencedColumns: ["user_id"]
          }
        ]
      }
      ranking_full_view: {
        Row: {
          assists: Json | null
          competition_id: number | null
          conference: Json | null
          conference_losses: Json | null
          conference_wins: Json | null
          draft_num: number | null
          inactive: boolean | null
          losses: Json | null
          note: string | null
          overall_seed: number | null
          player_name: string | null
          player_stats: Json | null
          player_stats_thru: string | null
          player_unique: string | null
          points: Json | null
          pool_id: number | null
          position: string | null
          ranking: number | null
          rebounds: Json | null
          region: string | null
          roster_id: number | null
          round_eliminated: number | null
          round_started: number | null
          seed: number | null
          team_name: string | null
          team_stats: Json | null
          team_stats_thru: string | null
          team_unique: string | null
          team_win_loss: Json | null
          wins: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isbetonby_pool_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "player_isrankedin_ranking_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_full_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_player_total_scores_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_total_score_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_player_game_scores"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_isdeterminedby_ranking_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_total_score"
            referencedColumns: ["roster_id"]
          }
        ]
      }
      roster_active_players_view: {
        Row: {
          active_players: number | null
          pool_id: number | null
          roster_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_full_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_player_total_scores_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_total_score_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_player_game_scores"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_total_score"
            referencedColumns: ["roster_id"]
          }
        ]
      }
      roster_full_view: {
        Row: {
          admin_user_id: string | null
          competition_id: number | null
          currency: string | null
          daterange: unknown | null
          full_name: string | null
          point_value: number | null
          pool_id: number | null
          pool_name: string | null
          poolmeta_id: number | null
          rankings_submitted: number | null
          roster_id: number | null
          roster_name: string | null
          total_draft_count: number | null
          total_roster_count: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isbetonby_pool_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "group_hosts_pool_fk"
            columns: ["poolmeta_id"]
            isOneToOne: false
            referencedRelation: "poolmeta"
            referencedColumns: ["poolmeta_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "poolmeta_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "userprofile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_drafts_roster_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userprofile"
            referencedColumns: ["user_id"]
          }
        ]
      }
      roster_player_total_scores_view: {
        Row: {
          competition_id: number | null
          overall_seed: number | null
          pick_number: number | null
          player_name: string | null
          player_unique: string | null
          pool_id: number | null
          roster_id: number | null
          roster_name: string | null
          round_end: number | null
          round_start: number | null
          seed: number | null
          team_name: string | null
          team_unique: string | null
          total_player_points: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isbetonby_pool_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "player_comprises_roster_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "user_drafts_roster_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userprofile"
            referencedColumns: ["user_id"]
          }
        ]
      }
      roster_total_score_view: {
        Row: {
          pool_id: number | null
          roster_id: number | null
          roster_name: string | null
          total_roster_points: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "user_drafts_roster_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userprofile"
            referencedColumns: ["user_id"]
          }
        ]
      }
      view_active_players: {
        Row: {
          competition_id: number | null
          player_unique: string | null
          round_eliminated: number | null
          team_unique: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isplayedby_player_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "player_playsin_competition_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          }
        ]
      }
      view_available_players: {
        Row: {
          competition_id: number | null
          pick_number: number | null
          player_unique: string | null
          pool_id: number | null
          roster_id: number | null
          round_eliminated: number | null
          round_end: number | null
          round_start: number | null
          team_name: string | null
          team_unique: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isbetonby_pool_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "player_playsin_competition_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_full_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_player_total_scores_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_total_score_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_player_game_scores"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_total_score"
            referencedColumns: ["roster_id"]
          }
        ]
      }
      view_competition_player_full: {
        Row: {
          competition_id: number | null
          inactive: boolean | null
          note: string | null
          overall_seed: number | null
          player_name: string | null
          player_stats: Json | null
          player_stats_thru: string | null
          player_unique: string | null
          position: string | null
          region: string | null
          round_eliminated: number | null
          round_started: number | null
          seed: number | null
          team_name: string | null
          team_stats: Json | null
          team_stats_thru: string | null
          team_unique: string | null
          team_win_loss: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isplayedby_player_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "player_playsin_competition_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          }
        ]
      }
      view_pool_players_full: {
        Row: {
          competition_id: number | null
          inactive: boolean | null
          note: string | null
          overall_seed: number | null
          pick_number: number | null
          player_name: string | null
          player_stats: Json | null
          player_stats_thru: string | null
          player_unique: string | null
          pool_id: number | null
          position: string | null
          region: string | null
          roster_id: number | null
          round_eliminated: number | null
          round_end: number | null
          round_start: number | null
          round_started: number | null
          seed: number | null
          team_name: string | null
          team_stats: Json | null
          team_stats_thru: string | null
          team_unique: string | null
          team_win_loss: Json | null
          tournament_points: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isbetonby_pool_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "player_playsin_competition_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_full_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_player_total_scores_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "roster_total_score_view"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_player_game_scores"
            referencedColumns: ["roster_id"]
          },
          {
            foreignKeyName: "roster_iscomprisedof_player_fk"
            columns: ["roster_id"]
            isOneToOne: false
            referencedRelation: "view_roster_total_score"
            referencedColumns: ["roster_id"]
          }
        ]
      }
      view_roster_player_game_scores: {
        Row: {
          competition_id: number | null
          game_id: number | null
          player_unique: string | null
          points: number | null
          pool_id: number | null
          roster_id: number | null
          roster_name: string | null
          round_end: number | null
          round_num: number | null
          round_start: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isbetonby_pool_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "game_isplayedby_players_fk"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "game"
            referencedColumns: ["game_id"]
          },
          {
            foreignKeyName: "game_isplayedby_players_fk"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "players_in_games_view"
            referencedColumns: ["game_id"]
          },
          {
            foreignKeyName: "player_comprises_roster_fk"
            columns: ["player_unique"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["player_unique"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "user_drafts_roster_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userprofile"
            referencedColumns: ["user_id"]
          }
        ]
      }
      view_roster_total_score: {
        Row: {
          admin_user_id: string | null
          competition_id: number | null
          currency: string | null
          full_name: string | null
          point_value: number | null
          pool_id: number | null
          pool_name: string | null
          poolmeta_id: number | null
          rankings_submitted: number | null
          roster_id: number | null
          roster_name: string | null
          total_draft_count: number | null
          total_roster_count: number | null
          total_roster_points: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_isbetonby_pool_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "group_hosts_pool_fk"
            columns: ["poolmeta_id"]
            isOneToOne: false
            referencedRelation: "poolmeta"
            referencedColumns: ["poolmeta_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "pool_full_view"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_available_players"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "pool_iscomprisedof_roster_fk"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "view_pool_players_full"
            referencedColumns: ["pool_id"]
          },
          {
            foreignKeyName: "poolmeta_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "userprofile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_drafts_roster_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "userprofile"
            referencedColumns: ["user_id"]
          }
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
