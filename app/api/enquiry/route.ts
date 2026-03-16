import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const maxDuration = 60

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, business_type, message } = body

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    }
    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
    }
    if (!message?.trim() || message.trim().length < 20) {
      return NextResponse.json(
        { error: 'Message must be at least 20 characters.' },
        { status: 400 }
      )
    }

    // Service role client — bypasses RLS
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Insert enquiry
    const { data: enquiry, error: dbError } = await serviceClient
      .from('enquiries')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        business_type: business_type || null,
        message: message.trim(),
        source: 'website',
        status: 'new',
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB insert error:', dbError)
      return NextResponse.json({ error: 'Failed to save enquiry.' }, { status: 500 })
    }

    // Send email via Resend
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const timestamp = new Date().toLocaleString('en-GB', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'short',
      })

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'hello@bisxp.com',
        to: process.env.ADMIN_EMAIL!,
        replyTo: email.trim(),
        subject: `New BISXP enquiry from ${name} — ${business_type || 'General'}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: Arial, sans-serif; background: #08080A; color: #F0EBE0; margin: 0; padding: 32px;">
            <div style="max-width: 600px; margin: 0 auto; background: #131318; border: 1px solid rgba(212,168,67,0.2); padding: 40px;">
              <h1 style="font-family: Georgia, serif; font-size: 28px; font-weight: 300; color: #D4A843; margin: 0 0 8px;">
                New Enquiry
              </h1>
              <p style="font-size: 12px; color: #70707A; margin: 0 0 32px; letter-spacing: 1px;">
                BISXP.COM · ${timestamp}
              </p>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(212,168,67,0.1); width: 140px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #70707A;">Name</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(212,168,67,0.1); font-size: 15px; color: #F0EBE0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(212,168,67,0.1); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #70707A;">Email</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(212,168,67,0.1); font-size: 15px; color: #D4A843;">
                    <a href="mailto:${email}" style="color: #D4A843;">${email}</a>
                  </td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(212,168,67,0.1); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #70707A;">Phone</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(212,168,67,0.1); font-size: 15px; color: #F0EBE0;">${phone}</td>
                </tr>` : ''}
                ${company ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(212,168,67,0.1); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #70707A;">Company</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(212,168,67,0.1); font-size: 15px; color: #F0EBE0;">${company}</td>
                </tr>` : ''}
                ${business_type ? `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(212,168,67,0.1); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #70707A;">Business Type</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid rgba(212,168,67,0.1); font-size: 15px; color: #F0EBE0;">${business_type}</td>
                </tr>` : ''}
              </table>

              <div style="margin-top: 28px; padding: 24px; background: #1E1E26; border-left: 3px solid #D4A843;">
                <p style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #70707A; margin: 0 0 12px;">Message</p>
                <p style="font-size: 15px; color: #F0EBE0; line-height: 1.7; margin: 0;">${message.replace(/\n/g, '<br/>')}</p>
              </div>

              <div style="margin-top: 32px; text-align: center;">
                <a href="mailto:${email}?subject=Re: Your BISXP enquiry"
                   style="display: inline-block; background: #D4A843; color: #08080A; padding: 12px 28px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; text-decoration: none;">
                  Reply to ${name}
                </a>
              </div>

              <p style="margin-top: 40px; font-size: 11px; color: #70707A; text-align: center; letter-spacing: 1px;">
                BISXP · Blueprint. Ignite. Scale. Xperience. · bisxp.com
              </p>
            </div>
          </body>
          </html>
        `,
      })
    } catch (emailError) {
      // Don't fail the request if email fails — enquiry is already saved
      console.error('Email send error:', emailError)
    }

    return NextResponse.json({ success: true, id: enquiry.id })
  } catch (err) {
    console.error('Enquiry API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
