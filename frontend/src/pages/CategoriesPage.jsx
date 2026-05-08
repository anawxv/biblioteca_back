import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { HeroIllustration } from "../components/HeroIllustration";
import { TopBar } from "../components/TopBar";
import { CATEGORY_NAMES, listarCategorias } from "../services/api";
import { slugifyCategory } from "./CategoryPage";

export function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      setFeedback("");

      try {
        const response = await listarCategorias();
        setCategories(response.length ? response : CATEGORY_NAMES.map((name, index) => ({ id: index + 1, name })));
      } catch (error) {
        setFeedback(error.message);
        setCategories(CATEGORY_NAMES.map((name, index) => ({ id: index + 1, name })));
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <main className="page page-with-nav">
      <TopBar title="Categorias" />

      <section className="panel panel--soft panel--centered">
        <HeroIllustration compact />
      </section>

      {feedback ? <div className="alert alert--error">{feedback}</div> : null}

      {loading ? (
        <section className="panel">Carregando categorias...</section>
      ) : categories.length ? (
        <section className="category-grid">
          {categories.map((category) => (
            <button
              key={`${category.id}-${category.name}`}
              className="category-card"
              onClick={() => navigate(`/cliente/categorias/${slugifyCategory(category.name)}`)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </section>
      ) : (
        <EmptyState
          title="Nenhuma categoria encontrada"
          description="As categorias cadastradas no banco aparecerão aqui."
        />
      )}
    </main>
  );
}
