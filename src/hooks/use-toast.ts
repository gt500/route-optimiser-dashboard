
import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast as useToastPrimitive } from "@/components/ui/use-toast"

export const ToastContext = React.createContext<ReturnType<typeof useToastPrimitive>>({
  toast: () => {},
  dismiss: () => {}
})

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const toast = (props: Parameters<typeof useToastPrimitive.toast>[0]) => {
  const { toast } = useToastPrimitive()
  return toast(props)
}
