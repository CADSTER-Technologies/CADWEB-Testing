import React from 'react';

type Props = {
  src: string;
  alt: string;
  height?: number;   // target render height inside the card
  aspect?: number;   // width / height
  className?: string;
};

export default function ImageLogo({ src, alt, height = 84, aspect = 1.6, className }: Props) {
  const width = Math.round(height * aspect);
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={width}
        height={height}
        style={{
          height: '100%',
          width: 'auto',
          objectFit: 'contain',
          imageRendering: 'auto',
          filter: 'drop-shadow(0 0 6px rgba(0,225,255,0.25))',
          maxWidth: 180, // clamp very wide logos
        }}
        className={className}
      />
    </div>
  );
}
