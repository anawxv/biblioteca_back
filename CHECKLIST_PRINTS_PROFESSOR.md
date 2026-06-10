# Checklist de prints para apresentar ao professor

Tire os prints nesta ordem para contar a historia do sistema funcionando de ponta a ponta.

## Banco e configuracao

1. pgAdmin mostrando o banco `biblioteca`.
2. Lista de tabelas: `usuario`, `cliente`, `funcionario`, `categoria`, `livro`, `emprestimo`, `multa`, `favorito`, `reserva`, `historico_livro`, `codigo_funcionario`.
3. `application.properties` com `ddl-auto=none`, porta 8080 e URL PostgreSQL.
4. Terminal do backend rodando com `.\mvnw.cmd spring-boot:run`.
5. Terminal do frontend rodando com `npm run dev`.

## Login e perfis

6. Tela inicial com escolha de cliente/funcionario.
7. Login de cliente bem-sucedido.
8. Area do cliente aberta apos login.
9. Logout funcionando.
10. Login de funcionario bem-sucedido.
11. Area do funcionario aberta apos login.

## Area do cliente

12. Catalogo com livros ativos.
13. Busca por titulo.
14. Busca por autor.
15. Busca por categoria.
16. Tela de categorias.
17. Detalhes de um livro.
18. Solicitacao/registro de emprestimo de livro disponivel.
19. Meus emprestimos ativos.
20. Historico de emprestimos.
21. Perfil do cliente.

## Area do funcionario

22. Painel do bibliotecario com cards de metricas.
23. Grafico circular de generos mais consumidos.
24. Grafico de barras de livros mais emprestados.
25. Grafico mensal de emprestimos.
26. Grafico de devolucoes no prazo x atrasadas.
27. Tela de gerenciar livros.
28. Formulario de adicionar livro.
29. Edicao de livro.
30. Exclusao logica de livro.
31. Historico de acoes do livro.
32. Registrar emprestimo.
33. Registrar devolucao.
34. Consultar atrasos.
35. Consultar clientes.
36. Lista de multas pendentes, se houver.

## Provas no banco

37. `SELECT` no livro criado/editado.
38. `SELECT` mostrando `ativo=false` apos exclusao logica.
39. `SELECT` em `historico_livro` com `EXCLUIDO_LOGICAMENTE`.
40. `SELECT` em `emprestimo` apos registrar emprestimo.
41. `SELECT` em `livro` mostrando estoque reduzido.
42. `SELECT` em `emprestimo` apos devolucao com `data_devolucao`.
43. `SELECT` em `livro` mostrando estoque aumentado.
44. `SELECT` em `multa` mostrando valor de atraso, se testado.
45. `SELECT * FROM vw_dashboard_resumo`.

## Builds e entrega

46. Terminal com backend passando: `.\mvnw.cmd -q -DskipTests package`.
47. Terminal com frontend passando: `npm.cmd run build`.
48. Estrutura de pastas do projeto: `backend_java`, `frontend`, `banco_de_dados`.
49. Arquivo `TESTES_CRONOGRAMA.md`.
50. Este checklist aberto.
