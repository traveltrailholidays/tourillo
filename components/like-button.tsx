'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { addToWishlist, removeFromWishlist } from '@/lib/actions/wishlist-actions';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface LikeButtonProps {
  listingId: string;
  initialLiked?: boolean; // Server-provided initial state
  backgroundColor?: string;
}

export default function LikeButton({
  listingId,
  initialLiked = false,
  backgroundColor = 'background',
}: LikeButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated, addToWishlist: addToStore, removeFromWishlist: removeFromStore } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(initialLiked);

  // Sync with Zustand store after mount
  useEffect(() => {
    const storeHasListing = user?.wishlistId?.includes(listingId);
    if (storeHasListing !== undefined) {
      setIsLiked(storeHasListing);
    }
  }, [user, listingId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      toast.error('Please login to add to wishlist');
      router.push('/login');
      return;
    }

    setIsLoading(true);

    // Optimistic update
    setIsLiked(!isLiked);

    try {
      if (isLiked) {
        const result = await removeFromWishlist(listingId);
        if (result.success) {
          removeFromStore(listingId);
          toast.success('Removed from wishlist');
        } else {
          setIsLiked(true); // Revert on error
          toast.error(result.error || 'Failed to remove from wishlist');
        }
      } else {
        const result = await addToWishlist(listingId);
        if (result.success) {
          addToStore(listingId);
          toast.success('Added to wishlist');
        } else {
          setIsLiked(false); // Revert on error
          toast.error(result.error || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      setIsLiked(!isLiked); // Revert on error
      toast.error('Something went wrong');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`bg-${backgroundColor} p-2 rounded transition-colors disabled:opacity-50 cursor-pointer`}
      aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isLiked ? <IoMdHeart className="h-5 w-5 text-red-500" /> : <IoMdHeartEmpty className="h-5 w-5" />}
    </button>
  );
}
