/**
 * Button Component - Design System Base
 * 
 * Variants:
 * - primary: Main action buttons (default)
 * - secondary: Secondary actions
 * - danger: Destructive actions
 * - outline: Outlined buttons
 * - ghost: Minimal style buttons
 * 
 * Sizes:
 * - sm: Small
 * - md: Medium (default)
 * - lg: Large
 */

function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  as: Component = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-600 focus:ring-primary active:bg-primary-700 shadow-sm hover:shadow-md transition-all duration-200',
    accent: 'bg-primary text-white hover:bg-primary-600 focus:ring-primary active:bg-primary-700 shadow-sm hover:shadow-md transition-all duration-200',
    secondary: 'bg-navy-900 text-white hover:bg-navy-800 focus:ring-navy-700 active:bg-navy-700 shadow-sm hover:shadow-md transition-all duration-200',
    danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 active:bg-error-700 shadow-sm hover:shadow-md transition-all duration-200',
    outline: 'border-2 border-white text-white hover:bg-white/10 focus:ring-white/50 active:bg-white/20 transition-all duration-200',
    ghost: 'text-navy-700 hover:bg-grey-100 focus:ring-grey-300 active:bg-grey-200 transition-all duration-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;

  // Se for um link, não usar type e disabled
  const isLink = Component !== 'button';
  const buttonProps = isLink 
    ? { ...props }
    : { type, disabled: disabled || loading, ...props };

  return (
    <Component
      className={`${baseStyles} ${variantClasses} ${sizeClasses} ${className}`}
      onClick={onClick}
      {...buttonProps}
    >
      {loading && !isLink ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          A carregar...
        </>
      ) : (
        children
      )}
    </Component>
  );
}

export default Button;
