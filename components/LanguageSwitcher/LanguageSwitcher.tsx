'use client'

import { useI18n } from '@/i18n/context'
import { Locale, locales } from '@/i18n'
import { Select, MenuItem, FormControl } from '@mui/material'
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

  return (
    <div className="language-switcher">
      <FormControl sx={{ minWidth: '100%' }}>
        <Select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="language-select"
          sx={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '12px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#667eea',
            '&:hover': {
              backgroundColor: '#f8f9fa',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            },
            '&.Mui-focused': {
              backgroundColor: 'white',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
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
              <span style={{ fontWeight: 600, color: '#667eea' }}>{localeLabels[value]}</span>
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
    </div>
  )
}
