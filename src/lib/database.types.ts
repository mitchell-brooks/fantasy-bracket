export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
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
      }
      game: {
        Row: {
          competition_id: number
          game_date: string
          game_id: number
          game_time: string | null
          league_unique: string
          league_unique_1: string
          round_num: number
          team_1_id: string
          team_2_id: string
          winner: string
        }
        Insert: {
          competition_id?: number
          game_date: string
          game_id?: number
          game_time?: string | null
          league_unique: string
          league_unique_1: string
          round_num: number
          team_1_id: string
          team_2_id: string
          winner: string
        }
        Update: {
          competition_id?: number
          game_date?: string
          game_id?: number
          game_time?: string | null
          league_unique?: string
          league_unique_1?: string
          round_num?: number
          team_1_id?: string
          team_2_id?: string
          winner?: string
        }
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
          assists: number
          blocks: number
          game_id?: number
          player_unique: string
          points: number
          rebounds: number
        }
        Update: {
          assists?: number
          blocks?: number
          game_id?: number
          player_unique?: string
          points?: number
          rebounds?: number
        }
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
      }
      roster: {
        Row: {
          draft_order: number
          pool_id: number
          roster_id: number
          roster_name: string
          user_id: string
        }
        Insert: {
          draft_order: number
          pool_id?: number
          roster_id?: number
          roster_name: string
          user_id: string
        }
        Update: {
          draft_order?: number
          pool_id?: number
          roster_id?: number
          roster_name?: string
          user_id?: string
        }
      }
      roster_player: {
        Row: {
          player_unique: string
          roster_id: number
          round_end: number
          round_start: number
        }
        Insert: {
          player_unique: string
          roster_id?: number
          round_end: number
          round_start: number
        }
        Update: {
          player_unique?: string
          roster_id?: number
          round_end?: number
          round_start?: number
        }
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
      }
      user_pool: {
        Row: {
          pool_id: number
          user_id: string
        }
        Insert: {
          pool_id: number
          user_id: string
        }
        Update: {
          pool_id?: number
          user_id?: string
        }
      }
      userprofile: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
      }
    }
    Views: {
      draft_view: {
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
