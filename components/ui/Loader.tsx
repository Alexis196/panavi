import Image from 'next/image'

interface Props {
  fullscreen?: boolean
  message?: string
}

export default function Loader({ fullscreen = false, message }: Props) {
  const dots = Array.from({ length: 12 })

  const spinner = (
    <div className="relative flex items-center justify-center w-28 h-28">
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
        {dots.map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#D4A65A]"
            style={{
              width: 9,
              height: 9,
              top: '50%',
              left: '50%',
              marginTop: -4.5,
              marginLeft: -4.5,
              transform: `rotate(${i * 30}deg) translateY(-44px)`,
              opacity: 0.2 + (i / 11) * 0.8,
            }}
          />
        ))}
      </div>
      <Image
        src="/loader.png"
        alt="Cargando"
        width={52}
        height={52}
        className="object-contain relative z-10"
      />
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#F8F4EC]">
        {spinner}
        {message && (
          <p className="text-[#3E3124] text-sm font-medium">{message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-16">
      {spinner}
    </div>
  )
}
