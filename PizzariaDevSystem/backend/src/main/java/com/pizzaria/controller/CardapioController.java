package com.pizzaria.controller;

import com.pizzaria.model.Cardapio; // Supondo que Cardapio esteja no pacote model
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController // Diz ao Spring que esta classe responde a requisições web
@RequestMapping("/api/cardapio") // Todas as rotas aqui começarão com /api/cardapio
public class CardapioController {

    private final Cardapio cardapio = new Cardapio();

    @GetMapping // Responde a requisições GET para /api/cardapio
    public Map<String, Double> getCardapioCompleto() {
        // O Spring automaticamente converte este Map em um formato que o navegador entende (JSON)
        return cardapio.getCardapio();
    }

    @PostMapping
    public ResponseEntity<Void> adicionarSabor(@RequestBody Map<String, Object> payload) {
        String sabor = (String) payload.get("sabor");
        Double preco = ((Number) payload.get("preco")).doubleValue();
        cardapio.adicionarSabor(sabor, preco);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{sabor}")
    public ResponseEntity<Void> atualizarSabor(@PathVariable String sabor, @RequestBody Map<String, Double> payload) {
        Double novoPreco = payload.get("preco");
        if (novoPreco == null) {
            return ResponseEntity.badRequest().build(); // Preço não fornecido
        }
        // O método adicionarSabor também atualiza se a chave já existir
        cardapio.adicionarSabor(sabor, novoPreco);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{sabor}")
    public ResponseEntity<Void> removerSabor(@PathVariable String sabor) {
        boolean removido = cardapio.removerSabor(sabor);
        if (removido) return ResponseEntity.noContent().build(); // Sucesso, sem conteúdo
        return ResponseEntity.notFound().build(); // Sabor não encontrado
    }
}