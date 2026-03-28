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

    const { email, joinUrl, joinCode, projectName, inviterName } = await req.json()

    if (!email || !joinUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, joinUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const displayProject = projectName || 'a group project'
    const displayInviter = inviterName || 'Your teammate'

    const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #F8F7FF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F7FF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #8B5CF6, #EC4899); text-align: center; vertical-align: middle;">
                    <span style="color: white; font-weight: 900; font-size: 20px; line-height: 40px;">G</span>
                  </td>
                  <td style="padding-left: 10px;">
                    <span style="font-weight: 800; font-size: 20px; color: #8B5CF6;">Groupify</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background: white; border-radius: 16px; border: 1px solid #EDE9FE; box-shadow: 0 4px 24px rgba(139,92,246,0.06); overflow: hidden;">

              <!-- Header gradient -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #8B5CF6, #EC4899); padding: 32px 32px 24px; text-align: center;">
                    <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); letter-spacing: 0.5px;">YOU'RE INVITED TO JOIN</p>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: white; line-height: 1.3;">${displayProject}</h1>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 28px 32px 8px;">
                    <!-- Inviter info -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="width: 36px; height: 36px; border-radius: 10px; background: #F5F3FF; text-align: center; vertical-align: middle;">
                          <span style="font-size: 16px; line-height: 36px;">👋</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 14px; color: #1C1829;">
                            <strong>${displayInviter}</strong> <span style="color: #6B6584;">invited you to collaborate on Groupify</span>
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #6B6584;">
                      You've been invited to join a group project. Click the button below to join the team and take a quick quiz so tasks can be allocated fairly.
                    </p>
                  </td>
                </tr>
              </table>

              ${joinCode ? `
              <!-- Join code -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 32px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #F5F3FF; border: 1px solid #C4B5FD; border-radius: 12px;">
                      <tr>
                        <td style="padding: 18px; text-align: center;">
                          <p style="margin: 0 0 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8B5CF6;">Join Code</p>
                          <p style="margin: 0; font-size: 32px; font-weight: 900; font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; color: #1C1829; letter-spacing: 6px;">${joinCode}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 4px 32px 24px; text-align: center;">
                    <a href="${joinUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(139,92,246,0.3);">
                      Join the Project →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 32px 24px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #A09BB8; line-height: 1.5;">
                      Or copy this link into your browser:<br/>
                      <a href="${joinUrl}" style="color: #8B5CF6; word-break: break-all; text-decoration: none;">${joinUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Steps info -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 32px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #FAFAFE; border-radius: 10px; border: 1px solid #EDE9FE;">
                      <tr>
                        <td style="padding: 16px;">
                          <p style="margin: 0 0 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #8B5CF6;">What happens next</p>
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-bottom: 6px; vertical-align: top; width: 24px;"><span style="font-size: 12px;">1️⃣</span></td>
                              <td style="padding-bottom: 6px; font-size: 13px; color: #6B6584;">Click the link to join the project</td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 6px; vertical-align: top; width: 24px;"><span style="font-size: 12px;">2️⃣</span></td>
                              <td style="padding-bottom: 6px; font-size: 13px; color: #6B6584;">Take a 3-minute skills & availability quiz</td>
                            </tr>
                            <tr>
                              <td style="vertical-align: top; width: 24px;"><span style="font-size: 12px;">3️⃣</span></td>
                              <td style="font-size: 13px; color: #6B6584;">AI allocates tasks fairly based on everyone's strengths</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #C4B5FD;">
                Sent via <strong>Groupify</strong> · Smart group project management
              </p>
              <p style="margin: 4px 0 0; font-size: 11px; color: #D8D3F0;">
                You received this because ${displayInviter} invited you to their project.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
        subject: `${displayInviter} invited you to join "${displayProject}" on Groupify`,
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
