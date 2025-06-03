import express, { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

const router = express.Router();

// Inscription
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email ou nom d\'utilisateur est déjà utilisé' });
        }

        // Créer le nouvel utilisateur
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Générer le token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'votre_secret_jwt_super_securise',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
        );

        res.status(201).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            },
            token
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Connexion
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        // Trouver l'utilisateur
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        // Mettre à jour la dernière connexion
        user.lastLogin = new Date();
        await user.save();

        // Générer le token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'votre_secret_jwt_super_securise',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
        );

        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            },
            token
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Déconnexion
router.post('/logout', auth, async (req: AuthRequest, res: Response) => {
    try {
        // Dans une implémentation réelle, vous pourriez vouloir invalider le token
        // ou le mettre dans une liste noire
        res.json({ message: 'Déconnexion réussie' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer les informations de l'utilisateur connecté
router.get('/me', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Non autorisé' });
        }

        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour le profil
router.put('/profile', auth, async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Non autorisé' });
        }

        const { username, email } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier si le nouveau username ou email est déjà utilisé
        if (username !== user.username || email !== user.email) {
            const existingUser = await User.findOne({
                $or: [
                    { username, _id: { $ne: user._id } },
                    { email, _id: { $ne: user._id } }
                ]
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Cet email ou nom d\'utilisateur est déjà utilisé' });
            }
        }

        user.username = username;
        user.email = email;
        await user.save();

        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 