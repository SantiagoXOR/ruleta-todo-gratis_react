import { supabase } from '../lib/supabase';
import type { ClaimRow } from '../lib/supabase';

export const claimService = {
  async createClaim(claim: Omit<ClaimRow, 'id' | 'created_at' | 'claimed_at'>) {
    try {
      const { data, error } = await supabase
        .from('claims')
        .insert([{ ...claim, status: 'pending' }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear reclamación:', error);
      throw error;
    }
  },

  async getUserClaims(userId: string) {
    try {
      const { data, error } = await supabase
        .from('claims')
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
      console.error('Error al obtener reclamaciones del usuario:', error);
      throw error;
    }
  },

  async updateClaimStatus(claimId: string, status: ClaimRow['status']) {
    try {
      const updates: Partial<ClaimRow> = {
        status,
        ...(status === 'completed' ? { claimed_at: new Date().toISOString() } : {})
      };

      const { data, error } = await supabase
        .from('claims')
        .update(updates)
        .eq('id', claimId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar estado de reclamación:', error);
      throw error;
    }
  },

  async getClaimById(claimId: string) {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          prizes (
            name,
            description,
            image_url
          )
        `)
        .eq('id', claimId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener reclamación:', error);
      throw error;
    }
  },

  async getPendingClaims() {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          prizes (
            name,
            description,
            image_url
          ),
          users (
            email,
            name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener reclamaciones pendientes:', error);
      throw error;
    }
  }
}; 