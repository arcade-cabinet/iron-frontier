import React from "react";

interface HtmlProps extends React.HTMLAttributes<HTMLHtmlElement> {
  children?: React.ReactNode;
}

interface HeadProps {
  children?: React.ReactNode;
}

const Html: React.FC<HtmlProps> = ({ children, ...props }) => <html {...props}>{children}</html>;
const Head: React.FC<HeadProps> = ({ children = null }) => <head>{children}</head>;
const Main: React.FC = () => <div id="__next"></div>;
const NextScript: React.FC = () => <script />;

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export { Html, Head, Main, NextScript };
