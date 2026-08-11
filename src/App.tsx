import { useEffect, useState } from 'react'
import { CardPendulum } from './components/CardPendulum'
import { ControlPanel } from './components/ControlPanel'
import { collections } from './data/collections'
import { useKeyboardPanel } from './hooks/useKeyboardPanel'

const MOVEMENT_DURATION = 920
const REST_DURATION = 320

function App() {
  const [echoCount, setEchoCount] = useState(4)
  const [echoStartDelay, setEchoStartDelay] = useState(80)
  const [echoGap, setEchoGap] = useState(80)
  const [cycle, setCycle] = useState(0)
  const { isOpen, setIsOpen } = useKeyboardPanel()

  const assetIndex = cycle % collections.length
  const isForward = cycle % 2 === 0
  const activeCollection = collections[assetIndex]

  useEffect(() => {
    const lastEchoDelay = echoCount === 0 ? 0 : echoStartDelay + (echoCount - 1) * echoGap
    const totalCycleTime = MOVEMENT_DURATION + lastEchoDelay + REST_DURATION
    const timer = window.setTimeout(() => setCycle((value) => value + 1), totalCycleTime)
    return () => window.clearTimeout(timer)
  }, [cycle, echoCount, echoGap, echoStartDelay])

  return (
    <main className="splash">
      <header className="site-header">
        <h1>
          <span>Collections</span> 2027
        </h1>
        <nav aria-label="Collection status">
          {collections.map((collection, index) => (
            <span
              className={index === assetIndex ? 'is-active' : ''}
              style={{ '--accent': collection.color } as React.CSSProperties}
              key={collection.name}
            >
              {collection.name}
            </span>
          ))}
        </nav>
      </header>

      <section className="animation-stage" aria-live="polite">
        <CardPendulum
          assetIndex={assetIndex}
          cycle={cycle}
          echoCount={echoCount}
          echoStartDelay={echoStartDelay}
          echoGap={echoGap}
          isForward={isForward}
        />
        <p className="sr-only">Showing the {activeCollection.name} collection</p>
      </section>

      <button className="controls-trigger" type="button" onClick={() => setIsOpen(true)} aria-label="Open animation controls">
        <kbd>C</kbd>
        <span>Controls</span>
      </button>

      {isOpen && (
        <ControlPanel
          echoCount={echoCount}
          echoStartDelay={echoStartDelay}
          echoGap={echoGap}
          onEchoCountChange={setEchoCount}
          onEchoStartDelayChange={setEchoStartDelay}
          onEchoGapChange={setEchoGap}
          onClose={() => setIsOpen(false)}
        />
      )}
    </main>
  )
}

export default App
