import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Pedido } from '@/types/database'

export default async function ActividadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)

  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('fecha, estado, total')
    .eq('cliente_id', user.id)
    .gte('fecha', start.toISOString())
    .lte('fecha', end.toISOString())

  const diasConPedidos = (pedidos ?? []).map((p: Pick<Pedido, 'fecha'>) => new Date(p.fecha))

  const diasDelMes = eachDayOfInterval({ start, end })

  // Fill grid from Monday
  const firstDay = getDay(start) // 0=Sun, 1=Mon...
  const offset = firstDay === 0 ? 6 : firstDay - 1

  const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#3E3124] mb-2">Actividad mensual</h1>
      <p className="text-[#8A7660] mb-8 capitalize">
        {format(now, 'MMMM yyyy', { locale: es })}
      </p>

      {/* Calendario */}
      <div className="bg-white rounded-2xl border border-[#DDD0B0] p-6 mb-6">
        {/* Cabecera días */}
        <div className="grid grid-cols-7 mb-2">
          {dias.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-[#8A7660] py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Días */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells at start */}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {diasDelMes.map((dia) => {
            const tienePedido = diasConPedidos.some((d) => isSameDay(d, dia))
            const esHoy = isSameDay(dia, now)

            return (
              <div
                key={dia.toISOString()}
                className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                  tienePedido
                    ? 'bg-[#C97B4B] text-[#FFFDF8]'
                    : esHoy
                    ? 'border-2 border-[#C97B4B] text-[#3E3124]'
                    : 'text-[#3E3124] hover:bg-[#E7D7B1]'
                }`}
              >
                {format(dia, 'd')}
              </div>
            )
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 text-sm text-[#8A7660] mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#C97B4B]" />
          <span>Día con pedido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-[#C97B4B]" />
          <span>Hoy</span>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-[#E7D7B1] rounded-2xl p-5 border border-[#DDD0B0]">
        <h3 className="font-semibold text-[#3E3124] mb-3">Resumen del mes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-[#3E3124]">{pedidos?.length ?? 0}</p>
            <p className="text-xs text-[#8A7660]">Pedidos realizados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#3E3124]">
              ${(pedidos ?? []).reduce((acc, p) => acc + Number(p.total), 0).toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-[#8A7660]">Total gastado</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#3E3124]">
              {(pedidos ?? []).filter((p) => p.estado === 'entregado').length}
            </p>
            <p className="text-xs text-[#8A7660]">Pedidos entregados</p>
          </div>
        </div>
      </div>
    </div>
  )
}
