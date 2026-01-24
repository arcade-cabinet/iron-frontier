import React, { Suspense, ComponentType } from "react";

interface DynamicOptions {
  ssr?: boolean;
  loading?: ComponentType;
}

function dynamic<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: DynamicOptions = {}
): ComponentType<P> {
  const {
    loading: LoadingComponent = () => <div>Loading...</div>,
  } = options;

  const LazyComponent = React.lazy(importFunc);

  return (props: P) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

export default dynamic;
