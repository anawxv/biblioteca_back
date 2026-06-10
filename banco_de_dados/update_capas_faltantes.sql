-- Atualização de capas faltantes (somente imagem_capa).
-- Open Library (ISBN/id) → Google Books → fallback rosa no front-end.

BEGIN;

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788501112514-L.jpg'
WHERE titulo = 'É Assim que Acaba'
  AND autor = 'Colleen Hoover'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788580573299-L.jpg'
WHERE titulo = 'Como Eu Era Antes de Você'
  AND autor = 'Jojo Moyes'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788532530783-L.jpg'
WHERE titulo = 'Harry Potter e a Pedra Filosofal'
  AND autor = 'J. K. Rowling'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788595084742-L.jpg'
WHERE titulo = 'O Hobbit'
  AND autor = 'J. R. R. Tolkien'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788595084759-L.jpg'
WHERE titulo = 'A Sociedade do Anel'
  AND autor = 'J. R. R. Tolkien'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788578270698-L.jpg'
WHERE titulo = 'As Crônicas de Nárnia'
  AND autor = 'C. S. Lewis'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788556510785-L.jpg'
WHERE titulo = 'A Guerra dos Tronos'
  AND autor = 'George R. R. Martin'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788537812785-L.jpg'
WHERE titulo = 'As Minas do Rei Salomão'
  AND autor = 'H. Rider Haggard'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788576573135-L.jpg'
WHERE titulo = 'Duna'
  AND autor = 'Frank Herbert'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788535914849-L.jpg'
WHERE titulo = '1984'
  AND autor = 'George Orwell'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788525052247-L.jpg'
WHERE titulo = 'Fahrenheit 451'
  AND autor = 'Ray Bradbury'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788576572008-L.jpg'
WHERE titulo = 'Eu, Robô'
  AND autor = 'Isaac Asimov'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788576573005-L.jpg'
WHERE titulo = 'Neuromancer'
  AND autor = 'William Gibson'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788599296578-L.jpg'
WHERE titulo = 'O Guia do Mochileiro das Galáxias'
  AND autor = 'Douglas Adams'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788580572902-L.jpg'
WHERE titulo = 'Garota Exemplar'
  AND autor = 'Gillian Flynn'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788594318602-L.jpg'
WHERE titulo = 'O Colecionador'
  AND autor = 'John Fowles'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788581052144-L.jpg'
WHERE titulo = 'Caixa de Pássaros'
  AND autor = 'Josh Malerman'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788501116437-L.jpg'
WHERE titulo = 'A Paciente Silenciosa'
  AND autor = 'Alex Michaelides'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788525432186-L.jpg'
WHERE titulo = 'E Não Sobrou Nenhum'
  AND autor = 'Agatha Christie'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788575421130-L.jpg'
WHERE titulo = 'O Código Da Vinci'
  AND autor = 'Dan Brown'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788560280940-L.jpg'
WHERE titulo = 'It: A Coisa'
  AND autor = 'Stephen King'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788537811221-L.jpg'
WHERE titulo = 'Drácula'
  AND autor = 'Bram Stoker'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788535919714-L.jpg'
WHERE titulo = 'Steve Jobs'
  AND autor = 'Walter Isaacson'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788547000646-L.jpg'
WHERE titulo = 'Minha História'
  AND autor = 'Michelle Obama'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788535923438-L.jpg'
WHERE titulo = 'Eu Sou Malala'
  AND autor = 'Malala Yousafzai'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788501044457-L.jpg'
WHERE titulo = 'O Diário de Anne Frank'
  AND autor = 'Anne Frank'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788580578287-L.jpg'
WHERE titulo = 'Elon Musk'
  AND autor = 'Ashlee Vance'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9781524763138-L.jpg'
WHERE titulo = 'Becoming'
  AND autor = 'Michelle Obama'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788535928198-L.jpg'
WHERE titulo = 'Homo Deus'
  AND autor = 'Yuval Noah Harari'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788535925661-L.jpg'
WHERE titulo = 'Brasil: Uma Biografia'
  AND autor = 'Lilia M. Schwarcz e Heloisa M. Starling'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788525057518-L.jpg'
WHERE titulo = '1889'
  AND autor = 'Laurentino Gomes'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788544001851-L.jpg'
WHERE titulo = 'O Príncipe'
  AND autor = 'Nicolau Maquiavel'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788539003839-L.jpg'
WHERE titulo = 'Rápido e Devagar'
  AND autor = 'Daniel Kahneman'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788539004119-L.jpg'
WHERE titulo = 'O Poder do Hábito'
  AND autor = 'Charles Duhigg'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788547000240-L.jpg'
WHERE titulo = 'Mindset'
  AND autor = 'Carol S. Dweck'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788532602084-L.jpg'
WHERE titulo = 'O Corpo Fala'
  AND autor = 'Pierre Weil e Roland Tompakow'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788544001868-L.jpg'
WHERE titulo = 'Psicologia das Massas'
  AND autor = 'Gustave Le Bon'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788550807560-L.jpg'
WHERE titulo = 'Hábitos Atômicos'
  AND autor = 'James Clear'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788576849940-L.jpg'
WHERE titulo = 'O Milagre da Manhã'
  AND autor = 'Hal Elrod'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788550801483-L.jpg'
WHERE titulo = 'Pai Rico, Pai Pobre'
  AND autor = 'Robert T. Kiyosaki'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788576840626-L.jpg'
WHERE titulo = 'Os 7 Hábitos das Pessoas Altamente Eficazes'
  AND autor = 'Stephen R. Covey'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788543102146-L.jpg'
WHERE titulo = 'Essencialismo'
  AND autor = 'Greg McKeown'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788551002490-L.jpg'
WHERE titulo = 'A Sutil Arte de Ligar o Foda-se'
  AND autor = 'Mark Manson'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788575225639-L.jpg'
WHERE titulo = 'Entendendo Algoritmos'
  AND autor = 'Aditya Y. Bhargava'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788576082675-L.jpg'
WHERE titulo = 'Código Limpo'
  AND autor = 'Robert C. Martin'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788576081739-L.jpg'
WHERE titulo = 'Use a Cabeça Java'
  AND autor = 'Kathy Sierra e Bert Bates'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788543004792-L.jpg'
WHERE titulo = 'Java: Como Programar'
  AND autor = 'Paul Deitel e Harvey Deitel'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788576831303-L.jpg'
WHERE titulo = 'Diário de um Banana'
  AND autor = 'Jeff Kinney'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788598078175-L.jpg'
WHERE titulo = 'A Menina que Roubava Livros'
  AND autor = 'Markus Zusak'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788520917671-L.jpg'
WHERE titulo = 'O Caçador de Pipas'
  AND autor = 'Khaled Hosseini'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788580573015-L.jpg'
WHERE titulo = 'Extraordinário'
  AND autor = 'R. J. Palacio'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9786580309313-L.jpg'
WHERE titulo = 'Torto Arado'
  AND autor = 'Itamar Vieira Junior'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788508171279-L.jpg'
WHERE titulo = 'Quarto de Despejo'
  AND autor = 'Carolina Maria de Jesus'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788576832294-L.jpg'
WHERE titulo = 'Diário de um Banana: Rodrick é o Cara'
  AND autor = 'Jeff Kinney'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788573029505-L.jpg'
WHERE titulo = 'Como Ser Brasileiro'
  AND autor = 'Matthew Shirts'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788501067340-L.jpg'
WHERE titulo = 'Vidas Secas'
  AND autor = 'Graciliano Ramos'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

UPDATE livro
SET imagem_capa = 'https://covers.openlibrary.org/b/isbn/9788525406385-L.jpg'
WHERE titulo = 'Iracema'
  AND autor = 'José de Alencar'
  AND (imagem_capa IS NULL OR btrim(imagem_capa) = '' OR imagem_capa !~* '^https?://');

COMMIT;
