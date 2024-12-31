import React, { Suspense } from 'react';

// Componente de carga mientras se importan los componentes lazy
const LoadingFallback = () => (
  <div className="loading-fallback">
    <div className="loading-spinner"></div>
    <p>Cargando...</p>
  </div>
);

// Lazy imports
export const LazyCodeExport = React.lazy(() => import('./CodeExport'));
export const LazyWheel = React.lazy(() => import('./Wheel').then(module => ({ default: module.Wheel })));

// HOC para envolver componentes lazy con Suspense
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  FallbackComponent: React.ComponentType = LoadingFallback
) => {
  return function WithSuspenseWrapper(props: P) {
    return (
      <Suspense fallback={<FallbackComponent />}>
        <Component {...props} />
      </Suspense>
    );
  };
};

// Componentes envueltos con Suspense listos para usar
export const CodeExport = withSuspense(LazyCodeExport);
export const Wheel = withSuspense(LazyWheel); 