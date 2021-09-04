import * as React from 'react'

interface State {
  isPressed: boolean
  currentColor: string
  penWidth: number
}

const initialState: State = {
  isPressed: false,
  currentColor: '#ff0000',
  penWidth: 5,
}

enum ActionType {
  'press',
  'depress',
}

interface Action {
  type: ActionType
}

function stateReducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.press: {
      return { ...state, isPressed: true }
    }

    case ActionType.depress: {
      return { ...state, isPressed: false }
    }

    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function App() {
  const [state, dispatch] = React.useReducer(stateReducer, initialState)

  const canvasRef = React.createRef<HTMLCanvasElement>()

  const onPress = React.useCallback(() => dispatch({ type: ActionType.press }), [dispatch])

  const onDepress = React.useCallback(() => dispatch({ type: ActionType.depress }), [dispatch])

  const onMouseDown = React.useCallback(() => {
    console.log('onMouseDown')
  }, [])

  const onMouseMove = React.useCallback(() => {
    console.log('onMouseMove')
  }, [])

  const onMouseUp = React.useCallback(() => {
    console.log('onMouseUp')
  }, [])

  return (
    <div className="flex justify-center items-center h-screen">
      <canvas
        className="w-full max-w-5xl rounded-lg border active:border-purple-600 cursor-pointer"
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      ></canvas>
    </div>
  )
}

export default App
