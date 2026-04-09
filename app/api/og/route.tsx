import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || "We don't just advise. We build."
  const sub = searchParams.get('sub') || 'AI-native marketplace & SaaS development'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1B1F2E 0%, #232840 100%)',
          fontFamily: 'serif',
          padding: '80px'
        }}
      >
        <div style={{ width: '60px', height: '3px', background: '#D4A843', marginBottom: '40px' }} />
        <div style={{ fontSize: '72px', fontWeight: '300', color: '#F0EDF8', letterSpacing: '12px', marginBottom: '24px', display: 'flex' }}>
          BISX<span style={{ color: '#D4A843' }}>P</span>
        </div>
        <div style={{ fontSize: '32px', fontWeight: '300', color: '#F0EDF8', textAlign: 'center', marginBottom: '16px', maxWidth: '800px', lineHeight: '1.3' }}>
          {title}
        </div>
        <div style={{ fontSize: '18px', color: '#8892AA', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase' }}>
          {sub}
        </div>
        <div style={{ position: 'absolute', bottom: '40px', fontSize: '14px', color: 'rgba(212,168,67,0.6)', letterSpacing: '3px' }}>
          BISXP.COM
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
