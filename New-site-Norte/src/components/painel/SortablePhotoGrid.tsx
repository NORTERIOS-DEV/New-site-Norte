import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { Foto } from '../../data/painel/painelTypes'
import { deleteFoto, reordenarFotos, updateFoto } from '../../services/painel/galeriaApi'
import { IconEdit, IconMore, IconTrash } from './icons'
import { ConfirmModal } from './ConfirmModal'
import { FotoFormModal } from './FotoFormModal'

type SortablePhotoGridProps = {
  albumId: number
  fotos: Foto[]
}

export function SortablePhotoGrid({ albumId, fotos }: SortablePhotoGridProps) {
  const queryClient = useQueryClient()
  const [ordemLocal, setOrdemLocal] = useState(fotos)

  useEffect(() => setOrdemLocal(fotos), [fotos])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const reordenar = useMutation({
    mutationFn: (ids: number[]) => reordenarFotos(albumId, ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel', 'albuns', String(albumId)] }),
    onError: () => toast.error('Não foi possível reordenar as fotos.'),
  })

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ordemLocal.findIndex((f) => f.id === active.id)
    const newIndex = ordemLocal.findIndex((f) => f.id === over.id)
    const nova = arrayMove(ordemLocal, oldIndex, newIndex)
    setOrdemLocal(nova)
    reordenar.mutate(nova.map((f) => f.id))
  }

  if (ordemLocal.length === 0) {
    return <p className="painel-empty">Nenhuma foto neste álbum ainda.</p>
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToParentElement]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ordemLocal.map((f) => f.id)} strategy={rectSortingStrategy}>
        <div className="painel-photo-grid">
          {ordemLocal.map((foto) => (
            <SortablePhotoItem key={foto.id} foto={foto} albumId={albumId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortablePhotoItem({ foto, albumId }: { foto: Foto; albumId: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: foto.id })
  const queryClient = useQueryClient()
  const [menuAberto, setMenuAberto] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [confirmExcluirAberto, setConfirmExcluirAberto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['painel', 'albuns', String(albumId)] })

  const salvar = useMutation({
    mutationFn: (data: { file: File | null; legenda: string; alt: string }) =>
      updateFoto(foto.id, { legenda: data.legenda, alt: data.alt }, data.file),
    onSuccess: () => {
      invalidar()
      toast.success('Foto atualizada com sucesso!')
      setModalAberto(false)
    },
    onError: () => toast.error('Não foi possível salvar a foto.'),
  })

  const excluir = useMutation({
    mutationFn: () => deleteFoto(foto.id),
    onSuccess: () => {
      invalidar()
      toast.success('Foto excluída com sucesso!')
    },
    onError: () => toast.error('Não foi possível excluir a foto.'),
  })

  function onExcluir() {
    setMenuAberto(false)
    setConfirmExcluirAberto(true)
  }

  function abrirEditar() {
    setMenuAberto(false)
    setModalAberto(true)
  }

  // Impede que o clique num botão/campo dentro do card dispare o drag (o
  // listener de arrastar do dnd-kit fica no card inteiro).
  function pararPropagacao(event: PointerEvent) {
    event.stopPropagation()
  }

  // Fecha o menu de três pontinhos ao clicar fora dele.
  useEffect(() => {
    if (!menuAberto) return
    function aoClicarFora(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [menuAberto])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`painel-photo-item${menuAberto ? ' painel-photo-item--menu-aberto' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="painel-photo-thumb">
        <img src={foto.miniatura || foto.imagem} alt={foto.alt} />
        <div className="painel-photo-menu-wrap" ref={menuRef} onPointerDown={pararPropagacao}>
          <button
            type="button"
            className="painel-photo-menu-trigger"
            data-tooltip="Mais ações"
            onClick={() => setMenuAberto((aberto) => !aberto)}
          >
            <IconMore />
            <span className="painel-sr-only">Mais ações</span>
          </button>
          {menuAberto && (
            <div className="painel-photo-menu">
              <button type="button" onClick={abrirEditar}>
                <IconEdit />
                Editar
              </button>
              <button type="button" className="destrutivo" onClick={onExcluir}>
                <IconTrash />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {modalAberto &&
        createPortal(
          <div onPointerDown={pararPropagacao}>
            <FotoFormModal
              title="Editar foto"
              existingImageUrl={foto.miniatura || foto.imagem}
              initialLegenda={foto.legenda}
              initialAlt={foto.alt}
              isPending={salvar.isPending}
              onCancel={() => setModalAberto(false)}
              onSubmit={(data) => salvar.mutate(data)}
            />
          </div>,
          document.body,
        )}

      {confirmExcluirAberto &&
        createPortal(
          <div onPointerDown={pararPropagacao}>
            <ConfirmModal
              title="Excluir foto"
              message="Tem certeza que deseja excluir esta foto? Essa ação não pode ser desfeita."
              confirmLabel="Excluir"
              variant="danger"
              isPending={excluir.isPending}
              onCancel={() => setConfirmExcluirAberto(false)}
              onConfirm={() => {
                excluir.mutate()
                setConfirmExcluirAberto(false)
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  )
}
