import './Loader.css';

/**
 * TeamSync Loader Component
 * 
 * Um loader animado com barras sincronizadas que representam o conceito de "sync"
 * Usa as cores do design system TeamSync (azul primary + coral accent)
 * 
 * @param {Object} props
 * @param {string} props.size - Tamanho do loader: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.className - Classes CSS adicionais
 * @param {string} props.ariaLabel - Label de acessibilidade (default: 'Loading')
 */
function Loader({ size = 'md', className = '', ariaLabel = 'Loading' }) {
  const sizeClasses = {
    sm: 'ts-loader-sm',
    md: 'ts-loader',
    lg: 'ts-loader-lg'
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className}`} 
      aria-label={ariaLabel}
      role="status"
    >
      <span className="bar b1"></span>
      <span className="bar b2"></span>
      <span className="bar b3"></span>
    </div>
  );
}

export default Loader;
