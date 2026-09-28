import { useEffect, useState, type FocusEvent, type PointerEvent } from 'react'
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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Foto } from '../../data/painel/painelTypes'
import { deleteFoto, reordenarFotos, updateFoto } from '../../services/painel/galeriaApi'

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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['painel', 'albuns', String(albumId)] })

  const salvarCampo = useMutation({
    mutationFn: (data: { legenda?: string; alt?: string }) => updateFoto(foto.id, data),
    onSuccess: invalidar,
  })

  const excluir = useMutation({
    mutationFn: () => deleteFoto(foto.id),
    onSuccess: invalidar,
  })

  function onExcluir() {
    if (window.confirm('Excluir esta foto?')) excluir.mutate()
  }

  // Impede que o clique num input/botão dentro do card dispare o drag (o
  // listener de arrastar do dnd-kit fica no card inteiro).
  function pararPropagacao(event: PointerEvent) {
    event.stopPropagation()
  }

  function onLegendaBlur(event: FocusEvent<HTMLInputElement>) {
    if (event.target.value !== foto.legenda) salvarCampo.mutate({ legenda: event.target.value })
  }

  function onAltBlur(event: FocusEvent<HTMLInputElement>) {
    if (event.target.value !== foto.alt) salvarCampo.mutate({ alt: event.target.value })
  }

  return (
    <div ref={setNodeRef} style={style} className="painel-photo-item" {...attributes} {...listeners}>
      <img src={foto.miniatura || foto.imagem} alt={foto.alt} />
      <input placeholder="Legenda" defaultValue={foto.legenda} onBlur={onLegendaBlur} onPointerDown={pararPropagacao} />
      <input
        placeholder="Texto alternativo"
        defaultValue={foto.alt}
        onBlur={onAltBlur}
        onPointerDown={pararPropagacao}
      />
      <button type="button" className="destrutivo" onPointerDown={pararPropagacao} onClick={onExcluir}>
        Excluir
      </button>
    </div>
  )
}
