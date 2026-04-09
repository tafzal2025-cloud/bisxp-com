import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://bisxp.com'),
  title: {
    default: 'BISXP — The Platform for AI-Native Marketplaces',
    template: '%s | BISXP'
  },
  description: 'Build marketplace businesses on production-tested architecture. Three live platforms across India, USA, and healthcare. Solo founders, agencies, and enterprises build on BISXP.',
  keywords: [
    'AI marketplace platform', 'marketplace development platform', 'BISXP',
    'build marketplace', 'two-sided marketplace platform',
    'AI-native marketplace', 'marketplace SaaS platform', 'marketplace builder'
  ],
  authors: [{ name: 'Tharif Afzal', url: 'https://bisxp.com' }],
  creator: 'BISXP',
  publisher: 'BISXP',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bisxp.com',
    siteName: 'BISXP',
    title: 'BISXP — The Platform for AI-Native Marketplaces',
    description: 'Build marketplace businesses on production-tested architecture. Three live platforms. Three countries. One platform.',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'BISXP — The Platform for AI-Native Marketplaces' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BISXP — The Platform for AI-Native Marketplaces',
    description: 'Build marketplace businesses on production-tested architecture.',
    images: ['/api/og']
  },
  alternates: { canonical: 'https://bisxp.com' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: 'BISXP',
            alternateName: 'Blueprint Ignite Scale Xperience',
            url: 'https://bisxp.com',
            description: 'AI-native marketplace platform. Build marketplace businesses on production-tested architecture.',
            areaServed: ['US', 'IN', 'CA'],
            founder: { '@type': 'Person', name: 'Tharif Afzal', jobTitle: 'Founder & CEO' }
          }) }}
        />
        <style>{`
          :root {
            --obsidian: #1B1F2E;
            --charcoal: #232840;
            --steel: #2A3050;
            --amber: #D4A843;
            --amber-bright: #F0C060;
            --amber-dim: rgba(212,168,67,0.12);
            --cream: #F0EDF8;
            --white: #F8F6FF;
            --muted: #8892AA;
            --border: rgba(255,255,255,0.06);
            --border-strong: rgba(212,168,67,0.35);
            --font-display: 'Cormorant Garamond', Georgia, serif;
            --font-body: 'Inter', system-ui, sans-serif;
            --font-numeral: 'DM Sans', system-ui, sans-serif;
          }

          *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          html {
            overflow-x: hidden;
            scroll-behavior: smooth;
          }

          body {
            overflow-x: hidden;
            background: var(--obsidian);
            color: var(--cream);
            font-family: var(--font-body);
            font-weight: 400;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          h1, h2, h3, h4, h5, h6 {
            font-family: 'Cormorant Garamond', serif;
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          button {
            cursor: pointer;
            border: none;
            background: none;
            font-family: var(--font-body);
          }

          input, textarea, select {
            font-family: var(--font-body);
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
