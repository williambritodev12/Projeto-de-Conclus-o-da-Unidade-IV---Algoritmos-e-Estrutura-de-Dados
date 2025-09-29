// Local: backend/src/main/java/com/pizzaria/service/PizzariaServico.java
package com.pizzaria.service;

import com.pizzaria.model.Cliente;
import com.pizzaria.model.Pedido;
import com.pizzaria.model.Pizza;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PizzariaServico {
    private List<Cliente> clientes = new ArrayList<>();
    private List<Pedido> pedidos = new ArrayList<>();
    private int proximoIdCliente = 1;
    private int proximoIdPedido = 1;

    public Optional<Pedido> encontrarPedidoPorId(int id) {
        return pedidos.stream().filter(p -> p.getId() == id).findFirst();
    }

    public List<Pedido> encontrarPedidosPorNomeCliente(String nome) {
        String nomeBusca = nome.toLowerCase();
        return pedidos.stream()
                // Adiciona uma verificação para garantir que o cliente não seja nulo antes de buscar pelo nome
                .filter(p -> p.getCliente() != null && p.getCliente().getNome() != null &&
                             p.getCliente().getNome().toLowerCase().contains(nomeBusca))
                .collect(Collectors.toList());
    }

    public Pedido atualizarPedido(int id, Pedido pedidoAtualizado) {
        Pedido pedidoExistente = encontrarPedidoPorId(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        // Atualiza a lista de pizzas do pedido existente
        pedidoExistente.setPizzas(pedidoAtualizado.getPizzas());
        pedidoExistente.setDistancia(pedidoAtualizado.getDistancia()); // Atualiza a distância
        pedidoExistente.recalcularSubtotal(); // Recalcula o subtotal
        pedidoExistente.setFrete(CalculadoraFrete.calcular(pedidoExistente.getDistancia(), pedidoExistente.getPizzas().size())); // Recalcula o frete

        return pedidoExistente;
    }

    // Este método roda assim que o servidor inicia, populando com dados de exemplo
    @PostConstruct
    public void inicializarDados() {
        Cliente c1 = new Cliente(proximoIdCliente++, "João Silva", "Rua das Flores, 123", "9999-8888");
        Cliente c2 = new Cliente(proximoIdCliente++, "Maria Oliveira", "Avenida Central, 456", "7777-6666");
        clientes.add(c1);
        clientes.add(c2);

        Pedido ped1 = new Pedido(proximoIdPedido++, c1);
        ped1.adicionarPizza(new Pizza(Arrays.asList("Calabresa", "Mussarela"), 34.00, Pizza.TamanhoPizza.GRANDE));
        ped1.adicionarPizza(new Pizza(Collections.singletonList("Pepperoni"), 35.00, Pizza.TamanhoPizza.GRANDE));
        ped1.setFrete(7.50);
        pedidos.add(ped1);

        Pedido ped2 = new Pedido(proximoIdPedido++, c2);
        ped2.adicionarPizza(new Pizza(Arrays.asList("Quatro Queijos"), 37.00, Pizza.TamanhoPizza.GIGA));
        pedidos.add(ped2);
    }

    // Lógica para o Relatório
    public Map<String, Object> gerarDadosRelatorio() {
        Map<String, Object> dados = new HashMap<>();

        double faturamento = pedidos.stream().mapToDouble(p -> p.getValorTotal() + p.getFrete()).sum();

        Map<String, Long> contagem = pedidos.stream()
                .flatMap(p -> p.getPizzas().stream())
                .flatMap(pizza -> pizza.getSabores().stream())
                .collect(Collectors.groupingBy(sabor -> sabor, Collectors.counting()));

        String saborPopular = contagem.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("-");

        dados.put("faturamentoTotal", faturamento);
        dados.put("totalPedidos", pedidos.size());
        dados.put("saborMaisPedido", saborPopular);
        dados.put("contagemSabores", contagem);

        // LÓGICA DO GRAFO PARA CRUZAMENTO DE DADOS (REQUISITO 2)
        Map<String, Map<String, Integer>> grafoSabores = new HashMap<>();
        for (Pedido p : pedidos) {
            for (Pizza pizza : p.getPizzas()) {
                List<String> sabores = pizza.getSabores();
                if (sabores.size() > 1) {
                    for (int i = 0; i < sabores.size(); i++) {
                        for (int j = i + 1; j < sabores.size(); j++) {
                            String sabor1 = sabores.get(i);
                            String sabor2 = sabores.get(j);
                            // Adiciona a conexão nos dois sentidos
                            conectarSabores(grafoSabores, sabor1, sabor2);
                            conectarSabores(grafoSabores, sabor2, sabor1);
                        }
                    }
                }
            }
        }

        dados.put("grafoSabores", grafoSabores); // Adiciona o grafo aos dados do relatório

        return dados;
    }

    // Método auxiliar para o grafo
    private void conectarSabores(Map<String, Map<String, Integer>> grafo, String sabor1, String sabor2) {
        grafo.putIfAbsent(sabor1, new HashMap<>());
        Map<String, Integer> vizinhos = grafo.get(sabor1);
        vizinhos.put(sabor2, vizinhos.getOrDefault(sabor2, 0) + 1);
    }

    public List<Cliente> getClientes() {
        return clientes;
    }

    public Optional<Cliente> encontrarClientePorId(int id) {
        return clientes.stream().filter(c -> c.getId() == id).findFirst();
    }

    public Cliente atualizarCliente(int id, Cliente clienteAtualizado) {
        Cliente clienteExistente = encontrarClientePorId(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com ID: " + id));

        clienteExistente.setNome(clienteAtualizado.getNome());
        clienteExistente.setEndereco(clienteAtualizado.getEndereco());
        clienteExistente.setTelefone(clienteAtualizado.getTelefone());
        return clienteExistente;
    }

    public Cliente adicionarCliente(Cliente cliente) {
        cliente.setId(proximoIdCliente++);
        clientes.add(cliente);
        return cliente;
    }

    public boolean excluirCliente(int id) {
        // O método removeIf retorna true se algum elemento foi removido.
        // Isso evita problemas de concorrência ao iterar e remover ao mesmo tempo.
        return clientes.removeIf(cliente -> cliente.getId() == id);
    }

    public Pedido salvarPedido(Pedido pedido) {
        pedido.setId(proximoIdPedido++);

        // O frontend envia apenas o ID do cliente. Usamos esse ID para buscar o objeto Cliente completo e associá-lo ao pedido.
        Cliente clienteCompleto = encontrarClientePorId(pedido.getCliente().getId())
                .orElseThrow(() -> new RuntimeException("Tentativa de criar pedido para cliente inexistente com ID: " + pedido.getCliente().getId()));
        pedido.setCliente(clienteCompleto); // Associa o objeto Cliente completo ao pedido
        pedidos.add(pedido);
        pedido.setFrete(CalculadoraFrete.calcular(pedido.getDistancia(), pedido.getPizzas().size()));
        pedido.recalcularSubtotal();
        return pedido;
    }
}