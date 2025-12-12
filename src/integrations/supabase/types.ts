export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      assessment_sessions: {
        Row: {
          assessment_id: string;
          completed_at: string | null;
          created_at: string;
          current_question_index: number | null;
          id: string;
          is_completed: boolean | null;
          last_activity_at: string | null;
          score: number | null;
          security_violations: Json | null;
          started_at: string;
          time_elapsed_seconds: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          assessment_id: string;
          completed_at?: string | null;
          created_at?: string;
          current_question_index?: number | null;
          id?: string;
          is_completed?: boolean | null;
          last_activity_at?: string | null;
          score?: number | null;
          security_violations?: Json | null;
          started_at?: string;
          time_elapsed_seconds?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          assessment_id?: string;
          completed_at?: string | null;
          created_at?: string;
          current_question_index?: number | null;
          id?: string;
          is_completed?: boolean | null;
          last_activity_at?: string | null;
          score?: number | null;
          security_violations?: Json | null;
          started_at?: string;
          time_elapsed_seconds?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_sessions_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          }
        ];
      };
      assessments: {
        Row: {
          available_from: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          duration_minutes: number;
          id: string;
          is_active: boolean | null;
          max_attempts: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          available_from?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          duration_minutes: number;
          id?: string;
          is_active?: boolean | null;
          max_attempts?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          available_from?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          is_active?: boolean | null;
          max_attempts?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          is_admin: boolean | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          is_admin?: boolean | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          is_admin?: boolean | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          assessment_id: string;
          correct_answer: string | null;
          created_at: string;
          id: string;
          options: Json | null;
          order_index: number;
          points: number;
          question_text: string;
          question_type: string;
          updated_at: string;
        };
        Insert: {
          assessment_id: string;
          correct_answer?: string | null;
          created_at?: string;
          id?: string;
          options?: Json | null;
          order_index: number;
          points?: number;
          question_text: string;
          question_type: string;
          updated_at?: string;
        };
        Update: {
          assessment_id?: string;
          correct_answer?: string | null;
          created_at?: string;
          id?: string;
          options?: Json | null;
          order_index?: number;
          points?: number;
          question_text?: string;
          question_type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: false;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          }
        ];
      };
      user_answers: {
        Row: {
          answer: string | null;
          created_at: string;
          id: string;
          is_correct: boolean | null;
          question_id: string;
          session_id: string;
          updated_at: string;
        };
        Insert: {
          answer?: string | null;
          created_at?: string;
          id?: string;
          is_correct?: boolean | null;
          question_id: string;
          session_id: string;
          updated_at?: string;
        };
        Update: {
          answer?: string | null;
          created_at?: string;
          id?: string;
          is_correct?: boolean | null;
          question_id?: string;
          session_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_answers_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "assessment_sessions";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: { uid: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
