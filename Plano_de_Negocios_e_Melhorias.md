# Plano de Negócios e Melhorias Futuras - Pizzaria DevSystem

## 1. Plano de Negócios

### Visão

Tornar o **Pizzaria DevSystem** a solução de gerenciamento preferida para pizzarias de pequeno e médio porte, oferecendo uma ferramenta intuitiva, poderosa e acessível que otimiza desde o recebimento do pedido até a análise de dados de vendas.

### Missão

Nossa missão é empoderar donos de pizzarias com tecnologia, transformando dados em insights acionáveis. O sistema visa simplificar a operação diária, automatizar tarefas repetitivas e fornecer uma visão clara sobre a performance do negócio, permitindo que os gestores foquem no que fazem de melhor: pizzas deliciosas.

### Público-Alvo

- Pizzarias locais e de bairro.
- Food trucks especializados em pizza.
- Pequenas redes de pizzarias que buscam uma solução centralizada e de baixo custo.

### Diferenciais Competitivos

- **Interface Moderna e Intuitiva:** Foco na usabilidade para reduzir o tempo de treinamento da equipe.
- **Análise de Dados Inteligente:** O uso de grafos para cruzamento de sabores é um diferencial que oferece inteligência de negócio, ajudando a criar combos e promoções mais eficazes.
- **Tecnologia Robusta:** Construído sobre uma base sólida com Java (Spring Boot) no backend e JavaScript moderno no frontend, garantindo estabilidade e escalabilidade.
- **Custo-Benefício:** Posicionado como uma alternativa mais acessível em comparação com sistemas de PDV (Ponto de Venda) tradicionais e complexos.

---

## 2. Futuras Atualizações e Melhorias

O projeto atual estabelece uma base sólida. As próximas etapas visam expandir suas funcionalidades para transformá-lo em um sistema de gestão completo.

### Curto Prazo (Próximos Passos)

1.  **Gestão de Status do Pedido:**
    - Implementar um ciclo de vida para os pedidos com status: `Recebido`, `Em Preparo`, `Saiu para Entrega`, `Entregue`, `Cancelado`.
    - Criar uma tela de "Monitor de Pedidos" para acompanhar o andamento em tempo real.

2.  **Autenticação e Níveis de Acesso:**
    - Criar um sistema de login para diferenciar usuários (ex: Gerente, Atendente).
    - Gerentes teriam acesso a relatórios e configurações, enquanto atendentes teriam foco na criação e alteração de pedidos.

3.  **Paginação de Dados:**
    - Adicionar paginação nas telas de "Clientes" e "Pedidos" para garantir a performance do sistema à medida que a base de dados cresce.

### Médio Prazo (Expansão de Funcionalidades)

4.  **Integração com API de Mapas:**
    - Substituir o cálculo de frete manual por uma integração com uma API (como Google Maps) para obter a distância real e estimar o tempo de entrega.

5.  **Dashboard Interativo:**
    - Transformar a página de relatórios em um dashboard dinâmico com filtros por período (dia, semana, mês).

6.  **Gestão de Estoque Simplificada:**
    - Módulo para cadastrar ingredientes e associá-los aos sabores, permitindo um controle básico de estoque.

### Longo Prazo (Visão de Produto)

7.  **Módulo de Comandas e Mesas:**
    - Expandir o sistema para atender também ao consumo no local, com gestão de mesas e comandas.

8.  **Deploy em Nuvem:**
    - Preparar a aplicação para ser implantada em serviços de nuvem (como Heroku, AWS ou Google Cloud), tornando-a acessível de qualquer lugar.