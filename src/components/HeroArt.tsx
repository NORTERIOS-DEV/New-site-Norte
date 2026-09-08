// Elementos decorativos do hero e divisores de seção — SVGs do site legado.

export function Sun() {
  return <div className="sun" aria-hidden="true" />
}

export function RiverWaves() {
  return (
    <div className="scape" aria-hidden="true">
      <svg className="wave w1" viewBox="0 0 4320 230" preserveAspectRatio="none">
        <path
          d="M0 80 Q360 48 720 80 Q1080 112 1440 80 Q1800 48 2160 80 Q2520 112 2880 80 Q3240 48 3600 80 Q3960 112 4320 80 L4320 230 L0 230 Z"
          fill="#61cfce"
          opacity=".55"
        />
      </svg>
      <svg className="wave w2" viewBox="0 0 4320 230" preserveAspectRatio="none">
        <path
          d="M0 112 Q360 84 720 112 Q1080 140 1440 112 Q1800 84 2160 112 Q2520 140 2880 112 Q3240 84 3600 112 Q3960 140 4320 112 L4320 230 L0 230 Z"
          fill="#55b8b7"
          opacity=".8"
        />
      </svg>
      <svg className="wave w3" viewBox="0 0 4320 230" preserveAspectRatio="none">
        <path
          d="M0 146 Q360 122 720 146 Q1080 170 1440 146 Q1800 122 2160 146 Q2520 170 2880 146 Q3240 122 3600 146 Q3960 170 4320 146 L4320 230 L0 230 Z"
          fill="#699d6a"
          opacity="1"
        />
      </svg>
      <svg className="wave w4" viewBox="0 0 4320 230" preserveAspectRatio="none">
        <path
          d="M0 174 Q360 152 720 174 Q1080 196 1440 174 Q1800 152 2160 174 Q2520 196 2880 174 Q3240 152 3600 174 Q3960 196 4320 174 L4320 230 L0 230 Z"
          fill="#427443"
          opacity="1"
        />
      </svg>
      <svg className="wave w5" viewBox="0 0 4320 230" preserveAspectRatio="none">
        <path
          d="M0 198 Q360 178 720 198 Q1080 218 1440 198 Q1800 178 2160 198 Q2520 218 2880 198 Q3240 178 3600 198 Q3960 218 4320 198 L4320 230 L0 230 Z"
          fill="#304c38"
          opacity="1"
        />
      </svg>
    </div>
  )
}

export function RiverDivider() {
  return (
    <div className="river">
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
        <path d="M0 40 Q360 0 720 32 T1440 26 V70 H0 Z" fill="#d7e9cd" />
      </svg>
    </div>
  )
}
