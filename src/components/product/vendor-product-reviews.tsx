'use client';

import { useEffect, useState } from 'react';
import Rate from '@components/ui/rate';
import { Star, ThumbsUp, ThumbsDown, Check, MessageSquare, ChevronDown } from 'lucide-react';
import { getProductReviews, addReview } from '@/framework/basic-rest/products-reviews/useProductReviews';
import { toast } from 'react-toastify';
import moment from 'moment';
import cn from 'classnames';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';


interface VendorProductReviewsProps {
  productId: string;
  skuId?: string | null;
  lang: string;
}

interface Review {
  _id: string;
  rating: number;
  content?: string;
  createdAt: string;
  customer?: {
    username?: string;
    profileImage?: string;
  };
  isVerifiedPurchase?: boolean;
  totalHelpfulVotes?: number;
  totalNonHelpfulVotes?: number;
  sellerResponse?: {
    content: string;
    respondedAt: string;
  };
}

interface ReviewSummary {
  averageRating: number;
  ratingDistribution: number[];
}

const VendorProductReviews: React.FC<VendorProductReviewsProps> = ({ productId, skuId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');

  useEffect(() => {
    if (skuId) {
      fetchReviews();
    }
  }, [productId, skuId, sortBy, activeFilter]);

  const fetchReviews = async () => {
    if (!skuId) {
      setIsLoading(false);
      setReviews([]);
      setReviewSummary(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getProductReviews(productId, 'VendorProduct', skuId);
      if (response.reviews && response.summary) {
        let filteredReviews = response.reviews;

        // Apply filter
        if (activeFilter === 'verified') {
          filteredReviews = filteredReviews.filter((r: Review) => r.isVerifiedPurchase);
        }

        // Apply sort
        filteredReviews = [...filteredReviews].sort((a: Review, b: Review) => {
          if (sortBy === 'newest') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else if (sortBy === 'oldest') {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          } else if (sortBy === 'rating') {
            return b.rating - a.rating;
          }
          return 0;
        });

        setReviews(filteredReviews);
        setReviewSummary(response.summary);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      toast.error('Please enter your review');
      return;
    }

    if (!skuId) {
      toast.error('Please select a SKU to review');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await addReview({
        product: productId,
        productModel: 'VendorProduct',
        sku: skuId,
        rating,
        content: reviewText.trim(),
      });

      if (response.message === 'Review created successfully') {
        toast.success('Review submitted successfully!');
        setReviewText('');
        setRating(5);
        setShowReviewForm(false);
        fetchReviews();
      } else {
        toast.error(response.message || 'Failed to submit review');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(sizeClasses[size], star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300')}
          />
        ))}
      </div>
    );
  };

  const totalReviews = reviews.length;
  const averageRating = reviewSummary?.averageRating || 0;
  const ratingDistribution = reviewSummary?.ratingDistribution || [0, 0, 0, 0, 0];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex items-start justify-between gap-8">
          {/* Rating Summary */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-1">{averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center mb-2">
                  {renderStars(Math.round(averageRating), 'md')}
                </div>
                <div className="text-sm text-gray-600">
                  Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </div>
              </div>
              <div className="flex-1">
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((starRating) => {
                    const count = ratingDistribution[starRating - 1] || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={starRating} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 w-8">{starRating}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Write Review Button */}
          <div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className={cn(
              'inline-flex items-center justify-center gap-2',
              'font-semibold text-white whitespace-nowrap',
              'text-[clamp(11px,0.85vw,14px)]',
              'transition-all duration-100 ease-out',
              'transform hover:-translate-y-0.5 hover:scale-[1.02]',
              'active:translate-y-0 active:scale-[0.97]',
              'px-[clamp(10px,1vw,18px)] py-[clamp(6px,0.7vw,10px)]',
              'rounded-tl-xl rounded-br-2xl',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-700',
              'bg-black/90 ring-1 ring-black/10',
              'hover:bg-black/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:ring-white/10',
              'active:bg-slate-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]'
              )}
            >
              <MessageSquare size={18} className="shrink-0" />
              Write A Review
            </button>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <Rate value={rating} onChange={setRating} size="xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewText('');
                    setRating(5);
                  }}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Sort */}
      {totalReviews > 0 && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveFilter('all')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeFilter === 'all'
                  ? 'bg-brand-blue text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-brand-blue'
              )}
            >
              All Reviews ({totalReviews})
            </button>
            {/* <button
              onClick={() => setActiveFilter('verified')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                activeFilter === 'verified'
                  ? 'bg-brand-blue text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-brand-blue'
              )}
            >
              <Check size={16} />
              Verified Purchase ({reviews.filter((r) => r.isVerifiedPurchase).length})
            </button> */}
          </div>
          <div className="flex items-center gap-2 ">
           <div className="flex items-center gap-2">
  <span className="text-sm text-gray-600">Sort by:</span>

  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button
        className="flex items-center gap-14 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900
                   hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue"
      >
        {sortBy === 'newest'
          ? 'Most Recent'
          : sortBy === 'oldest'
          ? 'Oldest First'
          : 'Highest Rated'}
        <ChevronDown size={16} />
      </button>
    </DropdownMenu.Trigger>

    <DropdownMenu.Content
      align="end"
      className="z-50 min-w-[180px] rounded-xl border border-gray-200 bg-white p-1 pl-2 pr-2 shadow-lg"
    >
      <DropdownMenu.Item
        onClick={() => setSortBy('newest')}
        className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm
                   text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
      >
        Most Recent
        {sortBy === 'newest' && <Check size={14} className="text-brand-blue" />}
      </DropdownMenu.Item>

      <DropdownMenu.Item
        onClick={() => setSortBy('oldest')}
        className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm
                   text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
      >
        Oldest First
        {sortBy === 'oldest' && <Check size={14} className="text-brand-blue" />}
      </DropdownMenu.Item>

      <DropdownMenu.Item
        onClick={() => setSortBy('rating')}
        className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm
                   text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
      >
        Highest Rated
        {sortBy === 'rating' && <Check size={14} className="text-brand-blue" />}
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>

          </div>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : totalReviews > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-600">
                      {review.customer?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {review.customer?.username || 'Anonymous'}
                      </span>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          <Check size={12} />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ">
                      {renderStars(review.rating, 'sm')}
                      <span className="text-xs text-gray-500">
                        {moment(review.createdAt).format('MMMM DD, YYYY')}
                      </span>
                    </div>
                  </div>
                  
                </div>
                
              </div>

              {/* Review Content */}
              {review.content && (
                <div className="mb-4 ml-14 ">
                  <p className="text-gray-700 leading-relaxed">{review.content}</p>
                </div>
              )}

              {/* Seller Response */}
              {review.sellerResponse && (
                <div className="ml-14 mt-4 p-4 bg-blue-50 border-l-4 border-brand-blue rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">Seller Response</span>
                    <span className="text-xs text-gray-500">
                      {moment(review.sellerResponse.respondedAt).format('MMMM DD, YYYY')}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{review.sellerResponse.content}</p>
                </div>
              )}

              {/* Helpful Votes */}
              {(review.totalHelpfulVotes || 0) > 0 && (
                <div className="ml-14 flex items-center gap-4 mt-3">
                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <ThumbsUp size={16} />
                    <span>Helpful ({review.totalHelpfulVotes || 0})</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <ThumbsDown size={16} />
                    <span>Not Helpful ({review.totalNonHelpfulVotes || 0})</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !skuId ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a SKU to view reviews</h3>
          <p className="text-gray-600">Please select a SKU variant above to see reviews for that specific variant.</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600 mb-6">Be the first to review this SKU variant!</p>
          <button
            onClick={() => setShowReviewForm(true)}
              className={cn(
           'inline-flex items-center justify-center gap-2 mt-1',
           'font-semibold text-white whitespace-nowrap',
           'text-[clamp(11px,0.85vw,14px)]',
           'transition-all duration-100 ease-out',
           'transform hover:-translate-y-0.5 hover:scale-[1.02]',
           'active:translate-y-0 active:scale-[0.97]',
           'px-[clamp(10px,1vw,18px)] py-[clamp(6px,0.7vw,10px)]',
           'rounded-tl-xl rounded-br-2xl',
           'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-700',
           'bg-black/90 ring-1 ring-black/10',
           'hover:bg-black/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:ring-white/10',
           'active:bg-slate-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]'
            )}
            // className="px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/90 transition-colors"
          >
            Write A Review
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorProductReviews;

