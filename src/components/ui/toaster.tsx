import { ShieldAlert, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const isDestructive = props.variant === "destructive"
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3">
              <span
                className={
                  isDestructive
                    ? "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-destructive/15 text-destructive"
                    : "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary"
                }
              >
                {isDestructive ? (
                  <ShieldAlert className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
              </span>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
