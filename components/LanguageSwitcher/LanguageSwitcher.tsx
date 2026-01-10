'use client'

import { useI18n } from '@/i18n/context'
import { Locale, locales } from '@/i18n'
import { Select, MenuItem, FormControl, IconButton } from '@mui/material'
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

interface LanguageSwitcherProps {
  showDarkLight?: boolean
}

export default function LanguageSwitcher({ showDarkLight = true }: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="language-switcher">
      <FormControl className="language-select-form-control" sx={{ flex: 1, minWidth: 0 }}>
        <Select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="language-select"
          renderValue={(value) => (
            <div className="language-select-value">
              <img
                src={localeIcons[value]}
                alt={localeLabels[value]}
                className="language-icon"
              />
              <span className="language-select-value-text">{localeLabels[value]}</span>
            </div>
          )}
        >
          {locales.map((loc) => (
            <MenuItem key={loc} value={loc}>
              <img
                src={localeIcons[loc]}
                alt={localeLabels[loc]}
                className="language-option-icon"
              />
              <span className="language-option-text">{localeLabels[loc]}</span>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {showDarkLight && (
        <IconButton
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      )}
    </div>
  )
}
