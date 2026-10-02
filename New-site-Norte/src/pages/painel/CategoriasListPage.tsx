import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { Categoria } from '../../data/painel/painelTypes'
import {
  createCategoria,
  deleteCategoria,
  listCategorias,
  updateCategoria,
  type CategoriaInput,
} from '../../services/painel/categoriasApi'
import { PainelApiError } from '../../services/painel/httpClient'
import { IconEdit, IconEye, IconTag, IconTrash } from '../../components/painel/icons'
import { ConfirmModal } from '../../components/painel/ConfirmModal'
import { PainelPageHeader } from '../../components/painel/PainelPageHeader'
import '../../styles/painel.css'

const FORM_DEFAULTS: CategoriaInput = { nome: '', slug: '', descricao: '', ativo: true }

export function CategoriasListPage() {
  const queryClient = useQueryClient()
  const { data: categorias, isLoading } = useQuery({
    queryKey: ['painel', 'categorias'],
    queryFn: listCategorias,
  })

  const [editando, setEditando] = useState<Categoria | null>(null)
  const [formAberto, setFormAberto] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [statusPendente, setStatusPendente] = useState<CategoriaInput | null>(null)
  const [confirmExcluir, setConfirmExcluir] = useState<Categoria | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoriaInput>({ defaultValues: FORM_DEFAULTS })

  function abrirNova() {
    setEditando(null)
    reset(FORM_DEFAULTS)
    setErroGeral(null)
    setFormAberto(true)
  }

  function abrirEdicao(categoria: Categoria) {
    setEditando(categoria)
    reset({
      nome: categoria.nome,
      slug: categoria.slug,
      descricao: categoria.descricao,
      ativo: categoria.ativo,
    })
    setErroGeral(null)
    setFormAberto(true)
  }

  const salvar = useMutation({
    mutationFn: (data: CategoriaInput) => (editando ? updateCategoria(editando.id, data) : createCategoria(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel', 'categorias'] })
      toast.success(editando ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!')
      setFormAberto(false)
    },
    onError: (error: unknown) => {
      if (error instanceof PainelApiError && error.body && typeof error.body === 'object') {
        const body = error.body as Record<string, string[]>
        let algumCampo = false
        for (const campo of ['nome', 'slug', 'descricao', 'ativo'] as const) {
          if (body[campo]) {
            setError(campo, { message: body[campo].join(' ') })
            algumCampo = true
          }
        }
        if (!algumCampo) setErroGeral('Não foi possível salvar a categoria.')
      } else {
        setErroGeral('Não foi possível salvar a categoria.')
      }
      toast.error('Não foi possível salvar a categoria.')
    },
  })

  const excluir = useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel', 'categorias'] })
      toast.success('Categoria excluída com sucesso!')
    },
    onError: () => toast.error('Não foi possível excluir a categoria.'),
  })

  function onExcluir(categoria: Categoria) {
    setConfirmExcluir(categoria)
  }

  function fecharFormulario() {
    setFormAberto(false)
    setStatusPendente(null)
  }

  function onSubmitForm(data: CategoriaInput) {
    if (editando && data.ativo !== editando.ativo) {
      setStatusPendente(data)
      return
    }
    salvar.mutate(data)
  }

  return (
    <div>
      <PainelPageHeader
        icon={<IconTag />}
        title="Categorias"
        description="Organize as categorias usadas para classificar as postagens do blog."
        actions={
          <button type="button" className="painel-primary-button" onClick={abrirNova}>
            Nova categoria
          </button>
        }
      />

      {isLoading && <p>Carregando…</p>}

      {categorias && (
        <table className="painel-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Slug</th>
              <th>Status</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td data-label="Nome">{categoria.nome}</td>
                <td data-label="Slug">{categoria.slug}</td>
                <td data-label="Status">
                  <span className={`painel-status-badge ${categoria.ativo ? 'publicado' : 'rascunho'}`}>
                    {categoria.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="painel-table-cell-actions">
                  <div className="painel-table-actions">
                    <Link to={`/painel/categorias/${categoria.id}`} data-tooltip="Visualizar">
                      <IconEye />
                      <span className="painel-sr-only">Visualizar</span>
                    </Link>
                    <button type="button" data-tooltip="Editar" onClick={() => abrirEdicao(categoria)}>
                      <IconEdit />
                      <span className="painel-sr-only">Editar</span>
                    </button>
                    <button type="button" className="destrutivo" data-tooltip="Excluir" onClick={() => onExcluir(categoria)}>
                      <IconTrash />
                      <span className="painel-sr-only">Excluir</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan={4} className="painel-empty">
                  Nenhuma categoria cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {formAberto && (
        <div className="painel-modal-backdrop" onClick={fecharFormulario}>
          <form
            className="painel-modal"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmit(onSubmitForm)}
            noValidate
          >
            <h2>{editando ? 'Editar categoria' : 'Nova categoria'}</h2>

            <div className="painel-field">
              <label>
                Nome
                <input autoFocus {...register('nome', { required: true })} />
              </label>
              {errors.nome && <span className="painel-field-error">{errors.nome.message || 'Informe o nome.'}</span>}
            </div>

            <div className="painel-field">
              <label>
                Slug (opcional — gerado automaticamente a partir do nome)
                <input {...register('slug')} />
              </label>
              {errors.slug && <span className="painel-field-error">{errors.slug.message}</span>}
            </div>

            <label>
              Descrição
              <textarea rows={3} {...register('descricao')} />
            </label>

            <label className="painel-checkbox">
              <input type="checkbox" {...register('ativo')} />
              Ativa
            </label>

            {erroGeral && <p className="painel-form-error">{erroGeral}</p>}

            <div className="painel-modal-actions">
              <button type="button" onClick={fecharFormulario}>
                Cancelar
              </button>
              <button type="submit" disabled={salvar.isPending}>
                {salvar.isPending ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {statusPendente && (
        <ConfirmModal
          title="Mudar status da categoria"
          message={`Tem certeza que deseja tornar esta categoria ${statusPendente.ativo ? 'ativa' : 'inativa'}?`}
          confirmLabel={statusPendente.ativo ? 'Ativar' : 'Inativar'}
          variant={statusPendente.ativo ? 'success' : 'warning'}
          isPending={salvar.isPending}
          onCancel={() => setStatusPendente(null)}
          onConfirm={() => {
            salvar.mutate(statusPendente)
            setStatusPendente(null)
          }}
        />
      )}

      {confirmExcluir && (
        <ConfirmModal
          title="Excluir categoria"
          message={`Tem certeza que deseja excluir a categoria "${confirmExcluir.nome}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          variant="danger"
          isPending={excluir.isPending}
          onCancel={() => setConfirmExcluir(null)}
          onConfirm={() => {
            excluir.mutate(confirmExcluir.id)
            setConfirmExcluir(null)
          }}
        />
      )}
    </div>
  )
}
