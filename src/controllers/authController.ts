import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const register = async (req: Request, res: Response) => {
  try {
    const {
      firebaseUid,
      email,
      password,
      displayName,
      firstName,
      lastName,
      phoneNumber,
      nationality,
      language
    } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [
        { email },
        { firebaseUid }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hacher le mot de passe si fourni (pour compatibilité)
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const user = new User({
      firebaseUid,
      email,
      password: hashedPassword,
      displayName,
      firstName,
      lastName,
      phoneNumber,
      nationality,
      language: language || 'fr',
      role: 'user'
    });

    await user.save();

    // Générer un token JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        firebaseUid: user.firebaseUid,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Retourner l'utilisateur sans le mot de passe
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, firebaseUid } = req.body;

    let user;

    // Connexion via Firebase UID ou email/password
    if (firebaseUid) {
      user = await User.findOne({ firebaseUid });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }
    } else if (email && password) {
      user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Vérifier le mot de passe
      if (user.password) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: 'Mot de passe incorrect'
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentification par mot de passe non configurée'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Email/mot de passe ou Firebase UID requis'
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    // Mettre à jour la dernière connexion
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Générer un token JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        firebaseUid: user.firebaseUid,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Retourner l'utilisateur sans le mot de passe
    const userResponse = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Dans un système JWT stateless, le logout se fait côté client
    // On peut optionnellement blacklister le token ou nettoyer des données
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou désactivé'
      });
    }

    // Générer un nouveau token
    const token = jwt.sign(
      { 
        userId: user._id, 
        firebaseUid: user.firebaseUid,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Token rafraîchi avec succès',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Erreur refreshToken:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rafraîchissement du token',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou désactivé'
      });
    }

    res.json({
      success: true,
      message: 'Token valide',
      data: {
        user,
        valid: true
      }
    });
  } catch (error) {
    console.error('Erreur verifyToken:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du token',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le mot de passe actuel
    if (user.password) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe actuel incorrect'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Aucun mot de passe configuré pour ce compte'
      });
    }

    // Hacher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    console.error('Erreur changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe
      return res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      });
    }

    // TODO: Implémenter l'envoi d'email de réinitialisation
    // Pour l'instant, on simule le processus
    
    res.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
    });
  } catch (error) {
    console.error('Erreur forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la demande de réinitialisation',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};
