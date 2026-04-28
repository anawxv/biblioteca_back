import { useEffect, useState } from "react";
import { TopBar } from "../components/TopBar";
import { adicionarLivro, listarCategorias } from "../services/api";

const initialForm = {
  title: "",
  author: "",
  category: "Romance",
  isbn: "",
  pages: "",
  description: "",
  publishedYear: "",
  publisher: "",
  shelf: "",
  quantity: "1",
  coverImage: "",
  status: "disponivel",
  coverStart: "#FF66B3",
  coverEnd: "#FF4DA6",
};

export function AddBookPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listarCategorias().then(setCategories);
  }, []);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      await adicionarLivro({
        ...form,
        coverColors: [form.coverStart, form.coverEnd],
      });
      setFeedback({ type: "success", message: "Livro salvo com sucesso." });
      setForm(initialForm);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page page-with-nav">
      <TopBar title="Adicionar livro" subtitle="Cadastre novos títulos no acervo" />

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <input className="input" placeholder="Título" value={form.title} onChange={(event) => updateField("title", event.target.value)} />
        <input className="input" placeholder="Autor" value={form.author} onChange={(event) => updateField("author", event.target.value)} />
        <select className="input" value={form.category} onChange={(event) => updateField("category", event.target.value)}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input className="input" placeholder="ISBN" value={form.isbn} onChange={(event) => updateField("isbn", event.target.value)} />
        <input className="input" min="1" placeholder="Páginas" type="number" value={form.pages} onChange={(event) => updateField("pages", event.target.value)} />
        <input className="input" placeholder="Ano de publicação" value={form.publishedYear} onChange={(event) => updateField("publishedYear", event.target.value)} />
        <input className="input" placeholder="Editora" value={form.publisher} onChange={(event) => updateField("publisher", event.target.value)} />
        <input className="input" placeholder="Estante / localização" value={form.shelf} onChange={(event) => updateField("shelf", event.target.value)} />
        <input className="input" min="1" placeholder="Quantidade total" type="number" value={form.quantity} onChange={(event) => updateField("quantity", event.target.value)} />
        <input className="input" placeholder="Imagem da capa (URL)" value={form.coverImage} onChange={(event) => updateField("coverImage", event.target.value)} />
        <textarea className="input textarea" placeholder="Descrição" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
        <div className="color-fields">
          <label>
            Cor da capa 1
            <input className="color-input" type="color" value={form.coverStart} onChange={(event) => updateField("coverStart", event.target.value)} />
          </label>
          <label>
            Cor da capa 2
            <input className="color-input" type="color" value={form.coverEnd} onChange={(event) => updateField("coverEnd", event.target.value)} />
          </label>
        </div>

        {feedback ? (
          <div className={`alert alert--${feedback.type === "success" ? "success" : "error"}`}>
            {feedback.message}
          </div>
        ) : null}

        <button className="button" disabled={submitting} type="submit">
          {submitting ? "Salvando..." : "Salvar livro"}
        </button>
      </form>
    </main>
  );
}
