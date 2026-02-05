import * as React from "react"

import { cn } from "@/lib/utils"
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "./card"

const MysticalCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "bg-white/[0.08] backdrop-blur-xl border border-purple-500/30 rounded-2xl",
      "hover:bg-white/[0.12] hover:border-purple-500/50 transition-all",
      "shadow-lg shadow-purple-500/5",
      className
    )}
    {...props}
  />
))
MysticalCard.displayName = "MysticalCard"

const MysticalCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardHeader
    ref={ref}
    className={cn("pb-2", className)}
    {...props}
  />
))
MysticalCardHeader.displayName = "MysticalCardHeader"

const MysticalCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn("text-white font-heading", className)}
    {...props}
  />
))
MysticalCardTitle.displayName = "MysticalCardTitle"

const MysticalCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardDescription
    ref={ref}
    className={cn("text-white/60", className)}
    {...props}
  />
))
MysticalCardDescription.displayName = "MysticalCardDescription"

const MysticalCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardContent
    ref={ref}
    className={cn("text-white", className)}
    {...props}
  />
))
MysticalCardContent.displayName = "MysticalCardContent"

const MysticalCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardFooter
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
MysticalCardFooter.displayName = "MysticalCardFooter"

export {
  MysticalCard,
  MysticalCardHeader,
  MysticalCardFooter,
  MysticalCardTitle,
  MysticalCardDescription,
  MysticalCardContent
}
