export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      closet_items: {
        Row: {
          added_at: string
          clothing_item_id: string
          id: string
          is_favorite: boolean
          photo_url: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          clothing_item_id: string
          id?: string
          is_favorite?: boolean
          photo_url?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          clothing_item_id?: string
          id?: string
          is_favorite?: boolean
          photo_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "closet_items_clothing_item_id_fkey"
            columns: ["clothing_item_id"]
            isOneToOne: false
            referencedRelation: "clothing_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closet_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clothing_items: {
        Row: {
          brand: string | null
          category: Database["public"]["Enums"]["clothing_category"]
          created_at: string
          created_by: string | null
          id: string
          is_custom: boolean
          name: string
        }
        Insert: {
          brand?: string | null
          category: Database["public"]["Enums"]["clothing_category"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_custom?: boolean
          name: string
        }
        Update: {
          brand?: string | null
          category?: Database["public"]["Enums"]["clothing_category"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_custom?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "clothing_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at: string
          created_by: string | null
          equipment: Database["public"]["Enums"]["equipment_type"]
          id: string
          instructions: string | null
          is_custom: boolean
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          created_by?: string | null
          equipment: Database["public"]["Enums"]["equipment_type"]
          id?: string
          instructions?: string | null
          is_custom?: boolean
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          created_by?: string | null
          equipment?: Database["public"]["Enums"]["equipment_type"]
          id?: string
          instructions?: string | null
          is_custom?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_weight_lbs: number | null
          experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null
          full_name: string | null
          goal_weight_lbs: number | null
          height_inches: number | null
          id: string
          onboarding_completed_at: string | null
          updated_at: string
          workout_location:
            | Database["public"]["Enums"]["workout_location"]
            | null
          workouts_per_week: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_weight_lbs?: number | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          full_name?: string | null
          goal_weight_lbs?: number | null
          height_inches?: number | null
          id: string
          onboarding_completed_at?: string | null
          updated_at?: string
          workout_location?:
            | Database["public"]["Enums"]["workout_location"]
            | null
          workouts_per_week?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_weight_lbs?: number | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          full_name?: string | null
          goal_weight_lbs?: number | null
          height_inches?: number | null
          id?: string
          onboarding_completed_at?: string | null
          updated_at?: string
          workout_location?:
            | Database["public"]["Enums"]["workout_location"]
            | null
          workouts_per_week?: number | null
        }
        Relationships: []
      }
      sets: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_warmup: boolean
          reps: number | null
          rpe: number | null
          set_number: number
          weight: number | null
          workout_exercise_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_warmup?: boolean
          reps?: number | null
          rpe?: number | null
          set_number: number
          weight?: number | null
          workout_exercise_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_warmup?: boolean
          reps?: number | null
          rpe?: number | null
          set_number?: number
          weight?: number | null
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      training_splits: {
        Row: {
          day_of_week: number
          id: string
          label: string | null
          muscle_focus: Database["public"]["Enums"]["exercise_category"][]
          updated_at: string
          user_id: string
        }
        Insert: {
          day_of_week: number
          id?: string
          label?: string | null
          muscle_focus?: Database["public"]["Enums"]["exercise_category"][]
          updated_at?: string
          user_id: string
        }
        Update: {
          day_of_week?: number
          id?: string
          label?: string | null
          muscle_focus?: Database["public"]["Enums"]["exercise_category"][]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_splits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          order_index?: number
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      personal_records: {
        Row: {
          achieved_at: string | null
          estimated_1rm: number | null
          exercise_id: string | null
          exercise_name: string | null
          reps: number | null
          user_id: string | null
          weight: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      clothing_category:
        | "top"
        | "bottom"
        | "outerwear"
        | "footwear"
        | "accessory"
      equipment_type:
        | "barbell"
        | "dumbbell"
        | "machine"
        | "cable"
        | "bodyweight"
        | "kettlebell"
        | "other"
        | "band"
        | "sled"
        | "medicine_ball"
        | "sandbag"
      exercise_category:
        | "chest"
        | "back"
        | "shoulders"
        | "arms"
        | "legs"
        | "core"
        | "cardio"
        | "full_body"
        | "biceps"
        | "triceps"
        | "forearms"
        | "quads"
        | "hamstrings"
        | "glutes"
        | "calves"
        | "olympic"
        | "mobility"
      experience_level: "beginner" | "intermediate" | "advanced"
      workout_location: "home" | "gym" | "both"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      clothing_category: [
        "top",
        "bottom",
        "outerwear",
        "footwear",
        "accessory",
      ],
      equipment_type: [
        "barbell",
        "dumbbell",
        "machine",
        "cable",
        "bodyweight",
        "kettlebell",
        "other",
        "band",
        "sled",
        "medicine_ball",
        "sandbag",
      ],
      exercise_category: [
        "chest",
        "back",
        "shoulders",
        "arms",
        "legs",
        "core",
        "cardio",
        "full_body",
        "biceps",
        "triceps",
        "forearms",
        "quads",
        "hamstrings",
        "glutes",
        "calves",
        "olympic",
        "mobility",
      ],
      experience_level: ["beginner", "intermediate", "advanced"],
      workout_location: ["home", "gym", "both"],
    },
  },
} as const
