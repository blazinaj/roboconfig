import { useState, useEffect, useRef } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { Machine, MachineFormData } from '../types';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Helper function to recursively convert date strings to Date objects
const convertDatesToDateObjects = (obj: any): any => {
  if (!obj) return obj;
  
  // If it's a string that looks like a date (ISO 8601 or YYYY-MM-DD)
  if (typeof obj === 'string' && 
      (/^\d{4}-\d{2}-\d{2}$/.test(obj) || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj))) {
    return new Date(obj);
  }
  
  // If it's an array, process each item
  if (Array.isArray(obj)) {
    return obj.map(item => convertDatesToDateObjects(item));
  }
  
  // If it's an object, process each property
  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = convertDatesToDateObjects(obj[key]);
      }
    }
    
    return result;
  }
  
  // Otherwise return the original value
  return obj;
};

export function useMachineAI() {
  const { session } = useSupabase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const sendMessage = async (
    content: string, 
    machine: Machine | MachineFormData, 
    onSuggestions?: (suggestions: Partial<Machine | MachineFormData>) => void
  ) => {
    if (!content.trim() || loading) return;

    // Add user message to chat
    const userMessage = { role: 'user' as const, content: content.trim() };
    if (mounted.current) {
      setMessages(prev => [...prev, userMessage]);
      setLoading(true);
      setError(null);
    }

    try {
      if (!session) {
        throw new Error('You must be logged in to use the AI assistant');
      }

      // Call the AI assistant Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            messages: [userMessage],
            machine
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      
      // Add AI response to chat
      if (mounted.current) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message 
        }]);
      }
      
      // If suggestions were provided and we have a callback, convert date strings to Date objects and call the callback
      if (data.suggestions && typeof onSuggestions === 'function' && mounted.current) {
        const processedSuggestions = convertDatesToDateObjects(data.suggestions);
        onSuggestions(processedSuggestions);
      }
      
    } catch (err) {
      console.error('Error getting AI response:', err);
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: `I'm sorry, but I encountered an error: ${err instanceof Error ? err.message : 'An unknown error occurred'}. Please try again.` 
          }
        ]);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const clearMessages = () => {
    if (mounted.current) {
      setMessages([]);
      setError(null);
    }
  };

  return {
    messages,
    setMessages,
    loading,
    error,
    sendMessage,
    clearMessages
  };
}

// For backward compatibility
export function useAIAssistant() {
  return useMachineAI();
}