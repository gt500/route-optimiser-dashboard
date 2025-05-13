import * as React from "react"

import { useToast as useShadcnToast, type ToastActionElement } from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

export type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open: boolean
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToastProps
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToastProps> & Pick<ToastProps, "id">
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToastProps["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToastProps["id"]
    }

interface State {
  toasts: ToastProps[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        if (toastTimeouts.has(toastId)) {
          clearTimeout(toastTimeouts.get(toastId))
          toastTimeouts.delete(toastId)
        }
      } else {
        for (const [id, timeout] of toastTimeouts.entries()) {
          clearTimeout(timeout)
          toastTimeouts.delete(id)
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const initialState: State = {
  toasts: [],
}

export function useToast() {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const { toast: shadcnToast } = useShadcnToast()

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (!toast.open) return

      if (toastTimeouts.has(toast.id)) return

      const timeout = setTimeout(() => {
        dispatch({ type: actionTypes.REMOVE_TOAST, toastId: toast.id })
      }, TOAST_REMOVE_DELAY)

      toastTimeouts.set(toast.id, timeout)

      return () => {
        if (timeout) clearTimeout(timeout)
      }
    })
  }, [state.toasts])

  const toast = React.useCallback(
    (props: Omit<ToastProps, "id" | "open">) => {
      const id = genId()

      const newToast = {
        ...props,
        id,
        open: true,
      }

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: newToast,
      })

      return id
    },
    [dispatch]
  )

  const update = React.useCallback(
    (props: Partial<ToastProps> & Pick<ToastProps, "id">) => {
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: props,
      })
    },
    [dispatch]
  )

  const dismiss = React.useCallback(
    (toastId?: string) => {
      dispatch({
        type: actionTypes.DISMISS_TOAST,
        toastId,
      })
    },
    [dispatch]
  )

  return {
    toasts: state.toasts,
    toast,
    dismiss,
    update,
  }
}

export { toast } from "@/components/ui/toast"
export type { ToastActionElement } from "@/components/ui/toast"
