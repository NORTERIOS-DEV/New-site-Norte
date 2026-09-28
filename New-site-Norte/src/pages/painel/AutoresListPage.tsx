import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Autor } from '../../data/painel/painelTypes'
import { createAutor, deleteAutor, listAutores, updateAutor } from '../../services/painel/autoresApi'
import { PainelApiError } from '../../services/painel/httpClient'
import '../../styles/painel.css'

type AutorFormValues = {
  nome: string
  cargo: string
  mini_bio: string
  ativo: boolean
  foto: FileList | null
}

const FORM_DEFAULTS: AutorFormValues = { nome: '', cargo: '', mini_bio: '', ativo: true, foto: null }

function buildFormData(data: AutorFormValues): FormData {
  const fd = new FormData()
  fd.append('nome', data.nome)
  fd.append('cargo', data.cargo)
  fd.append('mini_bio', data.mini_bio)
  fd.append('ativo', String(data.ativo))
  if (data.foto && data.foto.length > 0) {
    fd.append('foto', data.foto[0])
  }
  return fd
}

export function AutoresListPage() {
  const queryClient = useQueryClient()
  const { data: autores, isLoading } = useQuery({ queryKey: ['painel', 'autores'], queryFn: listAutores })

  const [editando, setEditando] = useState<Autor | null>(null)
  const [formAberto, setFormAberto] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AutorFormValues>({ defaultValues: FORM_DEFAULTS })

  function abrirNovo() {
    setEditando(null)
    reset(FORM_DEFAULTS)
    setErroGeral(null)
    setFormAberto(true)
  }

  function abrirEdicao(autor: Autor) {
    setEditando(autor)
    reset({ nome: autor.nome, cargo: autor.cargo, mini_bio: autor.mini_bio, ativo: autor.ativo, foto: null })
    setErroGeral(null)
    setFormAberto(true)
  }

  const salvar = useMutation({
    mutationFn: (data: AutorFormValues) => {
      const fd = buildFormData(data)
      return editando ? updateAutor(editando.id, fd) : createAutor(fd)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel', 'autores'] })
      setFormAberto(false)
    },
    onError: (error: unknown) => {
      if (error instanceof PainelApiError && error.body && typeof error.body === 'object') {
        const body = error.body as Record<string, string[]>
        let algumCampo = false
        for (const campo of ['nome', 'cargo', 'mini_bio', 'foto'] as const) {
          if (body[campo]) {
            setError(campo, { message: body[campo].join(' ') })
            algumCampo = true
          }
        }
        if (!algumCampo) setErroGeral('Não foi possível salvar o autor.')
      } else {
        setErroGeral('Não foi possível salvar o autor.')
      }
    },
  })

  const excluir = useMutation({
    mutationFn: (id: number) => deleteAutor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel', 'autores'] }),
    onError: (error: unknown) => {
      const mensagem =
        error instanceof PainelApiError && error.body && typeof error.body === 'object' && 'detail' in error.body
          ? String((error.body as { detail: string }).detail)
          : 'Não foi possível excluir o autor.'
      window.alert(mensagem)
    },
  })

  function onExcluir(autor: Autor) {
    if (window.confirm(`Excluir o autor "${autor.nome}"?`)) {
      excluir.mutate(autor.id)
    }
  }

  return (
    <div>
      <div className="painel-crud-header">
        <h1>Autores</h1>
        <button type="button" onClick={abrirNovo}>
          Novo autor
        </button>
      </div>

      {isLoading && <p>Carregando…</p>}

      {autores && (
        <table className="painel-table">
          <thead>
            <tr>
              <th aria-label="Foto" />
              <th>Nome</th>
              <th>Cargo</th>
              <th>Status</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {autores.map((autor) => (
              <tr key={autor.id}>
                <td>
                  {autor.foto ? (
                    <img className="painel-thumb" src={autor.foto} alt="" />
                  ) : (
                    <div className="painel-thumb" />
                  )}
                </td>
                <td>{autor.nome}</td>
                <td>{autor.cargo}</td>
                <td>
                  <span className={`painel-status-badge ${autor.ativo ? 'publicado' : 'rascunho'}`}>
                    {autor.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="painel-table-actions">
                  <button type="button" onClick={() => abrirEdicao(autor)}>
                    Editar
                  </button>
                  <button type="button" className="destrutivo" onClick={() => onExcluir(autor)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {autores.length === 0 && (
              <tr>
                <td colSpan={5} className="painel-empty">
                  Nenhum autor cadastrado ainda.
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
            <h2>{editando ? 'Editar autor' : 'Novo autor'}</h2>

            <label>
              Nome
              <input autoFocus {...register('nome', { required: true })} />
            </label>
            {errors.nome && <span className="painel-field-error">{errors.nome.message || 'Informe o nome.'}</span>}

            <label>
              Cargo / função
              <input {...register('cargo')} />
            </label>

            <label>
              Mini biografia
              <textarea rows={3} {...register('mini_bio')} />
            </label>

            <label>
              Foto {editando?.foto && '(enviar um arquivo substitui a atual)'}
              <input type="file" accept="image/*" {...register('foto')} />
            </label>
            {errors.foto && <span className="painel-field-error">{errors.foto.message}</span>}

            <label className="painel-checkbox">
              <input type="checkbox" {...register('ativo')} />
              Ativo
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
