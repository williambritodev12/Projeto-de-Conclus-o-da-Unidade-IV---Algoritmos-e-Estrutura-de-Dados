// Local: backend/src/main/java/com/pizzaria/controller/RelatorioController.java
package com.pizzaria.controller;

import com.pizzaria.service.PizzariaServico;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@CrossOrigin(origins = "*") // Permite que o frontend acesse este endpoint
@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final PizzariaServico servico;

    public RelatorioController(PizzariaServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public Map<String, Object> getDadosRelatorio() {
        return servico.gerarDadosRelatorio();
    }
}