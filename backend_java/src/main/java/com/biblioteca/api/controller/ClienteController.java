package com.biblioteca.api.controller;

<<<<<<< HEAD
import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
=======
import com.biblioteca.api.model.Cliente;
import com.biblioteca.api.service.UsuarioService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
>>>>>>> f1c942b357e26ea8407126567397b833e9cf7c6f
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
<<<<<<< HEAD
=======
@CrossOrigin("*") 
>>>>>>> f1c942b357e26ea8407126567397b833e9cf7c6f
public class ClienteController {

    private final UsuarioService usuarioService;

    public ClienteController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
<<<<<<< HEAD
    public ResponseEntity<List<ApiDtos.UserSummary>> listar(@RequestParam(value = "busca", required = false) String busca) {
        return ResponseEntity.ok(usuarioService.listarClientes(busca));
    }
}
=======
    public List<Cliente> listarTodos() {
        return usuarioService.listarClientesAtivos();
    }
}
>>>>>>> f1c942b357e26ea8407126567397b833e9cf7c6f
