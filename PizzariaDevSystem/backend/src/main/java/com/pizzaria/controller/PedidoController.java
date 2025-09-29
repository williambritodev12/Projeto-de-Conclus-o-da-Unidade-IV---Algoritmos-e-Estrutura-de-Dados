// // Local: backend/src/main/java/com/pizzaria/controller/PedidoController.java
// package com.pizzaria.controller;

// import com.pizzaria.model.Pedido;
// import com.pizzaria.service.PizzariaServico;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// @CrossOrigin // Permite que o frontend acesse este endpoint
// @RestController
// @RequestMapping("/api/pedidos")
// public class PedidoController {

//     private final PizzariaServico servico;

//     public PedidoController(PizzariaServico servico) {
//         this.servico = servico;
//     }

//     // @PostMapping indica que este método recebe dados (via POST)
//     @PostMapping
//     public ResponseEntity<Pedido> criarPedido(@RequestBody Pedido pedido) {
//         Pedido novoPedido = servico.salvarPedido(pedido);
//         return ResponseEntity.ok(novoPedido);
//     }

    
// }

// Local: backend/src/main/java/com/pizzaria/controller/PedidoController.java
package com.pizzaria.controller;

import com.pizzaria.model.Pedido;
import com.pizzaria.service.PizzariaServico;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PizzariaServico servico;

    public PedidoController(PizzariaServico servico) {
        this.servico = servico;
    }

    // Endpoint para buscar um pedido específico pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPedidoPorId(@PathVariable int id) {
        Optional<Pedido> pedido = servico.encontrarPedidoPorId(id);
        return pedido.map(ResponseEntity::ok)
                     .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint para buscar pedidos (por nome de cliente, por exemplo)
    @GetMapping
    public ResponseEntity<List<Pedido>> listarPedidos(@RequestParam(required = false) String nomeCliente) {
        if (nomeCliente != null && !nomeCliente.isEmpty()) {
            return ResponseEntity.ok(servico.encontrarPedidosPorNomeCliente(nomeCliente));
        }
        // Poderia retornar todos os pedidos aqui se quisesse, mas por enquanto focamos na busca
        return ResponseEntity.ok(List.of());
    }

    // Endpoint para receber um novo pedido
    @PostMapping
    public ResponseEntity<Pedido> criarPedido(@RequestBody Pedido pedido) {
        Pedido novoPedido = servico.salvarPedido(pedido);
        return ResponseEntity.ok(novoPedido);
    }
    
    // Endpoint para atualizar um pedido existente
    @PutMapping("/{id}")
    public ResponseEntity<Pedido> atualizarPedido(@PathVariable int id, @RequestBody Pedido pedidoAtualizado) {
        Pedido pedido = servico.atualizarPedido(id, pedidoAtualizado);
        return ResponseEntity.ok(pedido);
    }
}