import type * as React from 'react'

export function getAxisPositions<T extends HTMLElement = HTMLElement>(event: React.MouseEvent<T>, target: T) {
  const xPosition = event.clientX - target.offsetLeft

  const yPosition = event.clientY - target.offsetTop

  return { xPosition, yPosition }
}
