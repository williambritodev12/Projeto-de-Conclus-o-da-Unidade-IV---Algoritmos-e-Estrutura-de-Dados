// Local: backend/src/main/java/com/pizzaria/model/Cliente.java
package com.pizzaria.model;

public class Cliente {
    private int id;
    private String nome;
    private String endereco;
    private String telefone;

    // Construtor usado pelo sistema para criar clientes com ID
    public Cliente(int id, String nome, String endereco, String telefone) {
        this.id = id;
        this.nome = nome;
        this.endereco = endereco;
        this.telefone = telefone;
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEndereco() {
        return endereco;
    }

    public String getTelefone() {
        return telefone;
    }
}