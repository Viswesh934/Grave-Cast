import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { KIT_CARDS, type KitGroup } from '../kit/cards'
import { KIT_PROTOTYPE_NOTICE } from '../kit/recoveryPosition'

const GROUPS: readonly KitGroup[] = ['First aid', 'Survival', 'Disasters']

/** The survival kit: every guide, in groups. */
export function KitIndex() {
  useEffect(() => {
    document.title = 'Survival kit \u00b7 Gravecast Emergency'
  }, [])

  return (
    <>
      <h1 className="m-0 text-4xl leading-tight font-bold text-grave-bone-100">Survival kit</h1>
      <p className="mt-4 mb-0 text-xl leading-relaxed text-grave-mist-100">
        Step-by-step guides, drawn as short comics and written out in words. They work with no internet.
      </p>
      <p className="mt-4 mb-0 text-lg text-grave-mist-200">{KIT_PROTOTYPE_NOTICE}</p>

      {GROUPS.map((group) => {
        const cards = KIT_CARDS.filter((card) => card.group === group)
        if (cards.length === 0) return null
        return (
          <section key={group} aria-labelledby={`group-${group}`} className="mt-10">
            <h2 id={`group-${group}`} className="m-0 text-2xl font-bold text-grave-bone-100">
              {group}
            </h2>
            <ul className="mt-4 mb-0 list-none space-y-3 p-0">
              {cards.map((card) => (
                <li key={card.slug}>
                  <Link
                    to={`/kit/${card.slug}`}
                    className="flex min-h-14 items-center rounded-lg border-2 border-grave-mist-400 px-5 py-3 text-xl font-semibold text-grave-bone-100 underline-offset-4 hover:border-grave-bone-100 hover:underline"
                  >
                    {card.strip.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}