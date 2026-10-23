import React from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export default function Image({
  src,
  alt = '',
  fill,
  priority,
  className = '',
  sizes,
  loading,
  style,
  ...props
}: ImageProps) {
  const fillClass = fill ? 'absolute inset-0 w-full h-full' : '';
  const loadMode = priority ? 'eager' : (loading || 'lazy');

  return (
    <img
      src={src}
      alt={alt}
      loading={loadMode}
      decoding="async"
      referrerPolicy="no-referrer"
      className={`${fillClass} ${className}`.trim()}
      style={style}
      {...props}
    />
  );
}
