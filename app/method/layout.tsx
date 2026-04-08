import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The BISXP Method — 3-Day Marketplace Immersion',
  description: 'Build and deploy a live marketplace MVP in 3 days. Hands-on programme for founders and technical teams who want to understand the full stack of modern marketplace development.',
  openGraph: {
    title: 'The BISXP Method — 3-Day Marketplace Immersion',
    description: 'Build and deploy a live marketplace MVP in 3 days.',
    images: [{ url: '/api/og?title=The BISXP Method&sub=3-Day Marketplace Immersion', width: 1200, height: 630 }]
  }
}

export default function MethodLayout({ children }: { children: React.ReactNode }) {
  return children
}
