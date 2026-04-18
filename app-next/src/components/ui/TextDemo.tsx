import { ChevronRight, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { AnimatedGradientText } from "./animated-gradient-text"

export function AnimatedGradientTextDemo() {
  return (
    <div className="group relative flex items-center justify-center rounded-full px-3 py-1 text-xs shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] bg-gray-950">
      <span
        className={cn(
          "animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-white/50 via-gray-300/50 to-white/50 bg-[length:300%_100%] p-[1px]"
        )}
        style={{
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "destination-out",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "subtract",
          WebkitClipPath: "padding-box",
        }}
      />
      <Sparkles className="size-3 text-white" /> <hr className="mx-1.5 h-3 w-px shrink-0 bg-gray-700" />
      <AnimatedGradientText className="text-xs font-medium text-gray-200">
        Cloud Gaming
      </AnimatedGradientText>
      <ChevronRight className="ml-1 size-3 stroke-gray-400 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
    </div>
  )
}