import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CardPendulum } from './components/CardPendulum'
import { collections } from './data/collections'

const MOVEMENT_DURATION = 820
const REST_DURATION = 320
const ECHO_COUNT = 5
const ECHO_START_DELAY = 80
const ECHO_GAP = 80
const LAST_ECHO_DELAY = ECHO_START_DELAY + (ECHO_COUNT - 1) * ECHO_GAP
const TOTAL_CYCLE_TIME = MOVEMENT_DURATION + LAST_ECHO_DELAY + REST_DURATION

function App() {
  const [cycle, setCycle] = useState(0)
  const assetIndex = cycle % collections.length
  const activeCollection = collections[assetIndex]

  useEffect(() => {
    const timer = window.setTimeout(() => setCycle((value) => value + 1), TOTAL_CYCLE_TIME)
    return () => window.clearTimeout(timer)
  }, [cycle])

  return (
    <main className="splash">
      <header className="topbar">
        <p className="wordmark"><span>Collections</span>{' '}2027</p>

        <div className="progress" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => (
            <span className={index === 0 ? 'is-current' : ''} key={index} />
          ))}
          <strong>Intro</strong>
        </div>

        <button className="calendar-button" type="button">Add to Calendar</button>
      </header>

      <section className="hero-copy" aria-labelledby="collections-title">
        <h1 id="collections-title"><span>Collections</span>{' '}2027</h1>

        <nav className="collection-tabs" aria-label="Collection status">
          {collections.map((collection, index) => {
            const isActive = index === assetIndex

            return (
              <span
                className="collection-tab"
                aria-current={isActive ? 'true' : undefined}
                style={{ '--accent': collection.color } as React.CSSProperties}
                key={collection.name}
              >
                {isActive && (
                  <motion.span
                    className="collection-tab__highlight"
                    layoutId="active-collection"
                    transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                  />
                )}
                <span className="collection-tab__label">{collection.name}</span>
              </span>
            )
          })}
        </nav>

        <p className="hero-statement">Empowering change by<br />anticipating user needs.</p>
        <p className="release-date">Coming Fall 2026</p>
      </section>

      <section className="animation-stage" aria-live="polite">
        <CardPendulum
          assetIndex={assetIndex}
          cycle={cycle}
          echoCount={ECHO_COUNT}
          echoStartDelay={ECHO_START_DELAY}
          echoGap={ECHO_GAP}
        />
        <p className="sr-only">Showing the {activeCollection.name} collection</p>
      </section>
    </main>
  )
}

export default App
