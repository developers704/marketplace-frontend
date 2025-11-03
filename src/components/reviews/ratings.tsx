'use client';
import React, { useEffect, useState } from 'react';
import Rate from '../ui/rate';
import ShowMoreDropdown from '../ui/show-more-dropdown';
import {
  addReview,
  getProductReviews,
} from '@/framework/basic-rest/products-reviews/useProductReviews';
import { toast } from 'react-toastify';
import moment from 'moment';

const ReviewInput = () => {
  return (
    <div>
      <input type="text" placeholder="Your Review" />
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Submit
      </button>
    </div>
  );
};

const ReviewContainer = ({ rating, content, createdAt, userName }: any) => (
  <div
    id="reviewContainer"
    className="flex flex-col items-start justify-center gap-4 p-6 my-5 bg-[#EFEEEE]"
  >
    <div className="flex items-center gap-4">
      <div>
        <Rate
          //   onChange={(value) => set_rating_custom_icon(value)}
          value={rating}
        />
      </div>
      <div>{createdAt}</div>
    </div>
    <div>
      {/* <h1 className="text-lg font-semibold !text-black">Main Title</h1> */}
      <div>
        <p>{content}</p>
      </div>
    </div>
    <div className="flex items-center justify-between w-full">
      <div className="font-bold">{userName}</div>
      <div>
        <ul className="flex items-center gap-4 font-bold">
          <li>Helpful?</li>
          <li>Yes</li>
          <li>No</li>
          <li>Report</li>
        </ul>
      </div>
    </div>
  </div>
);

const RatingProgressBar = ({
  averageRating,
  title,
}: {
  averageRating: number;
  title: string;
}) => {
  const progress = (averageRating / 5) * 100; // Convert rating to percentage

  return (
    <div className="w-full flex items-center gap-3 space-x-2">
      <div className="text-[15px] font-bold flex-1">{title}:</div>
      <div className="w-full h-3 flex-[3] bg-gray-200 rounded-lg overflow-hidden">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-[15px] font-bold flex-1">{averageRating} / 5</div>
    </div>
  );
};

const Ratings = ({ productId }: any) => {
  const [rating_custom_icon, set_rating_custom_icon] = useState(1);
  const [reviewSummary, setReviewSummary] = useState<any>({});
  const [reviewText, setReviewText] = useState<string | any>('');
  const [isReview, setIsReview] = useState<boolean | any>(false);
  const [reviews, setReviews] = useState<any[] | any>([]);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean | any>(false);
  const [updateList, setUpdateList] = useState<boolean | any>(false);
  // let averageRatingProgress; // Convert rating to percentage
  // = (averageRating / 5) * 100

  //   console.log(rating_custom_icon);
  const moreItems = ['Newest', 'Oldest'];

  const onSubmitReview = async () => {
    const formData = {
      content: reviewText,
      rating: rating_custom_icon,
      product: productId,
    };
    // console.log(formData, '===>>> formData');
    if (formData) {
      const response = await addReview(formData);

      if (response.message === 'Review created successfully') {
        setIsReview(false);
        setReviewText('');
        set_rating_custom_icon(1);
        toast.success('Review submitted successfully');
        setReviewSubmitted(true);
        setUpdateList(!updateList);
      } else if (
        response.message === 'You have already reviewed this product'
      ) {
        toast.warning(response.message);
        setReviewText('');
        set_rating_custom_icon(1);
        setReviewSubmitted(true);
        setUpdateList(!updateList);
      }
    }
  };

  useEffect(() => {
    const getProductAllReviews = async () => {
      const response = await getProductReviews(productId);
      console.log(response, '===>>> response for fetch useEffect');
      if (response.reviews.length > 0) {
        setReviews(response.reviews);
        setReviewSummary(response.summary);
      } else {
        setReviews([]);
      }
    };
    getProductAllReviews();
  }, [reviewSubmitted, updateList]);

  return (
    <div className="">
      <div className="flex">
        <div className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-5">
          <p className="text-black text-[15px]">
            <strong className="font-bold">1</strong> Customer review this
            product
          </p>
          <div>
            <Rate
              onChange={(value) => set_rating_custom_icon(value)}
              value={rating_custom_icon}
            />
          </div>
          <div className="text-[15px] font-bold mr-2">
            <span>{rating_custom_icon}.00</span> stars out of 5
          </div>
          {isReview && (
            <div className="flex flex-col gap-3">
              <textarea
                className="w-full h-32 border border-gray-300 rounded-md p-2"
                placeholder="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => onSubmitReview()}
              >
                Submit
              </button>
            </div>
          )}
          {reviewSubmitted ? (
            <div className="bg-lime-200 py-1 px-2 rounded">
              <h1>Thanks for sharing your review</h1>
            </div>
          ) : (
            <div
              className="self-start text-lg text-black font-bold underline cursor-pointer"
              onClick={() => setIsReview(true)}
            >
              Write a review
            </div>
          )}
        </div>
        <div className="flex-1 px-5">
          <p className="text-lg font-bold pb-2">Ratings Breakdown</p>
          <div>
            <RatingProgressBar
              averageRating={reviewSummary.averageRating}
              title="Averrage Rating"
            />
            {/* {['Quality', 'Value', 'Appearance'].map((item, index) => {
              return (
                <div className="flex items-center gap-3">
                  <p className="text-[15px] font-bold flex-1">{item}</p>
                  <div className="flex-[3] bg-black h-5 w-full mr-2"></div>
                  <div className="text-[15px] font-bold flex-1">5.00</div>
                </div>
              );
            })} */}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-5">
        <div className="flex items-center justify-center gap-4">
          <div className="cursor-pointer border-[1px] rounded-lg border-brand-button_color py-1 px-3 hover:bg-brand-button_color transition-all duration-200 ease-in-out hover:text-white">
            Review
          </div>
          <div className="cursor-pointer border-[1px] rounded-lg border-brand-button_color py-1 px-3 hover:bg-brand-button_color transition-all duration-200 ease-in-out hover:text-white">
            Recommended
          </div>
        </div>
        <div className="flex gap-2">
          <p>Sort By: </p>
          <div className="flex items-center justify-center">
            <ShowMoreDropdown items={moreItems} initial="Newest" />
          </div>
        </div>
      </div>
      {reviews.length > 0 ? (
        reviews.map((review: any) => {
          const formateDate = moment(review.createdAt).fromNow();
          return (
            <ReviewContainer
              rating={review?.rating}
              content={review.content}
              userName={review.customer.username}
              createdAt={formateDate}
            />
          );
        })
      ) : (
        <div>No Reviews Yet</div>
      )}
    </div>
  );
};

export default Ratings;
