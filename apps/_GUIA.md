# 📋 Rebranding da pasta /apps/ — Instruções

Este ZIP contém os **16 arquivos HTML da pasta `/apps/`** com o rebranding aplicado.

## O que tem dentro

- 15 arquivos `farmaclub_*.html` (versões da pasta /apps/)
- 1 arquivo `index.html` (da pasta /apps/)

## Como aplicar (3 minutos)

### Passo 1 — Extrair
Botão direito no ZIP → **Extrair tudo** → salva numa pasta temporária.

### Passo 2 — Copiar para dentro de /apps/
1. Abra a pasta do projeto (GitHub Desktop → Show in Explorer)
2. **Entre na pasta `apps/`** (é uma subpasta dentro do projeto)
3. Copia TODOS os 16 arquivos extraídos do ZIP pra dentro dessa pasta `apps/`
4. Quando perguntar "Substituir arquivos?" → **Sim para todos**

### Passo 3 — Commit e push
1. GitHub Desktop vai mostrar ~16 arquivos modificados em Changes
2. Summary: `fix: rebranding dos arquivos da pasta /apps/`
3. Clica em **Commit to main**
4. Clica em **Push origin**
5. Aguarda 1-2 minutos

### Passo 4 — Testar
Aba anônima:

- `https://farmaclub-erp.vercel.app/site`
- `https://farmaclub-erp.vercel.app/comprar`
- `https://farmaclub-erp.vercel.app/erp`
- `https://farmaclub-erp.vercel.app/piloto`

Todos devem mostrar **"Farma do Bairro"** agora.

---

## ⚠️ Observação importante: logos

Os HTMLs da pasta `/apps/` **não usam tag de imagem** pra logo. O nome "Farma do Bairro" aparece como **texto estilizado em CSS** (classe `.logo` com cor verde).

Isso significa que a logo bonita que sua esposa fez não aparece nessas páginas. Para mostrar a imagem da logo, precisaríamos editar cada HTML e adicionar `<img src="/farma-do-bairro-logo.png">` no lugar certo.

**Recomendação:** por enquanto, deixa só o texto "Farma do Bairro" (já fica profissional). Quando quiser adicionar a logo real, me avisa que faço essa alteração numa sprint específica.

---

**Geração:** 24/04/2026
