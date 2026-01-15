/**
 * Card Component - Design System Base
 * 
 * A flexible card component for displaying content in containers
 */

function Card({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
  ...props
}) {
  const baseStyles = 'bg-white rounded-2xl border border-grey';
  
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const hoverStyles = hover ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1' : '';

  const paddingClass = paddingStyles[padding] || paddingStyles.md;
  const shadowClass = shadowStyles[shadow] || shadowStyles.md;

  return (
    <div
      className={`${baseStyles} ${paddingClass} ${shadowClass} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Header Component
function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

// Card Title Component
function CardTitle({ children, className = '', as: Component = 'h3' }) {
  return (
    <Component className={`text-xl font-bold text-navy-900 ${className}`}>
      {children}
    </Component>
  );
}

// Card Description Component
function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-navy-700 mt-1 ${className}`}>
      {children}
    </p>
  );
}

// Card Content Component
function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Card Footer Component
function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-grey ${className}`}>
      {children}
    </div>
  );
}

// Export main Card and sub-components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
