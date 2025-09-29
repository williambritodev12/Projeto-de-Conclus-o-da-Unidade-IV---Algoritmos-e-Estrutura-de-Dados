// Local: frontend/js/app.js

const API_BASE_URL = 'http://localhost:8080/api';
let cardapioCache = {}; // Cache para guardar os preços dos sabores

// Roteador principal do Frontend
document.addEventListener('DOMContentLoaded', () => {
    const pageId = document.body.id;
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

// ===================================================================
// PÁGINA DE RELATÓRIOS (relatorio.html)
// ===================================================================
async function inicializarPaginaRelatorio() {
    // ... (código igual ao anterior, já está correto) ...
}
function criarGraficoSabores(labels, data) {
    // ... (código igual ao anterior, já está correto) ...
}

// ===================================================================
// PÁGINA DE CLIENTES E CARDÁPIO (clientes.html, cardapio.html)
// ===================================================================
async function inicializarPaginaClientes() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`);
        const clientes = await response.json();
        const tbody = document.querySelector('#clientes-table tbody');
        tbody.innerHTML = ''; // Limpa a mensagem "Carregando..."

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
                        <button class="btn-secondary">Editar</button>
                        <button class="btn-danger">Excluir</button>
                    </td>
                </tr>`;
        });
    } catch (e) { console.error("Erro ao carregar clientes", e); }
}

async function inicializarPaginaCardapio() {
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio`);
        const cardapio = await response.json();
        const tbody = document.querySelector('#cardapio-table tbody');
        tbody.innerHTML = '';

        for (const sabor in cardapio) {
            tbody.innerHTML += `
                <tr>
                    <td>${sabor}</td>
                    <td>R$ ${cardapio[sabor].toFixed(2)}</td>
                    <td>
                        <button class="btn-secondary">Editar</button>
                        <button class="btn-danger">Excluir</button>
                    </td>
                </tr>`;
        }
    } catch (e) { console.error("Erro ao carregar cardápio", e); }
}

// ===================================================================
// PÁGINA DE NOVO PEDIDO (pedido.html)
// ===================================================================
async function inicializarPaginaPedido() {
    await Promise.all([
        carregarClientesParaSelect(),
        carregarSaboresParaCheckbox()
    ]);

    document.getElementById('order-form').addEventListener('submit', e => {
        e.preventDefault();
        enviarPedido();
    });

    // Listeners para cálculo em tempo real
    document.getElementById('sabores-container').addEventListener('change', atualizarResumoPedido);
    document.getElementById('distancia').addEventListener('input', atualizarResumoPedido);
}

async function carregarClientesParaSelect() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`);
        const clientes = await response.json();
        const select = document.getElementById('cliente-select');
        select.innerHTML = '<option value="">-- Selecione um cliente --</option>';

        clientes.forEach(cliente => {
            select.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
        });
    } catch (error) {
        console.error('Falha ao carregar clientes:', error);
    }
}
async function carregarSaboresParaCheckbox() {
    try {
        const response = await fetch(`${API_BASE_URL}/cardapio`);
        cardapioCache = await response.json();
        const container = document.getElementById('sabores-container');
        container.innerHTML = '';
        for (const sabor in cardapioCache) {
            container.innerHTML += `<span><input type="checkbox" name="sabor" value="${sabor}" data-preco="${cardapioCache[sabor]}"> ${sabor}</span>`;
        }
    } catch (e) { console.error('Falha ao carregar cardápio', e); }
}

function atualizarResumoPedido() {
    const saboresSelecionados = Array.from(document.querySelectorAll('input[name="sabor"]:checked'));
    let subtotal = 0;
    if (saboresSelecionados.length > 0) {
        const precos = saboresSelecionados.map(s => parseFloat(s.dataset.preco));
        subtotal = precos.reduce((a, b) => a + b, 0) / saboresSelecionados.length;
    }

    const distancia = parseFloat(document.getElementById('distancia').value) || 0;
    const frete = (distancia * 1.20) + (1 * 0.50); // Simulação para 1 pizza

    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('frete').textContent = `R$ ${frete.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${(subtotal + frete).toFixed(2)}`;
}

async function enviarPedido() {
    const clienteId = document.getElementById('cliente-select').value;
    const tamanho = document.querySelector('select[name="tamanho"]').value;
    const sabores = Array.from(document.querySelectorAll('input[name="sabor"]:checked')).map(cb => cb.value);

    if (!clienteId || sabores.length === 0) {
        alert("Por favor, selecione um cliente e pelo menos um sabor.");
        return;
    }

    const pedidoParaEnviar = {
        cliente: { id: parseInt(clienteId) },
        pizzas: [{ sabores: sabores, tamanho: tamanho, preco: 0 }],
        frete: 0 // O frete pode ser calculado no backend futuramente
    };

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoParaEnviar)
        });

        if (!response.ok) throw new Error('Falha ao registrar o pedido.');

        const pedidoSalvo = await response.json();
        alert(`Pedido #${pedidoSalvo.id} criado com sucesso!`);
        document.getElementById('order-form').reset(); // Limpa o formulário

    } catch (error) {
        console.error("Erro ao enviar pedido:", error);
        alert("Ocorreu um erro ao registrar o pedido.");
    }
}

// ===================================================================
// PÁGINA DE ALTERAR PEDIDO (alterar-pedido.html)
// ===================================================================
let pedidoAtual = null;
let saboresDisponiveis = {};

async function inicializarPaginaAlterarPedido() {
    // Carrega os sabores disponíveis para o menu de adição
    const response = await fetch(`${API_BASE_URL}/cardapio`);
    saboresDisponiveis = await response.json();
    const container = document.getElementById('sabores-container');
    container.innerHTML = '';
    for (const sabor in saboresDisponiveis) {
        container.innerHTML += `<span><input type="checkbox" name="novo-sabor" value="${sabor}"> ${sabor}</span>`;
    }

    // Adiciona funcionalidade aos botões
    document.getElementById('buscar-pedido-btn').addEventListener('click', buscarPedido);
    document.getElementById('add-pizza-btn').addEventListener('click', adicionarPizzaAoPedido);
    document.getElementById('salvar-alteracoes-btn').addEventListener('click', salvarAlteracoes);
}

async function buscarPedido() {
    const id = document.getElementById('pedido-id-input').value;
    if (!id) {
        alert("Por favor, insira um ID.");
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${id}`);
        if (!response.ok) throw new Error('Pedido não encontrado');
        pedidoAtual = await response.json();

        document.getElementById('detalhes-pedido').classList.remove('hidden');
        document.getElementById('cliente-info').textContent = `Cliente: ${pedidoAtual.cliente.nome}`;
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
        li.textContent = `Pizza ${pizza.tamanho} - Sabores: ${pizza.sabores.join(', ')}`;
        const btnRemover = document.createElement('button');
        btnRemover.textContent = 'Remover';
        btnRemover.className = 'btn-danger';
        btnRemover.style.marginLeft = '10px';
        btnRemover.onclick = () => removerPizzaDoPedido(index);
        li.appendChild(btnRemover);
        lista.appendChild(li);
    });
}

function removerPizzaDoPedido(index) {
    pedidoAtual.pizzas.splice(index, 1);
    renderizarListaPizzas();
}

function adicionarPizzaAoPedido() {
    const tamanho = document.getElementById('novo-tamanho').value;
    const sabores = Array.from(document.querySelectorAll('input[name="novo-sabor"]:checked')).map(cb => cb.value);

    if (sabores.length === 0) {
        alert("Selecione ao menos um sabor para a nova pizza.");
        return;
    }

    // Calcula o preço da nova pizza
    let preco = 0;
    const precos = sabores.map(s => saboresDisponiveis[s]);
    preco = precos.reduce((a, b) => a + b, 0) / sabores.length;

    const novaPizza = { sabores, tamanho, preco };
    pedidoAtual.pizzas.push(novaPizza);
    renderizarListaPizzas();

    // Limpa os checkboxes
    document.querySelectorAll('input[name="novo-sabor"]:checked').forEach(cb => cb.checked = false);
}

async function salvarAlteracoes() {
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
    } catch (error) {
        alert(error.message);
    }
}