// Local: backend/src/main/java/com/pizzaria/model/Pedido.java
package com.pizzaria.model;

import java.util.ArrayList;
import java.util.List;

public class Pedido {
    private int id;
    private Cliente cliente;
    private List<Pizza> pizzas = new ArrayList<>(); // Inicializa a lista aqui
    private double valorTotal;
    private double distancia; // Nova propriedade para a distância
    private double frete;

    // Construtor padrão (sem argumentos) necessário para a desserialização do JSON pelo Spring/Jackson
    public Pedido() {
    }

    public Pedido(int id, Cliente cliente) {
        this.id = id;
        this.cliente = cliente;
        this.distancia = 0.0; // Valor padrão
    }

    // Construtor adicional para facilitar a criação de pedidos com distância
    public Pedido(int id, Cliente cliente, double distancia) {
        this(id, cliente); // Chama o construtor existente
        this.distancia = distancia;
        
    }

    // Métodos para manipular o pedido
    public void adicionarPizza(Pizza pizza) {
        this.pizzas.add(pizza);
        recalcularSubtotal();
    }

    public void recalcularSubtotal() {
        this.valorTotal = this.pizzas.stream().mapToDouble(Pizza::getPreco).sum();
    }

    // Getters e Setters
    public int getId() { return id; }
    public Cliente getCliente() { return cliente; }
    public List<Pizza> getPizzas() { return pizzas; }
    public double getDistancia() { return distancia; }
    public double getValorTotal() { return valorTotal; }
    public double getFrete() { return frete; }
    public void setFrete(double frete) { this.frete = frete; }

    // Setters
    public void setId(int id) {
        this.id = id;
    }

    public void setDistancia(double distancia) {
        this.distancia = distancia;
    }
    public void setPizzas(List<Pizza> pizzas) {
        this.pizzas = pizzas;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }
}