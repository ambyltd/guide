import { Request, Response } from 'express';
import UserActivity from '../models/UserActivity';
import ActivityLog from '../models/ActivityLog';
import UserStats from '../models/UserStats';
import { Attraction } from '../models/Attraction';

/**
 * GET /api/analytics/users/:userId/trends
 * Récupérer les tendances d'activité d'un utilisateur sur 7j ou 30j
 */
export const getUserTrends = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { timeframe = '7d' } = req.query;

    // Calculer la date de début selon le timeframe
    const days = timeframe === '7d' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Récupérer les activités agrégées
    const activities = await UserActivity.find({
      userId,
      date: { $gte: startDate },
    })
      .sort({ date: 1 })
      .select('-__v -createdAt -updatedAt');

    // Formater les données pour les graphiques
    const trendsData = activities.map((activity) => ({
      date: activity.date.toISOString().split('T')[0], // Format YYYY-MM-DD
      attractionsVisited: activity.attractionsVisited,
      audioGuidesListened: activity.audioGuidesListened,
      reviewCount: activity.reviewCount,
      totalListeningTime: activity.totalListeningTime,
      shareCount: activity.shareCount,
      favoriteCount: activity.favoriteCount,
    }));

    // Calculer les totaux sur la période
    const totals = activities.reduce(
      (acc, activity) => ({
        attractionsVisited: acc.attractionsVisited + activity.attractionsVisited,
        audioGuidesListened: acc.audioGuidesListened + activity.audioGuidesListened,
        reviewCount: acc.reviewCount + activity.reviewCount,
        totalListeningTime: acc.totalListeningTime + activity.totalListeningTime,
        shareCount: acc.shareCount + activity.shareCount,
        favoriteCount: acc.favoriteCount + activity.favoriteCount,
      }),
      {
        attractionsVisited: 0,
        audioGuidesListened: 0,
        reviewCount: 0,
        totalListeningTime: 0,
        shareCount: 0,
        favoriteCount: 0,
      }
    );

    res.json({
      success: true,
      data: {
        timeframe,
        period: `${days} jours`,
        trends: trendsData,
        totals,
      },
    });
  } catch (error) {
    console.error('Erreur getUserTrends:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des tendances',
    });
  }
};

/**
 * GET /api/analytics/users/:userId/compare
 * Comparer les stats d'un utilisateur avec la moyenne des autres utilisateurs
 */
export const compareWithPeers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Récupérer les stats de l'utilisateur
    const userStats = await UserStats.findOne({ userId });

    if (!userStats) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
      });
    }

    // Récupérer toutes les stats pour calculer les moyennes
    const allStats = await UserStats.find().select(
      'attractionsVisited audioGuidesListened toursCompleted totalListeningTime favoriteCount reviewCount shareCount'
    );

    const totalUsers = allStats.length;

    if (totalUsers === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucune donnée disponible pour la comparaison',
      });
    }

    // Calculer les moyennes
    const averages = allStats.reduce(
      (acc, stats) => ({
        attractionsVisited: acc.attractionsVisited + stats.attractionsVisited,
        audioGuidesListened: acc.audioGuidesListened + stats.audioGuidesListened,
        toursCompleted: acc.toursCompleted + stats.toursCompleted,
        totalListeningTime: acc.totalListeningTime + stats.totalListeningTime,
        favoriteCount: acc.favoriteCount + stats.favoriteCount,
        reviewCount: acc.reviewCount + stats.reviewCount,
        shareCount: acc.shareCount + (stats.shareCount || 0),
      }),
      {
        attractionsVisited: 0,
        audioGuidesListened: 0,
        toursCompleted: 0,
        totalListeningTime: 0,
        favoriteCount: 0,
        reviewCount: 0,
        shareCount: 0,
      }
    );

    // Diviser par le nombre d'utilisateurs pour obtenir les moyennes
    Object.keys(averages).forEach((key) => {
      averages[key as keyof typeof averages] = Math.round(
        averages[key as keyof typeof averages] / totalUsers
      );
    });

    // Calculer le rang de l'utilisateur (basé sur attractionsVisited)
    const sortedStats = allStats.sort(
      (a, b) => b.attractionsVisited - a.attractionsVisited
    );
    const rank = sortedStats.findIndex((s) => s.userId === userId) + 1;
    const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);

    res.json({
      success: true,
      data: {
        user: {
          userId: userStats.userId,
          userName: userStats.userName,
          stats: {
            attractionsVisited: userStats.attractionsVisited,
            audioGuidesListened: userStats.audioGuidesListened,
            toursCompleted: userStats.toursCompleted,
            totalListeningTime: userStats.totalListeningTime,
            favoriteCount: userStats.favoriteCount,
            reviewCount: userStats.reviewCount,
            shareCount: userStats.shareCount || 0,
          },
        },
        peers: {
          average: averages,
          rank,
          percentile,
          totalUsers,
        },
      },
    });
  } catch (error) {
    console.error('Erreur compareWithPeers:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la comparaison avec les pairs',
    });
  }
};

/**
 * GET /api/analytics/dashboard
 * Analytics globales pour admin (dashboard)
 */
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    // Stats globales
    const [totalUsers, totalAttractions, totalActivities, recentActivities] =
      await Promise.all([
        UserStats.countDocuments(),
        Attraction.countDocuments({ status: 'active' }),
        ActivityLog.countDocuments(),
        ActivityLog.find()
          .sort({ timestamp: -1 })
          .limit(20)
          .select('userId action attractionId timestamp'),
      ]);

    // Top attractions (les plus visitées)
    const topAttractions = await Attraction.find({ status: 'active' })
      .sort({ visitCount: -1 })
      .limit(10)
      .select('name visitCount rating');

    // Top utilisateurs (par attractions visitées)
    const topUsers = await UserStats.find()
      .sort({ attractionsVisited: -1 })
      .limit(10)
      .select('userId userName attractionsVisited audioGuidesListened reviewCount');

    // Calculer les totaux d'activité par action (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityByType = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalAttractions,
          totalActivities,
          period: '7 derniers jours',
        },
        topAttractions,
        topUsers,
        activityByType,
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Erreur getDashboardAnalytics:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des analytics',
    });
  }
};

/**
 * POST /api/analytics/track
 * Tracker une action utilisateur (créer un ActivityLog)
 */
export const trackAction = async (req: Request, res: Response) => {
  try {
    const { userId, action, attractionId, audioGuideId, tourId, metadata } =
      req.body;

    // Validation
    if (!userId || !action) {
      return res.status(400).json({
        success: false,
        error: 'userId et action sont requis',
      });
    }

    const validActions = [
      'visit',
      'listen',
      'review',
      'share',
      'favorite',
      'tour_start',
      'tour_complete',
    ];

    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: `action doit être l'une de: ${validActions.join(', ')}`,
      });
    }

    // Créer le log d'activité
    const activityLog = new ActivityLog({
      userId,
      action,
      attractionId,
      audioGuideId,
      tourId,
      metadata: metadata || {},
      timestamp: new Date(),
    });

    await activityLog.save();

    // Mettre à jour UserActivity (agrégation quotidienne)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let userActivity = await UserActivity.findOne({
      userId,
      date: today,
    });

    if (!userActivity) {
      userActivity = new UserActivity({
        userId,
        date: today,
      });
    }

    // Incrémenter le compteur selon l'action
    switch (action) {
      case 'visit':
        userActivity.attractionsVisited += 1;
        break;
      case 'listen':
        userActivity.audioGuidesListened += 1;
        if (metadata?.duration) {
          userActivity.totalListeningTime += metadata.duration;
        }
        break;
      case 'review':
        userActivity.reviewCount += 1;
        break;
      case 'share':
        userActivity.shareCount += 1;
        break;
      case 'favorite':
        userActivity.favoriteCount += 1;
        break;
    }

    await userActivity.save();

    res.json({
      success: true,
      data: {
        activityLog: {
          id: activityLog._id,
          action: activityLog.action,
          timestamp: activityLog.timestamp,
        },
      },
    });
  } catch (error) {
    console.error('Erreur trackAction:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du tracking de l\'action',
    });
  }
};
