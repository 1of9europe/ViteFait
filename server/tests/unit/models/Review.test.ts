import { Review } from '../../../src/models/Review';
import { ReviewStatus } from '../../../src/types/enums';
import { getReviewRatingText } from '../../../src/utils/i18n';

describe('Review Entity', () => {
  let review: Review;

  beforeEach(() => {
    review = new Review();
    review.id = 'test-id';
    review.missionId = 'mission-id';
    review.reviewerId = 'reviewer-id';
    review.reviewedUserId = 'reviewed-user-id';
    review.rating = 4;
    review.comment = 'Excellent service';
    review.isPublic = true;
    review.status = ReviewStatus.PENDING;
    review.createdAt = new Date();
    review.updatedAt = new Date();
  });

  describe('isValidRating', () => {
    it('should return true for valid ratings', () => {
      review.rating = 1;
      expect(review.isValidRating()).toBe(true);

      review.rating = 3;
      expect(review.isValidRating()).toBe(true);

      review.rating = 5;
      expect(review.isValidRating()).toBe(true);
    });

    it('should return false for invalid ratings', () => {
      review.rating = 0;
      expect(review.isValidRating()).toBe(false);

      review.rating = 6;
      expect(review.isValidRating()).toBe(false);

      review.rating = -1;
      expect(review.isValidRating()).toBe(false);
    });
  });

  describe('getRatingText', () => {
    it('should return correct rating text in French', () => {
      review.rating = 1;
      expect(review.getRatingText('fr')).toBe('Très mauvais');

      review.rating = 3;
      expect(review.getRatingText('fr')).toBe('Moyen');

      review.rating = 5;
      expect(review.getRatingText('fr')).toBe('Excellent');
    });

    it('should return correct rating text in English', () => {
      review.rating = 1;
      expect(review.getRatingText('en')).toBe('Very Bad');

      review.rating = 3;
      expect(review.getRatingText('en')).toBe('Average');

      review.rating = 5;
      expect(review.getRatingText('en')).toBe('Excellent');
    });

    it('should use French as default locale', () => {
      review.rating = 4;
      expect(review.getRatingText()).toBe('Bon');
    });
  });

  describe('canBeModified', () => {
    it('should return true for pending reviews', () => {
      review.status = ReviewStatus.PENDING;
      expect(review.canBeModified()).toBe(true);
    });

    it('should return false for non-pending reviews', () => {
      review.status = ReviewStatus.APPROVED;
      expect(review.canBeModified()).toBe(false);

      review.status = ReviewStatus.REJECTED;
      expect(review.canBeModified()).toBe(false);
    });
  });

  describe('canBeDeleted', () => {
    it('should return true for pending reviews', () => {
      review.status = ReviewStatus.PENDING;
      expect(review.canBeDeleted()).toBe(true);
    });

    it('should return false for non-pending reviews', () => {
      review.status = ReviewStatus.APPROVED;
      expect(review.canBeDeleted()).toBe(false);
    });
  });

  describe('isApproved', () => {
    it('should return true for approved reviews', () => {
      review.status = ReviewStatus.APPROVED;
      expect(review.isApproved()).toBe(true);
    });

    it('should return false for non-approved reviews', () => {
      review.status = ReviewStatus.PENDING;
      expect(review.isApproved()).toBe(false);

      review.status = ReviewStatus.REJECTED;
      expect(review.isApproved()).toBe(false);
    });
  });

  describe('isRejected', () => {
    it('should return true for rejected reviews', () => {
      review.status = ReviewStatus.REJECTED;
      expect(review.isRejected()).toBe(true);
    });

    it('should return false for non-rejected reviews', () => {
      review.status = ReviewStatus.PENDING;
      expect(review.isRejected()).toBe(false);

      review.status = ReviewStatus.APPROVED;
      expect(review.isRejected()).toBe(false);
    });
  });

  describe('isPending', () => {
    it('should return true for pending reviews', () => {
      review.status = ReviewStatus.PENDING;
      expect(review.isPending()).toBe(true);
    });

    it('should return false for non-pending reviews', () => {
      review.status = ReviewStatus.APPROVED;
      expect(review.isPending()).toBe(false);

      review.status = ReviewStatus.REJECTED;
      expect(review.isPending()).toBe(false);
    });
  });

  describe('getCommissionAmount', () => {
    it('should calculate commission based on rating', () => {
      review.rating = 1;
      expect(review.getCommissionAmount()).toBe(0.60); // 0.50 + (1 * 0.10)

      review.rating = 3;
      expect(review.getCommissionAmount()).toBe(0.80); // 0.50 + (3 * 0.10)

      review.rating = 5;
      expect(review.getCommissionAmount()).toBe(1.00); // 0.50 + (5 * 0.10)
    });
  });

  describe('validateMetadata', () => {
    it('should return true when metadata is null', () => {
      review.metadata = undefined;
      expect(review.validateMetadata()).toBe(true);
    });

    it('should return true for valid metadata', () => {
      review.metadata = {
        missionType: 'delivery',
        communicationQuality: 4,
        punctuality: 5,
        tags: ['rapide', 'professionnel'],
        wouldRecommend: true
      };
      expect(review.validateMetadata()).toBe(true);
    });

    it('should return false for invalid metadata', () => {
      review.metadata = {
        missionType: 'invalid_type',
        communicationQuality: 6, // Invalid: should be 1-5
        punctuality: 0 // Invalid: should be 1-5
      };
      expect(review.validateMetadata()).toBe(false);
    });
  });

  describe('getTags', () => {
    it('should return empty array when no metadata', () => {
      review.metadata = undefined;
      expect(review.getTags()).toEqual([]);
    });

    it('should return tags from metadata', () => {
      review.metadata = {
        tags: ['rapide', 'professionnel', 'ponctuel']
      };
      expect(review.getTags()).toEqual(['rapide', 'professionnel', 'ponctuel']);
    });
  });

  describe('addTag', () => {
    it('should add tag to empty metadata', () => {
      review.metadata = undefined;
      review.addTag('nouveau');
      expect(review.metadata?.tags).toEqual(['nouveau']);
    });

    it('should add tag to existing tags', () => {
      review.metadata = {
        tags: ['existant']
      };
      review.addTag('nouveau');
      expect(review.metadata?.tags).toEqual(['existant', 'nouveau']);
    });

    it('should not add duplicate tags', () => {
      review.metadata = {
        tags: ['existant']
      };
      review.addTag('existant');
      expect(review.metadata?.tags).toEqual(['existant']);
    });
  });

  describe('removeTag', () => {
    it('should remove tag from metadata', () => {
      review.metadata = {
        tags: ['tag1', 'tag2', 'tag3']
      };
      review.removeTag('tag2');
      expect(review.metadata?.tags).toEqual(['tag1', 'tag3']);
    });

    it('should do nothing if tag does not exist', () => {
      review.metadata = {
        tags: ['tag1', 'tag2']
      };
      review.removeTag('nonexistent');
      expect(review.metadata?.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('getCommunicationQuality', () => {
    it('should return communication quality from metadata', () => {
      review.metadata = {
        communicationQuality: 4
      };
      expect(review.getCommunicationQuality()).toBe(4);
    });

    it('should return null when not in metadata', () => {
      review.metadata = {};
      expect(review.getCommunicationQuality()).toBeNull();
    });
  });

  describe('getPunctuality', () => {
    it('should return punctuality from metadata', () => {
      review.metadata = {
        punctuality: 5
      };
      expect(review.getPunctuality()).toBe(5);
    });

    it('should return null when not in metadata', () => {
      review.metadata = {};
      expect(review.getPunctuality()).toBeNull();
    });
  });

  describe('getCompletionTime', () => {
    it('should return completion time from metadata', () => {
      review.metadata = {
        completionTime: 30
      };
      expect(review.getCompletionTime()).toBe(30);
    });

    it('should return null when not in metadata', () => {
      review.metadata = {};
      expect(review.getCompletionTime()).toBeNull();
    });
  });

  describe('wouldRecommend', () => {
    it('should return recommendation from metadata', () => {
      review.metadata = {
        wouldRecommend: true
      };
      expect(review.wouldRecommend()).toBe(true);
    });

    it('should return null when not in metadata', () => {
      review.metadata = {};
      expect(review.wouldRecommend()).toBeNull();
    });
  });

  describe('getSpecialCircumstances', () => {
    it('should return special circumstances from metadata', () => {
      review.metadata = {
        specialCircumstances: 'Pluie torrentielle'
      };
      expect(review.getSpecialCircumstances()).toBe('Pluie torrentielle');
    });

    it('should return null when not in metadata', () => {
      review.metadata = {};
      expect(review.getSpecialCircumstances()).toBeNull();
    });
  });

  describe('getOverallScore', () => {
    it('should calculate basic score with rating only', () => {
      review.rating = 4;
      expect(review.getOverallScore()).toBe(4);
    });

    it('should calculate score with communication quality', () => {
      review.rating = 4;
      review.metadata = {
        communicationQuality: 5
      };
      expect(review.getOverallScore()).toBe(4.5); // (4 + 5) / 2
    });

    it('should calculate score with multiple factors', () => {
      review.rating = 4;
      review.comment = 'Excellent service';
      review.metadata = {
        communicationQuality: 5,
        punctuality: 4,
        tags: ['professionnel']
      };
      // (4 + 5 + 4 + 0.5 + 0.25) / 5 = 2.75
      expect(review.getOverallScore()).toBe(2.75);
    });
  });

  describe('toJSON', () => {
    it('should return complete review data', () => {
      review.metadata = {
        tags: ['test'],
        communicationQuality: 4
      };

      const json = review.toJSON();

      expect(json).toHaveProperty('id', 'test-id');
      expect(json).toHaveProperty('missionId', 'mission-id');
      expect(json).toHaveProperty('rating', 4);
      expect(json).toHaveProperty('ratingText', 'Bon');
      expect(json).toHaveProperty('overallScore');
      expect(json).toHaveProperty('tags', ['test']);
      expect(json).toHaveProperty('communicationQuality', 4);
      expect(json).toHaveProperty('metadata');
    });
  });

  describe('toPublicJSON', () => {
    it('should exclude sensitive information', () => {
      review.metadata = {
        tags: ['test']
      };

      const json = review.toPublicJSON();

      expect(json).toHaveProperty('id', 'test-id');
      expect(json).toHaveProperty('rating', 4);
      expect(json).toHaveProperty('ratingText', 'Bon');
      expect(json).not.toHaveProperty('reviewerId');
      expect(json).not.toHaveProperty('metadata');
    });
  });
}); 