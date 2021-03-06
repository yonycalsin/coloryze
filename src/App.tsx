import * as React from 'react'
import debounce from 'just-debounce-it'
import { getAxisPositions } from './utils'
import { Colors } from './utils/constants'
import clsx from 'clsx'

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

    const ctx = canvasContext as CanvasRenderingContext2D

    const onResize = (event: UIEvent) => {
      if (!canvas || !ctx) {
        return
      }

      const target = event.target as Window

      const { innerHeight, innerWidth } = target

      const temp = ctx.getImageData(0, 0, canvas.width, canvas.height)

      ctx.canvas.width = innerWidth

      ctx.canvas.height = innerHeight

      ctx.putImageData(temp, 0, 0)
    }

    window.addEventListener('resize', debounce(onResize, 100))

    if (canvas) {
      onResize({ target: window } as unknown as UIEvent)
    }

    return () => {
      window.removeEventListener('resize', debounce(onResize, 100))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasContext])

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
              // eslint-disable-next-line tailwindcss/no-custom-classname
              className={clsx(
                'p-5 rounded-full border',
                state.currentColor === Colors[colorName] && 'ring ring-green-500',
              )}
              key={colorName}
              style={{ backgroundColor: Colors[colorName] }}
              onClick={() => onChangeColor(Colors[colorName])}
            ></button>
          ))}
        </div>
      </div>

      <canvas
        className="rounded-lg border"
        style={{
          cursor: 'url("/images/icons/pen.svg") 4 27, auto',
          backgroundImage: 'url("/images/background-dot.png")',
          backgroundSize: 16,
        }}
        ref={canvasRef}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        width="980"
        height="580"
      ></canvas>

      <div className="absolute bottom-4 font-bold">
        <p>
          Created with ??? by {/* eslint-disable-next-line react/jsx-no-target-blank */}
          <a href="https://yonycalsin.com" target="_blank" className="hover:underline">
            Yony Calsin
          </a>
        </p>
      </div>
    </div>
  )
}

export default App
