'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

interface Message {
  id: string
  role: 'bot' | 'user'
  text: string
}

const QUICK_OPTIONS = [
  { label: '💰 Ver precios', value: 'precios' },
  { label: '🛒 Hacer un pedido', value: 'pedido' },
  { label: '🕐 Horarios', value: 'horarios' },
  { label: '👤 Hablar con humano', value: 'humano' },
]

const WELCOME: Message = {
  id: 'welcome',
  role: 'bot',
  text: '¡Hola! Soy el asistente de Panavi 🥐 ¿En qué te puedo ayudar?',
}

const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493704000000'

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mode = process.env.NEXT_PUBLIC_CHATBOT_MODE || 'static'

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const addMessage = (role: 'bot' | 'user', text: string) => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), role, text }])
  }

  const handleStaticResponse = (value: string) => {
    switch (value) {
      case 'precios':
        addMessage('bot', 'Te llevo al catálogo para que veas todos nuestros precios 😊')
        setTimeout(() => { window.location.href = '/productos' }, 1000)
        break
      case 'pedido':
        addMessage('bot', '¡Perfecto! Te dirijo al formulario de pedidos 📋')
        setTimeout(() => { window.location.href = '/pedidos' }, 1000)
        break
      case 'horarios':
        addMessage('bot', 'Estamos abiertos de Lunes a Sábados de 7:00 a 18:00 hs 🕐')
        break
      case 'humano':
        addMessage('bot', 'Te conectamos con nuestro equipo por WhatsApp ahora mismo 💬')
        setTimeout(() => {
          window.open(`https://wa.me/${whatsapp}?text=Hola, quiero hablar con alguien de Panavi`, '_blank')
        }, 800)
        break
      default:
        addMessage('bot', 'No entendí bien. Por favor elegí una opción del menú o escribinos por WhatsApp.')
    }
  }

  const handleOptionClick = (value: string, label: string) => {
    addMessage('user', label)
    handleStaticResponse(value)
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    addMessage('user', text)
    setInput('')

    if (mode === 'static') {
      const lower = text.toLowerCase()
      if (lower.includes('precio') || lower.includes('cuánto') || lower.includes('cuanto')) {
        handleStaticResponse('precios')
      } else if (lower.includes('pedido') || lower.includes('pedir') || lower.includes('comprar')) {
        handleStaticResponse('pedido')
      } else if (lower.includes('horario') || lower.includes('hora') || lower.includes('abierto')) {
        handleStaticResponse('horarios')
      } else if (lower.includes('humano') || lower.includes('persona') || lower.includes('whatsapp')) {
        handleStaticResponse('humano')
      } else {
        addMessage('bot', 'Para ayudarte mejor, podés elegir una opción del menú o escribirnos directamente por WhatsApp.')
      }
      return
    }

    // AI mode (future)
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      addMessage('bot', data.reply || 'Lo siento, no pude procesar tu consulta.')
    } catch {
      addMessage('bot', 'Error al conectar. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-[#C97B4B] hover:bg-[#A5623C] text-white rounded-full p-4 shadow-xl transition-all hover:scale-110 cursor-pointer"
        aria-label="Abrir chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-[#DDD0B0] flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-[#C97B4B] px-4 py-3 flex items-center gap-3">
            <div className="bg-[#D4A65A] rounded-full p-1.5">
              <Bot className="w-4 h-4 text-[#C97B4B]" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Asistente Panavi</p>
              <p className="text-[#FFFDF8] text-xs">Siempre disponible</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 bg-[#F8F4EC]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-[#C97B4B] text-white rounded-br-none'
                      : 'bg-[#E7D7B1] text-[#3E3124] rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#E7D7B1] px-3 py-2 rounded-xl rounded-bl-none">
                  <span className="text-[#C97B4B] text-sm">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick options */}
          <div className="px-3 py-2 bg-white border-t border-[#DDD0B0]">
            <p className="text-xs text-[#8A7660] mb-2">Opciones rápidas:</p>
            <div className="grid grid-cols-2 gap-1">
              {QUICK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleOptionClick(opt.value, opt.label)}
                  className="text-xs px-2 py-1.5 bg-[#E7D7B1] hover:bg-[#D4A65A] text-[#3E3124] rounded-lg transition-colors text-left cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-3 py-2 bg-white border-t border-[#DDD0B0] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribí tu consulta..."
              className="flex-1 text-sm border border-[#DDD0B0] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-[#C97B4B] hover:bg-[#A5623C] disabled:opacity-50 text-white p-2 rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
