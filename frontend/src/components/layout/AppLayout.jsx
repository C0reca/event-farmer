/**
 * AppLayout Component - Layout base para todas as páginas
 * 
 * Fornece um layout consistente com:
 * - Container centralizado
 * - Espaçamento consistente
 * - Responsividade
 */

function AppLayout({
  children,
  title,
  description,
  maxWidth = '7xl',
  className = '',
  showHeader = true,
}) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const containerClass = maxWidthClasses[maxWidth] || maxWidthClasses['7xl'];

  return (
    <div className={`min-h-screen bg-secondary-50 ${className}`}>
      <div className={`${containerClass} mx-auto container-padding section-spacing`}>
        {showHeader && (title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-base md:text-lg text-secondary-600">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default AppLayout;
