import { forwardRef } from 'react';
import styles from './Button.module.css';

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      className = '',
      ...props
    },
    ref,
  ) => {
    const classes = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={classes} disabled={props.disabled || loading} {...props}>
        {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
        <span>{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
