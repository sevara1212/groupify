import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, joinUrl, joinCode, projectName } = await req.json()

    if (!email || !joinUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, joinUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #8B5CF6, #EC4899); line-height: 48px; text-align: center;">
            <span style="color: white; font-weight: 900; font-size: 22px;">G</span>
          </div>
          <h1 style="margin: 16px 0 4px; font-size: 22px; color: #1C1829;">You're invited to Groupify!</h1>
          <p style="color: #6B6584; font-size: 14px; margin: 0;">Join ${projectName ? `<strong>${projectName}</strong>` : 'a group project'} and start collaborating.</p>
        </div>

        ${joinCode ? `
        <div style="text-align: center; background: #F5F3FF; border: 1px solid #C4B5FD; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #8B5CF6; margin: 0 0 8px;">Join Code</p>
          <p style="font-size: 28px; font-weight: 900; font-family: monospace; color: #1C1829; letter-spacing: 4px; margin: 0;">${joinCode}</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${joinUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">
            Join Project →
          </a>
        </div>

        <p style="color: #A09BB8; font-size: 12px; text-align: center;">
          Or paste this link in your browser:<br/>
          <a href="${joinUrl}" style="color: #8B5CF6; word-break: break-all;">${joinUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #EDE9FE; margin: 24px 0;" />
        <p style="color: #C4B5FD; font-size: 11px; text-align: center;">
          Sent via Groupify · Smart group project management
        </p>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Groupify <onboarding@resend.dev>',
        to: [email],
        subject: `You're invited to join ${projectName || 'a Groupify project'}!`,
        html: htmlContent,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data.message || 'Failed to send email' }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
