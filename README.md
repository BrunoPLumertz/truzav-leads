# TRUZAV · Funil de prospecção

Ferramenta interna da TRUZAV para prospectar clientes: funil em quadro (kanban), mapa dos negócios e metas diárias.

É um site estático de um arquivo só (`index.html`), sem etapa de build.

## Como os dados funcionam

- Os dados ficam salvos no navegador (localStorage), separados por endereço.
- Abrir o arquivo no computador e abrir pelo endereço da Vercel são lugares diferentes: os dados não passam de um para o outro sozinhos.
- Para levar os dados, use **Exportar** onde eles estão e **Importar** no outro lugar.
- Exporte um backup de vez em quando. Os arquivos de backup (`truzav-prospeccao-AAAA-MM-DD.json`) ficam fora do Git pelo `.gitignore`, porque têm anotações dos contatos.

## Rodar no computador

Abra o `index.html` direto no Chrome ou no Edge, com internet (o mapa e as fontes vêm de fora).

## Subir no GitHub

```bash
cd truzav-prospeccao
git init
git add .
git commit -m "Primeira versão do funil de prospecção"
git branch -M main
git remote add origin https://github.com/BrunoPLumertz/truzav-prospeccao.git
git push -u origin main
```

Antes, crie o repositório vazio `truzav-prospeccao` no GitHub (sem README, para não dar conflito). Sugestão: deixe o repositório **privado**.

## Publicar na Vercel

1. Entre em vercel.com com a conta do GitHub.
2. Clique em **Add New** e depois em **Project**.
3. Escolha o repositório `truzav-prospeccao` e clique em **Import**.
4. Em **Framework Preset**, deixe **Other**. Não precisa de comando de build nem de pasta de saída.
5. Clique em **Deploy**.

A cada `git push` na branch `main`, a Vercel publica a nova versão sozinha.

## Privacidade

- O site pede para não aparecer no Google (`robots.txt`, meta `noindex` e cabeçalho `X-Robots-Tag`).
- Quem tiver o link consegue abrir a ferramenta, mas só vê a lista inicial: o andamento e as anotações ficam no navegador de quem usa.
