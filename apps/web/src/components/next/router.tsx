import React, { createContext, useContext, ReactNode } from "react";

interface RouterContextType {
  pathname: string;
  push: (url: string) => void;
  replace: (url: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  pathname: "/",
  push: () => {},
  replace: () => {},
});

export const useRouter = (): RouterContextType => useContext(RouterContext);

export const usePathname = (): string => {
  const router = useRouter();
  return router.pathname;
};

interface RouterProviderProps {
  children: ReactNode;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({ children }) => {
  const router: RouterContextType = {
    pathname: "/",
    push: (url: string) => {
      console.log(`Navigating to ${url}`);
    },
    replace: (url: string) => {
      console.log(`Replacing with ${url}`);
    },
  };

  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
};
