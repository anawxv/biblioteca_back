import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeroIllustration } from "../components/HeroIllustration";
import { TopBar } from "../components/TopBar";
import { listarCategorias } from "../services/api";

export function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    listarCategorias().then(setCategories);
  }, []);

  return (
    <main className="page page-with-nav">
      <TopBar title="Categorias" />

      <section className="panel panel--soft panel--centered">
        <HeroIllustration compact />
      </section>

      <section className="category-grid">
        {categories.map((category) => (
          <button
            key={category}
            className="category-card"
            onClick={() => navigate(`/catalogo?categoria=${encodeURIComponent(category)}`)}
            type="button"
          >
            {category}
          </button>
        ))}
      </section>
    </main>
  );
}
