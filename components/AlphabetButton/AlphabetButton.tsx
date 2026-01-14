'use client'

import { useState } from 'react'
import { AlphabetModal, Button } from '@/components'
import { useI18n } from '@/i18n/context'
import './AlphabetButton.css'

export default function AlphabetButton() {
  const { t } = useI18n()
  const [isAlphabetModalOpen, setIsAlphabetModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsAlphabetModalOpen(true)}
        aria-label={t.alphabet.viewAlphabet}
        className="alphabet-floating-btn"
      >
        あ
      </Button>

      <AlphabetModal
        isOpen={isAlphabetModalOpen}
        onClose={() => setIsAlphabetModalOpen(false)}
      />
    </>
  )
}

