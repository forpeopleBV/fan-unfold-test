import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CardPendulum } from './components/CardPendulum'
import { collections } from './data/collections'
import portalBackground from '../Asset/section-2-background.png'

const MOVEMENT_DURATION = 820
const REST_DURATION = 320
const ECHO_COUNT = 5
const ECHO_START_DELAY = 80
const ECHO_GAP = 80
const LAST_ECHO_DELAY = ECHO_START_DELAY + (ECHO_COUNT - 1) * ECHO_GAP
const TOTAL_CYCLE_TIME = MOVEMENT_DURATION + LAST_ECHO_DELAY + REST_DURATION

const placeholderSections = [
  { number: '03', color: '#5485ff', tone: 'dark' },
  { number: '04', color: '#ffc562', tone: 'dark' },
  { number: '05', color: '#00ddd0', tone: 'dark' },
  { number: '06', color: '#b159ff', tone: 'light' },
  { number: '07', color: '#0c4787', tone: 'light' },
  { number: '08', color: '#cd8814', tone: 'dark' },
]

const storySteps = ['Intro', 'Purpose', 'Process', 'Collections', 'Future', 'Future', 'EDG', 'Dummy']
const stepperColors = ['#080808', '#ffffff', '#ffffff', '#080808', '#080808', '#ffffff', '#ffffff', '#080808']

function App() {
  const [cycle, setCycle] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const assetIndex = cycle % collections.length
  const activeCollection = collections[assetIndex]

  useEffect(() => {
    const timer = window.setTimeout(() => setCycle((value) => value + 1), TOTAL_CYCLE_TIME)
    return () => window.clearTimeout(timer)
  }, [cycle])

  useEffect(() => {
    const updateActiveStep = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-story-step]'))
      const viewportCenter = window.scrollY + window.innerHeight / 2
      const closest = sections.reduce((current, section) =>
        Math.abs(section.offsetTop + section.offsetHeight / 2 - viewportCenter) <
        Math.abs(current.offsetTop + current.offsetHeight / 2 - viewportCenter)
          ? section
          : current,
      )
      setActiveStep(Number(closest.dataset.storyStep))

      const portalSection = document.querySelector<HTMLElement>('.portal-section')
      if (portalSection) {
        const scrollRange = portalSection.offsetHeight - window.innerHeight
        const scrolledThroughPortal = Math.max(0, Math.min(1, -portalSection.getBoundingClientRect().top / scrollRange))
        const scaleProgress = Math.min(1, scrolledThroughPortal * 2)
        portalSection.style.setProperty('--browser-scale', String(0.9 + scaleProgress * 0.2))
      }
    }

    updateActiveStep()
    window.addEventListener('scroll', updateActiveStep, { passive: true })
    window.addEventListener('resize', updateActiveStep)
    return () => {
      window.removeEventListener('scroll', updateActiveStep)
      window.removeEventListener('resize', updateActiveStep)
    }
  }, [])

  return (
    <main style={{ '--stepper-color': stepperColors[activeStep] } as React.CSSProperties}>
      <header className="topbar">
        <p className="wordmark"><span>Collections</span>{' '}2027</p>

        <div
          className="progress"
          aria-label={`Section ${activeStep + 1} of 8`}
        >
          {storySteps.map((label, index) => (
            <div
              className={`progress__step${index === activeStep ? ' is-current' : ''}`}
              style={{ flexGrow: index === activeStep ? 1.45 : 1 }}
              key={`${label}-${index}`}
            >
              <span />
              <strong>{label}</strong>
            </div>
          ))}
        </div>

        <button className="calendar-button" type="button">Add to Calendar</button>
      </header>
      <section className="splash" data-story-step="0">
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
      </section>

      <p className="hero-statement">Empowering change by<br />anticipating user needs.</p>
      <p className="release-date">Coming Fall 2026</p>

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
      </section>

      <section className="portal-section" aria-label="Section 2: Dell research portal" data-story-step="1">
        <div className="portal-section__scene">
          <img
            className="portal-section__background"
            src={portalBackground}
            alt=""
            aria-hidden="true"
          />

          <div className="portal-browser" data-parallax-layer="browser">
            <div className="portal-browser__window">
              <div className="portal-video-frame" data-video-frame aria-label="Video frame reserved for future video upload">
                <video className="portal-video-frame__media" muted playsInline />
                <div className="portal-video-frame__glass" aria-hidden="true" />
              </div>

              <div className="portal-browser__toolbar" aria-hidden="true">
                <div className="portal-browser__window-controls">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="portal-browser__address">27c.dell.com</div>
                <div className="portal-browser__toolbar-actions">
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {placeholderSections.map((section) => (
        <section
          className={`story-section story-section--${section.tone}`}
          style={{ backgroundColor: section.color }}
          aria-label={`Section ${section.number}`}
          data-story-step={Number(section.number) - 1}
          key={section.number}
        >
          <span>Section</span>
          <strong>{section.number}</strong>
        </section>
      ))}
    </main>
  )
}

export default App
