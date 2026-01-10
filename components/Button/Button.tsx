'use client'

import { Button as MuiButton, ButtonProps as MuiButtonProps, SxProps, Theme } from '@mui/material'
import './Button.css'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'submit' | 'next' | 'nav'

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: ButtonVariant
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  sx,
  ...props
}: ButtonProps) {
  const getVariantStyles = (): SxProps<Theme> => {
    const baseStyles = {
      padding: '12px 24px',
      fontSize: '1rem',
      fontWeight: 600,
      borderRadius: '8px',
      textTransform: 'none' as const,
      transition: 'all 0.3s ease',
      '&:hover:not(:disabled)': {
        transform: 'translateY(-2px)',
      },
      '&:disabled': {
        opacity: 0.6,
        cursor: 'not-allowed',
        transform: 'none !important',
      },
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          background: 'var(--gradient-primary)',
          color: 'var(--color-white)',
          '&:hover:not(:disabled)': {
            ...baseStyles['&:hover:not(:disabled)'],
            boxShadow: `0 4px 12px var(--shadow-primary)`,
          },
        }
      case 'secondary':
        return {
          ...baseStyles,
          background: 'var(--color-secondary)',
          color: 'var(--color-white)',
          '&:hover:not(:disabled)': {
            ...baseStyles['&:hover:not(:disabled)'],
            background: 'var(--color-secondary-dark)',
          },
        }
      case 'success':
        return {
          ...baseStyles,
          background: 'var(--color-success)',
          color: 'var(--color-white)',
          '&:hover:not(:disabled)': {
            ...baseStyles['&:hover:not(:disabled)'],
            background: 'var(--color-success-dark)',
            boxShadow: `0 4px 8px var(--shadow-success)`,
          },
        }
      case 'danger':
        return {
          ...baseStyles,
          background: 'var(--color-danger)',
          color: 'var(--color-white)',
          '&:hover:not(:disabled)': {
            ...baseStyles['&:hover:not(:disabled)'],
            background: 'var(--color-danger-dark)',
            boxShadow: `0 4px 8px var(--shadow-danger)`,
          },
        }
      case 'submit':
        return {
          ...baseStyles,
          padding: '12px 32px',
          fontSize: '1.1rem',
          background: 'var(--gradient-primary)',
          color: 'var(--color-white)',
          '&:hover:not(:disabled)': {
            ...baseStyles['&:hover:not(:disabled)'],
            boxShadow: `0 4px 12px var(--shadow-primary)`,
          },
        }
      case 'next':
        return {
          ...baseStyles,
          padding: '12px 32px',
          fontSize: '1.1rem',
          background: 'var(--color-success)',
          color: 'var(--color-white)',
          '&:hover:not(:disabled)': {
            ...baseStyles['&:hover:not(:disabled)'],
            background: 'var(--color-success-dark)',
          },
        }
      case 'nav':
        return {
          ...baseStyles,
          background: 'var(--color-primary)',
          color: 'var(--color-white)',
          '&:hover:not(:disabled)': {
            ...baseStyles['&:hover:not(:disabled)'],
            background: 'var(--color-primary-dark)',
          },
        }
      default:
        return baseStyles
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <MuiButton
      {...props}
      className={`app-button app-button-${variant} ${className}`}
      sx={sx ? [variantStyles, sx] as SxProps<Theme> : variantStyles}
    >
      {children}
    </MuiButton>
  )
}
