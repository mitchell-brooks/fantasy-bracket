export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      Competition: {
        Row: {
          competition_id: number
          competition_short: string
          identifier: string
          round_count: number
        }
        Insert: {
          competition_id?: number
          competition_short: string
          identifier: string
          round_count: number
        }
        Update: {
          competition_id?: number
          competition_short?: string
          identifier?: string
          round_count?: number
        }
      }
      CompetitionDetails: {
        Row: {
          competition_short: string
          display_name: string
          league_unique: string
          official_name: string
        }
        Insert: {
          competition_short: string
          display_name: string
          league_unique: string
          official_name: string
        }
        Update: {
          competition_short?: string
          display_name?: string
          league_unique?: string
          official_name?: string
        }
      }
      Game: {
        Row: {
          competition_id: number
          game_date: string
          game_id: number
          game_time: string | null
          round_num: number
          team_1_id: string
          team_2_id: string
        }
        Insert: {
          competition_id?: number
          game_date: string
          game_id?: number
          game_time?: string | null
          round_num: number
          team_1_id: string
          team_2_id: string
        }
        Update: {
          competition_id?: number
          game_date?: string
          game_id?: number
          game_time?: string | null
          round_num?: number
          team_1_id?: string
          team_2_id?: string
        }
      }
      Group: {
        Row: {
          admin_user_id: string
          group_id: number
          group_name: string
        }
        Insert: {
          admin_user_id: string
          group_id?: number
          group_name: string
        }
        Update: {
          admin_user_id?: string
          group_id?: number
          group_name?: string
        }
      }
      League: {
        Row: {
          league_name: string
          league_unique: string
        }
        Insert: {
          league_name: string
          league_unique: string
        }
        Update: {
          league_name?: string
          league_unique?: string
        }
      }
      MVP: {
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
      Player: {
        Row: {
          player_name: string
          player_unique: string
          position: string
        }
        Insert: {
          player_name: string
          player_unique: string
          position: string
        }
        Update: {
          player_name?: string
          player_unique?: string
          position?: string
        }
      }
      Player_Competition: {
        Row: {
          competition_id: number
          inactive: boolean
          note: string | null
          player_unique: string
          team_id: string
        }
        Insert: {
          competition_id?: number
          inactive: boolean
          note?: string | null
          player_unique: string
          team_id: string
        }
        Update: {
          competition_id?: number
          inactive?: boolean
          note?: string | null
          player_unique?: string
          team_id?: string
        }
      }
      Player_Game: {
        Row: {
          assists: number
          game_id: number
          player_id: string
          points: number
          rebounds: number
        }
        Insert: {
          assists: number
          game_id?: number
          player_id: string
          points: number
          rebounds: number
        }
        Update: {
          assists?: number
          game_id?: number
          player_id?: string
          points?: number
          rebounds?: number
        }
      }
      Pool: {
        Row: {
          competition_id: number
          currency: string
          draft_time: string
          group_id: number
          point_value: number
          pool_id: number
          pool_name: string
          roster_count: number
        }
        Insert: {
          competition_id?: number
          currency: string
          draft_time: string
          group_id?: number
          point_value: number
          pool_id?: number
          pool_name: string
          roster_count: number
        }
        Update: {
          competition_id?: number
          currency?: string
          draft_time?: string
          group_id?: number
          point_value?: number
          pool_id?: number
          pool_name?: string
          roster_count?: number
        }
      }
      PrizeSplit: {
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
      Ranking: {
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
      Redraft: {
        Row: {
          pool_id: number
          redraft_count: number
          redraft_time: string
          round_num: number
        }
        Insert: {
          pool_id?: number
          redraft_count: number
          redraft_time: string
          round_num: number
        }
        Update: {
          pool_id?: number
          redraft_count?: number
          redraft_time?: string
          round_num?: number
        }
      }
      Roster: {
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
      Roster_Player: {
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
      Round: {
        Row: {
          competition_id: number
          round_end: string
          round_name: string | null
          round_num: number
          round_start: string
        }
        Insert: {
          competition_id?: number
          round_end: string
          round_name?: string | null
          round_num: number
          round_start: string
        }
        Update: {
          competition_id?: number
          round_end?: string
          round_name?: string | null
          round_num?: number
          round_start?: string
        }
      }
      Team: {
        Row: {
          league_unique: string
          team_id: string
          team_name: string
        }
        Insert: {
          league_unique: string
          team_id: string
          team_name: string
        }
        Update: {
          league_unique?: string
          team_id?: string
          team_name?: string
        }
      }
      Team_Competition: {
        Row: {
          competition_id: number
          overall_seed: number | null
          region: string | null
          round_eliminated: number | null
          seed: number
          team_id: string
        }
        Insert: {
          competition_id?: number
          overall_seed?: number | null
          region?: string | null
          round_eliminated?: number | null
          seed: number
          team_id: string
        }
        Update: {
          competition_id?: number
          overall_seed?: number | null
          region?: string | null
          round_eliminated?: number | null
          seed?: number
          team_id?: string
        }
      }
      User: {
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
      User_Group: {
        Row: {
          group_id: number
          user_id: string
        }
        Insert: {
          group_id: number
          user_id: string
        }
        Update: {
          group_id?: number
          user_id?: string
        }
      }
      User_Pool: {
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
    }
    Views: {
      [_ in never]: never
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

