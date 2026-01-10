'use client'

import * as React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme } from '@mui/material/styles'
import { colors } from '../colors'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.primaryDark,
    },
  },
})

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

