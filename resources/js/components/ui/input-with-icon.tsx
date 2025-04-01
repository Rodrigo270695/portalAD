import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { type InputHTMLAttributes, forwardRef } from "react"

export interface InputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode
}

const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
    ({ className, icon, ...props }, ref) => {
        return (
            <div className="relative">
                <Input
                    className={cn("pl-8", className)}
                    ref={ref}
                    {...props}
                />
                {icon && (
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {icon}
                    </div>
                )}
            </div>
        )
    }
)

InputWithIcon.displayName = "InputWithIcon"

export { InputWithIcon }
