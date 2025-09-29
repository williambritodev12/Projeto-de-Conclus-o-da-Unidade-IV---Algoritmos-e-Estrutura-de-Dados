package com.pizzaria.controller;

import com.pizzaria.model.Cardapio; // Supondo que Cardapio esteja no pacote model

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@CrossOrigin
@RestController // Diz ao Spring que esta classe responde a requisições web
@RequestMapping("/api/cardapio") // Todas as rotas aqui começarão com /api/cardapio
public class CardapioController {

    private final Cardapio cardapio = new Cardapio();

    @GetMapping // Responde a requisições GET para /api/cardapio
    public Map<String, Double> getCardapioCompleto() {
        // O Spring automaticamente converte este Map em um formato que o navegador entende (JSON)
        return cardapio.getCardapio();
    }
}