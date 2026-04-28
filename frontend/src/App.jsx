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
  const showCustomerNav = ["/catalogo", "/categorias", "/emprestimos", "/perfil"].some((path) =>
    location.pathname.startsWith(path),
  );
  const showAdminNav = [
    "/funcionario",
    "/funcionario/adicionar-livro",
    "/funcionario/remover-livro",
    "/funcionario/registrar-emprestimo",
    "/funcionario/registrar-devolucao",
  ].some((path) => location.pathname.startsWith(path));

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
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/livro/:id" element={<BookDetailsPage />} />
          <Route path="/emprestimos" element={<MyLoansPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["funcionario"]} />}>
          <Route path="/funcionario" element={<LibrarianDashboardPage />} />
          <Route path="/funcionario/adicionar-livro" element={<AddBookPage />} />
          <Route path="/funcionario/remover-livro" element={<RemoveBookPage />} />
          <Route
            path="/funcionario/registrar-emprestimo"
            element={<RegisterLoanPage />}
          />
          <Route
            path="/funcionario/registrar-devolucao"
            element={<RegisterReturnPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
