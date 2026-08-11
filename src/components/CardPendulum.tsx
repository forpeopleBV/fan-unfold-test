import { memo, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { collections } from '../data/collections'

interface CardPendulumProps {
  assetIndex: number
  cycle: number
  echoCount: number
  echoStartDelay: number
  echoGap: number
}

type CardStyle = CSSProperties & {
  '--layer': number
}

const MOVEMENT_DURATION_SECONDS = 0.82
const SNAPPY_EASE = [0.85, 0, 0.15, 1] as const

function randomAngle(seed: number, min: number, max: number) {
  const value = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1
  return min + value * (max - min)
}

function getBoundaryAngle(boundary: number) {
  return boundary % 2 === 0
    ? randomAngle(boundary + 1, -10, 10)
    : randomAngle(boundary + 1, 170, 190)
}

export const CardPendulum = memo(function CardPendulum({
  assetIndex,
  cycle,
  echoCount,
  echoStartDelay,
  echoGap,
}: CardPendulumProps) {
  const collection = collections[assetIndex]
  const shouldReduceMotion = useReducedMotion()
  const fromAngle = getBoundaryAngle(cycle)
  const toAngle = getBoundaryAngle(cycle + 1)

  return (
    <div className="pendulum" aria-label={`${collection.name} collection animation`}>
      {Array.from({ length: echoCount + 1 }, (_, index) => {
        const isEcho = index > 0
        const delayMs = isEcho ? echoStartDelay + (index - 1) * echoGap : 0
        const style: CardStyle = { '--layer': echoCount - index }

        return (
          <motion.img
            className={`pendulum__card${isEcho ? ' is-echo' : ''}`}
            src={isEcho ? collection.echoes[index - 1] : collection.image}
            width="161"
            height="331"
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchPriority={assetIndex === 0 ? 'high' : 'auto'}
            draggable="false"
            initial={{ x: '-50%', rotate: fromAngle }}
            animate={{ x: '-50%', rotate: toAngle }}
            transition={{
              type: 'tween',
              duration: shouldReduceMotion ? 0 : MOVEMENT_DURATION_SECONDS,
              delay: shouldReduceMotion ? 0 : delayMs / 1000,
              ease: SNAPPY_EASE,
            }}
            key={`${cycle}-${assetIndex}-${index}`}
            style={style}
          />
        )
      })}
    </div>
  )
})
