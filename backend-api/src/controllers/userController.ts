import { Request, Response } from 'express';
import { User } from '../models/User';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { 
      role,
      active = true,
      limit = 20, 
      page = 1 
    } = req.query;

    const filter: any = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (active !== 'all') {
      filter.active = active === 'true' || active === true;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const users = await User.find(filter)
      .select('-password') // Exclure le mot de passe
      .skip(skip)
      .limit(parseInt(limit as string))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // L'ID de l'utilisateur est disponible dans req.user (ajouté par le middleware d'auth)
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    const user = await User.findOne({ firebaseUid: userId }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profil utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur getUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      firebaseUid,
      email,
      displayName,
      firstName,
      lastName,
      phoneNumber,
      nationality,
      language,
      role
    } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [
        { firebaseUid },
        { email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email ou UID Firebase existe déjà'
      });
    }

    const user = new User({
      firebaseUid,
      email,
      displayName,
      firstName,
      lastName,
      phoneNumber,
      nationality,
      language: language || 'fr',
      role: role || 'user'
    });

    await user.save();

    // Retourner l'utilisateur sans le mot de passe
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: userResponse
    });
  } catch (error) {
    console.error('Erreur createUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Empêcher la modification de certains champs sensibles
    delete updateData.firebaseUid;
    delete updateData.password;
    delete updateData.createdAt;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: user
    });
  } catch (error) {
    console.error('Erreur updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    // Empêcher la modification de certains champs sensibles
    delete updateData.firebaseUid;
    delete updateData.email;
    delete updateData.role;
    delete updateData.password;
    delete updateData.createdAt;

    const user = await User.findOneAndUpdate(
      { firebaseUid: userId },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profil utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: user
    });
  } catch (error) {
    console.error('Erreur updateUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur désactivé avec succès',
      data: user
    });
  } catch (error) {
    console.error('Erreur deactivateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la désactivation de l\'utilisateur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const activateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id,
      { active: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur activé avec succès',
      data: user
    });
  } catch (error) {
    console.error('Erreur activateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'activation de l\'utilisateur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Rôle utilisateur mis à jour avec succès',
      data: user
    });
  } catch (error) {
    console.error('Erreur changeUserRole:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de rôle',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};
