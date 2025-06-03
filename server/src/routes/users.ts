import express from 'express';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Récupérer tous les utilisateurs (admin seulement)
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer un utilisateur spécifique
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour un utilisateur
router.put('/:id', auth, async (req, res) => {
    try {
        const { username, email, role } = req.body;
        const user = await User.findById(req.params.id);

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
        if (role) user.role = role;
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

// Supprimer un utilisateur
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        await user.deleteOne();
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 