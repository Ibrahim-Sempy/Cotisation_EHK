// Supabase database types

export interface Member {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  created_at?: string;
}

export interface Contribution {
  id: number;
  type: string;
  description: string;
  montant_unitaire: number;
  date_echeance: string | null;
  created_at?: string;
}

export interface Payment {
  id: number;
  membre_id: number;
  cotisation_id: number;
  payer: boolean;
  date_paiement: string | null;
  created_at?: string;
  // Join fields
  membre?: Member;
  cotisation?: Contribution;
}

export interface PaymentSummary {
  total_members: number;
  total_paid: number;
  total_unpaid: number;
  total_amount_collected: number;
  total_amount_due: number;
}

export interface MemberPaymentStatus {
  member: Member;
  paid: boolean;
  payment_id?: number;
  payment_date?: string | null;
}