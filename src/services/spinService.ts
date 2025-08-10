import { supabase } from '../lib/supabase';
import type { SpinRow } from '../lib/supabase';

export const spinService = {
  async createSpin(spin: Omit<SpinRow, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('spins')
        .insert([spin])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear giro:', error);
      throw error;
    }
  },

  async getUserSpins(userId: string) {
    try {
      const { data, error } = await supabase
        .from('spins')
        .select(`
          *,
          prizes (
            name,
            description,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener giros del usuario:', error);
      throw error;
    }
  },

  async getWinningSpins(userId: string) {
    try {
      const { data, error } = await supabase
        .from('spins')
        .select(`
          *,
          prizes (
            name,
            description,
            image_url
          )
        `)
        .eq('user_id', userId)
        .eq('is_winner', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener giros ganadores:', error);
      throw error;
    }
  },

  async getSpinById(spinId: string) {
    try {
      const { data, error } = await supabase
        .from('spins')
        .select(`
          *,
          prizes (
            name,
            description,
            image_url
          )
        `)
        .eq('id', spinId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener giro:', error);
      throw error;
    }
  }
}; 