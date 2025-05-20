
import { supabase } from "@/integrations/supabase/client";

export const createTask = async (taskData: {
  assignment_id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  assigned_to?: string;
  due_date: string;
  completed_at?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error };
  }
};
