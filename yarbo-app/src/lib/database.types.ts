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
      applicants: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applicants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_id: string | null
          applied_at: string | null
          cover_letter: string | null
          evaluation_scores: Json | null
          hr_notes: string | null
          id: string
          job_id: string | null
          last_contacted_at: string | null
          notes: string | null
          priority: number | null
          rating: number | null
          resume_id: string | null
          reviewed_at: string | null
          source: string | null
          status: string
          tags: string[] | null
        }
        Insert: {
          applicant_id?: string | null
          applied_at?: string | null
          cover_letter?: string | null
          evaluation_scores?: Json | null
          hr_notes?: string | null
          id?: string
          job_id?: string | null
          last_contacted_at?: string | null
          notes?: string | null
          priority?: number | null
          rating?: number | null
          resume_id?: string | null
          reviewed_at?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
        }
        Update: {
          applicant_id?: string | null
          applied_at?: string | null
          cover_letter?: string | null
          evaluation_scores?: Json | null
          hr_notes?: string | null
          id?: string
          job_id?: string | null
          last_contacted_at?: string | null
          notes?: string | null
          priority?: number | null
          rating?: number | null
          resume_id?: string | null
          reviewed_at?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          created_at: string | null
          dimension: string | null
          id: number
          options: Json
          question_order: number | null
          question_text: string
          test_type_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dimension?: string | null
          id?: number
          options: Json
          question_order?: number | null
          question_text: string
          test_type_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dimension?: string | null
          id?: number
          options?: Json
          question_order?: number | null
          question_text?: string
          test_type_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_records: {
        Row: {
          answers: Json | null
          assessment_type_id: string | null
          candidate_email: string | null
          candidate_name: string | null
          created_at: string | null
          end_time: string | null
          id: string
          result: Json | null
          start_time: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          assessment_type_id?: string | null
          candidate_email?: string | null
          candidate_name?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          result?: Json | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          assessment_type_id?: string | null
          candidate_email?: string | null
          candidate_name?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          result?: Json | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_records_assessment_type_id_fkey"
            columns: ["assessment_type_id"]
            isOneToOne: false
            referencedRelation: "assessment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_results: {
        Row: {
          assessment_id: string | null
          career_suggestions: string[] | null
          communication_style: string | null
          created_at: string | null
          description: string | null
          detailed_analysis: string | null
          id: string
          overall_score: number | null
          personality_name: string | null
          personality_type: string | null
          recommendation: string | null
          scores: Json | null
          strengths: string[] | null
          team_role: string | null
          updated_at: string | null
          weaknesses: string[] | null
          work_style: string | null
        }
        Insert: {
          assessment_id?: string | null
          career_suggestions?: string[] | null
          communication_style?: string | null
          created_at?: string | null
          description?: string | null
          detailed_analysis?: string | null
          id?: string
          overall_score?: number | null
          personality_name?: string | null
          personality_type?: string | null
          recommendation?: string | null
          scores?: Json | null
          strengths?: string[] | null
          team_role?: string | null
          updated_at?: string | null
          weaknesses?: string[] | null
          work_style?: string | null
        }
        Update: {
          assessment_id?: string | null
          career_suggestions?: string[] | null
          communication_style?: string | null
          created_at?: string | null
          description?: string | null
          detailed_analysis?: string | null
          id?: string
          overall_score?: number | null
          personality_name?: string | null
          personality_type?: string | null
          recommendation?: string | null
          scores?: Json | null
          strengths?: string[] | null
          team_role?: string | null
          updated_at?: string | null
          weaknesses?: string[] | null
          work_style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "psychological_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_statistics: {
        Row: {
          assessment_type_id: string | null
          average_score: number | null
          completed_assessments: number | null
          completion_rate: number | null
          created_at: string | null
          date: string | null
          id: string
          total_assessments: number | null
          updated_at: string | null
        }
        Insert: {
          assessment_type_id?: string | null
          average_score?: number | null
          completed_assessments?: number | null
          completion_rate?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          total_assessments?: number | null
          updated_at?: string | null
        }
        Update: {
          assessment_type_id?: string | null
          average_score?: number | null
          completed_assessments?: number | null
          completion_rate?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          total_assessments?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_statistics_assessment_type_id_fkey"
            columns: ["assessment_type_id"]
            isOneToOne: false
            referencedRelation: "assessment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_types: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          icon?: string | null
          id: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      candidate_pools: {
        Row: {
          added_by: string | null
          applicant_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          pool_name: string
          priority: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          added_by?: string | null
          applicant_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          pool_name: string
          priority?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          added_by?: string | null
          applicant_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          pool_name?: string
          priority?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_pools_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          color_theme: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color_theme?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color_theme?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hr_activity_logs: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hr_departments: {
        Row: {
          created_at: string | null
          department_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_departments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          application_id: string | null
          created_at: string | null
          duration_minutes: number | null
          feedback: string | null
          id: string
          interview_type: string | null
          interviewer_id: string | null
          location: string | null
          meeting_link: string | null
          next_round: boolean | null
          rating: number | null
          scheduled_at: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          interviewer_id?: string | null
          location?: string | null
          meeting_link?: string | null
          next_round?: boolean | null
          rating?: number | null
          scheduled_at: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string | null
          interviewer_id?: string | null
          location?: string | null
          meeting_link?: string | null
          next_round?: boolean | null
          rating?: number | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_count: number | null
          benefits: string[] | null
          created_at: string | null
          department: string | null
          department_id: string | null
          description: string
          employment_type: string | null
          experience_level: string | null
          expires_at: string | null
          hr_notes: string | null
          id: string
          is_remote: boolean | null
          location: string
          location_id: string | null
          priority: number | null
          requirements: string[] | null
          responsibilities: string[] | null
          salary_display: string | null
          salary_max: number | null
          salary_min: number | null
          status: string
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          application_count?: number | null
          benefits?: string[] | null
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          description: string
          employment_type?: string | null
          experience_level?: string | null
          expires_at?: string | null
          hr_notes?: string | null
          id?: string
          is_remote?: boolean | null
          location?: string
          location_id?: string | null
          priority?: number | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary_display?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          application_count?: number | null
          benefits?: string[] | null
          created_at?: string | null
          department?: string | null
          department_id?: string | null
          description?: string
          employment_type?: string | null
          experience_level?: string | null
          expires_at?: string | null
          hr_notes?: string | null
          id?: string
          is_remote?: boolean | null
          location?: string
          location_id?: string | null
          priority?: number | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary_display?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "office_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          archived_at: string | null
          content: string
          created_at: string | null
          deleted_at: string | null
          id: string
          metadata: Json | null
          priority: string | null
          read_at: string | null
          receiver_id: string
          receiver_name: string
          receiver_role: string
          sender_id: string
          sender_name: string
          sender_role: string
          status: string | null
          title: string
          type: string
        }
        Insert: {
          archived_at?: string | null
          content: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          receiver_id: string
          receiver_name: string
          receiver_role: string
          sender_id: string
          sender_name: string
          sender_role: string
          status?: string | null
          title: string
          type: string
        }
        Update: {
          archived_at?: string | null
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          receiver_id?: string
          receiver_name?: string
          receiver_role?: string
          sender_id?: string
          sender_name?: string
          sender_role?: string
          status?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          browser_enabled: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          id: string
          notification_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          browser_enabled?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          notification_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          browser_enabled?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          notification_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_type: string | null
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
          user_role: string
        }
        Insert: {
          action_type?: string | null
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
          user_role: string
        }
        Update: {
          action_type?: string | null
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      office_locations: {
        Row: {
          address: string | null
          capacity: number | null
          city: string
          country: string | null
          created_at: string | null
          description: string | null
          email: string | null
          facilities: string[] | null
          id: string
          is_active: boolean | null
          is_remote: boolean | null
          name: string
          phone: string | null
          postal_code: string | null
          province: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          city: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facilities?: string[] | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          name: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          city?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facilities?: string[] | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      psychological_assessments: {
        Row: {
          answers: Json | null
          candidate_email: string
          candidate_name: string
          candidate_phone: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          position: string
          results: Json | null
          started_at: string | null
          status: string | null
          test_type_id: number | null
          updated_at: string | null
        }
        Insert: {
          answers?: Json | null
          candidate_email: string
          candidate_name: string
          candidate_phone?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          position: string
          results?: Json | null
          started_at?: string | null
          status?: string | null
          test_type_id?: number | null
          updated_at?: string | null
        }
        Update: {
          answers?: Json | null
          candidate_email?: string
          candidate_name?: string
          candidate_phone?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          position?: string
          results?: Json | null
          started_at?: string | null
          status?: string | null
          test_type_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psychological_assessments_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          applicant_id: string | null
          content_type: string
          file_path: string
          file_size: number
          filename: string
          id: string
          is_primary: boolean
          uploaded_at: string | null
        }
        Insert: {
          applicant_id?: string | null
          content_type?: string
          file_path: string
          file_size: number
          filename: string
          id?: string
          is_primary?: boolean
          uploaded_at?: string | null
        }
        Update: {
          applicant_id?: string | null
          content_type?: string
          file_path?: string
          file_size?: number
          filename?: string
          id?: string
          is_primary?: boolean
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resumes_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          application_id: string | null
          applicant_id: string | null
          benefits: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          job_id: string | null
          notes: string | null
          offered_at: string | null
          offered_by: string | null
          responded_at: string | null
          salary_amount: number | null
          salary_currency: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          applicant_id?: string | null
          benefits?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          offered_at?: string | null
          offered_by?: string | null
          responded_at?: string | null
          salary_amount?: number | null
          salary_currency?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          applicant_id?: string | null
          benefits?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          offered_at?: string | null
          offered_by?: string | null
          responded_at?: string | null
          salary_amount?: number | null
          salary_currency?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "applicants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_offered_by_fkey"
            columns: ["offered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      test_types: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          duration_minutes: number | null
          id: number
          name: string
          question_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          duration_minutes?: number | null
          id?: number
          name: string
          question_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          duration_minutes?: number | null
          id?: number
          name?: string
          question_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          last_login_at: string | null
          password_hash: string | null
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          last_login_at?: string | null
          password_hash?: string | null
          role?: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          last_login_at?: string | null
          password_hash?: string | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      get_unread_message_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_unread_notification_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      mark_all_notifications_read: {
        Args: { user_uuid: string }
        Returns: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
