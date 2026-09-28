import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Categoria } from '../../data/painel/painelTypes'
import {
  createCategoria,
  deleteCategoria,
  listCategorias,
  updateCategoria,
  type CategoriaInput,
} from '../../services/painel/categoriasApi'
import { PainelApiError } from '../../services/painel/httpClient'
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
    },
  })

  const excluir = useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel', 'categorias'] }),
  })

  function onExcluir(categoria: Categoria) {
    if (window.confirm(`Excluir a categoria "${categoria.nome}"?`)) {
      excluir.mutate(categoria.id)
    }
  }

  return (
    <div>
      <div className="painel-crud-header">
        <h1>Categorias</h1>
        <button type="button" onClick={abrirNova}>
          Nova categoria
        </button>
      </div>

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
                <td>{categoria.nome}</td>
                <td>{categoria.slug}</td>
                <td>
                  <span className={`painel-status-badge ${categoria.ativo ? 'publicado' : 'rascunho'}`}>
                    {categoria.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td className="painel-table-actions">
                  <button type="button" onClick={() => abrirEdicao(categoria)}>
                    Editar
                  </button>
                  <button type="button" className="destrutivo" onClick={() => onExcluir(categoria)}>
                    Excluir
                  </button>
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
        <div className="painel-modal-backdrop" onClick={() => setFormAberto(false)}>
          <form
            className="painel-modal"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmit((data) => salvar.mutate(data))}
            noValidate
          >
            <h2>{editando ? 'Editar categoria' : 'Nova categoria'}</h2>

            <label>
              Nome
              <input autoFocus {...register('nome', { required: true })} />
            </label>
            {errors.nome && <span className="painel-field-error">{errors.nome.message || 'Informe o nome.'}</span>}

            <label>
              Slug (opcional — gerado automaticamente a partir do nome)
              <input {...register('slug')} />
            </label>
            {errors.slug && <span className="painel-field-error">{errors.slug.message}</span>}

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
              <button type="button" onClick={() => setFormAberto(false)}>
                Cancelar
              </button>
              <button type="submit" disabled={salvar.isPending}>
                {salvar.isPending ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
