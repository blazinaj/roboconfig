export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      components: {
        Row: {
          id: string
          name: string
          category: string
          type: string
          description: string | null
          specifications: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          category: string
          type: string
          description?: string | null
          specifications?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          type?: string
          description?: string | null
          specifications?: Json
          created_at?: string | null
          updated_at?: string | null
        }
      }
      risk_factors: {
        Row: {
          id: string
          component_id: string | null
          name: string
          severity: number
          probability: number
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          component_id?: string | null
          name: string
          severity: number
          probability: number
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          component_id?: string | null
          name?: string
          severity?: number
          probability?: number
          description?: string | null
          created_at?: string | null
        }
      }
      machines: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          status: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      machine_components: {
        Row: {
          machine_id: string
          component_id: string
          created_at: string | null
        }
        Insert: {
          machine_id: string
          component_id: string
          created_at?: string | null
        }
        Update: {
          machine_id?: string
          component_id?: string
          created_at?: string | null
        }
      }
      maintenance_schedules: {
        Row: {
          id: string
          machine_id: string | null
          frequency: string
          last_completed: string | null
          next_due: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          machine_id?: string | null
          frequency: string
          last_completed?: string | null
          next_due?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          machine_id?: string | null
          frequency?: string
          last_completed?: string | null
          next_due?: string | null
          created_at?: string | null
        }
      }
      maintenance_tasks: {
        Row: {
          id: string
          schedule_id: string | null
          name: string
          description: string | null
          priority: string
          estimated_duration: number
          completed: boolean | null
          completed_at: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          schedule_id?: string | null
          name: string
          description?: string | null
          priority: string
          estimated_duration: number
          completed?: boolean | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          schedule_id?: string | null
          name?: string
          description?: string | null
          priority?: string
          estimated_duration?: number
          completed?: boolean | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
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
  }
}