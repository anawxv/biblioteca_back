import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AddBookPage } from "./pages/AddBookPage";
import { BookDetailsPage } from "./pages/BookDetailsPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { LandingPage } from "./pages/LandingPage";
import { LibrarianDashboardPage } from "./pages/LibrarianDashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { MyLoansPage } from "./pages/MyLoansPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterLoanPage } from "./pages/RegisterLoanPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RegisterReturnPage } from "./pages/RegisterReturnPage";
import { RemoveBookPage } from "./pages/RemoveBookPage";

function AppFrame() {
  const location = useLocation();
  const showCustomerNav = location.pathname.startsWith("/cliente");
  const showAdminNav = location.pathname.startsWith("/funcionario");

  return (
    <div className="desktop-shell">
      <div className="app-shell">
        <Outlet />
        {(showCustomerNav || showAdminNav) && <BottomNav isAdmin={showAdminNav} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppFrame />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />

        <Route element={<ProtectedRoute allowedRoles={["cliente"]} />}>
          <Route path="/cliente/catalogo" element={<CatalogPage />} />
          <Route path="/cliente/categorias" element={<CategoriesPage />} />
          <Route path="/cliente/livros/:id" element={<BookDetailsPage />} />
          <Route path="/cliente/emprestimos" element={<MyLoansPage />} />
          <Route path="/cliente/perfil" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["funcionario"]} />}>
          <Route path="/funcionario/painel" element={<LibrarianDashboardPage />} />
          <Route path="/funcionario/dashboard" element={<LibrarianDashboardPage initialSection="dashboard" />} />
          <Route path="/funcionario/gerenciar-livros" element={<LibrarianDashboardPage initialSection="livros" />} />
          <Route path="/funcionario/adicionar-livro" element={<AddBookPage />} />
          <Route path="/funcionario/remover-livro" element={<RemoveBookPage />} />
          <Route path="/funcionario/controlar-emprestimos" element={<LibrarianDashboardPage initialSection="emprestimos" />} />
          <Route path="/funcionario/registrar-emprestimo" element={<RegisterLoanPage />} />
          <Route path="/funcionario/registrar-devolucao" element={<RegisterReturnPage />} />
          <Route path="/funcionario/emprestimos-recentes" element={<LibrarianDashboardPage initialSection="recentes" />} />
        </Route>

        <Route path="/catalogo" element={<Navigate to="/cliente/catalogo" replace />} />
        <Route path="/categorias" element={<Navigate to="/cliente/categorias" replace />} />
        <Route path="/livro/:id" element={<Navigate to="/cliente/catalogo" replace />} />
        <Route path="/emprestimos" element={<Navigate to="/cliente/emprestimos" replace />} />
        <Route path="/perfil" element={<Navigate to="/cliente/perfil" replace />} />
        <Route path="/funcionario" element={<Navigate to="/funcionario/painel" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
