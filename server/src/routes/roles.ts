import express from 'express';
import { Role } from '../models/Role';
import { auth } from '../middleware/auth';

const router = express.Router();

// Récupérer tous les rôles
router.get('/', auth, async (req, res) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Créer un nouveau rôle
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        // Vérifier si le rôle existe déjà
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Ce rôle existe déjà' });
        }

        const role = new Role({
            name,
            description,
            permissions
        });

        await role.save();
        res.status(201).json(role);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour un rôle
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Rôle non trouvé' });
        }

        // Vérifier si le nouveau nom est déjà utilisé
        if (name !== role.name) {
            const existingRole = await Role.findOne({ name, _id: { $ne: role._id } });
            if (existingRole) {
                return res.status(400).json({ message: 'Ce nom de rôle est déjà utilisé' });
            }
        }

        role.name = name;
        role.description = description;
        role.permissions = permissions;
        await role.save();

        res.json(role);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un rôle
router.delete('/:id', auth, async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Rôle non trouvé' });
        }

        await role.deleteOne();
        res.json({ message: 'Rôle supprimé avec succès' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 