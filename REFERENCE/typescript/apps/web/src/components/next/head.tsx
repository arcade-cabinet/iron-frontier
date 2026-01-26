import type React from 'react';

interface HeadProps {
  children?: React.ReactNode;
}

const Head: React.FC<HeadProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default Head;
