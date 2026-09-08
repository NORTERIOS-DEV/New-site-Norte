import { Link } from 'react-router-dom'
import { contact, waLink, waMessages } from '../data/contact'
import { Reveal } from './Reveal'
import { Btn } from './Btn'
import { LogoMark } from './LogoMark'
import {
  IconWhatsApp,
  IconPhone,
  IconMail,
  IconMapPin,
  IconInstagram,
  IconGlobe,
} from './icons'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="contato">
      <div className="wrap">
        <div className="foot-top">
          <Reveal className="foot-brand">
            <LogoMark className="logo" />
            <div className="name">Norte Rios</div>
            <p>
              Gestão e Treinamentos em Educação. Entre em contato e fale com um
              especialista — o primeiro passo é uma conversa.
            </p>
            <Btn
              href={waLink(waMessages.reuniao)}
              className="foot-cta"
              style={{ marginTop: 22 }}
              arrow
            >
              Agendar reunião
            </Btn>
          </Reveal>

          <Reveal className="foot">
            <h4>Fale com a gente</h4>
            <div className="contact-list">
              <a href={waLink(waMessages.falar)} target="_blank" rel="noopener">
                <span className="ci">
                  <IconWhatsApp />
                </span>
                <span>
                  <small>WhatsApp</small>
                  {contact.phoneDisplay}
                </span>
              </a>
              <a href={contact.tel}>
                <span className="ci">
                  <IconPhone />
                </span>
                <span>
                  <small>Telefone</small>
                  {contact.phoneDisplay}
                </span>
              </a>
              <a href={`mailto:${contact.email}`}>
                <span className="ci">
                  <IconMail />
                </span>
                <span>
                  <small>E-mail</small>
                  {contact.email}
                </span>
              </a>
            </div>
          </Reveal>

          <Reveal className="foot">
            <h4>Onde estamos</h4>
            <div className="contact-list">
              <a href={contact.mapsUrl} target="_blank" rel="noopener">
                <span className="ci">
                  <IconMapPin />
                </span>
                <span>
                  <small>Endereço</small>
                  {contact.address}
                </span>
              </a>
              <a href={contact.instagram} target="_blank" rel="noopener">
                <span className="ci">
                  <IconInstagram />
                </span>
                <span>
                  <small>Instagram</small>
                  {contact.instagramHandle}
                </span>
              </a>
              <a href={contact.site} target="_blank" rel="noopener">
                <span className="ci">
                  <IconGlobe />
                </span>
                <span>
                  <small>Site</small>
                  {contact.siteDisplay}
                </span>
              </a>
            </div>
          </Reveal>
        </div>

        <div className="foot-bot">
          <span>
            © {year} Norte Rios · Gestão e Treinamentos. Todos os direitos
            reservados.
          </span>
          <span>
            <Link to="#top">Voltar ao topo ↑</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
