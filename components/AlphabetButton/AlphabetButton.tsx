'use client'

import { useState } from 'react'
import { AlphabetModal } from '@/components'
import { useI18n } from '@/i18n/context'
import './AlphabetButton.css'

export default function AlphabetButton() {
  const { t } = useI18n()
  const [isAlphabetModalOpen, setIsAlphabetModalOpen] = useState(false)

  return (
    <>
      <button
        className="alphabet-floating-btn"
        onClick={() => setIsAlphabetModalOpen(true)}
        aria-label={t.alphabet.viewAlphabet}
      >
        あ
      </button>

      <AlphabetModal
        isOpen={isAlphabetModalOpen}
        onClose={() => setIsAlphabetModalOpen(false)}
      />
    </>
  )
}

