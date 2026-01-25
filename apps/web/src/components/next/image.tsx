import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
}

const Image: React.FC<ImageProps> = ({ src, alt, width, height, ...props }) => (
  <img src={src} alt={alt} width={width} height={height} {...props} />
);

export default Image;
