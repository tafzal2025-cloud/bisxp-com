import { NextResponse } from 'next/server'
import { getServices } from '@/lib/cms'
export const revalidate = 0
export const maxDuration = 60
export async function GET() {
  return NextResponse.json(await getServices())
}
