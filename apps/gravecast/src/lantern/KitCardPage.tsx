import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DoodleStrip } from 'groove-ui/doodle'
import { findKitCard } from '../kit/cards'
import { KIT_PROTOTYPE_NOTICE } from '../kit/recoveryPosition'
import { canSpeak } from './access/aid'
import { BackButton } from './BackButton'
import { Reader } from './access/Reader'
import { ui } from './ui'

/** One kit card: the whole comic on one page, with each step also written out, and read aloud step by step on request (the card's own words). */
export function KitCardPage() {
  const { slug } = useParams()
  const card = findKitCard(slug)
  const [reading, setReading] = useState(false)

  useEffect(() => {
    if (card) document.title = `${card.strip.title} \u00b7 Gravecast Lantern`
  }, [card])

  if (!card) return <Navigate to="/kit" replace />

  return (
    <>
      <div className="flex items-center gap-3">
        <BackButton to="/kit" label="Back to Survival kit" />
        <h1 className={`${ui.h1} min-w-0`}>{card.strip.title}</h1>
      </div>
      <p className={`${ui.muted} mt-3 mb-0`}>{KIT_PROTOTYPE_NOTICE}</p>
      {canSpeak() && (
        <div className="mt-4">
          <button type="button" onClick={() => setReading((on) => !on)} aria-expanded={reading} className={ui.secondary}>
            {reading ? 'Close read aloud' : 'Read aloud, step by step'}
          </button>
          {reading && (
            <Reader
              key={card.slug}
              label={`${card.strip.title}, read aloud`}
              items={[
                `${card.strip.title}. ${KIT_PROTOTYPE_NOTICE}`,
                ...card.strip.panels.map((panel, i) => `Step ${i + 1} of ${card.strip.panels.length}. ${panel.caption}`),
                ...(card.strip.source ? [`Source: ${card.strip.source.name}.`] : []),
              ]}
            />
          )}
        </div>
      )}
      <div className="mt-6">
        {/* The page's own heading is the card's title, so the comic's heading says what it holds. */}
        <DoodleStrip strip={{ ...card.strip, title: 'The steps' }} headingLevel={2} draw={false} showSource />
      </div>
    </>
  )
}