package com.pizzaria;



import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;



@SpringBootApplication
public class PizzariaApplication {
    public static void main(String[] args) {
        SpringApplication.run(PizzariaApplication.class, args);
        System.out.println("Servidor da Pizzaria no ar! Acesse http://localhost:8080");
    }
}