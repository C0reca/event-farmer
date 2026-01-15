/**
 * Input Component - Design System Base
 * 
 * A consistent input component for forms
 */

function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  required = false,
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const baseInputStyles = 'w-full px-4 py-2.5 text-base text-navy-900 bg-white border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const inputStyles = hasError
    ? `${baseInputStyles} border-error-500 focus:border-error-500 focus:ring-error-500`
    : `${baseInputStyles} border-grey focus:border-primary focus:ring-primary`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-navy-700 mb-1.5"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        className={inputStyles}
        aria-invalid={hasError}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-error-600" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-navy-600">
          {helperText}
        </p>
      )}
    </div>
  );
}

// Select Component
function Select({
  label,
  error,
  helperText,
  className = '',
  id,
  required = false,
  children,
  ...props
}) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const baseSelectStyles = 'w-full px-4 py-2.5 text-base text-navy-900 bg-white border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")] bg-no-repeat bg-right pr-10';
  
  const selectStyles = hasError
    ? `${baseSelectStyles} border-error-500 focus:border-error-500 focus:ring-error-500`
    : `${baseSelectStyles} border-grey focus:border-primary focus:ring-primary`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-navy-700 mb-1.5"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        className={selectStyles}
        aria-invalid={hasError}
        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
        {...props}
      >
        {children}
      </select>
      
      {error && (
        <p id={`${selectId}-error`} className="mt-1.5 text-sm text-danger-600" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-secondary-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

// Textarea Component
function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  required = false,
  rows = 3,
  ...props
}) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const baseTextareaStyles = 'w-full px-4 py-2.5 text-base text-navy-900 bg-white border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed resize-y';
  
  const textareaStyles = hasError
    ? `${baseTextareaStyles} border-error-500 focus:border-error-500 focus:ring-error-500`
    : `${baseTextareaStyles} border-grey focus:border-primary focus:ring-primary`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-semibold text-navy-700 mb-1.5"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        rows={rows}
        className={textareaStyles}
        aria-invalid={hasError}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        {...props}
      />
      
      {error && (
        <p id={`${textareaId}-error`} className="mt-1.5 text-sm text-danger-600" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${textareaId}-helper`} className="mt-1.5 text-sm text-secondary-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

// Export all input components
Input.Select = Select;
Input.Textarea = Textarea;

export default Input;
