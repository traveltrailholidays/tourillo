'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface ShareButtonProps {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'copy';
  url: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ platform, url, title, children, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      case 'copy':
        return url;
      default:
        return '#';
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    } else {
      window.open(getShareUrl(), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {platform === 'copy' && copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Copied!
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default ShareButton;
