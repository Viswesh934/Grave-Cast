import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DoodleStrip } from 'groove-ui/doodle'
import { findKitCard } from '../kit/cards'
import { KIT_PROTOTYPE_NOTICE } from '../kit/recoveryPosition'
import { ui } from './ui'

/** One kit card: the whole comic on one page, with each step also written out. */
export function KitCardPage() {
  const { slug } = useParams()
  const card = findKitCard(slug)

  useEffect(() => {
    if (card) document.title = `${card.strip.title} \u00b7 Gravecast Lantern`
  }, [card])

  if (!card) return <Navigate to="/kit" replace />

  return (
    <>
      <h1 className={ui.h1}>{card.strip.title}</h1>
      <p className={`${ui.muted} mt-3 mb-0`}>{KIT_PROTOTYPE_NOTICE}</p>
      <div className="mt-6">
        {/* The page's own heading is the card's title, so the comic's heading says what it holds. */}
        <DoodleStrip strip={{ ...card.strip, title: 'The steps' }} headingLevel={2} draw={false} showSource />
      </div>
    </>
  )
}