import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Review } from '../models/Review';
import { Attraction } from '../models/Attraction';
import { Tour } from '../models/Tour';
import { AudioGuide } from '../models/AudioGuide';
import { AuthenticatedUser } from '../middleware/authMiddleware';

// Interface pour les requêtes authentifiées
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Modèles correspondants aux types d'items
const itemModels = {
  Attraction,
  Tour,
  AudioGuide,
};

/**
 * Met à jour la note moyenne et le nombre d'avis pour un élément donné.
 * @param itemType Le type de l'élément ('Attraction', 'Tour', 'AudioGuide')
 * @param itemId L'ID de l'élément
 */
const updateAverageRating = async (itemType: 'Attraction' | 'Tour' | 'AudioGuide', itemId: mongoose.Types.ObjectId) => {
  const stats = await Review.aggregate([
    { $match: { itemId, active: true } }, // Ne compter que les reviews actives
    {
      $group: {
        _id: '$itemId',
        rating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const updateData = stats.length > 0
    ? {
        rating: parseFloat(stats[0].rating.toFixed(2)), // Arrondir à 2 décimales
        reviewCount: stats[0].reviewCount,
      }
    : {
        rating: 0,
        reviewCount: 0,
      };

  // Mettre à jour selon le type d'élément
  switch (itemType) {
    case 'Attraction':
      await Attraction.findByIdAndUpdate(itemId, updateData);
      break;
    case 'Tour':
      await Tour.findByIdAndUpdate(itemId, updateData);
      break;
    case 'AudioGuide':
      await AudioGuide.findByIdAndUpdate(itemId, updateData);
      break;
  }
};

/**
 * Crée un nouvel avis.
 * Accessible par les utilisateurs de l'application mobile.
 */
export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId, itemType, rating, comment, userName, userAvatar } = req.body;
    
    // Utiliser l'UID Firebase
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié.' });
    }

    if (!itemId || !itemType || !rating) {
      return res.status(400).json({ success: false, message: 'itemId, itemType et rating sont requis.' });
    }

    // Valider le rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'La note doit être entre 1 et 5.' });
    }

    // Valider le type d'élément
    if (!['Attraction', 'Tour', 'AudioGuide'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Type d\'élément invalide.' });
    }

    // Vérifier si l'utilisateur a déjà noté cet élément
    const existingReview = await Review.findOne({ itemId, userId });
    if (existingReview) {
      return res.status(409).json({ success: false, message: 'Vous avez déjà noté cet élément.' });
    }

    const review = new Review({
      itemId,
      itemType,
      userId,
      userName, // Dénormalisé depuis le frontend
      userAvatar, // Dénormalisé depuis le frontend
      rating,
      comment,
    });

    await review.save();
    
    // Mettre à jour la note moyenne de manière asynchrone
    await updateAverageRating(itemType, new mongoose.Types.ObjectId(itemId));

    res.status(201).json({ success: true, data: review, message: 'Avis créé avec succès.' });
  } catch (error) {
    console.error('Erreur createReview:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'avis.' });
  }
};

/**
 * Récupère tous les avis pour un élément spécifique.
 */
export const getReviewsForItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const reviews = await Review.find({ itemId }).populate('userId', 'displayName photoURL');
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Erreur getReviewsForItem:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des avis.' });
  }
};

/**
 * Récupère tous les avis (pour le CMS).
 */
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, itemType, active, isModerated } = req.query;
    const filter: any = {};
    
    if (itemType) filter.itemType = itemType;
    if (active !== undefined) filter.active = active === 'true';
    if (isModerated !== undefined) filter.isModerated = isModerated === 'true';

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const reviews = await Review.find(filter)
      .populate('userId', 'displayName email')
      .populate('itemId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Erreur getAllReviews:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de tous les avis.' });
  }
};


/**
 * Supprime un avis (pour la modération par un admin).
 */
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Avis non trouvé.' });
    }

    await review.deleteOne();

    // Mettre à jour la note moyenne de manière asynchrone
    await updateAverageRating(review.itemType, review.itemId);

    res.json({ success: true, message: 'Avis supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur deleteReview:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l\'avis.' });
  }
};

/**
 * Active ou désactive un avis.
 */
export const toggleReviewActive = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID d\'avis invalide.' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Avis non trouvé.' });
    }

    review.active = active;
    await review.save();

    // Mettre à jour la note moyenne
    await updateAverageRating(review.itemType, review.itemId);

    res.json({ 
      success: true, 
      message: `Avis ${active ? 'activé' : 'désactivé'} avec succès.`,
      data: review
    });
  } catch (error) {
    console.error('Erreur toggleReviewActive:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la modification de l\'avis.' });
  }
};

/**
 * Modère un avis (approuve ou rejette).
 */
export const moderateReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isModerated, active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID d\'avis invalide.' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Avis non trouvé.' });
    }

    review.isModerated = isModerated;
    if (active !== undefined) {
      review.active = active;
    }
    await review.save();

    // Mettre à jour la note moyenne
    await updateAverageRating(review.itemType, review.itemId);

    res.json({ 
      success: true, 
      message: 'Avis modéré avec succès.',
      data: review
    });
  } catch (error) {
    console.error('Erreur moderateReview:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la modération de l\'avis.' });
  }
};

// ========== NOUVELLES FONCTIONS POUR MOBILE APP ==========

/**
 * Récupérer les reviews (pour mobile app)
 * GET /api/reviews?itemId=xxx&userId=xxx&active=true&page=1&limit=10
 * Note: Utilise itemId au lieu de attractionId (compatible avec le modèle existant)
 */
export const getReviews = async (req: Request, res: Response) => {
  try {
    const { itemId, attractionId, userId, active, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    // Support des deux formats: itemId (modèle actuel) et attractionId (mobile app)
    if (itemId) filter.itemId = itemId;
    if (attractionId) filter.itemId = attractionId;
    if (userId) filter.userId = userId;
    if (active !== undefined) filter.active = active === 'true';
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Review.countDocuments(filter);
    
    res.json({
      success: true,
      data: reviews,
      count: reviews.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Erreur getReviews:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des reviews.' });
  }
};

/**
 * Marquer une review comme utile
 * PATCH /api/reviews/:id/helpful
 * Note: Le modèle actuel n'a pas de champ 'helpful', cette fonction retourne simplement la review
 */
export const markReviewHelpful = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review non trouvée.' });
    }
    
    // Le modèle actuel n'a pas de compteur 'helpful'
    // On retourne simplement la review avec un message de succès
    res.json({
      success: true,
      message: 'Review marquée comme utile (compteur non implémenté dans ce modèle).',
      data: review
    });
  } catch (error) {
    console.error('Erreur markReviewHelpful:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du marquage de la review.' });
  }
};

/**
 * Signaler une review
 * PATCH /api/reviews/:id/report
 * Note: Marque la review comme inactive (active: false) après signalement
 */
/**
 * 🚀 SPRINT 4: Signaler un avis (report) - VERSION AMÉLIORÉE
 * POST /api/reviews/:id/report
 * Body: { reason, userId }
 */
export const reportReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, userId } = req.body;

    if (!reason || !userId) {
      return res.status(400).json({ success: false, message: 'Raison et userId requis.' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review non trouvée.' });
    }

    // Vérifier si l'utilisateur a déjà signalé
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (review.reportedBy.some(id => id.equals(userObjectId))) {
      return res.status(409).json({ success: false, message: 'Vous avez déjà signalé cet avis.' });
    }

    // Ajouter le signalement
    review.reportCount += 1;
    review.reportReasons.push(reason);
    review.reportedBy.push(userObjectId);

    // Auto-modération si 3+ signalements
    if (review.reportCount >= 3 && review.moderationStatus === 'approved') {
      review.moderationStatus = 'pending';
      review.isModerated = false;
      review.active = false; // Masquer temporairement
      console.log(`⚠️ Review ${id} mise en pending (3+ signalements)`);
    }

    await review.save();

    res.json({ 
      success: true, 
      data: review,
      message: 'Avis signalé avec succès.' 
    });
  } catch (error) {
    console.error('Erreur reportReview:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du signalement de la review.' });
  }
};

/**
 * Créer une review (version simplifiée pour tests - sans authentification)
 * POST /api/reviews
 * Body: { itemId, itemType, userId, rating, comment }
 */
export const createReviewSimple = async (req: Request, res: Response) => {
  try {
    const { itemId, itemType, userId, rating, comment } = req.body;
    
    if (!itemId || !itemType || !userId || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'itemId, itemType, userId et rating sont requis.' 
      });
    }

    // Valider le rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'La note doit être entre 1 et 5.' });
    }

    // Valider le type d'élément
    if (!['Attraction', 'Tour', 'AudioGuide'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Type d\'élément invalide.' });
    }

    // Vérifier si l'utilisateur a déjà noté cet élément
    const existingReview = await Review.findOne({ itemId, userId });
    if (existingReview) {
      return res.status(409).json({ success: false, message: 'Vous avez déjà noté cet élément.' });
    }

    // Convertir itemId en ObjectId si c'est un string
    const itemObjectId = typeof itemId === 'string' ? new mongoose.Types.ObjectId(itemId) : itemId;
    
    // Convertir userId en ObjectId si c'est un string
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const review = new Review({
      itemId: itemObjectId,
      itemType,
      userId: userObjectId,
      rating,
      comment,
      active: true,
      isModerated: false
    });

    await review.save();
    
    // Mettre à jour la note moyenne
    await updateAverageRating(itemType, itemObjectId);

    res.status(201).json({ 
      success: true, 
      data: review, 
      message: 'Avis créé avec succès.' 
    });
  } catch (error) {
    console.error('Erreur createReviewSimple:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'avis.' });
  }
};

// ========================================
// 🚀 SPRINT 4: MODÉRATION AVANCÉE - NOUVELLES FONCTIONS
// ========================================

/**
 * Récupérer les avis en attente de modération
 * GET /api/reviews/pending
 */
export const getPendingReviews = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ moderationStatus: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Review.countDocuments({ moderationStatus: 'pending' });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Erreur getPendingReviews:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des avis en attente.' });
  }
};

/**
 * Récupérer les statistiques de modération
 * GET /api/reviews/moderation/stats
 */
export const getModerationStats = async (req: Request, res: Response) => {
  try {
    const [totalReviews, pendingReviews, approvedReviews, rejectedReviews, reportedReviews] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ moderationStatus: 'pending' }),
      Review.countDocuments({ moderationStatus: 'approved' }),
      Review.countDocuments({ moderationStatus: 'rejected' }),
      Review.countDocuments({ reportCount: { $gt: 0 } }),
    ]);

    // Top 5 raisons de signalement
    const topReasons = await Review.aggregate([
      { $match: { reportCount: { $gt: 0 } } },
      { $unwind: '$reportReasons' },
      { $group: { _id: '$reportReasons', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      data: {
        total: totalReviews,
        pending: pendingReviews,
        approved: approvedReviews,
        rejected: rejectedReviews,
        reported: reportedReviews,
        topReportReasons: topReasons.map(r => ({ reason: r._id, count: r.count })),
      },
    });
  } catch (error) {
    console.error('Erreur getModerationStats:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques.' });
  }
};
