import type { CSSProperties } from 'react'
import { collections } from '../data/collections'

interface CardPendulumProps {
  assetIndex: number
  cycle: number
  echoCount: number
  echoStartDelay: number
  echoGap: number
  isForward: boolean
}

type AnimationStyle = CSSProperties & {
  '--echo-index': number
  '--echo-delay': string
  '--layer': number
}

export function CardPendulum({
  assetIndex,
  cycle,
  echoCount,
  echoStartDelay,
  echoGap,
  isForward,
}: CardPendulumProps) {
  const collection = collections[assetIndex]

  return (
    <div className="pendulum" aria-label={`${collection.name} collection animation`}>
      {Array.from({ length: echoCount + 1 }, (_, index) => {
        const delay = index === 0 ? 0 : echoStartDelay + (index - 1) * echoGap
        const style: AnimationStyle = {
          '--echo-index': index,
          '--echo-delay': `${delay}ms`,
          '--layer': echoCount - index,
        }

        return (
          <img
            className={`pendulum__card ${isForward ? 'is-forward' : 'is-reverse'}`}
            src={collection.image}
            alt=""
            aria-hidden="true"
            draggable="false"
            key={`${cycle}-${assetIndex}-${index}`}
            style={style}
          />
        )
      })}
    </div>
  )
}
