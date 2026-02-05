"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-white/10 backdrop-blur-xl text-white border border-purple-500/30 shadow-lg shadow-purple-500/20",
          description: "text-gray-300",
          actionButton:
            "bg-purple-600 text-white hover:bg-purple-700",
          cancelButton:
            "bg-white/10 text-gray-300 hover:bg-white/20",
          success: "border-green-500/50 shadow-green-500/20",
          error: "border-red-500/50 shadow-red-500/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
