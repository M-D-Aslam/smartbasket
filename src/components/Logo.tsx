import React from 'react';
import { cn } from '../lib/utils';
import { ShoppingCart } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  showSlogan?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ 
  className, 
  showText = true, 
  showSlogan = false,
  size = 'md',
  variant = 'dark'
}) => {
  const sizes = {
    sm: { 
      container: 'w-8 h-8 rounded-lg', 
      icon: 'w-4 h-4', 
      text: 'text-xl', 
      slogan: 'text-[9px]' 
    },
    md: { 
      container: 'w-10 h-10 rounded-xl', 
      icon: 'w-5 h-5', 
      text: 'text-2xl', 
      slogan: 'text-[11px]' 
    },
    lg: { 
      container: 'w-12 h-12 rounded-2xl', 
      icon: 'w-6 h-6', 
      text: 'text-3xl', 
      slogan: 'text-[13px]' 
    },
    xl: { 
      container: 'w-16 h-16 rounded-[1.5rem]', 
      icon: 'w-8 h-8', 
      text: 'text-5xl', 
      slogan: 'text-[16px]' 
    },
  };

  const currentSize = sizes[size];

  return (
    <div className={cn("flex flex-col items-start", className)}>
      <div className="flex items-center gap-2 lg:gap-3">
        <div className={cn(
          "bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-100 flex-shrink-0",
          currentSize.container
        )}>
          <ShoppingCart className={cn("text-white", currentSize.icon)} />
        </div>

        {showText && (
          <div className="flex flex-col leading-none">
            <span className={cn(
              "font-display font-black tracking-tight", 
              currentSize.text,
              variant === 'dark' ? 'text-gray-900' : 'text-white'
            )}>
              Smart<span className={variant === 'dark' ? 'text-brand-600' : 'text-white/80'}>Basket</span>
            </span>
            {showSlogan && (
              <span className={cn(
                "font-sans font-bold tracking-widest uppercase mt-1.5", 
                currentSize.slogan,
                variant === 'dark' ? 'text-gray-400' : 'text-gray-300'
              )}>
                Freshness Delivered
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
