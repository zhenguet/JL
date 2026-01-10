'use client'

import { useI18n } from '@/i18n/context'
import { Locale, locales } from '@/i18n'
import { Select, MenuItem, FormControl, IconButton } from '@mui/material'
import { colors } from '@/lib/styles/colors'
import { useTheme } from '@/lib/styles/theme/context'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import './LanguageSwitcher.css'

const localeLabels: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  ja: '日本語',
}

const localeIcons: Record<Locale, string> = {
  vi: '/JL/assets/icons/vietnam.png',
  en: '/JL/assets/icons/united-kingdom.png',
  ja: '/JL/assets/icons/japan.png',
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="language-switcher">
      <FormControl sx={{ flex: 1, minWidth: 0 }}>
        <Select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="language-select"
          sx={{
            backgroundColor: 'var(--color-bg-white)',
            borderRadius: '8px',
            boxShadow: `0 2px 4px ${colors.blackOverlay10}`,
            padding: '12px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: colors.primary,
            '&:hover': {
              backgroundColor: colors.bgLight,
              boxShadow: `0 4px 8px ${colors.blackOverlay15}`,
            },
            '&.Mui-focused': {
              backgroundColor: 'var(--color-bg-white)',
              boxShadow: `0 4px 8px ${colors.blackOverlay15}`,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '& .MuiSelect-select': {
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            },
          }}
          renderValue={(value) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <img
                src={localeIcons[value]}
                alt={localeLabels[value]}
                className="language-icon"
              />
              <span style={{ fontWeight: 600, color: colors.primary }}>{localeLabels[value]}</span>
            </div>
          )}
        >
          {locales.map((loc) => (
            <MenuItem key={loc} value={loc} sx={{ padding: '10px 16px' }}>
              <img
                src={localeIcons[loc]}
                alt={localeLabels[loc]}
                className="language-option-icon"
              />
              <span style={{ marginLeft: '10px', fontWeight: 500 }}>{localeLabels[loc]}</span>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <IconButton
        onClick={toggleTheme}
        className="theme-toggle"
        sx={{
          backgroundColor: 'var(--color-bg-white)',
          borderRadius: '8px',
          boxShadow: `0 2px 4px ${colors.blackOverlay10}`,
          padding: '12px',
          color: colors.primary,
          flexShrink: 0,
          '&:hover': {
            backgroundColor: colors.bgLight,
            boxShadow: `0 4px 8px ${colors.blackOverlay15}`,
          },
        }}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </div>
  )
}
