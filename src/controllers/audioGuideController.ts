import { Request, Response } from 'express';
import { AudioGuide } from '../models/AudioGuide';
import { Attraction } from '../models/Attraction';

export const getAllAudioGuides = async (req: Request, res: Response) => {
  try {
    const { 
      attractionId, 
      language = 'fr', 
      limit = 20, 
      page = 1,
      active = true
    } = req.query;

    const filter: any = {};
    
    if (attractionId) {
      filter.attractionId = attractionId;
    }
    
    if (language && language !== 'all') {
      filter.language = language;
    }
    
    if (active !== 'all') {
      filter.active = active === 'true' || active === true;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const audioGuides = await AudioGuide.find(filter)
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('attractionId', 'name nameEn city region')
      .sort({ rating: -1, downloadCount: -1 });

    const total = await AudioGuide.countDocuments(filter);

    res.json({
      success: true,
      data: audioGuides,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erreur getAllAudioGuides:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des guides audio',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const getAudioGuideById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const audioGuide = await AudioGuide.findById(id)
      .populate('attractionId', 'name nameEn description descriptionEn city region location images');

    if (!audioGuide) {
      return res.status(404).json({
        success: false,
        message: 'Guide audio non trouvé'
      });
    }

    res.json({
      success: true,
      data: audioGuide
    });
  } catch (error) {
    console.error('Erreur getAudioGuideById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du guide audio',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const createAudioGuide = async (req: Request, res: Response) => {
  try {
    const {
      title,
      titleEn,
      description,
      descriptionEn,
      attractionId,
      audioUrl,
      duration,
      language,
      transcript,
      transcriptEn,
      narrator,
      fileSize
    } = req.body;

    // Vérifier que l'attraction existe
    const attraction = await Attraction.findById(attractionId);
    if (!attraction) {
      return res.status(404).json({
        success: false,
        message: 'Attraction non trouvée'
      });
    }

    const audioGuide = new AudioGuide({
      title,
      titleEn,
      description,
      descriptionEn,
      attractionId,
      audioUrl,
      duration,
      language,
      transcript,
      transcriptEn,
      narrator,
      fileSize
    });

    await audioGuide.save();

    // Mettre à jour l'attraction avec le nouvel ID de guide audio
    await Attraction.findByIdAndUpdate(
      attractionId,
      { audioGuideId: audioGuide._id }
    );

    await audioGuide.populate('attractionId', 'name nameEn city region');

    res.status(201).json({
      success: true,
      message: 'Guide audio créé avec succès',
      data: audioGuide
    });
  } catch (error) {
    console.error('Erreur createAudioGuide:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du guide audio',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const updateAudioGuide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Si on change l'attractionId, vérifier qu'elle existe
    if (updateData.attractionId) {
      const attraction = await Attraction.findById(updateData.attractionId);
      if (!attraction) {
        return res.status(404).json({
          success: false,
          message: 'Attraction non trouvée'
        });
      }
    }

    const audioGuide = await AudioGuide.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('attractionId', 'name nameEn city region');

    if (!audioGuide) {
      return res.status(404).json({
        success: false,
        message: 'Guide audio non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Guide audio mis à jour avec succès',
      data: audioGuide
    });
  } catch (error) {
    console.error('Erreur updateAudioGuide:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du guide audio',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const deleteAudioGuide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const audioGuide = await AudioGuide.findById(id);
    if (!audioGuide) {
      return res.status(404).json({
        success: false,
        message: 'Guide audio non trouvé'
      });
    }

    // Retirer l'ID du guide audio de l'attraction
    await Attraction.findByIdAndUpdate(
      audioGuide.attractionId,
      { $unset: { audioGuideId: 1 } } // ou { audioGuideId: null }
    );

    await AudioGuide.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Guide audio supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteAudioGuide:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du guide audio',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const incrementDownloadCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const audioGuide = await AudioGuide.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!audioGuide) {
      return res.status(404).json({
        success: false,
        message: 'Guide audio non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Compteur de téléchargement mis à jour',
      data: { downloadCount: audioGuide.downloadCount }
    });
  } catch (error) {
    console.error('Erreur incrementDownloadCount:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du compteur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

export const getAudioGuidesByAttraction = async (req: Request, res: Response) => {
  try {
    const { attractionId } = req.params;
    const { language = 'fr' } = req.query;

    const filter: any = { attractionId, active: true };
    
    if (language && language !== 'all') {
      filter.language = language;
    }

    const audioGuides = await AudioGuide.find(filter)
      .sort({ rating: -1, createdAt: -1 });

    res.json({
      success: true,
      data: audioGuides
    });
  } catch (error) {
    console.error('Erreur getAudioGuidesByAttraction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des guides audio de l\'attraction',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};
