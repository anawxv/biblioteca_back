import { NavLink } from "react-router-dom";

const customerItems = [
  { to: "/catalogo", label: "Catálogo", icon: "⌂" },
  { to: "/categorias", label: "Categorias", icon: "▦" },
  { to: "/emprestimos", label: "Empréstimos", icon: "◫" },
  { to: "/perfil", label: "Perfil", icon: "◌" },
];

const adminItems = [
  { to: "/funcionario", label: "Painel", icon: "⌂" },
  { to: "/funcionario/adicionar-livro", label: "Adicionar", icon: "+" },
  { to: "/funcionario/remover-livro", label: "Remover", icon: "−" },
  { to: "/funcionario/registrar-devolucao", label: "Devolução", icon: "↺" },
];

export function BottomNav({ isAdmin = false }) {
  const items = isAdmin ? adminItems : customerItems;

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `bottom-nav__item${isActive ? " bottom-nav__item--active" : ""}`
          }
        >
          <span className="bottom-nav__icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
