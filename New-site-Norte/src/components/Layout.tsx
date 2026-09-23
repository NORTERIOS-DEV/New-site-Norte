import { Outlet } from 'react-router-dom'
import { ScrollManager } from './ScrollManager'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout() {
  return (
    <>
      <ScrollManager />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
