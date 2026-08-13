import work from '../../Asset/1work.png'
import create from '../../Asset/2create.png'
import live from '../../Asset/3live.png'
import game from '../../Asset/4game.png'
import createEcho1 from '../../Asset/create/Frame 960316.png'
import createEcho2 from '../../Asset/create/Frame 960320.png'
import createEcho3 from '../../Asset/create/Frame 960324.png'
import createEcho4 from '../../Asset/create/Frame 960328.png'
import createEcho5 from '../../Asset/create/Frame 960332.png'
import gameEcho1 from '../../Asset/game/Frame 960315.png'
import gameEcho2 from '../../Asset/game/Frame 960319.png'
import gameEcho3 from '../../Asset/game/Frame 960323.png'
import gameEcho4 from '../../Asset/game/Frame 960327.png'
import gameEcho5 from '../../Asset/game/Frame 960331.png'
import liveEcho1 from '../../Asset/live/Frame 960314.png'
import liveEcho2 from '../../Asset/live/Frame 960318.png'
import liveEcho3 from '../../Asset/live/Frame 960322.png'
import liveEcho4 from '../../Asset/live/Frame 960326.png'
import liveEcho5 from '../../Asset/live/Frame 960330.png'
import workEcho1 from '../../Asset/work/Frame 960317.png'
import workEcho2 from '../../Asset/work/Frame 960334.png'
import workEcho3 from '../../Asset/work/Frame 960325.png'
import workEcho4 from '../../Asset/work/Frame 960329.png'
import workEcho5 from '../../Asset/work/Frame 960333.png'

export const collections = [
  { name: 'Work', image: work, echoes: [workEcho1, workEcho2, workEcho3, workEcho4, workEcho5], color: 'var(--color-collections-work)' },
  { name: 'Create', image: create, echoes: [createEcho1, createEcho2, createEcho3, createEcho4, createEcho5], color: 'var(--color-collections-create)' },
  { name: 'Live', image: live, echoes: [liveEcho1, liveEcho2, liveEcho3, liveEcho4, liveEcho5], color: 'var(--color-collections-live)' },
  { name: 'Game', image: game, echoes: [gameEcho1, gameEcho2, gameEcho3, gameEcho4, gameEcho5], color: 'var(--color-collections-game)' },
] as const
