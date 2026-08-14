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
      body_measurements: {
        Row: {
          arm_left_cm: number | null
          arm_right_cm: number | null
          body_fat_percent: number | null
          calf_left_cm: number | null
          calf_right_cm: number | null
          chest_cm: number | null
          client_id: string
          created_at: string
          forearm_left_cm: number | null
          forearm_right_cm: number | null
          hip_cm: number | null
          id: string
          measured_on: string
          neck_cm: number | null
          notes: string | null
          shoulder_cm: number | null
          thigh_left_cm: number | null
          thigh_right_cm: number | null
          updated_at: string
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_left_cm?: number | null
          arm_right_cm?: number | null
          body_fat_percent?: number | null
          calf_left_cm?: number | null
          calf_right_cm?: number | null
          chest_cm?: number | null
          client_id: string
          created_at?: string
          forearm_left_cm?: number | null
          forearm_right_cm?: number | null
          hip_cm?: number | null
          id?: string
          measured_on?: string
          neck_cm?: number | null
          notes?: string | null
          shoulder_cm?: number | null
          thigh_left_cm?: number | null
          thigh_right_cm?: number | null
          updated_at?: string
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_left_cm?: number | null
          arm_right_cm?: number | null
          body_fat_percent?: number | null
          calf_left_cm?: number | null
          calf_right_cm?: number | null
          chest_cm?: number | null
          client_id?: string
          created_at?: string
          forearm_left_cm?: number | null
          forearm_right_cm?: number | null
          hip_cm?: number | null
          id?: string
          measured_on?: string
          neck_cm?: number | null
          notes?: string | null
          shoulder_cm?: number | null
          thigh_left_cm?: number | null
          thigh_right_cm?: number | null
          updated_at?: string
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          display_order: number
          icon: string | null
          id: string
          name_en: string
          name_pt: string
          slug: string
        }
        Insert: {
          display_order?: number
          icon?: string | null
          id?: string
          name_en: string
          name_pt: string
          slug: string
        }
        Update: {
          display_order?: number
          icon?: string | null
          id?: string
          name_en?: string
          name_pt?: string
          slug?: string
        }
        Relationships: []
      }
      exercise_favorites: {
        Row: {
          created_at: string
          exercise_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_favorites_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_muscle_groups: {
        Row: {
          exercise_id: string
          muscle_group_id: string
          role: Database["public"]["Enums"]["muscle_role"]
        }
        Insert: {
          exercise_id: string
          muscle_group_id: string
          role?: Database["public"]["Enums"]["muscle_role"]
        }
        Update: {
          exercise_id?: string
          muscle_group_id?: string
          role?: Database["public"]["Enums"]["muscle_role"]
        }
        Relationships: [
          {
            foreignKeyName: "exercise_muscle_groups_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_muscle_groups_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_muscle_groups_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "v_muscle_group_volume"
            referencedColumns: ["muscle_group_id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["experience_level"]
          equipment_id: string | null
          force_type: Database["public"]["Enums"]["force_type"] | null
          id: string
          instructions: string[] | null
          is_public: boolean
          is_unilateral: boolean
          mechanic: Database["public"]["Enums"]["exercise_mechanic"] | null
          media_paths: string[] | null
          name_en: string | null
          name_pt: string
          primary_muscle_group_id: string
          search_terms: string | null
          search_vector: unknown
          slug: string | null
          thumbnail_path: string | null
          tips: string[] | null
          tracking_type: Database["public"]["Enums"]["tracking_type"]
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["experience_level"]
          equipment_id?: string | null
          force_type?: Database["public"]["Enums"]["force_type"] | null
          id?: string
          instructions?: string[] | null
          is_public?: boolean
          is_unilateral?: boolean
          mechanic?: Database["public"]["Enums"]["exercise_mechanic"] | null
          media_paths?: string[] | null
          name_en?: string | null
          name_pt: string
          primary_muscle_group_id: string
          search_terms?: string | null
          search_vector?: unknown
          slug?: string | null
          thumbnail_path?: string | null
          tips?: string[] | null
          tracking_type?: Database["public"]["Enums"]["tracking_type"]
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["experience_level"]
          equipment_id?: string | null
          force_type?: Database["public"]["Enums"]["force_type"] | null
          id?: string
          instructions?: string[] | null
          is_public?: boolean
          is_unilateral?: boolean
          mechanic?: Database["public"]["Enums"]["exercise_mechanic"] | null
          media_paths?: string[] | null
          name_en?: string | null
          name_pt?: string
          primary_muscle_group_id?: string
          search_terms?: string | null
          search_vector?: unknown
          slug?: string | null
          thumbnail_path?: string | null
          tips?: string[] | null
          tracking_type?: Database["public"]["Enums"]["tracking_type"]
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_primary_muscle_group_id_fkey"
            columns: ["primary_muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_primary_muscle_group_id_fkey"
            columns: ["primary_muscle_group_id"]
            isOneToOne: false
            referencedRelation: "v_muscle_group_volume"
            referencedColumns: ["muscle_group_id"]
          },
        ]
      }
      muscle_groups: {
        Row: {
          body_part: Database["public"]["Enums"]["body_part"]
          color_hex: string
          display_order: number
          id: string
          name_en: string
          name_pt: string
          slug: string
        }
        Insert: {
          body_part: Database["public"]["Enums"]["body_part"]
          color_hex?: string
          display_order?: number
          id?: string
          name_en: string
          name_pt: string
          slug: string
        }
        Update: {
          body_part?: Database["public"]["Enums"]["body_part"]
          color_hex?: string
          display_order?: number
          id?: string
          name_en?: string
          name_pt?: string
          slug?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_at: string
          exercise_id: string
          id: string
          previous_value: number | null
          record_type: Database["public"]["Enums"]["record_type"]
          reps: number | null
          session_set_id: string | null
          user_id: string
          value: number
          weight_kg: number | null
        }
        Insert: {
          achieved_at?: string
          exercise_id: string
          id?: string
          previous_value?: number | null
          record_type: Database["public"]["Enums"]["record_type"]
          reps?: number | null
          session_set_id?: string | null
          user_id: string
          value: number
          weight_kg?: number | null
        }
        Update: {
          achieved_at?: string
          exercise_id?: string
          id?: string
          previous_value?: number | null
          record_type?: Database["public"]["Enums"]["record_type"]
          reps?: number | null
          session_set_id?: string | null
          user_id?: string
          value?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_session_set_id_fkey"
            columns: ["session_set_id"]
            isOneToOne: false
            referencedRelation: "session_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_plan_id: string | null
          avatar_path: string | null
          birth_date: string | null
          created_at: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          height_cm: number | null
          id: string
          onboarding_completed: boolean
          primary_goal: Database["public"]["Enums"]["fitness_goal"]
          timezone: string
          updated_at: string
          username: string | null
          weekly_session_goal: number
        }
        Insert: {
          active_plan_id?: string | null
          avatar_path?: string | null
          birth_date?: string | null
          created_at?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          height_cm?: number | null
          id: string
          onboarding_completed?: boolean
          primary_goal?: Database["public"]["Enums"]["fitness_goal"]
          timezone?: string
          updated_at?: string
          username?: string | null
          weekly_session_goal?: number
        }
        Update: {
          active_plan_id?: string | null
          avatar_path?: string | null
          birth_date?: string | null
          created_at?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          height_cm?: number | null
          id?: string
          onboarding_completed?: boolean
          primary_goal?: Database["public"]["Enums"]["fitness_goal"]
          timezone?: string
          updated_at?: string
          username?: string | null
          weekly_session_goal?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_active_plan"
            columns: ["active_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_photos: {
        Row: {
          created_at: string
          id: string
          measurement_id: string | null
          pose: Database["public"]["Enums"]["photo_pose"]
          storage_path: string
          taken_on: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          measurement_id?: string | null
          pose?: Database["public"]["Enums"]["photo_pose"]
          storage_path: string
          taken_on?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          measurement_id?: string | null
          pose?: Database["public"]["Enums"]["photo_pose"]
          storage_path?: string
          taken_on?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_measurement_id_fkey"
            columns: ["measurement_id"]
            isOneToOne: false
            referencedRelation: "body_measurements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string
          device_name: string | null
          id: string
          last_used_at: string
          platform: Database["public"]["Enums"]["device_platform"]
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          id?: string
          last_used_at?: string
          platform: Database["public"]["Enums"]["device_platform"]
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          id?: string
          last_used_at?: string
          platform?: Database["public"]["Enums"]["device_platform"]
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_exercises: {
        Row: {
          client_id: string
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          session_id: string
          updated_at: string
          workout_exercise_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          order_index?: number
          session_id: string
          updated_at?: string
          workout_exercise_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          session_id?: string
          updated_at?: string
          workout_exercise_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_exercise_last_performance"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "session_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_exercises_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      session_sets: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          distance_m: number | null
          duration_seconds: number | null
          id: string
          is_completed: boolean
          notes: string | null
          reps: number | null
          rest_taken_seconds: number | null
          rpe: number | null
          session_exercise_id: string
          set_number: number
          set_type: Database["public"]["Enums"]["set_type"]
          side: string | null
          updated_at: string
          volume_kg: number | null
          weight_kg: number | null
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          distance_m?: number | null
          duration_seconds?: number | null
          id?: string
          is_completed?: boolean
          notes?: string | null
          reps?: number | null
          rest_taken_seconds?: number | null
          rpe?: number | null
          session_exercise_id: string
          set_number: number
          set_type?: Database["public"]["Enums"]["set_type"]
          side?: string | null
          updated_at?: string
          volume_kg?: number | null
          weight_kg?: number | null
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          distance_m?: number | null
          duration_seconds?: number | null
          id?: string
          is_completed?: boolean
          notes?: string | null
          reps?: number | null
          rest_taken_seconds?: number | null
          rpe?: number | null
          session_exercise_id?: string
          set_number?: number
          set_type?: Database["public"]["Enums"]["set_type"]
          side?: string | null
          updated_at?: string
          volume_kg?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_sets_session_exercise_id_fkey"
            columns: ["session_exercise_id"]
            isOneToOne: false
            referencedRelation: "session_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          achieved_at: string | null
          created_at: string
          current_value: number
          exercise_id: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          start_date: string
          start_value: number | null
          status: Database["public"]["Enums"]["goal_status"]
          target_date: string | null
          target_value: number
          title: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string
          current_value?: number
          exercise_id?: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id?: string
          start_date?: string
          start_value?: number | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          target_value: number
          title: string
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string
          current_value?: number
          exercise_id?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          start_date?: string
          start_value?: number | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          default_rest_seconds: number
          keep_screen_on: boolean
          language: string
          reminder_time: string
          reminder_weekdays: number[]
          rest_timer_auto_start: boolean
          rest_timer_sound: boolean
          rest_timer_vibrate: boolean
          theme: Database["public"]["Enums"]["theme_preference"]
          unit_system: Database["public"]["Enums"]["unit_system"]
          updated_at: string
          user_id: string
          weight_increment_kg: number
          workout_reminders_enabled: boolean
        }
        Insert: {
          created_at?: string
          default_rest_seconds?: number
          keep_screen_on?: boolean
          language?: string
          reminder_time?: string
          reminder_weekdays?: number[]
          rest_timer_auto_start?: boolean
          rest_timer_sound?: boolean
          rest_timer_vibrate?: boolean
          theme?: Database["public"]["Enums"]["theme_preference"]
          unit_system?: Database["public"]["Enums"]["unit_system"]
          updated_at?: string
          user_id: string
          weight_increment_kg?: number
          workout_reminders_enabled?: boolean
        }
        Update: {
          created_at?: string
          default_rest_seconds?: number
          keep_screen_on?: boolean
          language?: string
          reminder_time?: string
          reminder_weekdays?: number[]
          rest_timer_auto_start?: boolean
          rest_timer_sound?: boolean
          rest_timer_vibrate?: boolean
          theme?: Database["public"]["Enums"]["theme_preference"]
          unit_system?: Database["public"]["Enums"]["unit_system"]
          updated_at?: string
          user_id?: string
          weight_increment_kg?: number
          workout_reminders_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_days: {
        Row: {
          created_at: string
          estimated_minutes: number | null
          id: string
          label: string | null
          name: string
          notes: string | null
          order_index: number
          plan_id: string
          scheduled_weekday: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          label?: string | null
          name: string
          notes?: string | null
          order_index?: number
          plan_id: string
          scheduled_weekday?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          label?: string | null
          name?: string
          notes?: string | null
          order_index?: number
          plan_id?: string
          scheduled_weekday?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_days_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
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
          superset_group: number | null
          target_duration_seconds: number | null
          target_reps_max: number | null
          target_reps_min: number | null
          target_rest_seconds: number
          target_rpe: number | null
          target_sets: number
          target_weight_kg: number | null
          tempo: string | null
          updated_at: string
          workout_day_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          order_index?: number
          superset_group?: number | null
          target_duration_seconds?: number | null
          target_reps_max?: number | null
          target_reps_min?: number | null
          target_rest_seconds?: number
          target_rpe?: number | null
          target_sets?: number
          target_weight_kg?: number | null
          tempo?: string | null
          updated_at?: string
          workout_day_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          superset_group?: number | null
          target_duration_seconds?: number | null
          target_reps_max?: number | null
          target_reps_min?: number | null
          target_rest_seconds?: number
          target_rpe?: number | null
          target_sets?: number
          target_weight_kg?: number | null
          tempo?: string | null
          updated_at?: string
          workout_day_id?: string
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
            foreignKeyName: "workout_exercises_workout_day_id_fkey"
            columns: ["workout_day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          archived_at: string | null
          coach_id: string | null
          cover_path: string | null
          created_at: string
          days_per_week: number | null
          description: string | null
          duration_weeks: number | null
          goal: Database["public"]["Enums"]["fitness_goal"] | null
          id: string
          is_template: boolean
          level: Database["public"]["Enums"]["experience_level"] | null
          name: string
          owner_id: string | null
          source: Database["public"]["Enums"]["plan_source"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          coach_id?: string | null
          cover_path?: string | null
          created_at?: string
          days_per_week?: number | null
          description?: string | null
          duration_weeks?: number | null
          goal?: Database["public"]["Enums"]["fitness_goal"] | null
          id?: string
          is_template?: boolean
          level?: Database["public"]["Enums"]["experience_level"] | null
          name: string
          owner_id?: string | null
          source?: Database["public"]["Enums"]["plan_source"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          coach_id?: string | null
          cover_path?: string | null
          created_at?: string
          days_per_week?: number | null
          description?: string | null
          duration_weeks?: number | null
          goal?: Database["public"]["Enums"]["fitness_goal"] | null
          id?: string
          is_template?: boolean
          level?: Database["public"]["Enums"]["experience_level"] | null
          name?: string
          owner_id?: string | null
          source?: Database["public"]["Enums"]["plan_source"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plans_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          client_id: string
          created_at: string
          duration_seconds: number | null
          feeling: number | null
          finished_at: string | null
          id: string
          name: string
          notes: string | null
          perceived_effort: number | null
          plan_id: string | null
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          total_reps: number
          paused_seconds: number
          total_sets: number
          total_volume_kg: number
          updated_at: string
          user_id: string
          workout_day_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          duration_seconds?: number | null
          feeling?: number | null
          finished_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          perceived_effort?: number | null
          plan_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          total_reps?: number
          paused_seconds?: number
          total_sets?: number
          total_volume_kg?: number
          updated_at?: string
          user_id: string
          workout_day_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          duration_seconds?: number | null
          feeling?: number | null
          finished_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          perceived_effort?: number | null
          plan_id?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          total_reps?: number
          paused_seconds?: number
          total_sets?: number
          total_volume_kg?: number
          updated_at?: string
          user_id?: string
          workout_day_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_workout_day_id_fkey"
            columns: ["workout_day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_exercise_last_performance: {
        Row: {
          exercise_id: string | null
          performed_at: string | null
          reps: number | null
          session_id: string | null
          user_id: string | null
          volume_kg: number | null
          weight_kg: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_muscle_group_volume: {
        Row: {
          muscle_group_id: string | null
          name_pt: string | null
          sets: number | null
          slug: string | null
          user_id: string | null
          volume_kg: number | null
          week_start: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_weekly_volume: {
        Row: {
          duration_seconds: number | null
          sessions: number | null
          sets: number | null
          user_id: string | null
          volume_kg: number | null
          week_start: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_read_exercise: { Args: { p_exercise_id: string }; Returns: boolean }
      copy_plan_template: {
        Args: { p_new_name?: string; p_plan_id: string }
        Returns: string
      }
      delete_my_account: { Args: never; Returns: undefined }
      estimate_1rm: {
        Args: { p_reps: number; p_weight: number }
        Returns: number
      }
      finish_workout_session: {
        Args: {
          p_effort?: number
          p_feeling?: number
          p_notes?: string
          p_session_id: string
        }
        Returns: Json
      }
      get_dashboard_summary: { Args: never; Returns: Json }
      get_exercise_history: {
        Args: { p_exercise_id: string; p_limit?: number }
        Returns: {
          best_volume_kg: number
          best_weight_kg: number
          estimated_1rm: number
          performed_at: string
          session_id: string
          total_sets: number
          total_volume: number
        }[]
      }
      immutable_unaccent: { Args: { "": string }; Returns: string }
      is_template_day: { Args: { p_day_id: string }; Returns: boolean }
      owns_day: { Args: { p_day_id: string }; Returns: boolean }
      owns_plan: { Args: { p_plan_id: string }; Returns: boolean }
      owns_session: { Args: { p_session_id: string }; Returns: boolean }
      owns_session_exercise: { Args: { p_se_id: string }; Returns: boolean }
      start_free_session: {
        Args: { p_client_id?: string; p_name?: string }
        Returns: string
      }
      start_workout_session: {
        Args: { p_client_id?: string; p_workout_day_id: string }
        Returns: string
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      body_part: "upper" | "lower" | "core" | "full_body"
      device_platform: "ios" | "android"
      exercise_mechanic: "compound" | "isolation"
      experience_level: "beginner" | "intermediate" | "advanced"
      fitness_goal:
        | "lose_fat"
        | "gain_muscle"
        | "gain_strength"
        | "endurance"
        | "health"
        | "maintenance"
      force_type: "push" | "pull" | "static"
      gender_type: "male" | "female" | "other" | "undisclosed"
      goal_status: "active" | "achieved" | "expired" | "cancelled"
      goal_type:
        | "weekly_sessions"
        | "body_weight"
        | "exercise_1rm"
        | "total_volume"
        | "body_measurement"
      muscle_role: "primary" | "secondary"
      photo_pose: "front" | "side" | "back" | "other"
      plan_source: "system" | "user" | "coach"
      record_type:
        | "max_weight"
        | "max_reps"
        | "max_volume_set"
        | "max_volume_session"
        | "estimated_1rm"
        | "best_duration"
        | "best_distance"
      session_status: "in_progress" | "paused" | "completed" | "cancelled"
      set_type: "warmup" | "normal" | "drop" | "failure" | "backoff" | "amrap"
      theme_preference: "light" | "dark" | "system"
      tracking_type:
        | "weight_reps"
        | "reps_only"
        | "duration"
        | "distance_duration"
        | "weight_duration"
      unit_system: "metric" | "imperial"
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
      body_part: ["upper", "lower", "core", "full_body"],
      device_platform: ["ios", "android"],
      exercise_mechanic: ["compound", "isolation"],
      experience_level: ["beginner", "intermediate", "advanced"],
      fitness_goal: [
        "lose_fat",
        "gain_muscle",
        "gain_strength",
        "endurance",
        "health",
        "maintenance",
      ],
      force_type: ["push", "pull", "static"],
      gender_type: ["male", "female", "other", "undisclosed"],
      goal_status: ["active", "achieved", "expired", "cancelled"],
      goal_type: [
        "weekly_sessions",
        "body_weight",
        "exercise_1rm",
        "total_volume",
        "body_measurement",
      ],
      muscle_role: ["primary", "secondary"],
      photo_pose: ["front", "side", "back", "other"],
      plan_source: ["system", "user", "coach"],
      record_type: [
        "max_weight",
        "max_reps",
        "max_volume_set",
        "max_volume_session",
        "estimated_1rm",
        "best_duration",
        "best_distance",
      ],
      session_status: ["in_progress", "paused", "completed", "cancelled"],
      set_type: ["warmup", "normal", "drop", "failure", "backoff", "amrap"],
      theme_preference: ["light", "dark", "system"],
      tracking_type: [
        "weight_reps",
        "reps_only",
        "duration",
        "distance_duration",
        "weight_duration",
      ],
      unit_system: ["metric", "imperial"],
    },
  },
} as const

