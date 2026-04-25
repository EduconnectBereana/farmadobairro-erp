# 🎨 Pacote com Logos — Farma do Bairro

Este ZIP tem os 16 arquivos HTML da pasta `/apps/` com:

- Rebranding completo (FarmaClub → Farma do Bairro)
- Logo visível em todas as páginas (tamanho conforme contexto)
- Favicon (ícone da aba do navegador) configurado
- Sintaxe JavaScript validada

## Como ficaram as logos

LOGO GRANDE (48px) - páginas institucionais:
- farmaclub_site.html (landing)
- farmaclub_piloto.html (portal piloto)
- farmaclub_instalar.html
- index.html

LOGO PEQUENA (32px) - ferramentas operacionais:
- farmaclub_erp_central.html
- farmaclub_erp_farmacia.html
- farmaclub_app_cliente.html
- farmaclub_app_motoboy.html
- farmaclub_contabilidade.html
- farmaclub_marketplace_pagamentos.html
- farmaclub_cadastro_fiscal.html
- farmaclub_setup.html
- farmaclub_seguranca.html
- farmaclub_compra_coletiva.html

Páginas tecnicas (sem logo visual): farmaclub_central.html e farmaclub_frete.html

## Como aplicar

1. Extrai o ZIP
2. Cola TODOS os 16 arquivos dentro da pasta /apps/ do projeto
3. Confirma "Substituir todos"
4. GitHub Desktop -> Commit "feat: adicionar logo Farma do Bairro nas paginas"
5. Push origin
6. Aguarda 1-2min e testa em aba anonima

URLs para testar:
- https://farmaclub-erp.vercel.app/site (logo grande)
- https://farmaclub-erp.vercel.app/piloto (logo grande)
- https://farmaclub-erp.vercel.app/comprar (logo pequena)
- https://farmaclub-erp.vercel.app/erp (logo pequena)

A aba do navegador deve mostrar o icone da logo (em vez do "FC" preto antigo).

## Se logo aparecer esticada/cortada

Avisa que ajusto o CSS em 1 min.

## Cache do navegador

Se ainda aparecer logo antiga, Ctrl+Shift+R ou aba anonima.
