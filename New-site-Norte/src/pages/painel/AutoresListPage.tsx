import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { Autor } from '../../data/painel/painelTypes'
import { createAutor, deleteAutor, listAutores, updateAutor } from '../../services/painel/autoresApi'
import { PainelApiError } from '../../services/painel/httpClient'
import { IconEdit, IconEye, IconTrash, IconUser } from '../../components/painel/icons'
import { ConfirmModal } from '../../components/painel/ConfirmModal'
import { PainelPageHeader } from '../../components/painel/PainelPageHeader'
import { ImageDropInput } from '../../components/painel/ImageDropInput'
import '../../styles/painel.css'

type AutorFormValues = {
  nome: string
  nome_exibicao: string
  cargo: string
  formacao_especialidade: string
  mini_bio: string
  instagram: string
  linkedin: string
  ativo: boolean
}

const FORM_DEFAULTS: AutorFormValues = {
  nome: '',
  nome_exibicao: '',
  cargo: '',
  formacao_especialidade: '',
  mini_bio: '',
  instagram: '',
  linkedin: '',
  ativo: true,
}

function buildFormData(data: AutorFormValues, foto: File | null): FormData {
  const fd = new FormData()
  fd.append('nome', data.nome)
  fd.append('nome_exibicao', data.nome_exibicao)
  fd.append('cargo', data.cargo)
  fd.append('formacao_especialidade', data.formacao_especialidade)
  fd.append('mini_bio', data.mini_bio)
  fd.append('instagram', data.instagram)
  fd.append('linkedin', data.linkedin)
  fd.append('ativo', String(data.ativo))
  if (foto) {
    fd.append('foto', foto)
  }
  return fd
}

export function AutoresListPage() {
  const queryClient = useQueryClient()
  const { data: autores, isLoading } = useQuery({ queryKey: ['painel', 'autores'], queryFn: listAutores })

  const [editando, setEditando] = useState<Autor | null>(null)
  const [formAberto, setFormAberto] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [confirmExcluir, setConfirmExcluir] = useState<Autor | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)

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
    setFotoFile(null)
    setErroGeral(null)
    setFormAberto(true)
  }

  function abrirEdicao(autor: Autor) {
    setEditando(autor)
    reset({
      nome: autor.nome,
      nome_exibicao: autor.nome_exibicao,
      cargo: autor.cargo,
      formacao_especialidade: autor.formacao_especialidade,
      mini_bio: autor.mini_bio,
      instagram: autor.instagram,
      linkedin: autor.linkedin,
      ativo: autor.ativo,
    })
    setFotoFile(null)
    setErroGeral(null)
    setFormAberto(true)
  }

  const salvar = useMutation({
    mutationFn: (data: AutorFormValues) => {
      const fd = buildFormData(data, fotoFile)
      return editando ? updateAutor(editando.id, fd) : createAutor(fd)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel', 'autores'] })
      toast.success(editando ? 'Autor atualizado com sucesso!' : 'Autor criado com sucesso!')
      setFormAberto(false)
    },
    onError: (error: unknown) => {
      if (error instanceof PainelApiError && error.body && typeof error.body === 'object') {
        const body = error.body as Record<string, string[]>
        let algumCampo = false
        for (const campo of [
          'nome', 'nome_exibicao', 'cargo', 'formacao_especialidade', 'mini_bio', 'instagram', 'linkedin',
        ] as const) {
          if (body[campo]) {
            setError(campo, { message: body[campo].join(' ') })
            algumCampo = true
          }
        }
        if (!algumCampo) setErroGeral('Não foi possível salvar o autor.')
      } else {
        setErroGeral('Não foi possível salvar o autor.')
      }
      toast.error('Não foi possível salvar o autor.')
    },
  })

  const excluir = useMutation({
    mutationFn: (id: number) => deleteAutor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel', 'autores'] })
      toast.success('Autor excluído com sucesso!')
    },
    onError: (error: unknown) => {
      const mensagem =
        error instanceof PainelApiError && error.body && typeof error.body === 'object' && 'detail' in error.body
          ? String((error.body as { detail: string }).detail)
          : 'Não foi possível excluir o autor.'
      toast.error(mensagem)
    },
  })

  function onExcluir(autor: Autor) {
    setConfirmExcluir(autor)
  }

  return (
    <div>
      <PainelPageHeader
        icon={<IconUser />}
        title="Autores"
        description="Cadastre e edite os autores que assinam as postagens do blog."
        actions={
          <button type="button" className="painel-primary-button" onClick={abrirNovo}>
            Novo autor
          </button>
        }
      />

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
                <td className="painel-table-cell-thumb">
                  {autor.foto ? (
                    <img className="painel-thumb" src={autor.foto} alt="" />
                  ) : (
                    <div className="painel-thumb" />
                  )}
                </td>
                <td data-label="Nome">{autor.nome}</td>
                <td data-label="Cargo">{autor.cargo}</td>
                <td data-label="Status">
                  <span className={`painel-status-badge ${autor.ativo ? 'publicado' : 'rascunho'}`}>
                    {autor.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="painel-table-cell-actions">
                  <div className="painel-table-actions">
                    <Link to={`/painel/autores/${autor.id}`} data-tooltip="Visualizar">
                      <IconEye />
                      <span className="painel-sr-only">Visualizar</span>
                    </Link>
                    <button type="button" data-tooltip="Editar" onClick={() => abrirEdicao(autor)}>
                      <IconEdit />
                      <span className="painel-sr-only">Editar</span>
                    </button>
                    <button type="button" className="destrutivo" data-tooltip="Excluir" onClick={() => onExcluir(autor)}>
                      <IconTrash />
                      <span className="painel-sr-only">Excluir</span>
                    </button>
                  </div>
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

      {formAberto &&
        createPortal(
          <div className="painel-modal-backdrop" onClick={() => setFormAberto(false)}>
            <form
              className="painel-modal painel-modal-wide"
              onClick={(event) => event.stopPropagation()}
              onSubmit={handleSubmit((data) => salvar.mutate(data))}
              noValidate
            >
              <h2>{editando ? 'Editar autor' : 'Novo autor'}</h2>

              <div className="painel-modal-grid">
                <div className="painel-field">
                  <label>
                    Nome
                    <input autoFocus {...register('nome', { required: true })} />
                  </label>
                  {errors.nome && (
                    <span className="painel-field-error">{errors.nome.message || 'Informe o nome.'}</span>
                  )}
                </div>

                <div className="painel-field">
                  <label>
                    Nome de exibição
                    <input {...register('nome_exibicao')} />
                  </label>
                  {errors.nome_exibicao && (
                    <span className="painel-field-error">{errors.nome_exibicao.message}</span>
                  )}
                </div>

                <label>
                  Cargo / função
                  <input {...register('cargo')} />
                </label>

                <div className="painel-field">
                  <label>
                    Formação / especialidade
                    <input {...register('formacao_especialidade')} />
                  </label>
                  {errors.formacao_especialidade && (
                    <span className="painel-field-error">{errors.formacao_especialidade.message}</span>
                  )}
                </div>

                <div className="painel-field">
                  <label>
                    Instagram
                    <input type="url" placeholder="https://instagram.com/..." {...register('instagram')} />
                  </label>
                  {errors.instagram && <span className="painel-field-error">{errors.instagram.message}</span>}
                </div>

                <div className="painel-field">
                  <label>
                    LinkedIn
                    <input type="url" placeholder="https://linkedin.com/in/..." {...register('linkedin')} />
                  </label>
                  {errors.linkedin && <span className="painel-field-error">{errors.linkedin.message}</span>}
                </div>

                <label className="painel-field-full">
                  Mini biografia
                  <textarea rows={3} {...register('mini_bio')} />
                </label>

                <label className="painel-field-full">
                  Foto
                  <ImageDropInput file={fotoFile} onFileChange={setFotoFile} existingImageUrl={editando?.foto} />
                </label>

                <label className="painel-checkbox">
                  <input type="checkbox" {...register('ativo')} />
                  Ativo
                </label>
              </div>

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
          </div>,
          document.body,
        )}

      {confirmExcluir && (
        <ConfirmModal
          title="Excluir autor"
          message={`Tem certeza que deseja excluir o autor "${confirmExcluir.nome}"? Essa ação não pode ser desfeita.`}
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
