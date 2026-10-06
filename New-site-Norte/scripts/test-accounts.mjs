import assert from 'node:assert/strict'
import { Window } from 'happy-dom'
import { createServer } from 'vite'
import { act, createElement as h } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const window = new Window()
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'HTMLSelectElement', 'Element', 'Node', 'FormData', 'localStorage']) {
  Object.defineProperty(globalThis, key, { configurable: true, value: key === 'window' ? window : window[key] })
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const server = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] }, ssr: { noExternal: ['react-router', 'react-router-dom'], resolve: { conditions: ['module', 'import'] } } })
let root
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
try {
  const { MemoryRouter, Routes, Route } = await server.ssrLoadModule('react-router-dom')
  const { AuthProvider, useAuth } = await server.ssrLoadModule('/src/context/AuthContext.tsx')
  const { ProtectedRoute } = await server.ssrLoadModule('/src/components/painel/ProtectedRoute.tsx')
  const { PainelLayout } = await server.ssrLoadModule('/src/components/painel/PainelLayout.tsx')
  const { ContaForm } = await server.ssrLoadModule('/src/components/painel/ContaForm.tsx')
  const { tokenStore } = await server.ssrLoadModule('/src/services/painel/tokenStore.ts')
  const { refreshAccessToken } = await server.ssrLoadModule('/src/services/painel/authApi.ts')
  const { painelFetch } = await server.ssrLoadModule('/src/services/painel/httpClient.ts')
  let account
  let auth
  function Probe() { auth = useAuth(); return null }
  globalThis.fetch = async (url) => new Response(JSON.stringify(String(url).endsWith('/me/') ? account : { access: 'access', refresh: 'refresh' }), { status: 200 })
  const container = document.createElement('div')
  document.body.append(container)
  async function mount(tipo, path) {
    if (root) await act(async () => root.unmount())
    account = { id: 1, username: 'teste', nome_completo: 'Pessoa Teste', email: 'pessoa@example.org', telefone: '85999991234', cargo: 'Redação', tipo, is_active: true, autor: tipo === 'autor' ? 1 : null, groups: [], permissions: [] }
    tokenStore.setTokens({ access: 'initial', refresh: 'refresh' })
    root = createRoot(container)
    await act(async () => {
      root.render(h(QueryClientProvider, { client }, h(AuthProvider, null, h(Probe), h(MemoryRouter, { initialEntries: [path] }, h(Routes, null,
        h(Route, { path: '/painel/login', element: h('p', null, 'LOGIN') }),
        h(Route, { path: '/painel', element: h(ProtectedRoute) }, h(Route, { element: h(PainelLayout) },
          ...['posts', 'usuarios', 'autores', 'categorias', 'galeria', 'perfil'].map((section) => h(Route, { key: section, path: section, element: h('p', { 'data-page': section }, section) })),
        )),
      )))))
    })
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)) })
  }
  for (const tipo of ['gerente', 'autor', 'comum']) {
    for (const section of ['posts', 'usuarios', 'autores', 'categorias', 'galeria', 'perfil']) {
      await mount(tipo, `/painel/${section}`)
      const allowed = tipo === 'gerente' || section === 'perfil' || (tipo === 'autor' && section === 'posts')
      assert.equal(container.querySelector('[data-page]')?.getAttribute('data-page'), allowed ? section : 'perfil', `${tipo}: ${section}`)
      const nav = [...container.querySelectorAll('nav a')].map((a) => a.getAttribute('href'))
      assert(nav.includes('/painel/perfil'))
      assert.equal(nav.includes('/painel/usuarios'), tipo === 'gerente')
      assert.equal(nav.includes('/painel/posts'), tipo !== 'comum')
    }
    await mount(tipo, '/painel')
    assert.equal(container.querySelector('[data-page]')?.getAttribute('data-page'), tipo === 'comum' ? 'perfil' : 'posts')
  }
  await mount('gerente', '/painel/posts')
  client.setQueryData(['private-data'], 'manager data')
  account = { ...account, tipo: 'comum' }
  await act(async () => auth.reloadUser())
  assert.equal(client.getQueryData(['private-data']), undefined)
  assert.equal(container.querySelector('[data-page]')?.getAttribute('data-page'), 'perfil')
  client.setQueryData(['private-data'], 'old account')
  await act(async () => auth.logout())
  assert.equal(client.getQueryData(['private-data']), undefined)
  assert.equal(container.textContent, 'LOGIN')

  let saved
  await act(async () => root.render(h(ContaForm, { conta: account, onSave: async (body) => { saved = body } })))
  const form = container.querySelector('form')
  assert(!form.querySelector('[name="username"]'))
  assert(!form.querySelector('[name="tipo"]'))
  form.querySelector('[name="nome_completo"]').value = 'Nome atualizado'
  await act(async () => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })))
  assert.deepEqual(Object.keys(saved).sort(), ['email', 'nome_completo', 'telefone'])
  assert.equal(saved.nome_completo, 'Nome atualizado')

  let finishRefresh
  globalThis.fetch = () => new Promise((resolve) => { finishRefresh = resolve })
  tokenStore.setTokens({ access: 'old', refresh: 'old-refresh' })
  const refreshing = refreshAccessToken()
  tokenStore.clear()
  finishRefresh(new Response(JSON.stringify({ access: 'late', refresh: 'late-refresh' }), { status: 200 }))
  assert.equal(await refreshing, false)
  assert.equal(tokenStore.getAccessToken(), null)
  globalThis.fetch = (url) => String(url).includes('/login/refresh/')
    ? new Promise((resolve) => { finishRefresh = resolve })
    : Promise.resolve(new Response(null, { status: 401 }))
  tokenStore.setTokens({ access: 'old', refresh: 'old-refresh' })
  const oldRequest = painelFetch('/posts/')
  await new Promise((resolve) => setTimeout(resolve, 0))
  tokenStore.setTokens({ access: 'new-account', refresh: 'new-account-refresh' })
  finishRefresh(new Response(JSON.stringify({ access: 'late', refresh: 'late-refresh' }), { status: 200 }))
  assert.equal((await oldRequest).status, 401)
  assert.equal(tokenStore.getAccessToken(), 'new-account')
  console.log('OK: três tipos de acesso, proteção por URL, menu, destino inicial, edição de perfil, limpeza de cache e refresh após logout.')
} finally {
  if (root) await act(async () => root.unmount())
  client.clear()
  await server.close()
  window.happyDOM.abort()
}
