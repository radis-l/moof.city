import { memo } from 'react'

export const MoofLogo = memo(() => (
  <div 
    className="text-white font-bold text-2xl tracking-wide font-logo"
    data-testid="moof-logo"
  >
    MOOF
  </div>
))

MoofLogo.displayName = 'MoofLogo'
