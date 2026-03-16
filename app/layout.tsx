import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BISXP — Blueprint. Ignite. Scale. Xperience.',
  description:
    'AI-native consultancy that builds marketplaces and SaaS products. From blueprint to scale.',
  openGraph: {
    title: 'BISXP — Blueprint. Ignite. Scale. Xperience.',
    description:
      'AI-native consultancy that builds marketplaces and SaaS products. From blueprint to scale.',
    url: 'https://bisxp.com',
    siteName: 'BISXP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BISXP — Blueprint. Ignite. Scale. Xperience.',
    description:
      'AI-native consultancy that builds marketplaces and SaaS products. From blueprint to scale.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --obsidian: #08080A;
            --charcoal: #131318;
            --steel: #1E1E26;
            --amber: #D4A843;
            --amber-bright: #F0C060;
            --amber-dim: rgba(212,168,67,0.15);
            --cream: #F0EBE0;
            --white: #FAFAF8;
            --muted: #70707A;
            --border: rgba(212,168,67,0.12);
            --border-strong: rgba(212,168,67,0.3);
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
            font-family: 'Outfit', sans-serif;
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
            font-family: 'Outfit', sans-serif;
          }

          input, textarea, select {
            font-family: 'Outfit', sans-serif;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
