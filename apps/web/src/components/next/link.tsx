import React from "react";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, children, ...props }) => (
  <a href={href} {...props}>
    {children}
  </a>
);

export default Link;
