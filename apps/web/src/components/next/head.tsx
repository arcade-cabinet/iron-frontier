import React, { Fragment, type FC, type ReactNode } from 'react';

interface HeadProps {
  children?: ReactNode;
}

const Head: FC<HeadProps> = ({ children }) => {
  return <Fragment>{children}</Fragment>;
};

export default Head;
