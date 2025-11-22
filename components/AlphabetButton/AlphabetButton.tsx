'use client'

import { useState } from 'react'
import { AlphabetModal } from '@/components'
import './AlphabetButton.css'

export default function AlphabetButton() {
  const [isAlphabetModalOpen, setIsAlphabetModalOpen] = useState(false)

  return (
    <>
      <button
        className="alphabet-floating-btn"
        onClick={() => setIsAlphabetModalOpen(true)}
        aria-label="Xem bảng chữ cái"
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

