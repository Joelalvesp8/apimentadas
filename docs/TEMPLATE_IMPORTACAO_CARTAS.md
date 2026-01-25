# Template para Importação de Cartas

## Formato da Planilha

A planilha deve ter as seguintes colunas (em ordem):

| Coluna A | Coluna B  | Coluna C   | Coluna D    |
|----------|-----------|------------|-------------|
| type     | category  | difficulty | content     |

## Valores Permitidos:

### Type (Tipo):
- `pergunta` - Para perguntas
- `tarefa` - Para tarefas/desafios

### Category (Categoria):
- `casais` - Para 2 pessoas
- `trios` - Para 3 pessoas
- `grupos` - Para 4+ pessoas

### Difficulty (Dificuldade):
- `facil` - Perguntas/tarefas fáceis
- `medio` - Perguntas/tarefas médias
- `dificil` - Perguntas/tarefas difíceis
- `extremo` - Perguntas/tarefas extremas

### Content (Conteúdo):
- Texto da pergunta ou tarefa
- Máximo recomendado: 500 caracteres

## Exemplo de Planilha:

| type     | category | difficulty | content                                           |
|----------|----------|------------|---------------------------------------------------|
| pergunta | casais   | facil      | Qual foi o seu primeiro beijo?                    |
| tarefa   | casais   | medio      | Dê um beijo de 10 segundos no seu parceiro        |
| pergunta | trios    | dificil    | Qual é a sua maior fantasia sexual?               |
| tarefa   | grupos   | extremo    | Tire uma peça de roupa                            |

## Formato do Arquivo:
- **CSV** (recomendado): arquivo .csv separado por vírgula
- **Excel**: arquivo .xlsx ou .xls

## Observações:
- A primeira linha deve conter os cabeçalhos (type, category, difficulty, content)
- Não deixe linhas vazias entre as cartas
- Cartas duplicadas serão ignoradas
- Todas as cartas importadas serão marcadas como "oficiais"
