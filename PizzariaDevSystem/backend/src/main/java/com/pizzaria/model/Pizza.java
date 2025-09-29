package com.pizzaria.model;

import java.util.List;

public class Pizza {
    private List<String> sabores;
    private double preco;
    private TamanhoPizza tamanho;

    public enum TamanhoPizza {
        BROTO,
        GRANDE,
        GIGA;
    }

    public Pizza(List<String> sabores, double preco, TamanhoPizza tamanho) {
        this.sabores = sabores;
        this.preco = preco;
        this.tamanho = tamanho;
    }

    // Getters - Métodos para acessar os dados
    public List<String> getSabores() {
        return sabores;
    }

    public double getPreco() {
        return preco;
    }

    public TamanhoPizza getTamanho() {
        return tamanho;
    }
}