# 🔗 Link do Projeto no Ar

**Acesse aqui:** ([https://SEU-USUARIO.github.io/controle-estoque-enfermagem](https://universidade-cesumar.github.io/prova-2bi-ads-3sem-LucasCavassani/))

---

# Almoxarifado — Sistema de Controle de Estoque de Enfermagem

Aplicação web para gerenciamento do estoque de materiais de um almoxarifado de enfermagem (consumo, equipamentos permanentes e EPIs), com cadastro, consulta, baixa de itens, exclusão e alertas visuais automáticos. Os dados são armazenados em uma API REST (MockAPI), consumida via `fetch`.

---

## Funcionalidades

### Cadastro de Materiais
- Formulário lateral para registrar um novo item no estoque com:
  - **Nome do material**
  - **Quantidade** inicial
  - **Categoria** (Consumo, Permanente ou EPI)
  - **Data de validade**
  - **Instrutor responsável** pela solicitação
- Validação antes do envio: nome obrigatório e quantidade numérica ≥ 0.
- Botão com estado de carregamento (spinner) durante o envio.
- Mensagem de sucesso ou erro exibida abaixo do formulário.

### Busca e Filtro
- Campo de busca (`#input-busca`) que filtra o inventário pelo nome do material em tempo real, conforme o usuário digita.
- Filtro por categoria (Consumo / Permanente / EPI / Todas) que pode ser combinado com a busca por nome.

### Painel de Resumo (Dashboard)
- **Total de itens cadastrados** (`#total-itens`), sempre sincronizado com os dados atuais da API.
- **Total de itens zerados** — materiais com quantidade igual a 0.
- **Total de itens vencendo em breve** — validade dentro de 30 dias.

### Listagem de Materiais (Inventário)
- Tabela com nome, categoria (com selo colorido por tipo), quantidade, validade, instrutor e ações.
- **Alerta visual de estoque crítico**: qualquer item com **menos de 10 unidades** recebe destaque automático na linha (classe `.estoque-critico`), facilitando identificar o que precisa de reposição.
- **Alerta visual de validade**:
  - Verde: dentro do prazo.
  - Amarelo: vencendo em até 30 dias.
  - Vermelho: já vencido.
- Estado de carregamento (skeleton) enquanto os dados são buscados na API.
- Estado vazio com ícone e mensagem quando não há itens cadastrados ou nenhum resultado bate com a busca/filtro.

### Baixa de Estoque (Retirada de Material)
- Cada linha da tabela possui um campo numérico para informar a quantidade a ser retirada e um botão **"Baixar"**.
- Validação de regra de negócio antes de confirmar a retirada:
  - Não permite retirar quantidade zero, negativa ou maior que o saldo disponível.
- Ao confirmar, a quantidade é subtraída do estoque e atualizada na API (requisição PUT).
- Botão de baixa fica desabilitado automaticamente quando o item está zerado.

### Edição Rápida de Quantidade
- Botão **"Editar"** abre um modal para ajustar diretamente a quantidade total de um material (sem precisar excluir e recadastrar).
- Modal pode ser fechado pelo botão "X", botão "Cancelar", clique fora da caixa, ou tecla **Esc**.

### Exclusão de Materiais
- Botão **"Excluir"** remove permanentemente um item do estoque, com confirmação prévia (pop-up de segurança) para evitar exclusões acidentais.

### Alertas Gerais no Topo da Página
- Barra de aviso destacada quando há itens **zerados** e/ou **vencendo em breve**, com resumo direto dos nomes afetados.

### Indicador de Conexão com a API
- Indicador no cabeçalho (bolinha verde/vermelha) mostrando se a aplicação está conectada à API em tempo real.
- Tratamento de erros em todas as operações (cadastro, busca, baixa, edição, exclusão):
  - Verifica se o dispositivo está sem internet antes de tentar a requisição.
  - Mensagens de erro específicas para falha de conexão x falha da API.
  - Reconexão automática: ao detectar que a internet voltou, os dados são recarregados sozinhos.

---

## Tecnologias Utilizadas

- **HTML5** — estrutura semântica da página
- **CSS3** — variáveis de tema, layout responsivo (grid/flexbox), estados visuais (sucesso, erro, alerta)
- **JavaScript (Vanilla, ES6+)** — toda a lógica de interface e integração com a API, sem frameworks
- **MockAPI** — backend simulado (REST: GET, POST, PUT, DELETE)

---

## Estrutura do Projeto

```
controle-estoque-enfermagem/
├── index.html        # Estrutura da página
├── style.css         # Estilos visuais
├── main.js           # Lógica da aplicação (fetch, validações, renderização)
├── package.json      # Metadados e scripts do projeto
└── README.md         # Este arquivo
```

---

## Como Executar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/controle-estoque-enfermagem.git
   cd controle-estoque-enfermagem
   ```
2. Abra o `index.html` diretamente no navegador, **ou** use o servidor de desenvolvimento:
   ```bash
   npm install
   npm run dev
   ```
3. O projeto abrirá em `http://localhost:3000`.

   ```

## Autor

Lucas Cavassani
