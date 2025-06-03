import { create } from 'zustand';
import { Member, Contribution, Payment, PaymentSummary } from '../types/schema';
import { supabase } from '../lib/supabase';

interface Store {
  // State
  members: Member[];
  contributions: Contribution[];
  payments: Payment[];
  selectedContribution: Contribution | null;
  loading: {
    members: boolean;
    contributions: boolean;
    payments: boolean;
  };
  error: string | null;

  // Member actions
  fetchMembers: () => Promise<void>;
  addMember: (member: Omit<Member, 'id' | 'created_at'>) => Promise<Member | null>;
  updateMember: (id: number, updates: Partial<Member>) => Promise<void>;
  deleteMember: (id: number) => Promise<void>;

  // Contribution actions
  fetchContributions: () => Promise<void>;
  addContribution: (contribution: Omit<Contribution, 'id' | 'created_at'>) => Promise<Contribution | null>;
  updateContribution: (id: number, updates: Partial<Contribution>) => Promise<void>;
  deleteContribution: (id: number) => Promise<void>;
  setSelectedContribution: (contribution: Contribution | null) => void;

  // Payment actions
  fetchPayments: () => Promise<void>;
  updatePaymentStatus: (paymentId: number | null, memberId: number, contributionId: number, paid: boolean, paymentDate?: string | null) => Promise<void>;
  getPaymentSummary: (contributionId: number) => PaymentSummary;
}

export const useStore = create<Store>((set, get) => ({
  members: [],
  contributions: [],
  payments: [],
  selectedContribution: null,
  loading: {
    members: false,
    contributions: false,
    payments: false,
  },
  error: null,

  // Member actions
  fetchMembers: async () => {
    set(state => ({ loading: { ...state.loading, members: true }, error: null }));
    try {
      const { data, error } = await supabase
        .from('membres')
        .select('*')
        .order('nom', { ascending: true });

      if (error) {
        console.error('Erreur lors du chargement des membres:', error);
        throw error;
      }

      console.log('Membres chargés:', data?.length || 0);
      set(state => ({
        members: data || [],
        loading: { ...state.loading, members: false }
      }));
    } catch (error: any) {
      set(state => ({
        error: error.message,
        loading: { ...state.loading, members: false }
      }));
    }
  },

  addMember: async (member) => {
    set({ error: null });
    try {
      const { data, error } = await supabase
        .from('membres')
        .insert([member])
        .select()
        .single();

      if (error) throw error;

      set(state => ({ members: [...state.members, data] }));
      return data;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },

  updateMember: async (id, updates) => {
    set({ error: null });
    try {
      const { error } = await supabase
        .from('membres')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        members: state.members.map(m => m.id === id ? { ...m, ...updates } : m)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteMember: async (id) => {
    set({ error: null });
    try {
      const { error } = await supabase
        .from('membres')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        members: state.members.filter(m => m.id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Contribution actions
  fetchContributions: async () => {
    set(state => ({ loading: { ...state.loading, contributions: true }, error: null }));
    try {
      const { data, error } = await supabase
        .from('cotisations')
        .select('*')
        .order('date_echeance', { ascending: false });

      if (error) throw error;
      set(state => ({
        contributions: data || [],
        loading: { ...state.loading, contributions: false }
      }));
    } catch (error: any) {
      set(state => ({
        error: error.message,
        loading: { ...state.loading, contributions: false }
      }));
    }
  },

  addContribution: async (contribution) => {
    set({ error: null });
    try {
      const { data, error } = await supabase
        .from('cotisations')
        .insert([contribution])
        .select()
        .single();

      if (error) throw error;

      set(state => ({ contributions: [...state.contributions, data] }));
      return data;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },

  updateContribution: async (id, updates) => {
    set({ error: null });
    try {
      const { error } = await supabase
        .from('cotisations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        contributions: state.contributions.map(c => c.id === id ? { ...c, ...updates } : c)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteContribution: async (id) => {
    set({ error: null });
    try {
      const { error } = await supabase
        .from('cotisations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        contributions: state.contributions.filter(c => c.id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  setSelectedContribution: (contribution) => {
    set({ selectedContribution: contribution });
  },

  // Payment actions
  fetchPayments: async () => {
    set(state => ({ loading: { ...state.loading, payments: true }, error: null }));
    try {
      const { data, error } = await supabase
        .from('paiements')
        .select(`
          *,
          membre:membre_id(id, nom, prenom, telephone),
          cotisation:cotisation_id(id, type, description, montant_unitaire, date_echeance)
        `);

      if (error) throw error;
      set(state => ({
        payments: data || [],
        loading: { ...state.loading, payments: false }
      }));
    } catch (error: any) {
      set(state => ({
        error: error.message,
        loading: { ...state.loading, payments: false }
      }));
    }
  },

  updatePaymentStatus: async (paymentId, memberId, contributionId, paid, paymentDate = null) => {
    set({ error: null });
    try {
      const payment = {
        membre_id: memberId,
        cotisation_id: contributionId,
        payer: paid,
        date_paiement: paid ? paymentDate || new Date().toISOString() : null,
      };

      let result;

      if (paymentId) {
        // Update existing payment
        result = await supabase
          .from('paiements')
          .update(payment)
          .eq('id', paymentId)
          .select();
      } else {
        // Create new payment
        result = await supabase
          .from('paiements')
          .insert([payment])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Erreur lors de la mise à jour du paiement:', result.error);
        throw result.error;
      }

      // Refresh payments
      await get().fetchPayments();
    } catch (error: any) {
      console.error('Erreur dans updatePaymentStatus:', error);
      set({ error: error.message });
    }
  },

  getPaymentSummary: (contributionId) => {
    const { members, payments, contributions } = get();
    const contribution = contributions.find(c => c.id === contributionId);

    if (!contribution) {
      return {
        total_members: 0,
        total_paid: 0,
        total_unpaid: 0,
        total_amount_collected: 0,
        total_amount_due: 0,
      };
    }

    const contributionPayments = payments.filter(p => p.cotisation_id === contributionId);
    const totalPaid = contributionPayments.filter(p => p.payer).length;

    return {
      total_members: members.length,
      total_paid: totalPaid,
      total_unpaid: members.length - totalPaid,
      total_amount_collected: totalPaid * contribution.montant_unitaire,
      total_amount_due: (members.length - totalPaid) * contribution.montant_unitaire,
    };
  },
}));