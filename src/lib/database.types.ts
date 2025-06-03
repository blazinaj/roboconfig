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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
          organization_id: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          status: string
          created_at?: string | null
          updated_at?: string | null
          organization_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
          organization_id?: string | null
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
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      organization_invitations: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: string
          token: string
          expires_at: string
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role: string
          token: string
          expires_at: string
          created_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          role?: string
          token?: string
          expires_at?: string
          created_at?: string | null
        }
      }
      stripe_customers: {
        Row: {
          id: bigint
          user_id: string
          customer_id: string
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: bigint
          user_id: string
          customer_id: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: bigint
          user_id?: string
          customer_id?: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
      }
      stripe_subscriptions: {
        Row: {
          id: bigint
          customer_id: string
          subscription_id: string | null
          price_id: string | null
          current_period_start: bigint | null
          current_period_end: bigint | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
          status: string
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: bigint
          customer_id: string
          subscription_id?: string | null
          price_id?: string | null
          current_period_start?: bigint | null
          current_period_end?: bigint | null
          cancel_at_period_end?: boolean | null
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          status: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: bigint
          customer_id?: string
          subscription_id?: string | null
          price_id?: string | null
          current_period_start?: bigint | null
          current_period_end?: bigint | null
          cancel_at_period_end?: boolean | null
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
      }
      stripe_orders: {
        Row: {
          id: bigint
          checkout_session_id: string
          payment_intent_id: string
          customer_id: string
          amount_subtotal: bigint
          amount_total: bigint
          currency: string
          payment_status: string
          status: string
          created_at: string | null
          updated_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: bigint
          checkout_session_id: string
          payment_intent_id: string
          customer_id: string
          amount_subtotal: bigint
          amount_total: bigint
          currency: string
          payment_status: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: bigint
          checkout_session_id?: string
          payment_intent_id?: string
          customer_id?: string
          amount_subtotal?: bigint
          amount_total?: bigint
          currency?: string
          payment_status?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
          deleted_at?: string | null
        }
      }
    }
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          price_id: string | null
          current_period_start: bigint | null
          current_period_end: bigint | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
      stripe_user_orders: {
        Row: {
          customer_id: string | null
          order_id: bigint | null
          checkout_session_id: string | null
          payment_intent_id: string | null
          amount_subtotal: bigint | null
          amount_total: bigint | null
          currency: string | null
          payment_status: string | null
          order_status: string | null
          order_date: string | null
        }
      }
      user_organizations: {
        Row: {
          id: string | null
          name: string | null
          slug: string | null
          logo_url: string | null
          role: string | null
          created_at: string | null
        }
      }
      organization_users: {
        Row: {
          organization_id: string | null
          user_id: string | null
          email: string | null
          full_name: string | null
          role: string | null
          joined_at: string | null
        }
      }
    }
    Functions: {
      create_organization: {
        Args: {
          org_name: string
        }
        Returns: string
      }
      invite_organization_member: {
        Args: {
          org_id: string
          member_email: string
          member_role: string
        }
        Returns: string
      }
      slugify: {
        Args: {
          input: string
        }
        Returns: string
      }
    }
    Enums: {
      stripe_subscription_status: [
        "not_started",
        "incomplete",
        "incomplete_expired",
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "paused"
      ]
      stripe_order_status: [
        "pending",
        "completed",
        "canceled"
      ]
    }
  }
}