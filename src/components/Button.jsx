import './Button.css'

const VARIANT_CLASS = {
  primary: 'ya-btn--primary',
  secondary: 'ya-btn--secondary',
  outline: 'ya-btn--outline',
  danger: 'ya-btn--danger',
  icon: 'ya-btn--icon',
}

function Button({
  children,
  variant = 'primary',
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...rest
}) {
  const variantClass = VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary

  return (
    <button type={type} className={`ya-btn ${variantClass} ${className}`.trim()} {...rest}>
      {Icon && iconPosition === 'left' && <Icon size={18} aria-hidden="true" />}
      {children && <span>{children}</span>}
      {Icon && iconPosition === 'right' && <Icon size={18} aria-hidden="true" />}
    </button>
  )
}

export default Button
