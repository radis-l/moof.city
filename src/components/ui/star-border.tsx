import React from 'react'

interface StarBorderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: React.ElementType
  className?: string
  color?: string
  speed?: string
  thickness?: number
  children: React.ReactNode
}

export const StarBorder = React.forwardRef<HTMLButtonElement, StarBorderProps>(
  ({ 
    as: Component = "button",
    className = "",
    color = "white",
    speed = "6s",
    thickness = 1,
    children,
    style,
    ...rest
  }, ref) => {
    return (
      <Component 
        ref={ref}
        className={`relative inline-block overflow-hidden rounded-[20px] ${className}`} 
        style={{
          padding: `${thickness}px 0`,
          ...style
        }}
        {...rest}
      >
        <div
          className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
          style={{
            background: `radial-gradient(circle, ${color}, transparent 10%)`,
            animationDuration: speed,
          }}
        />
        <div
          className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
          style={{
            background: `radial-gradient(circle, ${color}, transparent 10%)`,
            animationDuration: speed,
          }}
        />
        <div className="relative z-1 bg-gradient-to-b from-black to-gray-900 border border-gray-800 text-white text-center text-[16px] py-[16px] px-[26px] rounded-[20px]">
          {children}
        </div>
      </Component>
    );
  }
)

StarBorder.displayName = 'StarBorder'