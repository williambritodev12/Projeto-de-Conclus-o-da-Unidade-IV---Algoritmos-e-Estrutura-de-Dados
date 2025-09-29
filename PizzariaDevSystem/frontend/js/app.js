// Local: frontend/app.js

const API_BASE_URL = 'http://localhost:8080/api';
// Cache para o cardápio (sabores e preços)
let cardapioCache = {};
// Variável para o pedido sendo alterado
let pedidoAtual = null;

/**
 * Roteador Principal do Frontend
 */
document.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.id;
    // Carrega o cardápio uma vez para otimizar outras páginas
    carregarCardapioCache().then(() => {
        switch (pageId) {
            case 'page-relatorio':
                inicializarPaginaRelatorio();
                break;
            case 'page-pedido':
                inicializarPaginaPedido();
                break;
            case 'page-clientes':
                inicializarPaginaClientes();
                break;
            case 'page-cardapio':
                inicializarPaginaCardapio();
                break;
            case 'page-alterar-pedido':
                inicializarPaginaAlterarPedido();
                break;
        }
    });
});

/**
 * Função global para buscar o cardápio e armazenar em cache.
 */
async function carregarCardapioCache(force = false) {
    if (Object.keys(cardapioCache).length > 0 && !force) return; // Se já tem e não for forçado, não busca de novo
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio`);
        cardapioCache = await response.json();
    } catch (e) {
        console.error("Falha crítica ao carregar cardápio:", e);
        alert("Não foi possível carregar o cardápio. A API está offline?");
    }
}

// ===================================================================
// PÁGINA DE NOVO PEDIDO (pedido.html)
// ===================================================================
async function inicializarPaginaPedido() {
    await carregarClientesParaSelect();
    adicionarNovaPizza();
    document.getElementById('add-pizza-btn').addEventListener('click', adicionarNovaPizza);
    const form = document.getElementById('order-form');
    form.addEventListener('submit', enviarPedido);
    form.addEventListener('change', atualizarResumoPedido);
    document.getElementById('distancia').addEventListener('input', atualizarResumoPedido);
}

let pizzaIndexCounter = 0;

function adicionarNovaPizza() {
    const container = document.getElementById('pizza-builder-area');
    const pizzaIndex = pizzaIndexCounter++;
    
    const pizzaItemDiv = document.createElement('div');
    pizzaItemDiv.className = 'pizza-item';
    pizzaItemDiv.dataset.pizzaIndex = pizzaIndex;
    pizzaItemDiv.innerHTML = `
        <div class="pizza-item-header">
            <h3>Pizza ${pizzaIndex + 1}</h3>
            <button type="button" class="remove-pizza-btn">&times;</button>
        </div>
        <div class="pizza-details">
            <label for="tamanho-select-${pizzaIndex}">Tamanho:</label>
            <select id="tamanho-select-${pizzaIndex}" name="tamanho">
                <option value="GRANDE">Grande</option>
                <option value="BROTO">Broto</option>
                <option value="GIGA">Giga</option>
            </select>
            <label>Sabores (máximo 4):</label>
            <div class="sabores-grid" id="sabores-container-${pizzaIndex}"></div>
        </div>
    `;
    
    container.appendChild(pizzaItemDiv);
    renderizarSabores(pizzaIndex);

    // ===================================================================
    // CORREÇÃO 1: Limite de 4 sabores
    // Adiciona um "escutador" de eventos que valida a quantidade de sabores
    // ===================================================================
    const saboresContainer = pizzaItemDiv.querySelector(`#sabores-container-${pizzaIndex}`);
    saboresContainer.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            const checkboxes = saboresContainer.querySelectorAll('input[type="checkbox"]:checked');
            if (checkboxes.length > 4) {
                alert('Você pode selecionar no máximo 4 sabores por pizza.');
                event.target.checked = false; // Desfaz a última seleção
                atualizarResumoPedido(); // Recalcula o preço após desmarcar
            }
        }
    });

    pizzaItemDiv.querySelector('.remove-pizza-btn').addEventListener('click', () => {
        if (document.querySelectorAll('.pizza-item').length > 1) {
            pizzaItemDiv.remove();
            atualizarResumoPedido();
        } else {
            alert("O pedido deve ter pelo menos uma pizza.");
        }
    });
    atualizarResumoPedido();
}

function renderizarSabores(index) {
    const saboresContainer = document.getElementById(`sabores-container-${index}`);
    saboresContainer.innerHTML = '';
    for (const sabor in cardapioCache) {
        saboresContainer.innerHTML += `
            <label>
                <input type="checkbox" name="sabor-${index}" value="${sabor}" data-preco="${cardapioCache[sabor]}">
                ${sabor}
            </label>
        `;
    }
}

/**
 * Atualiza o resumo do pedido (subtotal, frete e total) em tempo real.
 */
function atualizarResumoPedido() {
    let subtotalTotal = 0;
    const pizzas = document.querySelectorAll('.pizza-item');

    pizzas.forEach(pizzaEl => {
        const index = pizzaEl.dataset.pizzaIndex;
        const saboresSelecionados = pizzaEl.querySelectorAll(`input[name="sabor-${index}"]:checked`);
        
        if (saboresSelecionados.length > 0) {
            const precos = Array.from(saboresSelecionados).map(s => parseFloat(s.dataset.preco));
            const precoDaPizza = precos.reduce((soma, precoAtual) => soma + precoAtual, 0) / precos.length;
            subtotalTotal += precoDaPizza;
        }
    });

    const distancia = parseFloat(document.getElementById('distancia').value) || 0;
    const frete = (distancia * 1.20) + (pizzas.length * 0.50);

    document.getElementById('subtotal').textContent = `R$ ${subtotalTotal.toFixed(2)}`;
    document.getElementById('frete').textContent = `R$ ${frete.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${(subtotalTotal + frete).toFixed(2)}`;
}

async function enviarPedido(event) {
    event.preventDefault();
    const clienteId = document.getElementById('cliente-select').value;
    if (!clienteId) {
        alert("Por favor, selecione um cliente.");
        return;
    }
    const pizzasParaEnviar = [];
    const pizzaItems = document.querySelectorAll('.pizza-item');
    pizzaItems.forEach(item => {
        const index = item.dataset.pizzaIndex;
        const tamanho = item.querySelector(`#tamanho-select-${index}`).value;
        const sabores = Array.from(item.querySelectorAll(`input[name="sabor-${index}"]:checked`)).map(cb => cb.value);
        if (sabores.length > 0) {
            const precosSabores = sabores.map(s => parseFloat(cardapioCache[s]));
            const precoPizza = precosSabores.reduce((soma, precoAtual) => soma + precoAtual, 0) / precosSabores.length;
            pizzasParaEnviar.push({ sabores, tamanho, preco: precoPizza });
        }
    });

    if (pizzasParaEnviar.length === 0) {
        alert("Adicione e configure pelo menos uma pizza com sabores.");
        return;
    }
    
    const distancia = parseFloat(document.getElementById('distancia').value) || 0;
    if (distancia < 0) {
        alert("A distância não pode ser negativa.");
        return;
    }
    
    const pedidoParaEnviar = {
        cliente: { id: parseInt(clienteId) },
        pizzas: pizzasParaEnviar,
        distancia: distancia // Envia a distância para o backend calcular o frete
    };

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoParaEnviar)
        });

        if (!response.ok) throw new Error('Falha ao registrar o pedido.');

        const pedidoSalvo = await response.json();
        alert(`Pedido #${pedidoSalvo.id} criado com sucesso! Frete calculado: R$ ${pedidoSalvo.frete.toFixed(2)}`);
        document.getElementById('order-form').reset(); // Limpa o formulário

    } catch (error) {
        console.error("Erro ao enviar pedido:", error);
        alert("Ocorreu um erro ao registrar o pedido.");
    }
}

// ===================================================================
// PÁGINA DE RELATÓRIOS (relatorio.html)
// ===================================================================
async function inicializarPaginaRelatorio() {
    try {
        const response = await fetch(`${API_BASE_URL}/relatorios`);
        if (!response.ok) throw new Error('Falha ao buscar dados da API');
        const dados = await response.json();
        document.getElementById('faturamento-total').textContent = `R$ ${dados.faturamentoTotal.toFixed(2)}`;
        document.getElementById('total-pedidos').textContent = dados.totalPedidos;

        // Ordena os sabores do mais popular para o menos popular
        const saboresOrdenados = Object.entries(dados.contagemSabores)
            .sort(([, a], [, b]) => b - a);

        if (saboresOrdenados.length > 0) {
            const [saborDestaque, contagemDestaque] = saboresOrdenados[0];
            document.getElementById('sabor-popular').textContent = saborDestaque;
            document.getElementById('sabor-popular-count').textContent = `${contagemDestaque} vezes`;
        }

        // Prepara dados para os gráficos
        const labels = saboresOrdenados.map(item => item[0]);
        const data = saboresOrdenados.map(item => item[1]);

        // Cria o gráfico de barras com todos os sabores
        criarGraficoBarras(labels, data);

        // Cria o gráfico de pizza com o Top 5 + "Outros"
        const top5Labels = labels.slice(0, 5);
        const top5Data = data.slice(0, 5);
        if (labels.length > 5) {
            top5Labels.push('Outros');
            const outrosSoma = data.slice(5).reduce((acc, val) => acc + val, 0);
            top5Data.push(outrosSoma);
        }
        criarGraficoPizza(top5Labels, top5Data);

        renderizarGrafoSabores(dados.grafoSabores);
    } catch (error) {
        console.error("Erro ao buscar dados do relatório:", error);
        alert("Não foi possível carregar os dados do relatório.");
    }
}
function criarGraficoPizza(labels, data) {
    const ctx = document.getElementById('saboresPieChart').getContext('2d');
    
    // Paleta de cores alinhada com a identidade visual
    const brandColors = [
        '#E63946', // Vermelho Pizza
        '#2A9D8F', // Verde Manjericão
        '#F4A261', // Amarelo Queijo
        '#8d99ae', // Cinza do botão danger
        '#e76f51', // Outro tom de laranja/vermelho
        '#264653', // Azul escuro
    ];

    new Chart(ctx, {
        type: 'pie',
        data: { 
            labels: labels, 
            datasets: [{ 
                data: data, 
                backgroundColor: brandColors,
                hoverOffset: 4
            }] 
        },
        options: { 
            responsive: true, 
            plugins: { 
                legend: { position: 'top' }
            } 
        }
    });
}

function criarGraficoBarras(labels, data) {
    const ctx = document.getElementById('saboresBarChart').getContext('2d');
    const brandColors = ['#E63946', '#2A9D8F', '#F4A261', '#8d99ae', '#e76f51', '#264653'];

    new Chart(ctx, {
        type: 'bar', // MUDANÇA: De pizza para barras
        data: { 
            labels: labels, 
            datasets: [{ 
                label: 'Quantidade Pedida',
                data: data, 
                backgroundColor: brandColors,
                borderColor: brandColors,
                borderWidth: 1
            }] 
        },
        options: { 
            indexAxis: 'y', // Torna o gráfico de barras horizontal
            responsive: true, 
            plugins: { 
                legend: {
                    display: false // Legenda é desnecessária em um gráfico de barras simples
                },
            } 
        }
    });
}

function renderizarGrafoSabores(grafo) {
    const container = document.getElementById('grafo-sabores');
    container.innerHTML = '';
    if (!grafo || Object.keys(grafo).length === 0) {
        container.innerHTML = '<div>Nenhuma conexão de sabores encontrada.</div>';
        return;
    }
    for (const saborPrincipal in grafo) {
        const conexoes = grafo[saborPrincipal];

        const card = document.createElement('div');
        card.className = 'grafo-card';

        let conexoesHtml = `<div class="grafo-card-header">${saborPrincipal}</div><div class="grafo-card-body">`;

        for (const saborConectado in conexoes) {
            conexoesHtml += `
                <div class="conexao-item">
                    <span class="sabor-conectado">${saborConectado}</span>
                    <span class="conexao-count">${conexoes[saborConectado]}x</span>
                </div>`;
        }
        conexoesHtml += '</div>';
        card.innerHTML = conexoesHtml;
        container.appendChild(card);
    }
}

// ===================================================================
// PÁGINAS DE CLIENTES E CARDÁPIO (clientes.html, cardapio.html)
// ===================================================================
async function inicializarPaginaClientes() {
    // Lógica do Modal de Adicionar Cliente
    const modal = document.getElementById('add-client-modal');
    const addClientBtn = document.querySelector('.btn-success');
    const closeBtn = modal.querySelector('.close-btn');
    const clientForm = document.getElementById('add-client-form');
    const modalTitle = modal.querySelector('h2');

    const openModalForNew = () => {
        clientForm.reset();
        document.getElementById('client-id').value = '';
        modalTitle.textContent = 'Adicionar Novo Cliente';
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    addClientBtn.addEventListener('click', openModalForNew);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) closeModal();
    });
    clientForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await salvarCliente(clientForm);
    });

    await carregarListaClientes();
}

async function carregarListaClientes() {
    try {
        const modalTitle = document.querySelector('#add-client-modal h2');
        const response = await fetch(`${API_BASE_URL}/clientes`);
        const clientes = await response.json();
        const tbody = document.querySelector('#clientes-table tbody');
        tbody.innerHTML = '';
        if (clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhum cliente cadastrado.</td></tr>';
            return;
        }
        clientes.forEach(c => {
            tbody.innerHTML += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.nome}</td>
                    <td>${c.telefone}</td>
                    <td>${c.endereco}</td>
                    <td>
                        <button class="btn-secondary" data-id="${c.id}">Editar</button>
                        <button class="btn-danger" data-id="${c.id}">Excluir</button>
                    </td>
                </tr>`;
        });

        // Adiciona event listeners para os botões de editar e excluir de cada cliente
        tbody.querySelectorAll('.btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clienteId = e.target.dataset.id;
                const cliente = clientes.find(c => c.id == clienteId);
                if (cliente) {
                    modalTitle.textContent = 'Editar Cliente';
                    document.getElementById('client-id').value = cliente.id;
                    document.getElementById('client-name').value = cliente.nome;
                    document.getElementById('client-phone').value = cliente.telefone;
                    document.getElementById('client-address').value = cliente.endereco;
                    modal.style.display = 'block';
                }
            });
        });
        tbody.querySelectorAll('.btn-danger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clienteId = e.target.dataset.id;
                if (confirm(`Tem certeza que deseja excluir o cliente com ID ${clienteId}?`)) {
                    excluirCliente(clienteId);
                }
            });
        });

    } catch (e) {
        console.error("Erro ao carregar clientes", e);
        document.querySelector('#clientes-table tbody').innerHTML = '<tr><td colspan="5">Erro ao carregar clientes.</td></tr>';
    }
}

async function excluirCliente(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Falha ao excluir o cliente. Verifique se ele existe.');
        }
        alert('Cliente excluído com sucesso!');
        await carregarListaClientes();
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert(error.message);
    }
}

async function salvarCliente(form) {
    const clienteId = form.id.value;
    const cliente = {
        id: clienteId ? parseInt(clienteId) : 0,
        nome: form.nome.value,
        telefone: form.telefone.value,
        endereco: form.endereco.value
    };

    const isEditing = !!clienteId;
    const url = isEditing ? `${API_BASE_URL}/clientes/${clienteId}` : `${API_BASE_URL}/clientes`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cliente)
        });

        if (!response.ok) {
            throw new Error(`Falha ao ${isEditing ? 'atualizar' : 'adicionar'} cliente.`);
        }

        alert(`Cliente ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`);
        document.getElementById('add-client-modal').style.display = 'none';
        await carregarListaClientes(); // Recarrega apenas a lista de clientes

    } catch (error) {
        console.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} cliente:`, error);
        alert(`Ocorreu um erro ao ${isEditing ? 'atualizar' : 'adicionar'} o cliente.`);
    }
}

async function inicializarPaginaCardapio() {
    await carregarCardapioCache(); // Garante que o cache está carregado

    // Lógica do Modal de Adicionar Sabor
    const modal = document.getElementById('add-sabor-modal');
    const addSaborBtn = document.querySelector('.btn-success');
    const closeBtn = modal.querySelector('.close-btn');
    const saborForm = document.getElementById('add-sabor-form');

    addSaborBtn.addEventListener('click', () => {
        abrirModalSabor(); // Abre para adicionar novo
    });
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
    saborForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await salvarSabor(saborForm);
        modal.style.display = 'block';
    });

    // Renderiza a tabela
    const tbody = document.querySelector('#cardapio-table tbody');
    tbody.innerHTML = '';

    for (const sabor in cardapioCache) {
        tbody.innerHTML += `
            <tr>
                <td>${sabor}</td>
                <td>R$ ${cardapioCache[sabor].toFixed(2)}</td>
                <td><button class="btn-secondary" data-sabor="${sabor}">Editar</button><button class="btn-danger" data-sabor="${sabor}">Excluir</button></td>
            </tr>`;
    }

    // Adiciona event listeners para os botões de editar e excluir de cada sabor
    tbody.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const sabor = event.target.dataset.sabor;
            if (event.target.classList.contains('btn-secondary')) {
                // Abre o modal em modo de edição
                abrirModalSabor(sabor);
            }
            if (event.target.classList.contains('btn-danger')) {
                if (confirm(`Tem certeza que deseja excluir o sabor "${sabor}"?`)) {
                    excluirSabor(sabor);
                }
            }
        }
    });
}

function abrirModalSabor(saborParaEditar = null) {
    const modal = document.getElementById('add-sabor-modal');
    const form = document.getElementById('add-sabor-form');
    const modalTitle = modal.querySelector('h2');
    const saborNameInput = document.getElementById('sabor-name');
    const saborNameReadonly = document.getElementById('sabor-name-readonly');

    form.reset();

    if (saborParaEditar) {
        // Modo Edição
        modalTitle.textContent = 'Editar Sabor';
        document.getElementById('original-sabor-name').value = saborParaEditar;
        saborNameReadonly.value = saborParaEditar;
        document.getElementById('sabor-price').value = cardapioCache[saborParaEditar].toFixed(2);

        saborNameInput.style.display = 'none';
        saborNameReadonly.style.display = 'block';
    } else {
        // Modo Adição
        modalTitle.textContent = 'Adicionar Novo Sabor';
        document.getElementById('original-sabor-name').value = '';

        saborNameInput.style.display = 'block';
        saborNameReadonly.style.display = 'none';
    }

    modal.style.display = 'block';
}

async function salvarSabor(form) {
    const originalSabor = form.originalSabor.value;
    const isEditing = !!originalSabor;

    let url, method, body, successMessage;

    if (isEditing) {
        url = `${API_BASE_URL}/cardapio/${originalSabor}`;
        method = 'PUT';
        body = JSON.stringify({ preco: parseFloat(form.preco.value) });
        successMessage = 'Sabor atualizado com sucesso!';
    } else {
        url = `${API_BASE_URL}/cardapio`;
        method = 'POST';
        body = JSON.stringify({
            sabor: form.sabor.value,
            preco: parseFloat(form.preco.value)
        });
        successMessage = 'Sabor adicionado com sucesso!';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        if (!response.ok) throw new Error(`Falha ao ${isEditing ? 'atualizar' : 'adicionar'} sabor.`);

        alert(successMessage);
        document.getElementById('add-sabor-modal').style.display = 'none';
        await carregarCardapioCache(true); // Força a recarga do cache
        await inicializarPaginaCardapio(); // Redesenha a página
    } catch (error) {
        alert(`Ocorreu um erro: ${error.message}`);
    }
}

async function excluirSabor(sabor) {
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio/${sabor}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Falha ao excluir sabor.');
        alert(`Sabor "${sabor}" excluído com sucesso!`);
        delete cardapioCache[sabor]; // Remove do cache local
        inicializarPaginaCardapio(); // Redesenha a tabela
    } catch (error) {
        alert('Erro ao excluir sabor.');
    }
}

// ===================================================================
// PÁGINA DE ALTERAR PEDIDO (alterar-pedido.html)
// ===================================================================
async function inicializarPaginaAlterarPedido() {
    const container = document.getElementById('sabores-container');
    container.innerHTML = '';
    for (const sabor in cardapioCache) {
        container.innerHTML += `<span><input type="checkbox" name="novo-sabor" value="${sabor}"> ${sabor}</span>`;
    }
    document.getElementById('buscar-pedido-id-btn').addEventListener('click', () => buscarPedido());
    document.getElementById('buscar-cliente-nome-btn').addEventListener('click', buscarPedidoPorNome);
    document.getElementById('add-pizza-btn').addEventListener('click', adicionarPizzaAoPedido);
    document.getElementById('salvar-alteracoes-btn').addEventListener('click', salvarAlteracoes);
    document.getElementById('distancia-edit').addEventListener('input', atualizarResumoPedidoAlteracao);
}

async function buscarPedidoPorNome() {
    const nome = document.getElementById('cliente-nome-input').value;
    if (!nome) { alert("Por favor, insira um nome para buscar."); return; }

    document.getElementById('detalhes-pedido').classList.add('hidden');
    const resultadosContainer = document.getElementById('resultados-busca');
    const listaResultados = document.getElementById('lista-resultados');

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos?nomeCliente=${encodeURIComponent(nome)}`);
        if (!response.ok) throw new Error('Erro ao buscar pedidos.');
        const pedidos = await response.json();

        if (pedidos.length === 0) {
            listaResultados.innerHTML = '<li>Nenhum pedido encontrado para este cliente.</li>';
        } else {
            listaResultados.innerHTML = '';
            pedidos.forEach(p => {
                const li = document.createElement('li'); // Item da lista principal
                li.className = 'resultado-item';

                // Cabeçalho do resultado, que é clicável para expandir
                const header = document.createElement('div');
                header.className = 'resultado-header';
                header.innerHTML = `<span>Pedido #${p.id} - Cliente: ${p.cliente.nome} - Total: R$ ${(p.valorTotal + p.frete).toFixed(2)}</span> <span class="expand-icon">&#9662;</span>`;
                
                // Div de detalhes, inicialmente oculta
                const detalhesDiv = document.createElement('div');
                detalhesDiv.className = 'resultado-detalhes hidden';
                
                const pizzasUl = document.createElement('ul');
                p.pizzas.forEach(pizza => {
                    pizzasUl.innerHTML += `<li>Pizza ${pizza.tamanho}: ${pizza.sabores.join(', ')}</li>`;
                });
                
                const btnEditar = document.createElement('button');
                btnEditar.textContent = 'Editar este Pedido';
                btnEditar.className = 'btn-secondary';
                btnEditar.onclick = () => buscarPedido(p.id);

                detalhesDiv.append(pizzasUl, btnEditar);
                header.onclick = () => detalhesDiv.classList.toggle('hidden');
                li.append(header, detalhesDiv);
                listaResultados.appendChild(li);
            });
        }
        resultadosContainer.classList.remove('hidden');
    } catch (error) {
        alert(error.message);
    }
}

async function buscarPedido(id = null) {
    const pedidoId = id || document.getElementById('pedido-id-input').value;
    if (!pedidoId) { alert("Por favor, insira um ID."); return; }

    document.getElementById('resultados-busca').classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}`);
        if (!response.ok) throw new Error('Pedido não encontrado');
        pedidoAtual = await response.json();
        document.getElementById('detalhes-pedido').classList.remove('hidden');
        document.getElementById('cliente-info').textContent = `Cliente: ${pedidoAtual.cliente.nome}`;
        document.getElementById('distancia-edit').value = pedidoAtual.distancia;
        renderizarListaPizzas();
    } catch (error) {
        alert(error.message);
    }
}

function renderizarListaPizzas() {
    const lista = document.getElementById('lista-pizzas');
    lista.innerHTML = '';
    pedidoAtual.pizzas.forEach((pizza, index) => {
        const li = document.createElement('li');
        li.className = 'pizza-item-editavel';

        // Cria o seletor de tamanho
        const selectTamanho = document.createElement('select');
        selectTamanho.className = 'tamanho-select';
        selectTamanho.dataset.pizzaIndex = index;
        selectTamanho.innerHTML = `
            <option value="GRANDE">Grande</option>
            <option value="BROTO">Broto</option>
            <option value="GIGA">Giga</option>
        `;
        selectTamanho.value = pizza.tamanho; // Define o valor atual
        selectTamanho.addEventListener('change', (e) => {
            // Atualiza o tamanho da pizza no objeto do pedido atual
            pedidoAtual.pizzas[index].tamanho = e.target.value;
            atualizarResumoPedidoAlteracao();
        });

        // Cria os checkboxes dos sabores
        const saboresDiv = document.createElement('div');
        saboresDiv.className = 'sabores-grid';
        for (const sabor in cardapioCache) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `sabor-${index}-${sabor}`;
            checkbox.value = sabor;
            checkbox.checked = pizza.sabores.includes(sabor); // Marca os sabores existentes

            const label = document.createElement('label');
            label.htmlFor = `sabor-${index}-${sabor}`; 
            label.appendChild(checkbox);
            label.append(sabor);

            saboresDiv.appendChild(label);
        }

        saboresDiv.addEventListener('change', (event) => {
            const checkboxesMarcados = saboresDiv.querySelectorAll('input:checked');
            if (checkboxesMarcados.length > 4) {
                alert('Você pode selecionar no máximo 4 sabores por pizza.');
                event.target.checked = false; // Desfaz a última seleção
            } else {
                // Atualiza a lista de sabores da pizza
                pedidoAtual.pizzas[index].sabores = Array.from(checkboxesMarcados)
                    .map(checkbox => checkbox.value);
            }
            // Atualiza o resumo do pedido em ambos os casos (seleção ou deseleção)
            atualizarResumoPedidoAlteracao(); 
        });

        // Cria o botão de remover
        const btnRemover = document.createElement('button');
        btnRemover.textContent = 'Remover';
        btnRemover.className = 'btn-danger';
        btnRemover.onclick = () => removerPizzaDoPedido(index);

        li.append(saboresDiv, selectTamanho, btnRemover);
        lista.appendChild(li);
    });
}

function removerPizzaDoPedido(index) {
    pedidoAtual.pizzas.splice(index, 1);
    atualizarResumoPedidoAlteracao();
    renderizarListaPizzas();
}

function adicionarPizzaAoPedido() {
    const tamanho = document.getElementById('novo-tamanho').value;
    const sabores = Array.from(document.querySelectorAll('input[name="novo-sabor"]:checked')).map(cb => cb.value);
    if (sabores.length === 0) { alert("Selecione ao menos um sabor para a nova pizza."); return; }
    if (sabores.length > 4) { alert("Você pode selecionar no máximo 4 sabores."); return; }
    
    const precos = sabores.map(s => cardapioCache[s]);
    const preco = precos.reduce((soma, precoAtual) => soma + precoAtual, 0) / precos.length;
    pedidoAtual.pizzas.push({ sabores, tamanho, preco });
    
    document.querySelectorAll('input[name="novo-sabor"]:checked').forEach(cb => cb.checked = false);
    atualizarResumoPedidoAlteracao();
    renderizarListaPizzas();
}

function atualizarResumoPedidoAlteracao() {
    if (!pedidoAtual) return;

    let subtotal = 0;
    pedidoAtual.pizzas.forEach(pizza => {
        if (pizza.sabores.length > 0) {
            const precos = pizza.sabores.map(s => cardapioCache[s] || 0);
            subtotal += precos.reduce((soma, p) => soma + p, 0) / precos.length;
        }
    });

    const distancia = parseFloat(document.getElementById('distancia-edit').value) || 0;
    const frete = (distancia * 1.20) + (pedidoAtual.pizzas.length * 0.50);

    document.getElementById('subtotal-edit').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('frete-edit').textContent = `R$ ${frete.toFixed(2)}`;
    document.getElementById('total-edit').textContent = `R$ ${(subtotal + frete).toFixed(2)}`;

    pedidoAtual.distancia = distancia;
}

async function salvarAlteracoes() {
    // Validação para garantir que o pedido não fique sem pizzas
    if (!pedidoAtual.pizzas || pedidoAtual.pizzas.length === 0) {
        alert("Não é possível salvar um pedido sem nenhuma pizza. Adicione ao menos uma ou cancele a alteração.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoAtual.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoAtual)
        });
        if (!response.ok) throw new Error("Falha ao salvar alterações.");
        alert("Pedido atualizado com sucesso!");
        document.getElementById('detalhes-pedido').classList.add('hidden');
        document.getElementById('pedido-id-input').value = '';
    } catch (error) { alert(error.message); }
}


// ===================================================================
// FUNÇÕES AUXILIARES
// ===================================================================
async function carregarClientesParaSelect() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`);
        const clientes = await response.json();
        const select = document.getElementById('cliente-select');
        select.innerHTML = '<option value="">-- Selecione um cliente --</option>';
        clientes.forEach(cliente => {
            select.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
        });
    } catch (error) { console.error('Falha ao carregar clientes:', error); }
}