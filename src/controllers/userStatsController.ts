import { Request, Response } from 'express';
import UserStats from '../models/UserStats';

// GET /api/users/:userId/stats - Récupérer les stats d'un utilisateur
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    let stats = await UserStats.findOne({ userId });

    // Si l'utilisateur n'a pas de stats, créer un profil vide
    if (!stats) {
      stats = new UserStats({
        userId,
        userName: 'Utilisateur',
      });
      await stats.save();
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Erreur getUserStats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des stats',
    });
  }
};

// PATCH /api/users/:userId/stats - Mettre à jour les stats d'un utilisateur
export const updateUserStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Liste des champs autorisés
    const allowedFields = [
      'userName',
      'attractionsVisited',
      'audioGuidesListened',
      'toursCompleted',
      'totalListeningTime',
      'favoriteCount',
      'reviewCount',
      'shareCount', // Sprint 4
      'badges',
    ];

    // Filtrer les champs non autorisés
    const filteredUpdates: any = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Ajouter lastActivityAt
    filteredUpdates.lastActivityAt = new Date();

    const stats = await UserStats.findOneAndUpdate(
      { userId },
      { $set: filteredUpdates },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Erreur updateUserStats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la mise à jour des stats',
    });
  }
};

// PATCH /api/users/:userId/stats/increment - Incrémenter des compteurs
export const incrementUserStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { field, value = 1 } = req.body;

    if (!field) {
      return res.status(400).json({
        success: false,
        error: 'Le champ field est requis',
      });
    }

    // Liste des champs autorisés pour incrémentation
    const allowedFields = [
      'attractionsVisited',
      'audioGuidesListened',
      'toursCompleted',
      'totalListeningTime',
      'favoriteCount',
      'reviewCount',
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        error: 'Champ non autorisé pour incrémentation',
      });
    }

    const increment: any = {};
    increment[field] = value;

    const stats = await UserStats.findOneAndUpdate(
      { userId },
      {
        $inc: increment,
        $set: { lastActivityAt: new Date() },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Erreur incrementUserStats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'incrémentation des stats',
    });
  }
};

// POST /api/users/:userId/stats/badge - Ajouter un badge
export const addBadge = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { badge } = req.body;

    if (!badge) {
      return res.status(400).json({
        success: false,
        error: 'Le badge est requis',
      });
    }

    const stats = await UserStats.findOneAndUpdate(
      { userId },
      {
        $addToSet: { badges: badge }, // Évite les doublons
        $set: { lastActivityAt: new Date() },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Erreur addBadge:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'ajout du badge',
    });
  }
};

// GET /api/users/leaderboard - Récupérer le classement des utilisateurs
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { sortBy = 'attractionsVisited', limit = '20', timeframe } = req.query;

    const limitNum = parseInt(limit as string);

    // Champs de tri autorisés
    const allowedSortFields = [
      'attractionsVisited',
      'audioGuidesListened',
      'toursCompleted',
      'totalListeningTime',
      'favoriteCount',
      'reviewCount',
      'shareCount', // Sprint 4
    ];

    const sortField = allowedSortFields.includes(sortBy as string)
      ? sortBy
      : 'attractionsVisited';

    const sortOption: any = {};
    sortOption[sortField as string] = -1;

    // Filtre temporel optionnel (7d, 30d, all)
    const query: any = {};
    if (timeframe === '7d' || timeframe === '30d') {
      const days = timeframe === '7d' ? 7 : 30;
      const date = new Date();
      date.setDate(date.getDate() - days);
      query.lastActivityAt = { $gte: date };
    }

    const leaderboard = await UserStats.find(query)
      .sort(sortOption)
      .limit(limitNum)
      .select('-__v');

    res.json({
      success: true,
      count: leaderboard.length,
      sortBy: sortField,
      timeframe: timeframe || 'all',
      data: leaderboard,
    });
  } catch (error) {
    console.error('Erreur getLeaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération du classement',
    });
  }
};
