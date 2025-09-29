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

    public Pedido atualizarPedido(int id, Pedido pedidoAtualizado) {
        Pedido pedidoExistente = encontrarPedidoPorId(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        // Atualiza a lista de pizzas do pedido existente
        pedidoExistente.setPizzas(pedidoAtualizado.getPizzas());
        pedidoExistente.recalcularSubtotal(); // Recalcula o valor

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

        return dados;
    }

    public List<Cliente> getClientes() {
        return clientes;
    }

    public Pedido salvarPedido(Pedido pedido) {
        pedido.setId(proximoIdPedido++);
        pedidos.add(pedido);
        return pedido;
    }
}