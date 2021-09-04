import * as React from 'react'
import debounce from 'just-debounce-it'
import { getAxisPositions } from './utils'
import { Colors } from './utils/constants'

interface State {
  isPressed: boolean
  currentColor: string
  penWidth: number
  axis: {
    x?: number
    y?: number
  }
}

const initialState: State = {
  isPressed: false,
  currentColor: Colors.ORANGE,
  penWidth: 5,
  axis: {
    x: undefined,
    y: undefined,
  },
}

enum ActionType {
  'press',
  'depress',
  'set-axis',
  'change-color',
}

interface Action {
  type: ActionType
  axis?: State['axis']
  color?: string
}

function stateReducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.press: {
      return { ...state, isPressed: true }
    }

    case ActionType.depress: {
      return { ...state, isPressed: false }
    }

    case ActionType['set-axis']: {
      return { ...state, axis: action.axis as State['axis'] }
    }

    case ActionType['change-color']: {
      return { ...state, currentColor: action.color as string }
    }

    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function App() {
  const [state, dispatch] = React.useReducer(stateReducer, initialState)

  const canvasRef = React.createRef<HTMLCanvasElement>()

  const [canvasContext, setCanvasContext] = React.useState<CanvasRenderingContext2D | null>()

  React.useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement

    const onResize = (event: UIEvent) => {
      if (!canvas) {
        return
      }

      const target = event.target as Window

      const { innerHeight, innerWidth } = target

      canvas.width = innerWidth

      canvas.height = innerHeight
    }

    window.addEventListener('resize', debounce(onResize, 100))

    if (canvas) {
      onResize({ target: window } as unknown as UIEvent)
    }

    return () => {
      window.removeEventListener('resize', debounce(onResize, 100))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')

    if (!ctx) {
      return
    }

    ctx.lineWidth = state.penWidth

    setCanvasContext(ctx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.penWidth])

  const onPress = React.useCallback(() => dispatch({ type: ActionType.press }), [dispatch])

  const onDepress = React.useCallback(() => dispatch({ type: ActionType.depress }), [dispatch])

  const onChangeColor = React.useCallback(color => dispatch({ type: ActionType['change-color'], color }), [dispatch])

  const setAxis = React.useCallback(({ axis }) => dispatch({ type: ActionType['set-axis'], axis }), [dispatch])

  const onMouseDown = () => {
    onPress()

    const ctx = canvasContext as CanvasRenderingContext2D

    const { x: xPosition, y: yPosition } = state.axis

    ctx.beginPath()

    if (xPosition && yPosition) {
      ctx.moveTo(xPosition, yPosition)
    }
  }

  const onMouseUp = () => {
    onDepress()
  }

  const onMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current as HTMLCanvasElement

    const ctx = canvasContext as CanvasRenderingContext2D

    const { xPosition, yPosition } = getAxisPositions<HTMLCanvasElement>(event, canvas)

    setAxis({ axis: { x: xPosition, y: yPosition } })

    if (state.isPressed) {
      // create a line from old point to new one
      ctx.lineTo(xPosition, yPosition)

      ctx.strokeStyle = state.currentColor

      ctx.stroke()
    }
  }

  return (
    <div className="flex overflow-hidden relative justify-center items-center h-screen">
      <div className=" absolute top-5">
        <div className="space-x-2">
          {Object.keys(Colors).map((colorName: string) => (
            <button
              className="p-2 rounded-full border"
              key={colorName}
              style={{ backgroundColor: Colors[colorName] }}
              onClick={() => onChangeColor(Colors[colorName])}
            >
              {colorName}
            </button>
          ))}
        </div>
      </div>

      <canvas
        className="rounded-lg border active:border-purple-600 cursor-pointer"
        ref={canvasRef}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        width="980"
        height="580"
      ></canvas>
    </div>
  )
}

export default App
