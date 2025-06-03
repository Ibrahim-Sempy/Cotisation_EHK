-- Création de la table membres
CREATE TABLE IF NOT EXISTS public.membres (
    id BIGSERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    telephone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Création de la table cotisations
CREATE TABLE IF NOT EXISTS public.cotisations (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    montant_unitaire DECIMAL(10,2) NOT NULL,
    date_echeance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Création de la table paiements
CREATE TABLE IF NOT EXISTS public.paiements (
    id BIGSERIAL PRIMARY KEY,
    membre_id BIGINT REFERENCES public.membres(id) ON DELETE CASCADE,
    cotisation_id BIGINT REFERENCES public.cotisations(id) ON DELETE CASCADE,
    payer BOOLEAN DEFAULT false,
    date_paiement TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(membre_id, cotisation_id)
);

-- Création des politiques de sécurité (RLS)
ALTER TABLE public.membres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;

-- Politiques pour les membres
CREATE POLICY "Enable read access for all users" ON public.membres
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.membres
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.membres
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.membres
    FOR DELETE USING (true);

-- Politiques pour les cotisations
CREATE POLICY "Enable read access for all users" ON public.cotisations
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.cotisations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.cotisations
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.cotisations
    FOR DELETE USING (true);

-- Politiques pour les paiements
CREATE POLICY "Enable read access for all users" ON public.paiements
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON public.paiements
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON public.paiements
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON public.paiements
    FOR DELETE USING (true); 