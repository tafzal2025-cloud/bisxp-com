import type { Metadata } from 'next'
import MethodPageClient from './MethodPageClient'

export const metadata: Metadata = {
  title: 'The BISXP Method — 3-Day AI Product Intensive',
  description: 'A 3-day intensive for technical founders and engineering leads who want to ship AI-native products. Not a course — a working capstone. You leave with a deployed product.',
  robots: { index: true, follow: true },
}

export default function MethodPage() {
  return <MethodPageClient />
}
