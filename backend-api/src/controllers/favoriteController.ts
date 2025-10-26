import { Request, Response } from 'express';
import Favorite from '../models/Favorite';
import UserStats from '../models/UserStats';
import { Attraction } from '../models/Attraction';
import mongoose from 'mongoose';

// POST /api/favorites - Ajouter un favori
export const addFavorite = async (req: Request, res: Response) => {
  try {
    // Utiliser le userId du token Firebase (authentification requise)
    const userId = req.user?.uid;
    const { userName, attractionId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise',
      });
    }

    if (!attractionId) {
      return res.status(400).json({
        success: false,
        error: 'attractionId est requis',
      });
    }

    // Vérifier que l'attraction existe
    const attraction = await Attraction.findById(attractionId);
    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: 'Attraction non trouvée',
      });
    }

    // Créer le favori (unique index gère les doublons)
    const favorite = new Favorite({
      userId,
      attractionId,
    });

    await favorite.save();

    // Mettre à jour les stats utilisateur
    await UserStats.findOneAndUpdate(
      { userId },
      {
        $inc: { favoriteCount: 1 },
        $set: { lastActivityAt: new Date(), userName: userName || req.user?.email || 'User' },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Doublon
      return res.status(200).json({
        success: true,
        message: 'Favori déjà existant',
      });
    }

    console.error('Erreur addFavorite:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'ajout du favori',
    });
  }
};

// DELETE /api/favorites/:attractionId - Supprimer un favori
export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const { attractionId } = req.params;
    // Support userId from query param (like checkFavorite) OR token Firebase
    const userId = (req.query.userId as string) || req.user?.uid;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId requis',
      });
    }

    const favorite = await Favorite.findOneAndDelete({
      userId,
      attractionId: new mongoose.Types.ObjectId(attractionId),
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: 'Favori non trouvé',
      });
    }

    // Mettre à jour les stats utilisateur
    await UserStats.findOneAndUpdate(
      { userId },
      {
        $inc: { favoriteCount: -1 },
        $set: { lastActivityAt: new Date() },
      }
    );

    res.json({
      success: true,
      message: 'Favori supprimé',
    });
  } catch (error) {
    console.error('Erreur removeFavorite:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la suppression du favori',
    });
  }
};

// GET /api/favorites - Récupérer tous les favoris d'un utilisateur
export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    // Support userId from query (for debug/fallback) OR token Firebase (preferred)
    const queryUserId = req.query.userId as string | undefined;
    const userId = queryUserId || req.user?.uid;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId requis',
      });
    }

    const favorites = await Favorite.find({ userId })
      .populate('attractionId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    console.error('Erreur getUserFavorites:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des favoris',
    });
  }
};

// GET /api/favorites/check/:attractionId - Vérifier si une attraction est en favori
export const checkFavorite = async (req: Request, res: Response) => {
  try {
    const { attractionId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId requis',
      });
    }

    const favorite = await Favorite.findOne({
      userId: userId as string,
      attractionId: new mongoose.Types.ObjectId(attractionId),
    });

    res.json({
      success: true,
      data: {
        isFavorite: !!favorite,
      },
    });
  } catch (error) {
    console.error('Erreur checkFavorite:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la vérification du favori',
    });
  }
};
