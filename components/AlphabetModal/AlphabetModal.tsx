'use client'

import React, { useState } from 'react'
import { useI18n } from '@/i18n/context'
import { Button } from '@/components'
import './AlphabetModal.css'

interface AlphabetModalProps {
  isOpen: boolean
  onClose: () => void
}

const hiraganaBasic = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', '', 'ゆ', '', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', '', '', '', 'を'],
]

const hiraganaRomaji = [
  ['a', 'i', 'u', 'e', 'o'],
  ['ka', 'ki', 'ku', 'ke', 'ko'],
  ['sa', 'shi', 'su', 'se', 'so'],
  ['ta', 'chi', 'tsu', 'te', 'to'],
  ['na', 'ni', 'nu', 'ne', 'no'],
  ['ha', 'hi', 'fu', 'he', 'ho'],
  ['ma', 'mi', 'mu', 'me', 'mo'],
  ['ya', '', 'yu', '', 'yo'],
  ['ra', 'ri', 'ru', 're', 'ro'],
  ['wa', '', '', '', 'wo'],
]

const hiraganaCombined = [
  ['きゃ', 'きゅ', 'きょ', 'ぎゃ', 'ぎゅ', 'ぎょ'],
  ['しゃ', 'しゅ', 'しょ', 'じゃ', 'じゅ', 'じょ'],
  ['ちゃ', 'ちゅ', 'ちょ', 'びゃ', 'びゅ', 'びょ'],
  ['にゃ', 'にゅ', 'にょ', 'ぴゃ', 'ぴゅ', 'ぴょ'],
  ['ひゃ', 'ひゅ', 'ひょ', '', '', ''],
  ['みゃ', 'みゅ', 'みょ', '', '', ''],
  ['りゃ', 'りゅ', 'りょ', '', '', ''],
]

const hiraganaCombinedRomaji = [
  ['kya', 'kyu', 'kyo', 'gya', 'gyu', 'gyo'],
  ['sha', 'shu', 'sho', 'ja', 'ju', 'jo'],
  ['cha', 'chu', 'cho', 'bya', 'byu', 'byo'],
  ['nya', 'nyu', 'nyo', 'pya', 'pyu', 'pyo'],
  ['hya', 'hyu', 'hyo', '', '', ''],
  ['mya', 'myu', 'myo', '', '', ''],
  ['rya', 'ryu', 'ryo', '', '', ''],
]

const katakanaBasic = [
  ['ア', 'イ', 'ウ', 'エ', 'オ'],
  ['カ', 'キ', 'ク', 'ケ', 'コ'],
  ['サ', 'シ', 'ス', 'セ', 'ソ'],
  ['タ', 'チ', 'ツ', 'テ', 'ト'],
  ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
  ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
  ['マ', 'ミ', 'ム', 'メ', 'モ'],
  ['ヤ', '', 'ユ', '', 'ヨ'],
  ['ラ', 'リ', 'ル', 'レ', 'ロ'],
  ['ワ', '', '', '', 'ヲ'],
]

const katakanaRomaji = [
  ['a', 'i', 'u', 'e', 'o'],
  ['ka', 'ki', 'ku', 'ke', 'ko'],
  ['sa', 'shi', 'su', 'se', 'so'],
  ['ta', 'chi', 'tsu', 'te', 'to'],
  ['na', 'ni', 'nu', 'ne', 'no'],
  ['ha', 'hi', 'fu', 'he', 'ho'],
  ['ma', 'mi', 'mu', 'me', 'mo'],
  ['ya', '', 'yu', '', 'yo'],
  ['ra', 'ri', 'ru', 're', 'ro'],
  ['wa', '', '', '', 'wo'],
]

const katakanaCombined = [
  ['キャ', 'キュ', 'キョ', 'ギャ', 'ギュ', 'ギョ'],
  ['シャ', 'シュ', 'ショ', 'ジャ', 'ジュ', 'ジョ'],
  ['チャ', 'チュ', 'チョ', 'ビャ', 'ビュ', 'ビョ'],
  ['ニャ', 'ニュ', 'ニョ', 'ピャ', 'ピュ', 'ピョ'],
  ['ヒャ', 'ヒュ', 'ヒョ', '', '', ''],
  ['ミャ', 'ミュ', 'ミョ', '', '', ''],
  ['リャ', 'リュ', 'リョ', '', '', ''],
]

const katakanaCombinedRomaji = [
  ['kya', 'kyu', 'kyo', 'gya', 'gyu', 'gyo'],
  ['sha', 'shu', 'sho', 'ja', 'ju', 'jo'],
  ['cha', 'chu', 'cho', 'bya', 'byu', 'byo'],
  ['nya', 'nyu', 'nyo', 'pya', 'pyu', 'pyo'],
  ['hya', 'hyu', 'hyo', '', '', ''],
  ['mya', 'myu', 'myo', '', '', ''],
  ['rya', 'ryu', 'ryo', '', '', ''],
]

export default function AlphabetModal({ isOpen, onClose }: AlphabetModalProps) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana'>('hiragana')

  if (!isOpen) return null

  return (
    <div className="alphabet-modal-overlay" onClick={onClose}>
      <div className="alphabet-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="alphabet-modal-header">
          <h2>{t.alphabet.title}</h2>
          <Button
            variant="secondary"
            onClick={onClose}
            className="alphabet-modal-close"
          >
            ×
          </Button>
        </div>

        <div className="alphabet-tabs">
          <Button
            variant="secondary"
            onClick={() => setActiveTab('hiragana')}
            className={`alphabet-tab ${activeTab === 'hiragana' ? 'active' : ''}`}
          >
            Hiragana
          </Button>
          <Button
            variant="secondary"
            onClick={() => setActiveTab('katakana')}
            className={`alphabet-tab ${activeTab === 'katakana' ? 'active' : ''}`}
          >
            Katakana
          </Button>
        </div>

        <div className="alphabet-content">
          {activeTab === 'hiragana' ? (
            <>
              <div className="alphabet-section">
                <h3>{t.alphabet.basicTable}</h3>
                <table className="alphabet-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>a</th>
                      <th>i</th>
                      <th>u</th>
                      <th>e</th>
                      <th>o</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hiraganaBasic.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="row-header">{hiraganaRomaji[rowIndex][0]?.charAt(0) || ''}</td>
                        {row.map((char, colIndex) => (
                          <td key={colIndex} className={char ? '' : 'empty'}>
                            {char && (
                              <>
                                <div className="char-kanji">{char}</div>
                                <div className="char-romaji">{hiraganaRomaji[rowIndex][colIndex]}</div>
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="alphabet-section">
                <h3>{t.alphabet.combinedTable}</h3>
                <table className="alphabet-table combined">
                  <thead>
                    <tr>
                      <th></th>
                      <th>ya</th>
                      <th>yu</th>
                      <th>yo</th>
                      <th>ya</th>
                      <th>yu</th>
                      <th>yo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hiraganaCombined.map((row, rowIndex) => {
                      const headers = [
                        'k/g',
                        's/j',
                        'ch/b',
                        'n/p',
                        'h',
                        'm',
                        'r'
                      ]
                      const header = headers[rowIndex] || ''
                      return (
                        <tr key={rowIndex}>
                          <td className="row-header">{header}</td>
                          {row.map((char, colIndex) => (
                            <td key={colIndex} className={char ? '' : 'empty'}>
                              {char && (
                                <>
                                  <div className="char-kanji">{char}</div>
                                  <div className="char-romaji">{hiraganaCombinedRomaji[rowIndex][colIndex]}</div>
                                </>
                              )}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="alphabet-section">
                <h3>{t.alphabet.basicTable}</h3>
                <table className="alphabet-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>a</th>
                      <th>i</th>
                      <th>u</th>
                      <th>e</th>
                      <th>o</th>
                    </tr>
                  </thead>
                  <tbody>
                    {katakanaBasic.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="row-header">{katakanaRomaji[rowIndex][0]?.charAt(0) || ''}</td>
                        {row.map((char, colIndex) => (
                          <td key={colIndex} className={char ? '' : 'empty'}>
                            {char && (
                              <>
                                <div className="char-kanji">{char}</div>
                                <div className="char-romaji">{katakanaRomaji[rowIndex][colIndex]}</div>
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="alphabet-section">
                <h3>{t.alphabet.combinedTable}</h3>
                <table className="alphabet-table combined">
                  <thead>
                    <tr>
                      <th></th>
                      <th>ya</th>
                      <th>yu</th>
                      <th>yo</th>
                      <th>ya</th>
                      <th>yu</th>
                      <th>yo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {katakanaCombined.map((row, rowIndex) => {
                      const headers = [
                        'k/g',
                        's/j',
                        'ch/b',
                        'n/p',
                        'h',
                        'm',
                        'r'
                      ]
                      const header = headers[rowIndex] || ''
                      return (
                        <tr key={rowIndex}>
                          <td className="row-header">{header}</td>
                          {row.map((char, colIndex) => (
                            <td key={colIndex} className={char ? '' : 'empty'}>
                              {char && (
                                <>
                                  <div className="char-kanji">{char}</div>
                                  <div className="char-romaji">{katakanaCombinedRomaji[rowIndex][colIndex]}</div>
                                </>
                              )}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="alphabet-footer">
          <p>
            発音はNHKワールド JAPANのウェブサイトで聞くことができます。
            <br />
            <a
              href={activeTab === 'hiragana' 
                ? 'https://www.nhk.or.jp/lesson/ja/letters/hiragana.html'
                : 'https://www.nhk.or.jp/lesson/ja/letters/katakana.html'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="alphabet-link"
            >
              {activeTab === 'hiragana' 
                ? 'https://www.nhk.or.jp/lesson/ja/letters/hiragana.html'
                : 'https://www.nhk.or.jp/lesson/ja/letters/katakana.html'
              }
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

