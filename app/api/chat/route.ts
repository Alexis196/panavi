import { NextRequest, NextResponse } from 'next/server'

const STATIC_RESPONSES: Record<string, string> = {
  precios: 'Podés ver todos nuestros precios en la sección de Productos: /productos',
  pedido: 'Para hacer un pedido, completá el formulario en: /presupuesto',
  horarios: 'Estamos abiertos de Lunes a Sábados de 7:00 a 18:00 hs.',
  humano: 'Te conectamos con nuestro equipo por WhatsApp ahora.',
}

// Handler preparado para escalar a IA (Anthropic API)
export async function POST(request: NextRequest) {
  const mode = process.env.NEXT_PUBLIC_CHATBOT_MODE ?? 'static'

  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
    }

    if (mode === 'static') {
      const lower = message.toLowerCase()
      let reply = 'Para ayudarte mejor, elegí una opción del menú o escribinos por WhatsApp.'

      if (lower.includes('precio') || lower.includes('cuánto') || lower.includes('cuanto')) {
        reply = STATIC_RESPONSES.precios
      } else if (lower.includes('pedido') || lower.includes('pedir') || lower.includes('comprar')) {
        reply = STATIC_RESPONSES.pedido
      } else if (lower.includes('horario') || lower.includes('hora') || lower.includes('abierto')) {
        reply = STATIC_RESPONSES.horarios
      } else if (lower.includes('humano') || lower.includes('persona') || lower.includes('whatsapp')) {
        reply = STATIC_RESPONSES.humano
      }

      return NextResponse.json({ reply, mode: 'static' })
    }

    // AI mode — Anthropic API (para activar: NEXT_PUBLIC_CHATBOT_MODE=ai + ANTHROPIC_API_KEY)
    if (mode === 'ai') {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        return NextResponse.json({ reply: 'Servicio de IA no configurado.', mode: 'ai_error' })
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: `Sos el asistente de Panavi, una panadería artesanal en Formosa, Argentina.
Respondé de forma amable y concisa en español rioplatense.
Si preguntan por precios, deciles que visiten /productos.
Si quieren hacer un pedido, enviálos a /presupuesto.
Horario: Lunes a Sábados de 7:00 a 18:00 hs.
WhatsApp disponible para consultas urgentes.`,
          messages: [{ role: 'user', content: message }],
        }),
      })

      const data = await response.json()
      const reply = data.content?.[0]?.text ?? 'Lo siento, no pude procesar tu consulta.'
      return NextResponse.json({ reply, mode: 'ai' })
    }

    return NextResponse.json({ reply: 'Modo no reconocido.', mode })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
