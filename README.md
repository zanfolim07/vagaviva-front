# Vaga Viva

Front-end da **Vaga Viva**, solução da Global Solution 2026/2 (tema CitizenTech) da FIAP, turma 1TDSPV.

## Objetivo

Reduzir o desperdício de consultas no SUS. A Vaga Viva prevê quais consultas têm mais chance de falta, ajuda a recepção a priorizar o contato e, quando uma vaga é devolvida, oferece o horário ao próximo paciente compatível da lista de espera. O risco de falta nunca cancela nem nega uma consulta.

Este projeto é a interface: todos os dados que mudam vêm da API REST em Java, por meio da Fetch API.

## Tecnologias

- React 19, Vite 8 e TypeScript
- Tailwind CSS 4
- React Router 7
- React Hook Form
- Fetch API, sem Axios nem outra biblioteca de requisições

## Solução de problemas

Em computadores com componentes muito antigos (principalmente processadores
sem suporte a AVX2), o Vite 8 pode ser incompatível e fazer `npm run dev`
falhar com o erro `illegal hardware instruction`. É uma limitação do hardware,
não do projeto. Para contornar, use o Vite 7:

```bash
npm install -D vite@^7 @vitejs/plugin-react@^5
npm run dev
```

## Estrutura de pastas

```text
src/
├── assets/       Fotos dos integrantes
├── components/   Componentes reutilizáveis (cabeçalhos, formulários, selos, modal)
├── context/      Sessão do usuário e tema claro/escuro
├── data/         Conteúdo fixo (integrantes, perguntas, municípios)
├── hooks/        useAsync e useRelogio
├── pages/        Páginas institucionais e páginas da solução
├── routes/       Rotas e proteção por perfil
├── services/     Chamadas à API (http.ts e api.ts)
├── types/        Tipos dos dados da API
└── utils/        Formatação de datas, telefones e valores
```

## Rotas

| Tipo | Rotas |
| --- | --- |
| Institucionais | `/`, `/integrantes`, `/sobre`, `/faq`, `/contato` |
| Acesso | `/login`, `/primeiro-acesso` |
| Solução, com login | `/agenda`, `/consultas/nova`, `/consultas/:id`, `/pacientes`, `/lista-espera`, `/painel`, `/admin/equipe` |
| Paciente, com link | `/celular/:token`, `/fila/:token` |

## Integrantes

| Nome | RM | Turma | GitHub | LinkedIn |
| --- | --- | --- | --- | --- |
| Fabio Cezare Almeida | 572642 | 1TDSPV | [FabioCAlmeida](https://github.com/FabioCAlmeida) | [Perfil](https://www.linkedin.com/in/fabio-cezare-almeida-4b448a408) |
| Guilherme Zanfolim Nunes Farias | 570983 | 1TDSPV | [zanfolim07](https://github.com/zanfolim07) | [Perfil](https://www.linkedin.com/in/guilherme-zanfolim-202865315) |
| Jaime Ringel | 562044 | 1TDSPV | [jaimeringel004](https://github.com/jaimeringel004) | [Perfil](https://www.linkedin.com/in/jaime-ringel-1060bb402) |
| Lucas Monteiro Dias da Costa | 571388 | 1TDSPV | [monteiroo5](https://github.com/monteiroo5) | [Perfil](https://www.linkedin.com/in/lucas-monteiro-1110703b5/) |
| Mateus Magalhães Romão de Moraes | 573371 | 1TDSPV | [MagalhaesMatheus007](https://github.com/MagalhaesMatheus007) | [Perfil](https://www.linkedin.com/in/matheus-magalh%C3%A3es-ti) |

## Como executar

Requer Node.js 20 ou superior.

```bash
npm install
cp .env.example .env
npm run dev
```

No Windows (PowerShell), troque o `cp` por `Copy-Item .env.example .env`. No arquivo `.env`, defina `VITE_API_URL` com o endereço da API. A aplicação abre em `http://localhost:5173`.

Para gerar a versão de produção: `npm run build`.

## Acesso de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Gestão | `marcos.andrade@saude.sp.gov.br` | `vagaviva2026` |
| Recepção | `regina.costa@saude.sp.gov.br` | `vagaviva2026` |

## Links

- **GitHub:** https://github.com/zanfolim07/vagaviva-front
- **Vercel:** https://vagaviva-front.vercel.app/
- **API Java (Render):** https://vagaviva-api.onrender.com
- **Vídeo no YouTube:** https://youtu.be/8T_0reS97Mg

## Contato

Fale com o grupo pela página `/contato` da aplicação ou pelos perfis listados em [Integrantes](#integrantes).
