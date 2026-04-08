import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/settings'

export const revalidate = 0
export const maxDuration = 60

export async function GET() {
  const settings = await getSettings()
  return NextResponse.json(settings)
}
