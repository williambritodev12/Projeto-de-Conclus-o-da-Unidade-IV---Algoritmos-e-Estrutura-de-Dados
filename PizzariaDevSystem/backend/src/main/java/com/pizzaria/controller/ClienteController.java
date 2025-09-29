// Local: backend/src/main/java/com/pizzaria/controller/ClienteController.java
package com.pizzaria.controller;

import com.pizzaria.model.Cliente;
import com.pizzaria.service.PizzariaServico;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*") // Permite que o frontend acesse este endpoint
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

    @PostMapping
    public Cliente adicionarCliente(@RequestBody Cliente cliente) {
        return servico.adicionarCliente(cliente);
    }

    @PutMapping("/{id}")
    public Cliente atualizarCliente(@PathVariable int id, @RequestBody Cliente cliente) {
        return servico.atualizarCliente(id, cliente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirCliente(@PathVariable int id) {
        boolean excluido = servico.excluirCliente(id);
        if (excluido) {
            return ResponseEntity.noContent().build(); // Sucesso, sem conteúdo de resposta
        }
        return ResponseEntity.notFound().build(); // Cliente não encontrado
    }
}