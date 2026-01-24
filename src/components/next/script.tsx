import React from "react";

interface ScriptProps extends React.ScriptHTMLAttributes<HTMLScriptElement> {
  src?: string;
  strategy?: "beforeInteractive" | "afterInteractive" | "lazyOnload";
  children?: React.ReactNode;
}

const Script: React.FC<ScriptProps> = ({ src, strategy, children, ...props }) => {
  return (
    <script src={src} {...props}>
      {children}
    </script>
  );
};

export default Script;
