import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { DoodleStrip } from 'groove-ui/doodle'
import { findKitCard } from '../kit/cards'
import { KIT_PROTOTYPE_NOTICE } from '../kit/recoveryPosition'
import { linkBase } from './styles'

/** One kit card: the whole comic on one page, with each step also written out. */
export function KitCardPage() {
  const { slug } = useParams()
  const card = findKitCard(slug)

  useEffect(() => {
    if (card) document.title = `${card.strip.title} \u00b7 Gravecast Emergency`
  }, [card])

  if (!card) return <Navigate to="/" replace />

  return (
    <>
      <p className="m-0">
        <Link to="/" className={`${linkBase} -ml-4 text-grave-bone-100 underline`}>
          {'\u2190'} Back to the survival kit
        </Link>
      </p>
      <h1 className="mt-2 mb-0 text-4xl leading-tight font-bold text-grave-bone-100">{card.strip.title}</h1>
      <p className="mt-3 mb-0 text-lg text-grave-mist-200">{KIT_PROTOTYPE_NOTICE}</p>
      <div className="mt-6">
        {/* The page's own heading is the card's title, so the comic's heading says what it holds. */}
        <DoodleStrip strip={{ ...card.strip, title: 'The steps' }} headingLevel={2} draw={false} showSource />
      </div>
    </>
  )
}