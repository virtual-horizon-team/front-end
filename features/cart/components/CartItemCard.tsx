import React, { useState } from 'react';
import { CartCourseDto } from '../types/cart';
import { Star, Clock, BookOpen, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface CartItemCardProps {
  item: CartCourseDto;
  onRemove: (cartItemId: string) => Promise<void>;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({ item, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await onRemove(item.cartItemId);
    } catch (error) {
      setIsRemoving(false);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row border border-brand-border rounded-xl overflow-hidden mb-4 bg-white shadow-sm transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${isRemoving ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="w-full sm:w-48 h-32 sm:h-auto relative flex-shrink-0 bg-brand-soft">
        {item.thumbnailUrl ? (
          <Image 
            src={item.thumbnailUrl} 
            alt={item.title} 
            fill 
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 192px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-muted bg-brand-soft">
            <BookOpen size={32} />
          </div>
        )}
      </div>
      
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-serif text-[18px] leading-snug font-normal text-brand-navy hover:text-brand-primary transition-colors line-clamp-2">
              {item.title}
            </h3>
            <div className="font-serif text-[20px] font-normal text-brand-primary whitespace-nowrap">
              {item.price !== null ? (
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: item.currency || 'USD',
                  maximumFractionDigits: 0
                }).format(item.price)
              ) : 'Free'}
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-2.5">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-peach text-brand-primary">
              {item.level}
            </span>
            <div className="flex items-center text-yellow-500 text-sm font-medium">
              <Star className="w-4 h-4 fill-current mr-1 text-yellow-400" />
              {item.averageRating.toFixed(1)}
            </div>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-brand-muted space-x-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 opacity-75" />
              {formatDuration(item.totalDurationMinutes)}
            </div>
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5 opacity-75" />
              {item.totalLectures} lectures
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleRemove}
            disabled={isRemoving}
            className="flex items-center text-sm font-semibold text-brand-primary hover:text-brand-hover transition-colors cursor-pointer"
          >
            {isRemoving ? (
              <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mr-1.5"></span>
            ) : (
              <Trash2 className="w-4 h-4 mr-1.5" />
            )}
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
