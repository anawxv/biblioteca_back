$backendRoot = "C:\Users\gusta\OneDrive\AP1\AP1_2.0\backend_java"

function Write-File {
    param(
        [string]$Path,
        [string]$Content
    )

    $directory = Split-Path -Parent $Path
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Force -Path $directory | Out-Null
    }

    Set-Content -Path $Path -Value $Content -Encoding UTF8
}

Write-File "$backendRoot\pom.xml" @'
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.5</version>
        <relativePath />
    </parent>

    <groupId>com.biblioteca</groupId>
    <artifactId>biblioteca-api</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>biblioteca-api</name>
    <description>API Spring Boot para o sistema de biblioteca</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
'@

Write-File "$backendRoot\.gitignore" @'
target
.idea
.vscode
*.iml
'@

Write-File "$backendRoot\README.md" @'
# Biblioteca API

Back-end Java com Spring Boot para o sistema de biblioteca, usando o banco PostgreSQL ja existente `biblioteca`.

## Stack

- Java 17+
- Spring Boot
- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Maven

## Configuracao

Arquivo principal:

- `src/main/resources/application.properties`

Propriedades:

- `server.port=8080`
- `spring.datasource.url=jdbc:postgresql://localhost:5432/biblioteca`
- `spring.datasource.username=postgres`
- `spring.datasource.password=${DB_PASSWORD:SUA_SENHA_AQUI}`
- `spring.jpa.hibernate.ddl-auto=none`

Voce pode definir a senha via variavel de ambiente:

```powershell
$env:DB_PASSWORD="SUA_SENHA_AQUI"
```

## Como rodar

1. Entre na pasta `backend_java`
2. Garanta que o PostgreSQL esteja ativo e que o banco `biblioteca` exista
3. Defina a senha do banco em `DB_PASSWORD` ou edite o `application.properties`
4. Execute:

```powershell
mvn spring-boot:run
```

## Endpoints

- `POST /api/auth/login`
- `POST /api/usuarios`
- `GET /api/livros`
- `GET /api/livros?busca=`
- `GET /api/livros/{id}`
- `POST /api/livros`
- `DELETE /api/livros/{id}`
- `GET /api/categorias`
- `POST /api/emprestimos`
- `GET /api/emprestimos/cliente/{id}`
- `POST /api/emprestimos/{id}/devolver`
- `GET /api/dashboard`
- `GET /api/dashboard/livros-mais-emprestados`
- `GET /api/dashboard/livros-recentes`
- `GET /api/dashboard/generos-mais-consumidos`
'@

Write-File "$backendRoot\src\main\resources\application.properties" @'
spring.application.name=biblioteca-api
server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/biblioteca
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD:SUA_SENHA_AQUI}
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false
spring.jackson.time-zone=America/Sao_Paulo
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\BibliotecaApiApplication.java" @'
package com.biblioteca.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BibliotecaApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(BibliotecaApiApplication.class, args);
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\config\CorsConfig.java" @'
package com.biblioteca.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\model\TipoUsuario.java" @'
package com.biblioteca.api.model;

public enum TipoUsuario {
    CLIENTE,
    FUNCIONARIO;

    public static TipoUsuario fromInput(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Tipo de usuario e obrigatorio.");
        }

        return TipoUsuario.valueOf(value.trim().toUpperCase());
    }

    public String toApiValue() {
        return name().toLowerCase();
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\model\StatusEmprestimo.java" @'
package com.biblioteca.api.model;

public enum StatusEmprestimo {
    ATIVO,
    DEVOLVIDO,
    ATRASADO,
    CANCELADO
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\model\Usuario.java" @'
package com.biblioteca.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @Column(name = "nome", nullable = false, length = 120)
    private String nome;

    @Column(name = "email", nullable = false, length = 120, unique = true)
    private String email;

    @Column(name = "senha_hash", nullable = false, length = 255)
    private String senhaHash;

    @Column(name = "telefone", length = 20)
    private String telefone;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario", nullable = false, length = 20)
    private TipoUsuario tipoUsuario;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "bloqueado", nullable = false)
    private Boolean bloqueado = false;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (criadoEm == null) {
            criadoEm = now;
        }
        atualizadoEm = now;
    }

    @PreUpdate
    public void preUpdate() {
        atualizadoEm = LocalDateTime.now();
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public TipoUsuario getTipoUsuario() {
        return tipoUsuario;
    }

    public void setTipoUsuario(TipoUsuario tipoUsuario) {
        this.tipoUsuario = tipoUsuario;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Boolean getBloqueado() {
        return bloqueado;
    }

    public void setBloqueado(Boolean bloqueado) {
        this.bloqueado = bloqueado;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\model\Cliente.java" @'
package com.biblioteca.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @Column(name = "id_cliente")
    private Integer idCliente;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "id_cliente")
    private Usuario usuario;

    @Column(name = "limite_emprestimos", nullable = false)
    private Integer limiteEmprestimos = 3;

    public Integer getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Integer idCliente) {
        this.idCliente = idCliente;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Integer getLimiteEmprestimos() {
        return limiteEmprestimos;
    }

    public void setLimiteEmprestimos(Integer limiteEmprestimos) {
        this.limiteEmprestimos = limiteEmprestimos;
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\model\Funcionario.java" @'
package com.biblioteca.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "funcionario")
public class Funcionario {

    @Id
    @Column(name = "id_funcionario")
    private Integer idFuncionario;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "id_funcionario")
    private Usuario usuario;

    @Column(name = "cargo", nullable = false, length = 50)
    private String cargo = "BIBLIOTECARIO";

    @Column(name = "administrador", nullable = false)
    private Boolean administrador = false;

    public Integer getIdFuncionario() {
        return idFuncionario;
    }

    public void setIdFuncionario(Integer idFuncionario) {
        this.idFuncionario = idFuncionario;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public Boolean getAdministrador() {
        return administrador;
    }

    public void setAdministrador(Boolean administrador) {
        this.administrador = administrador;
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\model\Categoria.java" @'
package com.biblioteca.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categoria")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Integer idCategoria;

    @Column(name = "nome", nullable = false, length = 80)
    private String nome;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    public Integer getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(Integer idCategoria) {
        this.idCategoria = idCategoria;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\model\Livro.java" @'
package com.biblioteca.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "livro")
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_livro")
    private Integer idLivro;

    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "autor", nullable = false, length = 150)
    private String autor;

    @Column(name = "isbn", length = 30)
    private String isbn;

    @Column(name = "descricao")
    private String descricao;

    @Column(name = "ano_publicacao")
    private Integer anoPublicacao;

    @Column(name = "paginas")
    private Integer paginas;

    @Column(name = "editora", length = 120)
    private String editora;

    @Column(name = "quantidade_total", nullable = false)
    private Integer quantidadeTotal = 1;

    @Column(name = "quantidade_disponivel", nullable = false)
    private Integer quantidadeDisponivel = 1;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @Column(name = "imagem_capa", length = 255)
    private String imagemCapa;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (criadoEm == null) {
            criadoEm = now;
        }
        atualizadoEm = now;
    }

    @PreUpdate
    public void preUpdate() {
        atualizadoEm = LocalDateTime.now();
    }

    public Integer getIdLivro() {
        return idLivro;
    }

    public void setIdLivro(Integer idLivro) {
        this.idLivro = idLivro;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Integer getAnoPublicacao() {
        return anoPublicacao;
    }

    public void setAnoPublicacao(Integer anoPublicacao) {
        this.anoPublicacao = anoPublicacao;
    }

    public Integer getPaginas() {
        return paginas;
    }

    public void setPaginas(Integer paginas) {
        this.paginas = paginas;
    }

    public String getEditora() {
        return editora;
    }

    public void setEditora(String editora) {
        this.editora = editora;
    }

    public Integer getQuantidadeTotal() {
        return quantidadeTotal;
    }

    public void setQuantidadeTotal(Integer quantidadeTotal) {
        this.quantidadeTotal = quantidadeTotal;
    }

    public Integer getQuantidadeDisponivel() {
        return quantidadeDisponivel;
    }

    public void setQuantidadeDisponivel(Integer quantidadeDisponivel) {
        this.quantidadeDisponivel = quantidadeDisponivel;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public String getImagemCapa() {
        return imagemCapa;
    }

    public void setImagemCapa(String imagemCapa) {
        this.imagemCapa = imagemCapa;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\model\Emprestimo.java" @'
package com.biblioteca.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "emprestimo")
public class Emprestimo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_emprestimo")
    private Integer idEmprestimo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_livro", nullable = false)
    private Livro livro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_funcionario")
    private Funcionario funcionario;

    @Column(name = "data_emprestimo", nullable = false)
    private LocalDate dataEmprestimo;

    @Column(name = "data_prevista_devolucao", nullable = false)
    private LocalDate dataPrevistaDevolucao;

    @Column(name = "data_devolucao")
    private LocalDate dataDevolucao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusEmprestimo status;

    @Column(name = "observacao")
    private String observacao;

    public Integer getIdEmprestimo() {
        return idEmprestimo;
    }

    public void setIdEmprestimo(Integer idEmprestimo) {
        this.idEmprestimo = idEmprestimo;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Livro getLivro() {
        return livro;
    }

    public void setLivro(Livro livro) {
        this.livro = livro;
    }

    public Funcionario getFuncionario() {
        return funcionario;
    }

    public void setFuncionario(Funcionario funcionario) {
        this.funcionario = funcionario;
    }

    public LocalDate getDataEmprestimo() {
        return dataEmprestimo;
    }

    public void setDataEmprestimo(LocalDate dataEmprestimo) {
        this.dataEmprestimo = dataEmprestimo;
    }

    public LocalDate getDataPrevistaDevolucao() {
        return dataPrevistaDevolucao;
    }

    public void setDataPrevistaDevolucao(LocalDate dataPrevistaDevolucao) {
        this.dataPrevistaDevolucao = dataPrevistaDevolucao;
    }

    public LocalDate getDataDevolucao() {
        return dataDevolucao;
    }

    public void setDataDevolucao(LocalDate dataDevolucao) {
        this.dataDevolucao = dataDevolucao;
    }

    public StatusEmprestimo getStatus() {
        return status;
    }

    public void setStatus(StatusEmprestimo status) {
        this.status = status;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\model\Multa.java" @'
package com.biblioteca.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "multa")
public class Multa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_multa")
    private Integer idMulta;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_emprestimo", nullable = false, unique = true)
    private Emprestimo emprestimo;

    @Column(name = "valor", nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "paga", nullable = false)
    private Boolean paga = false;

    @Column(name = "motivo", length = 200)
    private String motivo;

    @Column(name = "criada_em", nullable = false)
    private LocalDateTime criadaEm;

    @PrePersist
    public void prePersist() {
        if (criadaEm == null) {
            criadaEm = LocalDateTime.now();
        }
    }

    public Integer getIdMulta() {
        return idMulta;
    }

    public void setIdMulta(Integer idMulta) {
        this.idMulta = idMulta;
    }

    public Emprestimo getEmprestimo() {
        return emprestimo;
    }

    public void setEmprestimo(Emprestimo emprestimo) {
        this.emprestimo = emprestimo;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public Boolean getPaga() {
        return paga;
    }

    public void setPaga(Boolean paga) {
        this.paga = paga;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDateTime getCriadaEm() {
        return criadaEm;
    }

    public void setCriadaEm(LocalDateTime criadaEm) {
        this.criadaEm = criadaEm;
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\dto\ApiDtos.java" @'
package com.biblioteca.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class ApiDtos {

    private ApiDtos() {
    }

    public record LoginRequest(
            @NotBlank(message = "E-mail e obrigatorio.")
            @Email(message = "Informe um e-mail valido.")
            String email,
            @NotBlank(message = "Senha e obrigatoria.")
            String senha
    ) {
    }

    public record UserSummary(
            Integer id,
            String name,
            String email,
            String phone,
            String role,
            Boolean active,
            Boolean blocked,
            BigDecimal pendingFine
    ) {
    }

    public record AuthResponse(
            String token,
            UserSummary user
    ) {
    }

    public record CreateUserRequest(
            @NotBlank(message = "Nome e obrigatorio.")
            @Size(max = 120, message = "Nome deve ter no maximo 120 caracteres.")
            String name,
            @NotBlank(message = "E-mail e obrigatorio.")
            @Email(message = "Informe um e-mail valido.")
            String email,
            @NotBlank(message = "Senha e obrigatoria.")
            String password,
            @Size(max = 20, message = "Telefone deve ter no maximo 20 caracteres.")
            String phone,
            @NotBlank(message = "Tipo de usuario e obrigatorio.")
            String role
    ) {
    }

    public record RegisterResponse(
            String message,
            UserSummary user
    ) {
    }

    public record BookRequest(
            @NotBlank(message = "Titulo e obrigatorio.")
            String title,
            @NotBlank(message = "Autor e obrigatorio.")
            String author,
            String isbn,
            String description,
            Integer publishedYear,
            Integer pages,
            String publisher,
            @NotNull(message = "Quantidade total e obrigatoria.")
            @Min(value = 0, message = "Quantidade total nao pode ser negativa.")
            Integer quantityTotal,
            @Min(value = 0, message = "Quantidade disponivel nao pode ser negativa.")
            Integer availableQuantity,
            @NotNull(message = "Categoria e obrigatoria.")
            Integer categoryId,
            String coverImage
    ) {
    }

    public record BookResponse(
            Integer id,
            String title,
            String author,
            String category,
            String isbn,
            Integer pages,
            String description,
            String status,
            Integer quantityTotal,
            Integer availableQuantity,
            Integer publishedYear,
            String publisher,
            String coverImage,
            Boolean active,
            LocalDateTime createdAt,
            Long loanCount
    ) {
    }

    public record LoanRequest(
            @NotNull(message = "Cliente e obrigatorio.")
            Integer clienteId,
            @NotNull(message = "Livro e obrigatorio.")
            Integer livroId,
            Integer funcionarioId,
            @Min(value = 1, message = "Prazo minimo de 1 dia.")
            @Max(value = 60, message = "Prazo maximo de 60 dias.")
            Integer prazoDias,
            String observacao
    ) {
    }

    public record LoanItemResponse(
            Integer id,
            UserSummary client,
            BookResponse book,
            Integer funcionarioId,
            LocalDate borrowedAt,
            LocalDate dueDate,
            LocalDate returnedAt,
            String status,
            String observacao
    ) {
    }

    public record LoanListResponse(
            List<LoanItemResponse> ativos,
            List<LoanItemResponse> historico
    ) {
    }

    public record ReturnResponse(
            Integer id,
            UserSummary client,
            BookResponse book,
            Integer funcionarioId,
            LocalDate borrowedAt,
            LocalDate dueDate,
            LocalDate returnedAt,
            String status,
            String observacao,
            boolean fineApplied,
            BigDecimal fineAmount
    ) {
    }

    public record DeleteResponse(
            boolean success,
            Integer id,
            String message
    ) {
    }

    public record DashboardMetricsResponse(
            long totalBooks,
            long totalClients,
            long activeLoans,
            long overdueLoans,
            BigDecimal pendingFines
    ) {
    }

    public record ChartPointResponse(
            String label,
            long value
    ) {
    }

    public record DashboardResponse(
            DashboardMetricsResponse metrics,
            List<LoanItemResponse> recentLoans,
            List<ChartPointResponse> loansByMonth,
            ReturnsStats returnsStats
    ) {
    }

    public record ReturnsStats(
            long onTime,
            long late
    ) {
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\exception\BusinessException.java" @'
package com.biblioteca.api.exception;

public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\exception\NotFoundException.java" @'
package com.biblioteca.api.exception;

public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\exception\GlobalExceptionHandler.java" @'
package com.biblioteca.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException exception) {
        return buildResponse(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusiness(BusinessException exception) {
        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
        StringBuilder builder = new StringBuilder("Dados invalidos.");
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            builder.append(" ").append(fieldError.getDefaultMessage());
        }
        return buildResponse(HttpStatus.BAD_REQUEST, builder.toString().trim());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException exception) {
        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception exception) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno ao processar a requisicao.");
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        return ResponseEntity.status(status).body(body);
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\repository\UsuarioRepository.java" @'
package com.biblioteca.api.repository;

import com.biblioteca.api.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\repository\ClienteRepository.java" @'
package com.biblioteca.api.repository;

import com.biblioteca.api.model.Cliente;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    @EntityGraph(attributePaths = {"usuario"})
    @Query("select c from Cliente c where c.idCliente = :id")
    Optional<Cliente> findDetailedById(@Param("id") Integer id);

    @Query("select count(c) from Cliente c join c.usuario u where u.ativo = true")
    long countActiveClients();
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\repository\FuncionarioRepository.java" @'
package com.biblioteca.api.repository;

import com.biblioteca.api.model.Funcionario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Integer> {

    @EntityGraph(attributePaths = {"usuario"})
    @Query("select f from Funcionario f where f.idFuncionario = :id")
    Optional<Funcionario> findDetailedById(@Param("id") Integer id);
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\repository\CategoriaRepository.java" @'
package com.biblioteca.api.repository;

import com.biblioteca.api.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    List<Categoria> findByAtivoTrueOrderByNomeAsc();

    Optional<Categoria> findByIdCategoriaAndAtivoTrue(Integer idCategoria);
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\repository\LivroRepository.java" @'
package com.biblioteca.api.repository;

import com.biblioteca.api.model.Livro;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LivroRepository extends JpaRepository<Livro, Integer> {

    @EntityGraph(attributePaths = {"categoria"})
    @Query("""
            select l
            from Livro l
            where l.ativo = true
              and (
                :search is null
                or lower(l.titulo) like lower(concat('%', :search, '%'))
                or lower(l.autor) like lower(concat('%', :search, '%'))
                or lower(l.categoria.nome) like lower(concat('%', :search, '%'))
              )
            order by l.titulo asc
            """)
    List<Livro> findActiveBySearch(@Param("search") String search);

    @EntityGraph(attributePaths = {"categoria"})
    @Query("select l from Livro l where l.ativo = true and l.idLivro = :id")
    Optional<Livro> findActiveDetailedById(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"categoria"})
    List<Livro> findTop6ByAtivoTrueOrderByCriadoEmDesc();

    long countByAtivoTrue();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Livro l
               set l.ativo = false,
                   l.atualizadoEm = :updatedAt
             where l.idLivro = :id
               and l.ativo = true
            """)
    int softDelete(@Param("id") Integer id, @Param("updatedAt") LocalDateTime updatedAt);

    Optional<Livro> findByIdLivro(Integer idLivro);
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\repository\EmprestimoRepository.java" @'
package com.biblioteca.api.repository;

import com.biblioteca.api.model.Emprestimo;
import com.biblioteca.api.model.StatusEmprestimo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Integer> {

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario"})
    @Query("select e from Emprestimo e where e.cliente.idCliente = :clientId order by e.dataEmprestimo desc")
    List<Emprestimo> findDetailedByClientId(@Param("clientId") Integer clientId);

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario"})
    @Query("select e from Emprestimo e where e.idEmprestimo = :id")
    Optional<Emprestimo> findDetailedById(@Param("id") Integer id);

    @EntityGraph(attributePaths = {"cliente", "cliente.usuario", "livro", "livro.categoria", "funcionario", "funcionario.usuario"})
    Page<Emprestimo> findAllByOrderByDataEmprestimoDesc(Pageable pageable);

    List<Emprestimo> findAllByOrderByDataEmprestimoAsc();

    @Query("""
            select count(e)
            from Emprestimo e
            where e.cliente.idCliente = :clientId
              and e.dataDevolucao is null
              and e.status <> :cancelled
            """)
    long countOpenLoansByClientId(@Param("clientId") Integer clientId, @Param("cancelled") StatusEmprestimo cancelled);

    @Query("""
            select count(e)
            from Emprestimo e
            where e.dataDevolucao is null
              and e.status <> :cancelled
            """)
    long countActiveOpenLoans(@Param("cancelled") StatusEmprestimo cancelled);

    @Query("""
            select count(e)
            from Emprestimo e
            where e.dataDevolucao is null
              and e.dataPrevistaDevolucao < :today
              and e.status <> :cancelled
            """)
    long countOverdueOpenLoans(@Param("today") LocalDate today, @Param("cancelled") StatusEmprestimo cancelled);

    @Query("""
            select e.livro.idLivro as livroId, count(e.idEmprestimo) as total
            from Emprestimo e
            where e.livro.ativo = true
            group by e.livro.idLivro
            order by count(e.idEmprestimo) desc
            """)
    List<BookLoanCountProjection> findTopBorrowedBooks(Pageable pageable);

    @Query("""
            select e.livro.categoria.nome as label, count(e.idEmprestimo) as total
            from Emprestimo e
            where e.livro.ativo = true
            group by e.livro.categoria.nome
            order by count(e.idEmprestimo) desc
            """)
    List<CategoryConsumptionProjection> findTopGenres(Pageable pageable);

    interface BookLoanCountProjection {
        Integer getLivroId();
        long getTotal();
    }

    interface CategoryConsumptionProjection {
        String getLabel();
        long getTotal();
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\repository\MultaRepository.java" @'
package com.biblioteca.api.repository;

import com.biblioteca.api.model.Multa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface MultaRepository extends JpaRepository<Multa, Integer> {

    Optional<Multa> findByEmprestimo_IdEmprestimo(Integer idEmprestimo);

    @Query("select coalesce(sum(m.valor), 0) from Multa m where m.paga = false")
    BigDecimal sumPendingFines();

    @Query("""
            select coalesce(sum(m.valor), 0)
            from Multa m
            join m.emprestimo e
            where e.cliente.idCliente = :clientId
              and m.paga = false
            """)
    BigDecimal sumPendingFinesByClientId(@Param("clientId") Integer clientId);
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\service\AuthService.java" @'
package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.model.Usuario;
import com.biblioteca.api.repository.MultaRepository;
import com.biblioteca.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final MultaRepository multaRepository;

    public AuthService(UsuarioRepository usuarioRepository, MultaRepository multaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.multaRepository = multaRepository;
    }

    public ApiDtos.AuthResponse login(ApiDtos.LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BusinessException("E-mail ou senha invalidos."));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new BusinessException("Usuario inativo.");
        }

        if (!usuario.getSenhaHash().equals(request.senha())) {
            throw new BusinessException("E-mail ou senha invalidos.");
        }

        return new ApiDtos.AuthResponse(
                "mock-session-" + usuario.getIdUsuario(),
                toUserSummary(usuario)
        );
    }

    ApiDtos.UserSummary toUserSummary(Usuario usuario) {
        BigDecimal pendingFine = usuario.getTipoUsuario().name().equals("CLIENTE")
                ? multaRepository.sumPendingFinesByClientId(usuario.getIdUsuario())
                : BigDecimal.ZERO;

        return new ApiDtos.UserSummary(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getTipoUsuario().toApiValue(),
                usuario.getAtivo(),
                usuario.getBloqueado(),
                pendingFine
        );
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\service\UsuarioService.java" @'
package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.model.Cliente;
import com.biblioteca.api.model.Funcionario;
import com.biblioteca.api.model.TipoUsuario;
import com.biblioteca.api.model.Usuario;
import com.biblioteca.api.repository.ClienteRepository;
import com.biblioteca.api.repository.FuncionarioRepository;
import com.biblioteca.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final AuthService authService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            FuncionarioRepository funcionarioRepository,
            AuthService authService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.authService = authService;
    }

    @Transactional
    public ApiDtos.RegisterResponse cadastrar(ApiDtos.CreateUserRequest request) {
        if (usuarioRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BusinessException("Ja existe um usuario cadastrado com este e-mail.");
        }

        TipoUsuario tipoUsuario = TipoUsuario.fromInput(request.role());

        Usuario usuario = new Usuario();
        usuario.setNome(request.name().trim());
        usuario.setEmail(request.email().trim().toLowerCase());
        usuario.setSenhaHash(request.password());
        usuario.setTelefone(request.phone());
        usuario.setTipoUsuario(tipoUsuario);
        usuario.setAtivo(true);
        usuario.setBloqueado(false);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        if (tipoUsuario == TipoUsuario.CLIENTE) {
            Cliente cliente = new Cliente();
            cliente.setUsuario(usuarioSalvo);
            cliente.setLimiteEmprestimos(3);
            clienteRepository.save(cliente);
        } else {
            Funcionario funcionario = new Funcionario();
            funcionario.setUsuario(usuarioSalvo);
            funcionario.setCargo("BIBLIOTECARIO");
            funcionario.setAdministrador(false);
            funcionarioRepository.save(funcionario);
        }

        return new ApiDtos.RegisterResponse(
                "Cadastro realizado com sucesso.",
                authService.toUserSummary(usuarioSalvo)
        );
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\service\CategoriaService.java" @'
package com.biblioteca.api.service;

import com.biblioteca.api.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<String> listarCategorias() {
        return categoriaRepository.findByAtivoTrueOrderByNomeAsc()
                .stream()
                .map(categoria -> categoria.getNome())
                .toList();
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\service\LivroService.java" @'
package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.exception.NotFoundException;
import com.biblioteca.api.model.Categoria;
import com.biblioteca.api.model.Livro;
import com.biblioteca.api.repository.CategoriaRepository;
import com.biblioteca.api.repository.EmprestimoRepository;
import com.biblioteca.api.repository.LivroRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LivroService {

    private final LivroRepository livroRepository;
    private final CategoriaRepository categoriaRepository;
    private final EmprestimoRepository emprestimoRepository;

    public LivroService(
            LivroRepository livroRepository,
            CategoriaRepository categoriaRepository,
            EmprestimoRepository emprestimoRepository
    ) {
        this.livroRepository = livroRepository;
        this.categoriaRepository = categoriaRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    public List<ApiDtos.BookResponse> listarLivros(String busca) {
        String search = normalizeSearch(busca);
        return livroRepository.findActiveBySearch(search)
                .stream()
                .map(livro -> toBookResponse(livro, 0L))
                .toList();
    }

    public ApiDtos.BookResponse detalharLivro(Integer id) {
        Livro livro = livroRepository.findActiveDetailedById(id)
                .orElseThrow(() -> new NotFoundException("Livro nao encontrado."));
        return toBookResponse(livro, 0L);
    }

    @Transactional
    public ApiDtos.BookResponse adicionarLivro(ApiDtos.BookRequest request) {
        Categoria categoria = categoriaRepository.findByIdCategoriaAndAtivoTrue(request.categoryId())
                .orElseThrow(() -> new NotFoundException("Categoria nao encontrada."));

        int quantidadeTotal = request.quantityTotal() == null ? 0 : request.quantityTotal();
        int quantidadeDisponivel = request.availableQuantity() == null ? quantidadeTotal : request.availableQuantity();

        if (quantidadeDisponivel > quantidadeTotal) {
            throw new BusinessException("Quantidade disponivel nao pode ser maior que a quantidade total.");
        }

        Livro livro = new Livro();
        livro.setTitulo(request.title().trim());
        livro.setAutor(request.author().trim());
        livro.setIsbn(request.isbn());
        livro.setDescricao(request.description());
        livro.setAnoPublicacao(request.publishedYear());
        livro.setPaginas(request.pages());
        livro.setEditora(request.publisher());
        livro.setQuantidadeTotal(quantidadeTotal);
        livro.setQuantidadeDisponivel(quantidadeDisponivel);
        livro.setCategoria(categoria);
        livro.setImagemCapa(request.coverImage());
        livro.setAtivo(true);

        Livro salvo = livroRepository.save(livro);
        return toBookResponse(salvo, 0L);
    }

    @Transactional
    public ApiDtos.DeleteResponse excluirLivro(Integer id) {
        int updated = livroRepository.softDelete(id, LocalDateTime.now());
        if (updated == 0) {
            throw new NotFoundException("Livro nao encontrado.");
        }

        return new ApiDtos.DeleteResponse(true, id, "Livro excluido logicamente com sucesso.");
    }

    public List<ApiDtos.BookResponse> listarLivrosRecentes() {
        return livroRepository.findTop6ByAtivoTrueOrderByCriadoEmDesc()
                .stream()
                .map(livro -> toBookResponse(livro, 0L))
                .toList();
    }

    public List<ApiDtos.BookResponse> listarLivrosMaisEmprestados() {
        List<EmprestimoRepository.BookLoanCountProjection> ranking =
                emprestimoRepository.findTopBorrowedBooks(PageRequest.of(0, 6));

        Map<Integer, Long> countsByBookId = ranking.stream()
                .collect(Collectors.toMap(EmprestimoRepository.BookLoanCountProjection::getLivroId, EmprestimoRepository.BookLoanCountProjection::getTotal));

        Map<Integer, Livro> booksById = new HashMap<>();
        for (Integer bookId : countsByBookId.keySet()) {
            livroRepository.findActiveDetailedById(bookId).ifPresent(livro -> booksById.put(bookId, livro));
        }

        return ranking.stream()
                .map(item -> booksById.containsKey(item.getLivroId())
                        ? toBookResponse(booksById.get(item.getLivroId()), item.getTotal())
                        : null)
                .filter(item -> item != null)
                .toList();
    }

    ApiDtos.BookResponse toBookResponse(Livro livro, Long loanCount) {
        return new ApiDtos.BookResponse(
                livro.getIdLivro(),
                livro.getTitulo(),
                livro.getAutor(),
                livro.getCategoria().getNome(),
                livro.getIsbn(),
                livro.getPaginas(),
                livro.getDescricao(),
                determineStatus(livro),
                livro.getQuantidadeTotal(),
                livro.getQuantidadeDisponivel(),
                livro.getAnoPublicacao(),
                livro.getEditora(),
                livro.getImagemCapa(),
                livro.getAtivo(),
                livro.getCriadoEm(),
                loanCount == null ? 0L : loanCount
        );
    }

    private String normalizeSearch(String busca) {
        if (busca == null) {
            return null;
        }

        String normalized = busca.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String determineStatus(Livro livro) {
        if (!Boolean.TRUE.equals(livro.getAtivo())) {
            return "indisponivel";
        }
        return livro.getQuantidadeDisponivel() != null && livro.getQuantidadeDisponivel() > 0
                ? "disponivel"
                : "indisponivel";
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\service\EmprestimoService.java" @'
package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.exception.BusinessException;
import com.biblioteca.api.exception.NotFoundException;
import com.biblioteca.api.model.Cliente;
import com.biblioteca.api.model.Emprestimo;
import com.biblioteca.api.model.Funcionario;
import com.biblioteca.api.model.Livro;
import com.biblioteca.api.model.Multa;
import com.biblioteca.api.model.StatusEmprestimo;
import com.biblioteca.api.model.Usuario;
import com.biblioteca.api.repository.ClienteRepository;
import com.biblioteca.api.repository.EmprestimoRepository;
import com.biblioteca.api.repository.FuncionarioRepository;
import com.biblioteca.api.repository.LivroRepository;
import com.biblioteca.api.repository.MultaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class EmprestimoService {

    private static final int DEFAULT_PRAZO_DIAS = 15;
    private static final BigDecimal MULTA_DIARIA = new BigDecimal("2.50");

    private final ClienteRepository clienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final LivroRepository livroRepository;
    private final EmprestimoRepository emprestimoRepository;
    private final MultaRepository multaRepository;
    private final LivroService livroService;
    private final AuthService authService;

    public EmprestimoService(
            ClienteRepository clienteRepository,
            FuncionarioRepository funcionarioRepository,
            LivroRepository livroRepository,
            EmprestimoRepository emprestimoRepository,
            MultaRepository multaRepository,
            LivroService livroService,
            AuthService authService
    ) {
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.livroRepository = livroRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.multaRepository = multaRepository;
        this.livroService = livroService;
        this.authService = authService;
    }

    @Transactional
    public ApiDtos.LoanItemResponse registrarEmprestimo(ApiDtos.LoanRequest request) {
        Cliente cliente = clienteRepository.findDetailedById(request.clienteId())
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado."));

        Livro livro = livroRepository.findActiveDetailedById(request.livroId())
                .orElseThrow(() -> new NotFoundException("Livro nao encontrado."));

        Funcionario funcionario = null;
        if (request.funcionarioId() != null) {
            funcionario = funcionarioRepository.findDetailedById(request.funcionarioId())
                    .orElseThrow(() -> new NotFoundException("Funcionario nao encontrado."));
        }

        validateCliente(cliente);
        validateLivro(livro);

        long openLoans = emprestimoRepository.countOpenLoansByClientId(cliente.getIdCliente(), StatusEmprestimo.CANCELADO);
        if (openLoans >= cliente.getLimiteEmprestimos()) {
            throw new BusinessException("Cliente atingiu o limite de emprestimos.");
        }

        Emprestimo emprestimo = new Emprestimo();
        emprestimo.setCliente(cliente);
        emprestimo.setLivro(livro);
        emprestimo.setFuncionario(funcionario);
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataPrevistaDevolucao(LocalDate.now().plusDays(request.prazoDias() == null ? DEFAULT_PRAZO_DIAS : request.prazoDias()));
        emprestimo.setStatus(StatusEmprestimo.ATIVO);
        emprestimo.setObservacao(request.observacao());

        livro.setQuantidadeDisponivel(livro.getQuantidadeDisponivel() - 1);
        emprestimoRepository.save(emprestimo);
        livroRepository.save(livro);

        return toLoanItemResponse(emprestimo);
    }

    public ApiDtos.LoanListResponse listarPorCliente(Integer clienteId) {
        clienteRepository.findDetailedById(clienteId)
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado."));

        List<ApiDtos.LoanItemResponse> loans = emprestimoRepository.findDetailedByClientId(clienteId)
                .stream()
                .map(this::toLoanItemResponse)
                .toList();

        List<ApiDtos.LoanItemResponse> ativos = loans.stream()
                .filter(item -> item.returnedAt() == null)
                .toList();

        List<ApiDtos.LoanItemResponse> historico = loans.stream()
                .filter(item -> item.returnedAt() != null)
                .toList();

        return new ApiDtos.LoanListResponse(ativos, historico);
    }

    @Transactional
    public ApiDtos.ReturnResponse registrarDevolucao(Integer emprestimoId) {
        Emprestimo emprestimo = emprestimoRepository.findDetailedById(emprestimoId)
                .orElseThrow(() -> new NotFoundException("Emprestimo nao encontrado."));

        if (emprestimo.getDataDevolucao() != null) {
            throw new BusinessException("Este emprestimo ja foi finalizado.");
        }

        LocalDate today = LocalDate.now();
        boolean late = today.isAfter(emprestimo.getDataPrevistaDevolucao());
        BigDecimal fineAmount = BigDecimal.ZERO;

        emprestimo.setDataDevolucao(today);
        emprestimo.setStatus(StatusEmprestimo.DEVOLVIDO);

        Livro livro = emprestimo.getLivro();
        int currentAvailable = livro.getQuantidadeDisponivel() == null ? 0 : livro.getQuantidadeDisponivel();
        int maxTotal = livro.getQuantidadeTotal() == null ? currentAvailable + 1 : livro.getQuantidadeTotal();
        livro.setQuantidadeDisponivel(Math.min(maxTotal, currentAvailable + 1));

        if (late) {
            long daysLate = ChronoUnit.DAYS.between(emprestimo.getDataPrevistaDevolucao(), today);
            fineAmount = MULTA_DIARIA.multiply(BigDecimal.valueOf(daysLate)).setScale(2, RoundingMode.HALF_UP);

            Multa multa = multaRepository.findByEmprestimo_IdEmprestimo(emprestimoId)
                    .orElseGet(Multa::new);
            multa.setEmprestimo(emprestimo);
            multa.setPaga(false);
            multa.setValor(fineAmount);
            multa.setMotivo("Atraso na devolucao do livro.");
            multaRepository.save(multa);
        }

        emprestimoRepository.save(emprestimo);
        livroRepository.save(livro);

        ApiDtos.LoanItemResponse item = toLoanItemResponse(emprestimo);
        return new ApiDtos.ReturnResponse(
                item.id(),
                item.client(),
                item.book(),
                item.funcionarioId(),
                item.borrowedAt(),
                item.dueDate(),
                item.returnedAt(),
                item.status(),
                item.observacao(),
                late,
                fineAmount
        );
    }

    ApiDtos.LoanItemResponse toLoanItemResponse(Emprestimo emprestimo) {
        Usuario usuarioCliente = emprestimo.getCliente().getUsuario();
        ApiDtos.UserSummary client = authService.toUserSummary(usuarioCliente);
        ApiDtos.BookResponse book = livroService.toBookResponse(emprestimo.getLivro(), 0L);

        Integer funcionarioId = emprestimo.getFuncionario() != null ? emprestimo.getFuncionario().getIdFuncionario() : null;

        return new ApiDtos.LoanItemResponse(
                emprestimo.getIdEmprestimo(),
                client,
                book,
                funcionarioId,
                emprestimo.getDataEmprestimo(),
                emprestimo.getDataPrevistaDevolucao(),
                emprestimo.getDataDevolucao(),
                resolveVisualStatus(emprestimo),
                emprestimo.getObservacao()
        );
    }

    private void validateCliente(Cliente cliente) {
        Usuario usuario = cliente.getUsuario();
        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new BusinessException("Cliente inativo.");
        }
        if (Boolean.TRUE.equals(usuario.getBloqueado())) {
            throw new BusinessException("Cliente bloqueado.");
        }

        BigDecimal pendingFines = multaRepository.sumPendingFinesByClientId(cliente.getIdCliente());
        if (pendingFines.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Cliente possui multa pendente.");
        }
    }

    private void validateLivro(Livro livro) {
        if (!Boolean.TRUE.equals(livro.getAtivo())) {
            throw new BusinessException("Livro inativo.");
        }
        if (livro.getQuantidadeDisponivel() == null || livro.getQuantidadeDisponivel() <= 0) {
            throw new BusinessException("Livro indisponivel.");
        }
    }

    private String resolveVisualStatus(Emprestimo emprestimo) {
        LocalDate baseDate = emprestimo.getDataDevolucao() != null ? emprestimo.getDataDevolucao() : LocalDate.now();
        long diffDays = ChronoUnit.DAYS.between(baseDate, emprestimo.getDataPrevistaDevolucao());

        if (diffDays < 0) {
            return "Atrasado";
        }
        if (diffDays <= 2) {
            return "Devolucao breve";
        }
        return "Dentro do prazo";
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\service\DashboardService.java" @'
package com.biblioteca.api.service;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.model.Emprestimo;
import com.biblioteca.api.model.StatusEmprestimo;
import com.biblioteca.api.repository.ClienteRepository;
import com.biblioteca.api.repository.EmprestimoRepository;
import com.biblioteca.api.repository.LivroRepository;
import com.biblioteca.api.repository.MultaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class DashboardService {

    private final LivroRepository livroRepository;
    private final ClienteRepository clienteRepository;
    private final EmprestimoRepository emprestimoRepository;
    private final MultaRepository multaRepository;
    private final EmprestimoService emprestimoService;
    private final LivroService livroService;

    public DashboardService(
            LivroRepository livroRepository,
            ClienteRepository clienteRepository,
            EmprestimoRepository emprestimoRepository,
            MultaRepository multaRepository,
            EmprestimoService emprestimoService,
            LivroService livroService
    ) {
        this.livroRepository = livroRepository;
        this.clienteRepository = clienteRepository;
        this.emprestimoRepository = emprestimoRepository;
        this.multaRepository = multaRepository;
        this.emprestimoService = emprestimoService;
        this.livroService = livroService;
    }

    public ApiDtos.DashboardResponse carregarDashboard() {
        long totalBooks = livroRepository.countByAtivoTrue();
        long totalClients = clienteRepository.countActiveClients();
        long activeLoans = emprestimoRepository.countActiveOpenLoans(StatusEmprestimo.CANCELADO);
        long overdueLoans = emprestimoRepository.countOverdueOpenLoans(LocalDate.now(), StatusEmprestimo.CANCELADO);
        BigDecimal pendingFines = multaRepository.sumPendingFines();

        List<ApiDtos.LoanItemResponse> recentLoans = emprestimoRepository.findAllByOrderByDataEmprestimoDesc(PageRequest.of(0, 4))
                .stream()
                .map(emprestimoService::toLoanItemResponse)
                .toList();

        List<ApiDtos.ChartPointResponse> loansByMonth = buildLoansByMonth();
        ApiDtos.ReturnsStats returnsStats = buildReturnsStats();

        return new ApiDtos.DashboardResponse(
                new ApiDtos.DashboardMetricsResponse(totalBooks, totalClients, activeLoans, overdueLoans, pendingFines),
                recentLoans,
                loansByMonth,
                returnsStats
        );
    }

    public List<ApiDtos.BookResponse> listarLivrosMaisEmprestados() {
        return livroService.listarLivrosMaisEmprestados();
    }

    public List<ApiDtos.BookResponse> listarLivrosRecentes() {
        return livroService.listarLivrosRecentes();
    }

    public List<ApiDtos.ChartPointResponse> listarGenerosMaisConsumidos() {
        return emprestimoRepository.findTopGenres(PageRequest.of(0, 6))
                .stream()
                .map(item -> new ApiDtos.ChartPointResponse(item.getLabel(), item.getTotal()))
                .toList();
    }

    private List<ApiDtos.ChartPointResponse> buildLoansByMonth() {
        Locale locale = Locale.forLanguageTag("pt-BR");
        Map<String, Long> counters = new LinkedHashMap<>();

        for (Emprestimo emprestimo : emprestimoRepository.findAllByOrderByDataEmprestimoAsc()) {
            String label = emprestimo.getDataEmprestimo()
                    .getMonth()
                    .getDisplayName(TextStyle.SHORT, locale)
                    .replace(".", "");
            counters.put(label, counters.getOrDefault(label, 0L) + 1);
        }

        return counters.entrySet()
                .stream()
                .map(entry -> new ApiDtos.ChartPointResponse(entry.getKey(), entry.getValue()))
                .toList();
    }

    private ApiDtos.ReturnsStats buildReturnsStats() {
        long onTime = 0;
        long late = 0;

        for (Emprestimo emprestimo : emprestimoRepository.findAll()) {
            if (emprestimo.getDataDevolucao() == null) {
                continue;
            }

            if (emprestimo.getDataDevolucao().isAfter(emprestimo.getDataPrevistaDevolucao())) {
                late++;
            } else {
                onTime++;
            }
        }

        return new ApiDtos.ReturnsStats(onTime, late);
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\controller\AuthController.java" @'
package com.biblioteca.api.controller;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiDtos.AuthResponse> login(@Valid @RequestBody ApiDtos.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\controller\UsuarioController.java" @'
package com.biblioteca.api.controller;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<ApiDtos.RegisterResponse> cadastrar(@Valid @RequestBody ApiDtos.CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.cadastrar(request));
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\controller\LivroController.java" @'
package com.biblioteca.api.controller;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.service.LivroService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    private final LivroService livroService;

    public LivroController(LivroService livroService) {
        this.livroService = livroService;
    }

    @GetMapping
    public ResponseEntity<List<ApiDtos.BookResponse>> listar(@RequestParam(value = "busca", required = false) String busca) {
        return ResponseEntity.ok(livroService.listarLivros(busca));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiDtos.BookResponse> detalhar(@PathVariable Integer id) {
        return ResponseEntity.ok(livroService.detalharLivro(id));
    }

    @PostMapping
    public ResponseEntity<ApiDtos.BookResponse> adicionar(@Valid @RequestBody ApiDtos.BookRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(livroService.adicionarLivro(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiDtos.DeleteResponse> excluir(@PathVariable Integer id) {
        return ResponseEntity.ok(livroService.excluirLivro(id));
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\controller\CategoriaController.java" @'
package com.biblioteca.api.controller;

import com.biblioteca.api.service.CategoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<String>> listar() {
        return ResponseEntity.ok(categoriaService.listarCategorias());
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\controller\EmprestimoController.java" @'
package com.biblioteca.api.controller;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.service.EmprestimoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final EmprestimoService emprestimoService;

    public EmprestimoController(EmprestimoService emprestimoService) {
        this.emprestimoService = emprestimoService;
    }

    @PostMapping
    public ResponseEntity<ApiDtos.LoanItemResponse> solicitar(@Valid @RequestBody ApiDtos.LoanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(emprestimoService.registrarEmprestimo(request));
    }

    @GetMapping("/cliente/{id}")
    public ResponseEntity<ApiDtos.LoanListResponse> listarPorCliente(@PathVariable Integer id) {
        return ResponseEntity.ok(emprestimoService.listarPorCliente(id));
    }

    @PostMapping("/{id}/devolver")
    public ResponseEntity<ApiDtos.ReturnResponse> devolver(@PathVariable Integer id) {
        return ResponseEntity.ok(emprestimoService.registrarDevolucao(id));
    }
}
'@

Write-File "$backendRoot\src\main\java\com\biblioteca\api\controller\DashboardController.java" @'
package com.biblioteca.api.controller;

import com.biblioteca.api.dto.ApiDtos;
import com.biblioteca.api.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiDtos.DashboardResponse> dashboard() {
        return ResponseEntity.ok(dashboardService.carregarDashboard());
    }

    @GetMapping("/livros-mais-emprestados")
    public ResponseEntity<List<ApiDtos.BookResponse>> livrosMaisEmprestados() {
        return ResponseEntity.ok(dashboardService.listarLivrosMaisEmprestados());
    }

    @GetMapping("/livros-recentes")
    public ResponseEntity<List<ApiDtos.BookResponse>> livrosRecentes() {
        return ResponseEntity.ok(dashboardService.listarLivrosRecentes());
    }

    @GetMapping("/generos-mais-consumidos")
    public ResponseEntity<List<ApiDtos.ChartPointResponse>> generosMaisConsumidos() {
        return ResponseEntity.ok(dashboardService.listarGenerosMaisConsumidos());
    }
}
'@
