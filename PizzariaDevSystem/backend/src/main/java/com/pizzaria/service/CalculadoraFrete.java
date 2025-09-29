package com.pizzaria.service;
// Classe com uma única responsabilidade: calcular o frete.
public class CalculadoraFrete {
    private static final double CUSTO_POR_KM = 1.20;
    private static final double ADICIONAL_POR_PIZZA = 0.50;

    public static double calcular(double distanciaEmKm, int quantidadePizzas) {
        if (distanciaEmKm < 0) return 0.0;
        return (distanciaEmKm * CUSTO_POR_KM) + (quantidadePizzas * ADICIONAL_POR_PIZZA);
    }
}