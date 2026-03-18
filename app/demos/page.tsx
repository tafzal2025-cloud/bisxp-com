'use client'
import { useEffect } from 'react'
export default function DemosPage() {
  useEffect(() => { window.location.href = '/demos/index.html' }, [])
  return null
}
