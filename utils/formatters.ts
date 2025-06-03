import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Formatage des montants en GNF
export const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'GNF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Formatage des dates en français
export const formatDate = (date: string | Date): string => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
};

// Formatage des dates avec l'heure en français
export const formatDateTime = (date: string | Date): string => {
    return format(new Date(date), 'dd MMMM yyyy à HH:mm', { locale: fr });
}; 