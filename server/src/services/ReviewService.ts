import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Review } from '../models/Review';
import { Mission, MissionStatus } from '../models/Mission';
import { User } from '../models/User';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../middleware/errorHandler';

export interface CreateReviewData {
  missionId: string;
  targetId: string; // L'utilisateur qui reçoit l'avis
  rating: number;
  comment: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface ReviewFilters {
  isPublic?: boolean;
  rating?: number;
  targetId?: string;
  reviewerId?: string;
  limit?: number;
  offset?: number;
}

export class ReviewService {
  private reviewRepository: Repository<Review>;
  private missionRepository: Repository<Mission>;
  private userRepository: Repository<User>;

  constructor() {
    this.reviewRepository = AppDataSource.getRepository(Review);
    this.missionRepository = AppDataSource.getRepository(Mission);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Créer un avis
   */
  async createReview(reviewerId: string, data: CreateReviewData): Promise<Review> {
    // Vérifier que la mission existe et est terminée
    const mission = await this.missionRepository.findOne({
      where: { id: data.missionId },
      relations: ['client', 'assistant']
    });

    if (!mission) {
      throw new NotFoundError('MISSION_NOT_FOUND', 'Mission non trouvée');
    }

    if (mission.status !== MissionStatus.COMPLETED) {
      throw new BadRequestError('MISSION_NOT_COMPLETED', 'Seules les missions terminées peuvent recevoir des avis');
    }

    // Vérifier que l'utilisateur qui donne l'avis a participé à la mission
    if (mission.clientId !== reviewerId && mission.assistantId !== reviewerId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Seuls les participants à la mission peuvent donner un avis');
    }

    // Vérifier que la cible de l'avis a participé à la mission
    if (mission.clientId !== data.targetId && mission.assistantId !== data.targetId) {
      throw new BadRequestError('INVALID_TARGET', 'La cible de l\'avis doit avoir participé à la mission');
    }

    // Vérifier qu'un avis n'existe pas déjà pour cette mission et ce reviewer
    const existingReview = await this.reviewRepository.findOne({
      where: {
        missionId: data.missionId,
        reviewerId: reviewerId
      }
    });

    if (existingReview) {
      throw new ConflictError('REVIEW_ALREADY_EXISTS', 'Un avis existe déjà pour cette mission');
    }

    // Vérifier que la note est valide
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestError('INVALID_RATING', 'La note doit être comprise entre 1 et 5');
    }

    // Créer l'avis
    const review = new Review();
    review.missionId = data.missionId;
    review.reviewerId = reviewerId;
    review.reviewedId = data.targetId;
    review.rating = data.rating;
    review.comment = data.comment;
    review.isPublic = data.isPublic !== undefined ? data.isPublic : true;
    if (data.metadata) {
      review.metadata = data.metadata;
    }

    const savedReview = await this.reviewRepository.save(review);

    // Mettre à jour la note moyenne de l'utilisateur cible
    await this.updateUserAverageRating(data.targetId);

    return savedReview;
  }

  /**
   * Obtenir un avis par ID
   */
  async getReviewById(reviewId: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['reviewer', 'reviewed', 'mission']
    });

    if (!review) {
      throw new NotFoundError('REVIEW_NOT_FOUND', 'Avis non trouvé');
    }

    return review;
  }

  /**
   * Obtenir les avis d'une mission
   */
  async getMissionReviews(missionId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { missionId },
      relations: ['reviewer', 'reviewed'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Obtenir les avis reçus par un utilisateur
   */
  async getUserReceivedReviews(userId: string, filters: ReviewFilters = {}): Promise<{ reviews: Review[]; total: number }> {
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .leftJoinAndSelect('review.mission', 'mission')
      .where('review.reviewedId = :userId', { userId });

    // Appliquer les filtres
    if (filters.isPublic !== undefined) {
      queryBuilder.andWhere('review.isPublic = :isPublic', { isPublic: filters.isPublic });
    }

    if (filters.rating) {
      queryBuilder.andWhere('review.rating = :rating', { rating: filters.rating });
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    queryBuilder
      .orderBy('review.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    return { reviews, total };
  }

  /**
   * Obtenir les avis donnés par un utilisateur
   */
  async getUserGivenReviews(userId: string, filters: ReviewFilters = {}): Promise<{ reviews: Review[]; total: number }> {
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewed', 'reviewed')
      .leftJoinAndSelect('review.mission', 'mission')
      .where('review.reviewerId = :userId', { userId });

    // Appliquer les filtres
    if (filters.isPublic !== undefined) {
      queryBuilder.andWhere('review.isPublic = :isPublic', { isPublic: filters.isPublic });
    }

    if (filters.rating) {
      queryBuilder.andWhere('review.rating = :rating', { rating: filters.rating });
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    queryBuilder
      .orderBy('review.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    return { reviews, total };
  }

  /**
   * Mettre à jour un avis
   */
  async updateReview(reviewId: string, userId: string, data: Partial<Review>): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundError('REVIEW_NOT_FOUND', 'Avis non trouvé');
    }

    // Seul l'auteur de l'avis peut le modifier
    if (review.reviewerId !== userId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Non autorisé à modifier cet avis');
    }

    // Mettre à jour les champs autorisés
    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        throw new BadRequestError('INVALID_RATING', 'La note doit être comprise entre 1 et 5');
      }
      review.rating = data.rating;
    }

    if (data.comment !== undefined) {
      review.comment = data.comment;
    }

    if (data.isPublic !== undefined) {
      review.isPublic = data.isPublic;
    }

    if (data.metadata !== undefined) {
      review.metadata = data.metadata;
    }

    const updatedReview = await this.reviewRepository.save(review);

    // Mettre à jour la note moyenne de l'utilisateur cible
    await this.updateUserAverageRating(review.reviewedId);

    return updatedReview;
  }

  /**
   * Supprimer un avis
   */
  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundError('REVIEW_NOT_FOUND', 'Avis non trouvé');
    }

    // Seul l'auteur de l'avis peut le supprimer
    if (review.reviewerId !== userId) {
      throw new ForbiddenError('UNAUTHORIZED', 'Non autorisé à supprimer cet avis');
    }

    await this.reviewRepository.remove(review);

    // Mettre à jour la note moyenne de l'utilisateur cible
    await this.updateUserAverageRating(review.reviewedId);
  }

  /**
   * Mettre à jour la note moyenne d'un utilisateur
   */
  private async updateUserAverageRating(userId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.reviewedId = :userId', { userId })
      .andWhere('review.isPublic = :isPublic', { isPublic: true })
      .getRawOne();

    const averageRating = result?.averageRating ? parseFloat(result.averageRating) : 0;
    const reviewCount = result?.reviewCount ? parseInt(result.reviewCount) : 0;

    await this.userRepository.update(userId, {
      rating: averageRating,
      reviewCount: reviewCount
    });
  }

  /**
   * Obtenir les statistiques d'avis d'un utilisateur
   */
  async getUserReviewStats(userId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> {
    const reviews = await this.reviewRepository.find({
      where: {
        reviewedId: userId,
        isPublic: true
      }
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    // Distribution des notes
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating,
      totalReviews,
      ratingDistribution
    };
  }
}

export const reviewService = new ReviewService(); 