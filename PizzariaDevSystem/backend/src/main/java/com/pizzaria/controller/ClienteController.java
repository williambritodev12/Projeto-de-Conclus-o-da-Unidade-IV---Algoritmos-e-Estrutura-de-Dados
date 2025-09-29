// Local: backend/src/main/java/com/pizzaria/controller/ClienteController.java
package com.pizzaria.controller;

import com.pizzaria.model.Cliente;
import com.pizzaria.service.PizzariaServico;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin // Permite que o frontend acesse este endpoint
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final PizzariaServico servico;

    // O Spring injeta o serviço automaticamente
    public ClienteController(PizzariaServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public List<Cliente> listarClientes() {
        return servico.getClientes();
    }
}