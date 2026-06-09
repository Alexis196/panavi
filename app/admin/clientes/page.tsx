'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react'
import toast from 'react-hot-toast'
import { Profile, CuentaCorriente, MovimientoCuenta } from '@/types/database'
import Loader from '@/components/ui/Loader'

interface ClienteConCuenta extends Profile {
  cuentas_corrientes: CuentaCorriente | null
}

export default function ClientesPage() {
  const supabase = createClient()
  const [clientes, setClientes] = useState<ClienteConCuenta[]>([])
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [movimientos, setMovimientos] = useState<Record<string, MovimientoCuenta[]>>({})
  const [modal, setModal] = useState<{ cliente: ClienteConCuenta; tipo: 'debito' | 'credito' } | null>(null)
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*, cuentas_corrientes(*)')
      .eq('role', 'cliente')
      .order('full_name')
    setClientes(data as ClienteConCuenta[] ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchClientes() }, [fetchClientes])

  const fetchMovimientos = async (cuentaId: string) => {
    if (movimientos[cuentaId]) return
    const { data } = await supabase
      .from('movimientos_cuenta')
      .select('*')
      .eq('cuenta_id', cuentaId)
      .order('fecha', { ascending: false })
      .limit(10)
    setMovimientos((prev) => ({ ...prev, [cuentaId]: data ?? [] }))
  }

  const toggleExpandido = async (clienteId: string, cuentaId?: string) => {
    if (expandido === clienteId) {
      setExpandido(null)
    } else {
      setExpandido(clienteId)
      if (cuentaId) fetchMovimientos(cuentaId)
    }
  }

  const registrarMovimiento = async () => {
    if (!modal) return
    const montoNum = Number(monto)
    if (!montoNum || montoNum <= 0) { toast.error('Ingresá un monto válido'); return }

    let cuentaId = modal.cliente.cuentas_corrientes?.id

    // Crear cuenta si no existe
    if (!cuentaId) {
      const { data: cuenta, error } = await supabase
        .from('cuentas_corrientes')
        .insert({ cliente_id: modal.cliente.id, saldo: 0 })
        .select()
        .single()
      if (error || !cuenta) { toast.error('Error al crear cuenta'); return }
      cuentaId = cuenta.id
    }

    setSaving(true)
    const { error } = await supabase.from('movimientos_cuenta').insert({
      cuenta_id: cuentaId,
      tipo: modal.tipo,
      monto: montoNum,
      descripcion: descripcion || null,
    })
    if (error) { toast.error('Error al registrar'); setSaving(false); return }

    toast.success('Movimiento registrado')
    setModal(null)
    setMonto('')
    setDescripcion('')
    setMovimientos({}) // reset cache
    fetchClientes()
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#3E3124]">Clientes y cuentas corrientes</h1>
        <div className="flex items-center gap-2 text-sm text-[#8A7660]">
          <Users className="w-4 h-4" />
          {clientes.length} clientes
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-3">
          {clientes.map((cliente) => {
            const cuenta = cliente.cuentas_corrientes
            const saldo = cuenta?.saldo ?? 0
            const isOpen = expandido === cliente.id

            return (
              <div key={cliente.id} className="bg-white rounded-2xl border border-[#DDD0B0] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#E7D7B1] rounded-full w-10 h-10 flex items-center justify-center font-bold text-[#C97B4B]">
                      {cliente.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#3E3124]">{cliente.full_name}</p>
                      <p className="text-xs text-[#8A7660]">{cliente.phone ?? 'Sin teléfono'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold text-lg ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {saldo >= 0 ? '+' : ''} ${Math.abs(saldo).toLocaleString('es-AR')}
                      </p>
                      <p className="text-xs text-[#8A7660]">{saldo >= 0 ? 'A favor' : 'Pendiente'}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setModal({ cliente, tipo: 'credito' })}
                        className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                        title="Acreditar"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setModal({ cliente, tipo: 'debito' })}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                        title="Debitar"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleExpandido(cliente.id, cuenta?.id)}
                        className="p-1.5 text-[#8A7660] hover:text-[#3E3124] transition-colors"
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Movimientos expandidos */}
                {isOpen && cuenta && (
                  <div className="border-t border-[#DDD0B0] px-5 py-3">
                    <p className="text-xs font-semibold text-[#8A7660] mb-2">Últimos movimientos</p>
                    {(movimientos[cuenta.id] ?? []).length === 0 ? (
                      <p className="text-sm text-[#8A7660]">Sin movimientos</p>
                    ) : (
                      <div className="space-y-1">
                        {(movimientos[cuenta.id] ?? []).map((mov) => (
                          <div key={mov.id} className="flex items-center justify-between text-sm">
                            <div>
                              <span className="text-[#3E3124]">{mov.descripcion ?? (mov.tipo === 'credito' ? 'Crédito' : 'Débito')}</span>
                              <span className="text-xs text-[#8A7660] ml-2">
                                {format(new Date(mov.fecha), "d MMM", { locale: es })}
                              </span>
                            </div>
                            <span className={`font-semibold ${mov.tipo === 'credito' ? 'text-green-600' : 'text-red-600'}`}>
                              {mov.tipo === 'credito' ? '+' : '-'}${Number(mov.monto).toLocaleString('es-AR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal movimiento cuenta */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-[#3E3124] mb-1 capitalize">
              {modal.tipo === 'credito' ? 'Acreditar' : 'Debitar'} en cuenta
            </h3>
            <p className="text-sm text-[#8A7660] mb-4">{modal.cliente.full_name}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#3E3124] mb-1">Monto *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3E3124] mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Pago de pedido, abono..."
                  className="w-full border border-[#DDD0B0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C97B4B] text-[#3E3124]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-[#DDD0B0] rounded-xl text-[#8A7660] text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={registrarMovimiento}
                disabled={saving}
                className={`flex-1 py-2.5 font-semibold text-sm rounded-xl text-white transition-colors ${
                  modal.tipo === 'credito' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-60`}
              >
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
