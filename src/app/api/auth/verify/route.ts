import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('admin-session')
  
  if (!sessionCookie?.value) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
  
  // In a real app, you'd verify the token against a database
  // For this simple case, we just check if the cookie exists and is valid format
  if (sessionCookie.value.length === 64) { // 32 bytes = 64 hex chars
    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    )
  }
  
  return NextResponse.json(
    { authenticated: false },
    { status: 401 }
  )
}