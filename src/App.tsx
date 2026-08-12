import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { CardPendulum } from './components/CardPendulum'
import { HalftoneBackground, type HalftoneSettings } from './components/HalftoneBackground'
import { collections } from './data/collections'
import portalBackground from '../Asset/section-2-playground.png'

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
const initialShaderSettings: Required<HalftoneSettings> = {
  dotSize: 6,
  contrast: 1.2,
  dotSoftness: 0.33,
  darkColor: [0, 0.24705882370471954, 1, 1],
  lightColor: [0.6924276351928711, 0.34823843836784363, 1, 1],
  dotSpacing: 0.3,
  mouseRadius: 600,
  mouseStrength: 0.3,
}

function rgbaToHex([red, green, blue]: readonly number[]) {
  return `#${[red, green, blue].map((value) => Math.round(value * 255).toString(16).padStart(2, '0')).join('')}`
}

function hexToRgba(hex: string): readonly [number, number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255, 1]
}

function App() {
  const [cycle, setCycle] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [shaderControlsOpen, setShaderControlsOpen] = useState(false)
  const [shaderSettings, setShaderSettings] = useState(initialShaderSettings)
  const [shaderImageSrc, setShaderImageSrc] = useState(portalBackground)
  const [shaderImageName, setShaderImageName] = useState('01.png')
  const shaderImageUrlRef = useRef<string>()
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
        portalSection.style.setProperty('--browser-scale', String(0.85 + scaleProgress * 0.15))
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

  useEffect(() => () => {
    if (shaderImageUrlRef.current) URL.revokeObjectURL(shaderImageUrlRef.current)
  }, [])

  const updateShaderImage = (file?: File) => {
    if (!file) return
    if (shaderImageUrlRef.current) URL.revokeObjectURL(shaderImageUrlRef.current)
    const imageUrl = URL.createObjectURL(file)
    shaderImageUrlRef.current = imageUrl
    setShaderImageSrc(imageUrl)
    setShaderImageName(file.name)
  }

  useEffect(() => {
    const toggleShaderControls = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.key.toLowerCase() === 'c' && !target?.matches('input, textarea, select, [contenteditable="true"]')) {
        setShaderControlsOpen((isOpen) => !isOpen)
      }
    }

    window.addEventListener('keydown', toggleShaderControls)
    return () => window.removeEventListener('keydown', toggleShaderControls)
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

      {shaderControlsOpen && (
        <aside className="shader-controls" aria-label="Halftone shader controls">
          <div className="shader-controls__heading">
            <strong>Halftone shader</strong>
            <kbd>C</kbd>
          </div>

          <label>
            <span>Dot size <output>{shaderSettings.dotSize.toFixed(1)}px</output></span>
            <input type="range" min="1" max="20" step="0.5" value={shaderSettings.dotSize} onChange={(event) => setShaderSettings((current) => ({ ...current, dotSize: Number(event.target.value) }))} />
          </label>
          <label>
            <span>Contrast <output>{shaderSettings.contrast.toFixed(1)}</output></span>
            <input type="range" min="0.1" max="3" step="0.1" value={shaderSettings.contrast} onChange={(event) => setShaderSettings((current) => ({ ...current, contrast: Number(event.target.value) }))} />
          </label>
          <label>
            <span>Dot softness <output>{shaderSettings.dotSoftness.toFixed(2)}</output></span>
            <input type="range" min="0" max="1" step="0.01" value={shaderSettings.dotSoftness} onChange={(event) => setShaderSettings((current) => ({ ...current, dotSoftness: Number(event.target.value) }))} />
          </label>
          <label>
            <span>Dot spacing <output>{shaderSettings.dotSpacing.toFixed(2)}</output></span>
            <input type="range" min="0" max="1" step="0.01" value={shaderSettings.dotSpacing} onChange={(event) => setShaderSettings((current) => ({ ...current, dotSpacing: Number(event.target.value) }))} />
          </label>
          <label>
            <span>Mouse radius <output>{shaderSettings.mouseRadius}px</output></span>
            <input type="range" min="80" max="600" step="10" value={shaderSettings.mouseRadius} onChange={(event) => setShaderSettings((current) => ({ ...current, mouseRadius: Number(event.target.value) }))} />
          </label>
          <label>
            <span>Mouse intensity <output>{shaderSettings.mouseStrength.toFixed(2)}</output></span>
            <input type="range" min="0" max="1" step="0.01" value={shaderSettings.mouseStrength} onChange={(event) => setShaderSettings((current) => ({ ...current, mouseStrength: Number(event.target.value) }))} />
          </label>
          <label className="shader-controls__color">
            <span>Dark color</span>
            <input type="color" value={rgbaToHex(shaderSettings.darkColor)} onChange={(event) => setShaderSettings((current) => ({ ...current, darkColor: hexToRgba(event.target.value) }))} />
          </label>
          <label className="shader-controls__color">
            <span>Light color</span>
            <input type="color" value={rgbaToHex(shaderSettings.lightColor)} onChange={(event) => setShaderSettings((current) => ({ ...current, lightColor: hexToRgba(event.target.value) }))} />
          </label>
          <label className="shader-controls__file">
            <span>Background image <output title={shaderImageName}>{shaderImageName}</output></span>
            <input type="file" accept="image/*" onChange={(event) => updateShaderImage(event.target.files?.[0])} />
          </label>
        </aside>
      )}

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
          <HalftoneBackground
            className="portal-section__background"
            src={shaderImageSrc}
            {...shaderSettings}
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
