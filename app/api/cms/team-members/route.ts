import { NextResponse } from 'next/server'
import { getTeamMembers } from '@/lib/cms'
export const revalidate = 0
export const maxDuration = 60
export async function GET() {
  return NextResponse.json(await getTeamMembers())
}
