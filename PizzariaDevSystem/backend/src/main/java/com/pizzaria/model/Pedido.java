// Local: backend/src/main/java/com/pizzaria/model/Pedido.java
package com.pizzaria.model;

import java.util.ArrayList;
import java.util.List;

public class Pedido {
    private int id;
    private Cliente cliente;
    private List<Pizza> pizzas;
    private double valorTotal;
    private double frete;

    public Pedido(int id, Cliente cliente) {
        this.id = id;
        this.cliente = cliente;
        this.pizzas = new ArrayList<>();
        
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
    public double getValorTotal() { return valorTotal; }
    public double getFrete() { return frete; }
    public void setFrete(double frete) { this.frete = frete; }

     // **** MÉTODO QUE PRECISA SER ADICIONADO ****
    public void setId(int id) {
        this.id = id;
    }

        // **** MÉTODO QUE TAMBÉM PRECISA EXISTIR ****
    public void setPizzas(List<Pizza> pizzas) {
        this.pizzas = pizzas;
    }
}