import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { KIT_CARDS, type KitGroup } from '../kit/cards'
import { KIT_PROTOTYPE_NOTICE } from '../kit/recoveryPosition'
import { ui } from './ui'

const GROUPS: readonly KitGroup[] = ['First aid', 'Survival', 'Disasters']

/** The survival kit: every guide, in groups. */
export function KitPage() {
  useEffect(() => {
    document.title = 'Survival kit \u00b7 Gravecast Lantern'
  }, [])

  return (
    <>
      <h1 className={ui.h1}>Survival kit</h1>
      <p className={ui.lead}>Step-by-step guides, drawn as short comics and written out in words. They work with no internet.</p>
      <p className={`${ui.muted} mt-2 mb-0`}>{KIT_PROTOTYPE_NOTICE}</p>

      {GROUPS.map((group) => {
        const cards = KIT_CARDS.filter((card) => card.group === group)
        if (cards.length === 0) return null
        return (
          <section key={group} aria-labelledby={`group-${group}`} className="mt-6">
            <h2 id={`group-${group}`} className={ui.h2}>
              {group}
            </h2>
            <ul className="mt-2 mb-0 grid list-none gap-2 p-0 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => (
                <li key={card.slug}>
                  <Link to={`/kit/${card.slug}`} className={ui.cardLink}>
                    <span className="text-base font-semibold">{card.strip.title}</span>
                    <span aria-hidden className={ui.arrow}>
                      {'\u203a'}
                    </span>
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