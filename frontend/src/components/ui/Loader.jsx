import { FaSpinner } from "react-icons/fa"
import { cn } from "../../lib/utils"

export function Loader({ className, size = "md" }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <FaSpinner className={cn("animate-spin text-primary", {
        "text-sm": size === "sm",
        "text-2xl": size === "md",
        "text-4xl": size === "lg",
      })} />
    </div>
  )
}
