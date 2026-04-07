'use client'
import { useEffect } from 'react'
export default function DemosPage() {
  useEffect(() => { window.location.href = '/demos/access.html' }, [])
  return (
    <div style={{ background: '#08080A', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#D4A843', fontFamily: 'serif', fontSize: '18px' }}>
      Loading demos...
    </div>
  )
}
