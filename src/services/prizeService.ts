import { supabase } from '../lib/supabase';
import type { PrizeRow } from '../lib/supabase';

export const prizeService = {
  async getAllPrizes() {
    try {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener premios:', error);
      throw error;
    }
  },

  async getActivePrizes() {
    try {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .eq('is_active', true)
        .order('probability', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener premios activos:', error);
      throw error;
    }
  },

  async createPrize(prize: Omit<PrizeRow, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('prizes')
        .insert([prize])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear premio:', error);
      throw error;
    }
  },

  async updatePrize(id: string, updates: Partial<PrizeRow>) {
    try {
      const { data, error } = await supabase
        .from('prizes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar premio:', error);
      throw error;
    }
  },

  async deletePrize(id: string) {
    try {
      const { error } = await supabase
        .from('prizes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar premio:', error);
      throw error;
    }
  },

  async decrementStock(id: string) {
    try {
      const { data, error } = await supabase.rpc('decrement_prize_stock', {
        prize_id: id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al decrementar stock:', error);
      throw error;
    }
  }
};
