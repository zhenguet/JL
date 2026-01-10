import { css, CSSObject, SerializedStyles } from '@emotion/react'

type StyleValue = CSSObject | SerializedStyles

type StyleSheet<T extends Record<string, StyleValue>> = {
  [K in keyof T]: SerializedStyles
}

export function create<T extends Record<string, StyleValue>>(
  styles: T
): StyleSheet<T> {
  const result = {} as StyleSheet<T>
  
  for (const key in styles) {
    if (Object.prototype.hasOwnProperty.call(styles, key)) {
      const style = styles[key]
      if (style && typeof style === 'object' && 'name' in style && style.name === 'css') {
        result[key] = style as SerializedStyles
      } else {
        result[key] = css(style as CSSObject)
      }
    }
  }
  
  return result
}

export const StyleSheet = {
  create,
}
