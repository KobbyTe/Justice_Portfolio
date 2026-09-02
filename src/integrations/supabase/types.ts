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
      about_content: {
        Row: {
          about_description: string | null
          created_at: string | null
          description: string | null
          hero_description: string | null
          id: string
          location: string | null
          profile_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          about_description?: string | null
          created_at?: string | null
          description?: string | null
          hero_description?: string | null
          id?: string
          location?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          about_description?: string | null
          created_at?: string | null
          description?: string | null
          hero_description?: string | null
          id?: string
          location?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      appointment_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_available: boolean
          slot_date: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_available?: boolean
          slot_date: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_available?: boolean
          slot_date?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      auth_attempts: {
        Row: {
          attempted_at: string
          id: string
          identifier_hash: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          identifier_hash: string
        }
        Update: {
          attempted_at?: string
          id?: string
          identifier_hash?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          content: string
          created_at: string
          email: string
          id: string
          is_approved: boolean | null
          name: string
          parent_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          email: string
          id?: string
          is_approved?: boolean | null
          name: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          email?: string
          id?: string
          is_approved?: boolean | null
          name?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_likes: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          post_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          post_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          post_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          featured_video_url: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          read_time_minutes: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          featured_video_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          featured_video_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          read_time_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          apple_event_id: string | null
          created_at: string
          email: string
          google_event_id: string | null
          id: string
          message: string | null
          name: string
          phone: string | null
          slot_id: string
          status: string
          updated_at: string
        }
        Insert: {
          apple_event_id?: string | null
          created_at?: string
          email: string
          google_event_id?: string | null
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          slot_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          apple_event_id?: string | null
          created_at?: string
          email?: string
          google_event_id?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          slot_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "appointment_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_active: boolean | null
          media_type: string | null
          sort_order: number | null
          title: string
          updated_at: string
          video_url: string | null
          video_webm_url: string | null
          webp_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          media_type?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
          video_url?: string | null
          video_webm_url?: string | null
          webp_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          media_type?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
          video_url?: string | null
          video_webm_url?: string | null
          webp_url?: string | null
        }
        Relationships: []
      }
      hero_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      impact_metrics: {
        Row: {
          created_at: string
          girls_mentored: number
          id: string
          schools_taught: number
          students_impacted: number
          teachers_trained: number
          updated_at: string
          years_of_experience: number
          years_of_mentoring: number
        }
        Insert: {
          created_at?: string
          girls_mentored?: number
          id?: string
          schools_taught?: number
          students_impacted?: number
          teachers_trained?: number
          updated_at?: string
          years_of_experience?: number
          years_of_mentoring?: number
        }
        Update: {
          created_at?: string
          girls_mentored?: number
          id?: string
          schools_taught?: number
          students_impacted?: number
          teachers_trained?: number
          updated_at?: string
          years_of_experience?: number
          years_of_mentoring?: number
        }
        Relationships: []
      }
      page_views: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          page_path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          page_path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      partner_logos: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: Database["public"]["Enums"]["project_category"]
          created_at: string | null
          description: string | null
          github_url: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          project_url: string | null
          technologies: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["project_category"]
          created_at?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          project_url?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["project_category"]
          created_at?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          project_url?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      rate_limit_events: {
        Row: {
          bucket: string
          created_at: string
          id: string
        }
        Insert: {
          bucket: string
          created_at?: string
          id?: string
        }
        Update: {
          bucket?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      recommendation_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          recommender_email: string | null
          recommender_name: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean
          recommender_email?: string | null
          recommender_name: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          recommender_email?: string | null
          recommender_name?: string
          token?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          company: string | null
          created_at: string
          id: string
          is_active: boolean | null
          linkedin_url: string | null
          message: string
          name: string
          position: string | null
          recommender_image_url: string | null
          sort_order: number | null
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          linkedin_url?: string | null
          message: string
          name: string
          position?: string | null
          recommender_image_url?: string | null
          sort_order?: number | null
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          linkedin_url?: string | null
          message?: string
          name?: string
          position?: string | null
          recommender_image_url?: string | null
          sort_order?: number | null
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resume_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_url: string
          id: string
          is_current: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_url: string
          id?: string
          is_current?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_url?: string
          id?: string
          is_current?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          percentage: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          percentage?: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          percentage?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          platform: string
          sort_order: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          sort_order?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          sort_order?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      tech_stack: {
        Row: {
          category: string | null
          created_at: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wall_messages: {
        Row: {
          affiliation: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          message: string
          name: string
          updated_at: string
        }
        Insert: {
          affiliation?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          message: string
          name: string
          updated_at?: string
        }
        Update: {
          affiliation?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          message?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_clear_failures: { Args: { _identifier: string }; Returns: undefined }
      auth_lockout_seconds: { Args: { _identifier: string }; Returns: number }
      auth_record_failure: { Args: { _identifier: string }; Returns: number }
      check_rate_limit: {
        Args: {
          _bucket: string
          _max_requests: number
          _window_seconds: number
        }
        Returns: boolean
      }
      delete_own_blog_like: {
        Args: { _fingerprint: string; _post_id: string }
        Returns: undefined
      }
      get_blog_like_count: { Args: { _post_id: string }; Returns: number }
      get_blog_post_with_stats: {
        Args: { post_slug: string }
        Returns: {
          category: string
          content: string
          excerpt: string
          featured_image_url: string
          id: string
          like_count: number
          published_at: string
          read_time_minutes: number
          slug: string
          title: string
        }[]
      }
      has_liked_post: {
        Args: { _fingerprint: string; _post_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mark_recommendation_token_used: {
        Args: { _token: string }
        Returns: undefined
      }
      validate_recommendation_token: {
        Args: { _token: string }
        Returns: {
          expires_at: string
          id: string
          status: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      project_category: "Robotics" | "Web app" | "Mobile app" | "AI"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
      project_category: ["Robotics", "Web app", "Mobile app", "AI"],
    },
  },
} as const
