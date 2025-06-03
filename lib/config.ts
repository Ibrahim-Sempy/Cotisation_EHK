// Configuration de l'API
export const API_CONFIG = {
    // URL de base de l'API
    BASE_URL: 'https://api.sempy.dev',

    // URLs de développement
    DEV_URL: 'http://localhost:3000/api',

    // Configuration MongoDB
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority',

    // Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            PROFILE: '/auth/profile',
            ME: '/auth/me'
        },
        MEMBERS: {
            LIST: '/members',
            CREATE: '/members',
            UPDATE: '/members/:id',
            DELETE: '/members/:id'
        },
        CONTRIBUTIONS: {
            LIST: '/contributions',
            CREATE: '/contributions',
            UPDATE: '/contributions/:id',
            DELETE: '/contributions/:id'
        },
        PAYMENTS: {
            LIST: '/payments',
            CREATE: '/payments',
            UPDATE: '/payments/:id',
            DELETE: '/payments/:id'
        }
    }
};

// Fonction pour obtenir l'URL de base en fonction de l'environnement
export const getBaseUrl = () => {
    if (__DEV__) {
        return API_CONFIG.DEV_URL;
    }
    return API_CONFIG.BASE_URL;
}; 