# Launder & Clean - Landing Page Premium

Uma landing page moderna, luxuosa e de alta performance criada para a empresa **Launder & Clean**, especializada na higienização e estética de estofados e tapetes de luxo.

## 🚀 Funcionalidades

- **Design Premium ("Luxo Contemporâneo"):** Interface meticulosamente desenhada com tipografia sofisticada (Playfair Display) e uso elegante de paleta Navy/Gold.
- **Responsividade Total:** Layout fluido que se adapta perfeitamente a dispositivos móveis, tablets e desktops (Mobile-First approach).
- **Animações Cinematográficas:** Efeitos de Scroll Reveal utilizando *Intersection Observer* e *Glassmorphism* (Backdrop Filter) em componentes chave.
- **Formulário de Orçamento (Multi-step):** Modal avançado para solicitação de orçamento com progresso visual.
- **Integração com Supabase (Backendless):** 
  - Captura e envia as fotos do orçamento diretamente para um *Bucket no Supabase Storage*.
  - Salva as informações de contato, CEP, e dimensões do item em um *Supabase Database (PostgreSQL)*.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído focando na máxima performance e controle absoluto da interface, **sem o uso de frameworks pesados**:

- HTML5 Semântico
- CSS3 (Variáveis, Flexbox, Grid, Glassmorphism, Animações CSS)
- Vanilla JavaScript (ES6+, DOM Manipulation, APIs do navegador)
- Lucide Icons
- [Supabase](https://supabase.com/) (BaaS para Storage de Imagens e Banco de Dados)

## ⚙️ Como Configurar e Rodar o Projeto

1. Faça o clone do repositório
2. Abra a pasta do projeto
3. Abra o arquivo `script.js` e configure as credenciais do seu Supabase:

```javascript
const SUPABASE_URL = 'SUA_SUPABASE_PROJECT_URL_AQUI';
const SUPABASE_ANON_KEY = 'SUA_SUPABASE_ANON_KEY_AQUI';
```

### Configurando o Supabase

1. Crie uma nova tabela chamada `quotes` no SQL Editor do Supabase:
```sql
create table public.quotes (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    item_photo_url text,
    length numeric not null,
    width numeric not null,
    zipcode text not null,
    email text not null,
    phone text not null,
    status text default 'pending'
);

alter table public.quotes enable row level security;

create policy "Permitir insercoes anonimas em quotes"
on public.quotes for insert
with check (true);
```

2. Crie um novo Storage Bucket com o nome **`quote_images`**.
   - Defina-o como **Public**.
   - Adicione uma Policy (política de segurança) permitindo `INSERT` para papéis públicos/anônimos.

## 🖥️ Deploy

Por ser feito em HTML, CSS e JS puros, este projeto é estático e pode ser hospedado de forma 100% gratuita em plataformas como:
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [Cloudflare Pages](https://pages.cloudflare.com)
- [GitHub Pages](https://pages.github.com)

---
*Desenvolvido em colaboração com o modelo Antigravity.*
