USE [master]
GO
CREATE LOGIN [usuario_biblioteca] WITH PASSWORD=N'Senha123', DEFAULT_DATABASE=[BibliotecaDB], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF
GO
USE [BibliotecaDB]
GO
CREATE USER [usuario_biblioteca] FOR LOGIN [usuario_biblioteca]
GO
ALTER ROLE [db_owner] ADD MEMBER [usuario_biblioteca]
GO