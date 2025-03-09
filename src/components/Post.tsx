'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';

interface PostProps {
  data: Record<string, any>;
}

const Post: React.FC<PostProps> = ({ data }) => {
  const router = useRouter();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const goToUser = useCallback((event: any) => {
    event.stopPropagation();
    router.push(`/users/${data.user.username}`);
  }, [router, data.user.username]);

  const createdAt = useCallback(() => {
    if (!data?.createdAt) {
      return null;
    }

    return formatDistanceToNowStrict(new Date(data.createdAt));
  }, [data?.createdAt]);

  const openImageModal = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsImageModalOpen(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeImageModal = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setIsImageModalOpen(false);
    // Restore body scrolling
    document.body.style.overflow = 'unset';
  }, []);

  return (
    <>
      <div className="border-b border-[var(--border-color)] p-6 cursor-pointer hover:bg-[var(--hover-bg)] transition">
        <div className="flex flex-row items-start gap-4">
          <div onClick={goToUser} className="flex-shrink-0">
            {(data.user.profileImage || data.user.image) ? (
              <div className="rounded-full h-12 w-12 overflow-hidden border border-[var(--border-color)]">
                <img
                  src={data.user.profileImage || data.user.image}
                  alt={data.user.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-full h-12 w-12 bg-[var(--secondary-bg)] border border-[var(--border-color)] flex items-center justify-center">
                <span className="text-lg text-[var(--primary-text)]">
                  {data.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-grow">
            <div className="flex flex-row items-center gap-2">
              <p onClick={goToUser} className="text-[var(--primary-text)] font-semibold cursor-pointer hover:text-[var(--accent-color)] transition">
                {data.user.name}
              </p>
              <span onClick={goToUser} className="text-[var(--secondary-text)] cursor-pointer hover:text-[var(--accent-color)] hidden md:block transition">
                @{data.user.username}
              </span>
              <span className="text-[var(--secondary-text)] text-sm">
                · {createdAt()}
              </span>
            </div>
            <div className="text-[var(--primary-text)] mt-2 leading-relaxed">
              {data.body}
            </div>
            {data.image && (
              <div 
                className="mt-3 rounded-lg overflow-hidden bg-[var(--secondary-bg)] cursor-pointer"
                onClick={openImageModal}
              >
                <img
                  src={data.image}
                  alt="Post image"
                  className="max-h-[300px] w-auto object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen image modal */}
      {isImageModalOpen && data.image && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <button 
            className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
            onClick={closeImageModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={data.image}
            alt="Full-screen post image"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default Post; 