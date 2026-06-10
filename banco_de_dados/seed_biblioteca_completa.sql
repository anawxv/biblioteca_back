-- Seed completo e seguro para enriquecer o acervo da biblioteca.
-- Nao apaga dados, nao recria tabelas e nao altera regras do sistema.
-- Execute depois de tabelas_criadas.sql e, se existir no seu fluxo, depois de melhorias_nota10.sql.

BEGIN;

INSERT INTO categoria (nome, ativo)
VALUES
    ('Romance', TRUE),
    ('Fantasia', TRUE),
    ('Aventura', TRUE),
    ('Ficção Científica', TRUE),
    ('Suspense', TRUE),
    ('Mistério', TRUE),
    ('Horror', TRUE),
    ('Biografia', TRUE),
    ('História', TRUE),
    ('Filosofia', TRUE),
    ('Psicologia', TRUE),
    ('Autoajuda', TRUE),
    ('Educação', TRUE),
    ('Infantil', TRUE),
    ('Poesia', TRUE),
    ('Drama', TRUE),
    ('Humor', TRUE),
    ('Nacionais', TRUE)
ON CONFLICT (nome) DO UPDATE SET ativo = TRUE;

DO $$
BEGIN
    IF to_regclass('public.subgenero') IS NOT NULL THEN
        INSERT INTO subgenero (id_categoria, nome, ativo)
        SELECT c.id_categoria, s.nome, TRUE
        FROM (
            VALUES
                ('Romance', 'Romance contemporâneo'), ('Romance', 'Romance histórico'), ('Romance', 'Romance jovem adulto'), ('Romance', 'Comédia romântica'), ('Romance', 'Romance dramático'),
                ('Fantasia', 'Fantasia sombria'), ('Fantasia', 'Alta fantasia'), ('Fantasia', 'Fantasia urbana'), ('Fantasia', 'Mitologia'), ('Fantasia', 'Magia e aventura'),
                ('Aventura', 'Aventura clássica'), ('Aventura', 'Exploração'), ('Aventura', 'Sobrevivência'), ('Aventura', 'Viagem'), ('Aventura', 'Aventura histórica'),
                ('Ficção Científica', 'Distopia'), ('Ficção Científica', 'Cyberpunk'), ('Ficção Científica', 'Viagem espacial'), ('Ficção Científica', 'Inteligência artificial'), ('Ficção Científica', 'Pós-apocalíptico'),
                ('Suspense', 'Suspense psicológico'), ('Suspense', 'Thriller criminal'), ('Suspense', 'Mistério policial'), ('Suspense', 'Suspense doméstico'), ('Suspense', 'Investigação'),
                ('Mistério', 'Detetive clássico'), ('Mistério', 'Mistério histórico'), ('Mistério', 'Conspiração'), ('Mistério', 'Investigação'), ('Mistério', 'Crime'),
                ('Horror', 'Terror clássico'), ('Horror', 'Terror psicológico'), ('Horror', 'Sobrenatural'), ('Horror', 'Gótico'), ('Horror', 'Monstros'),
                ('Biografia', 'Biografia política'), ('Biografia', 'Memórias'), ('Biografia', 'Empreendedorismo'), ('Biografia', 'Artistas'), ('Biografia', 'Histórias de vida'),
                ('História', 'História do Brasil'), ('História', 'História mundial'), ('História', 'Guerras'), ('História', 'Civilizações'), ('História', 'História contemporânea'),
                ('Filosofia', 'Filosofia clássica'), ('Filosofia', 'Estoicismo'), ('Filosofia', 'Ética'), ('Filosofia', 'Existencialismo'), ('Filosofia', 'Filosofia política'),
                ('Psicologia', 'Comportamento'), ('Psicologia', 'Hábitos'), ('Psicologia', 'Emoções'), ('Psicologia', 'Terapia'), ('Psicologia', 'Psicologia social'),
                ('Autoajuda', 'Desenvolvimento pessoal'), ('Autoajuda', 'Produtividade'), ('Autoajuda', 'Hábitos'), ('Autoajuda', 'Finanças pessoais'), ('Autoajuda', 'Inteligência emocional'),
                ('Educação', 'Didático'), ('Educação', 'Tecnologia'), ('Educação', 'Programação'), ('Educação', 'Aprendizagem'), ('Educação', 'Ciências'),
                ('Infantil', 'Clássico infantil'), ('Infantil', 'Aventura infantil'), ('Infantil', 'Contos'), ('Infantil', 'Educação infantil'), ('Infantil', 'Fantasia infantil'),
                ('Poesia', 'Poesia brasileira'), ('Poesia', 'Poesia portuguesa'), ('Poesia', 'Antologia'), ('Poesia', 'Modernismo'), ('Poesia', 'Poesia clássica'),
                ('Drama', 'Drama histórico'), ('Drama', 'Drama social'), ('Drama', 'Drama familiar'), ('Drama', 'Formação'), ('Drama', 'Realismo'),
                ('Humor', 'Comédia brasileira'), ('Humor', 'Sátira'), ('Humor', 'Crônicas'), ('Humor', 'Humor cotidiano'), ('Humor', 'Comédia literária'),
                ('Nacionais', 'Clássicos brasileiros'), ('Nacionais', 'Modernismo brasileiro'), ('Nacionais', 'Regionalismo'), ('Nacionais', 'Realismo brasileiro'), ('Nacionais', 'Romance nacional')
        ) AS s(categoria, nome)
        JOIN categoria c ON c.nome = s.categoria
        ON CONFLICT (id_categoria, nome) DO UPDATE SET ativo = TRUE;
    END IF;
END $$;

WITH livros_seed (categoria, titulo, autor, isbn, editora, ano_publicacao, paginas, descricao, quantidade_total, subgenero) AS (
    VALUES
        ('Romance','É Assim que Acaba','Colleen Hoover','9788501112514','Galera Record',2018,368,'Romance contemporâneo sobre amor, escolhas difíceis e recomeços.',5,'Romance contemporâneo'),
        ('Romance','Vermelho, Branco e Sangue Azul','Casey McQuiston','9788555340940','Seguinte',2019,392,'Romance jovem adulto com humor, política e descobertas afetivas.',4,'Romance jovem adulto'),
        ('Romance','Orgulho e Preconceito','Jane Austen','9788544001820','Martin Claret',1813,424,'Clássico sobre orgulho, primeiras impressões e relações familiares.',5,'Romance histórico'),
        ('Romance','Como Eu Era Antes de Você','Jojo Moyes','9788580573299','Intrínseca',2013,320,'História emocionante sobre afeto, cuidado e escolhas de vida.',4,'Romance dramático'),
        ('Romance','A Culpa é das Estrelas','John Green','9788580573466','Intrínseca',2012,288,'Romance sensível sobre juventude, doença, amizade e amor.',6,'Romance jovem adulto'),
        ('Romance','Um Dia','David Nicholls','9788580570458','Intrínseca',2011,416,'Dois amigos se reencontram em diferentes momentos ao longo dos anos.',3,'Romance contemporâneo'),
        ('Romance','Teto Para Dois','Beth OLeary','9788551005416','Intrínseca',2019,400,'Comédia romântica sobre convivência improvável e novos afetos.',4,'Comédia romântica'),
        ('Romance','O Morro dos Ventos Uivantes','Emily Brontë','9788544001639','Martin Claret',1847,368,'Drama romântico intenso em uma paisagem marcada por paixão e vingança.',3,'Romance dramático'),

        ('Fantasia','Harry Potter e a Pedra Filosofal','J. K. Rowling','9788532530783','Rocco',1997,264,'Um garoto descobre que é bruxo e inicia sua vida em Hogwarts.',6,'Magia e aventura'),
        ('Fantasia','O Cálice dos Deuses','Rick Riordan','9786555607890','Intrínseca',2023,288,'Percy Jackson retorna para uma nova missão mitológica.',4,'Mitologia'),
        ('Fantasia','O Hobbit','J. R. R. Tolkien','9788595084742','HarperCollins Brasil',1937,336,'Bilbo Bolseiro parte em uma aventura com anões e dragões.',5,'Alta fantasia'),
        ('Fantasia','A Sociedade do Anel','J. R. R. Tolkien','9788595084759','HarperCollins Brasil',1954,576,'Primeiro volume da jornada para destruir o Um Anel.',5,'Alta fantasia'),
        ('Fantasia','O Nome do Vento','Patrick Rothfuss','9788599296493','Arqueiro',2007,656,'Kvothe narra sua vida entre música, magia e lendas.',4,'Alta fantasia'),
        ('Fantasia','Percy Jackson e o Ladrão de Raios','Rick Riordan','9788598078355','Intrínseca',2005,400,'Um garoto descobre ser filho de Poseidon e entra no mundo dos deuses.',6,'Mitologia'),
        ('Fantasia','As Crônicas de Nárnia','C. S. Lewis','9788578270698','WMF Martins Fontes',1956,752,'Crianças atravessam mundos mágicos e vivem grandes aventuras.',3,'Magia e aventura'),
        ('Fantasia','A Guerra dos Tronos','George R. R. Martin','9788556510785','Suma',1996,592,'Intrigas, poder e fantasia sombria em Westeros.',4,'Fantasia sombria'),

        ('Aventura','A Ilha do Tesouro','Robert Louis Stevenson','9788537816066','Zahar',1883,240,'Uma caça ao tesouro com piratas, mapas e perigos.',4,'Aventura clássica'),
        ('Aventura','Robinson Crusoé','Daniel Defoe','9788537811139','Zahar',1719,368,'A sobrevivência de um náufrago em uma ilha distante.',3,'Sobrevivência'),
        ('Aventura','Viagem ao Centro da Terra','Júlio Verne','9788537816059','Zahar',1864,304,'Exploradores seguem pistas rumo às profundezas da Terra.',5,'Exploração'),
        ('Aventura','A Volta ao Mundo em 80 Dias','Júlio Verne','9788537816073','Zahar',1873,256,'Phileas Fogg aposta que consegue dar a volta ao mundo em 80 dias.',5,'Viagem'),
        ('Aventura','Moby Dick','Herman Melville','9788544001821','Martin Claret',1851,656,'A perseguição obsessiva do capitão Ahab à baleia branca.',3,'Aventura clássica'),
        ('Aventura','As Minas do Rei Salomão','H. Rider Haggard','9788537812785','Zahar',1885,320,'Exploradores viajam pela África em busca de uma lendária mina.',3,'Exploração'),
        ('Aventura','O Conde de Monte Cristo','Alexandre Dumas','9788537811016','Zahar',1844,1376,'Uma história de prisão, fuga, fortuna e vingança.',4,'Aventura histórica'),
        ('Aventura','O Chamado da Selva','Jack London','9788525418272','LPM',1903,128,'Um cão é levado ao Alasca e descobre seus instintos selvagens.',4,'Sobrevivência'),

        ('Ficção Científica','Duna','Frank Herbert','9788576573135','Aleph',1965,680,'Política, ecologia e destino se cruzam no planeta Arrakis.',5,'Viagem espacial'),
        ('Ficção Científica','1984','George Orwell','9788535914849','Companhia das Letras',1949,416,'Distopia sobre vigilância, controle e manipulação da verdade.',6,'Distopia'),
        ('Ficção Científica','Fahrenheit 451','Ray Bradbury','9788525052247','Globo Livros',1953,216,'Um futuro em que livros são proibidos e queimados.',4,'Distopia'),
        ('Ficção Científica','Fundação','Isaac Asimov','9788576570554','Aleph',1951,320,'A queda de um império galáctico e o plano para preservar o conhecimento.',4,'Viagem espacial'),
        ('Ficção Científica','Eu, Robô','Isaac Asimov','9788576572008','Aleph',1950,320,'Contos clássicos sobre robôs e as leis da robótica.',5,'Inteligência artificial'),
        ('Ficção Científica','Neuromancer','William Gibson','9788576573005','Aleph',1984,320,'Marco cyberpunk sobre hackers, IA e realidades conectadas.',3,'Cyberpunk'),
        ('Ficção Científica','O Guia do Mochileiro das Galáxias','Douglas Adams','9788599296578','Arqueiro',1979,208,'Uma aventura espacial absurda e bem-humorada.',4,'Viagem espacial'),
        ('Ficção Científica','Admirável Mundo Novo','Aldous Huxley','9788525056009','Globo Livros',1932,312,'Sociedade futurista organizada por tecnologia, prazer e controle.',5,'Distopia'),

        ('Suspense','A Empregada','Freida McFadden','9786555606008','Arqueiro',2022,304,'Uma mulher aceita um emprego doméstico e descobre segredos perigosos.',5,'Suspense doméstico'),
        ('Suspense','Garota Exemplar','Gillian Flynn','9788580572902','Intrínseca',2012,448,'O desaparecimento de Amy revela camadas obscuras de um casamento.',4,'Suspense psicológico'),
        ('Suspense','A Garota no Trem','Paula Hawkins','9788501104656','Record',2015,378,'Uma passageira observa uma vida perfeita que esconde um crime.',5,'Suspense psicológico'),
        ('Suspense','O Silêncio dos Inocentes','Thomas Harris','9788501110237','Record',1988,360,'Uma agente do FBI busca ajuda de Hannibal Lecter para capturar um assassino.',3,'Thriller criminal'),
        ('Suspense','O Colecionador','John Fowles','9788594318602','DarkSide Books',1963,304,'Um sequestro perturbador narrado por perspectivas opostas.',3,'Suspense psicológico'),
        ('Suspense','Caixa de Pássaros','Josh Malerman','9788581052144','Intrínseca',2014,272,'Sobreviventes enfrentam uma ameaça que não pode ser vista.',4,'Suspense psicológico'),
        ('Suspense','Jantar Secreto','Raphael Montes','9788535928310','Companhia das Letras',2016,368,'Jovens no Rio se envolvem em crimes chocantes para ganhar dinheiro.',4,'Thriller criminal'),
        ('Suspense','O Homem de Giz','C. J. Tudor','9788551002934','Intrínseca',2018,272,'Desenhos de giz conectam um grupo de amigos a um crime antigo.',4,'Investigação'),
        ('Suspense','A Paciente Silenciosa','Alex Michaelides','9788501116437','Record',2019,364,'Uma pintora para de falar após ser acusada de matar o marido.',5,'Suspense psicológico'),

        ('Mistério','Assassinato no Expresso do Oriente','Agatha Christie','9788525421012','LPM',1934,240,'Hercule Poirot investiga um assassinato em um trem isolado pela neve.',5,'Detetive clássico'),
        ('Mistério','E Não Sobrou Nenhum','Agatha Christie','9788525432186','LPM',1939,400,'Dez pessoas em uma ilha são acusadas por crimes do passado.',5,'Crime'),
        ('Mistério','O Código Da Vinci','Dan Brown','9788575421130','Sextante',2003,432,'Símbolos, arte e religião movem uma investigação internacional.',4,'Conspiração'),
        ('Mistério','Sherlock Holmes: Um Estudo em Vermelho','Arthur Conan Doyle','9788537810460','Zahar',1887,176,'O primeiro caso de Sherlock Holmes e Dr. Watson.',5,'Detetive clássico'),
        ('Mistério','O Nome da Rosa','Umberto Eco','9788501021403','Record',1980,592,'Mortes misteriosas em um mosteiro medieval.',3,'Mistério histórico'),
        ('Mistério','A Mulher na Janela','A. J. Finn','9788580418293','Arqueiro',2018,352,'Uma mulher reclusa acredita ter testemunhado um crime.',4,'Investigação'),
        ('Mistério','O Chamado do Cuco','Robert Galbraith','9788532528940','Rocco',2013,448,'Cormoran Strike investiga a morte suspeita de uma modelo.',4,'Investigação'),
        ('Mistério','Morte no Nilo','Agatha Christie','9788525426130','LPM',1937,288,'Poirot investiga um assassinato durante um cruzeiro no Egito.',4,'Detetive clássico'),

        ('Horror','It: A Coisa','Stephen King','9788560280940','Suma',1986,1104,'Um grupo enfrenta uma entidade que assume a forma de seus medos.',3,'Monstros'),
        ('Horror','O Iluminado','Stephen King','9788556510464','Suma',1977,464,'Um hotel isolado desperta forças sombrias em uma família.',4,'Terror psicológico'),
        ('Horror','Drácula','Bram Stoker','9788537811221','Zahar',1897,448,'O clássico romance gótico do vampiro Conde Drácula.',5,'Gótico'),
        ('Horror','Frankenstein','Mary Shelley','9788537811245','Zahar',1818,304,'Um cientista cria vida e enfrenta as consequências de sua ambição.',5,'Terror clássico'),
        ('Horror','Coraline','Neil Gaiman','9788579801860','Rocco',2002,160,'Uma menina encontra uma versão sombria de sua própria casa.',4,'Sobrenatural'),
        ('Horror','O Exorcista','William Peter Blatty','9788594540591','HarperCollins Brasil',1971,336,'Uma possessão demoníaca desafia fé, ciência e coragem.',3,'Sobrenatural'),
        ('Horror','A Assombração da Casa da Colina','Shirley Jackson','9788581053707','Suma',1959,240,'Uma casa assombrada envolve seus visitantes em terror psicológico.',4,'Terror psicológico'),
        ('Horror','Misery','Stephen King','9788556510440','Suma',1987,328,'Um escritor é mantido preso por sua fã mais perigosa.',4,'Terror psicológico'),

        ('Biografia','Steve Jobs','Walter Isaacson','9788535919714','Companhia das Letras',2011,624,'A biografia do cofundador da Apple, marcada por inovação e intensidade.',4,'Empreendedorismo'),
        ('Biografia','Minha História','Michelle Obama','9788547000646','Objetiva',2018,448,'Memórias de Michelle Obama, da infância à Casa Branca.',4,'Memórias'),
        ('Biografia','Eu Sou Malala','Malala Yousafzai','9788535923438','Companhia das Letras',2013,360,'A trajetória da jovem paquistanesa que defendeu a educação feminina.',5,'Histórias de vida'),
        ('Biografia','Longa Caminhada até a Liberdade','Nelson Mandela','9788560280650','Nossa Cultura',1994,784,'Autobiografia de Nelson Mandela e sua luta contra o apartheid.',3,'Biografia política'),
        ('Biografia','O Diário de Anne Frank','Anne Frank','9788501044457','Record',1947,352,'Relato de Anne Frank durante a ocupação nazista.',6,'Memórias'),
        ('Biografia','Elon Musk','Ashlee Vance','9788580578287','Intrínseca',2015,416,'Biografia do empreendedor ligado à Tesla, SpaceX e tecnologia.',4,'Empreendedorismo'),
        ('Biografia','Becoming','Michelle Obama','9781524763138','Crown',2018,448,'Memórias sobre formação, família e vida pública.',3,'Memórias'),
        ('Biografia','Rita Lee: Uma Autobiografia','Rita Lee','9788525065308','Globo Livros',2016,296,'A artista brasileira conta sua vida com humor e franqueza.',4,'Artistas'),

        ('História','Sapiens','Yuval Noah Harari','9788525432407','LPM',2011,464,'Uma breve história da humanidade e suas revoluções.',5,'Civilizações'),
        ('História','Homo Deus','Yuval Noah Harari','9788535928198','Companhia das Letras',2015,448,'Reflexão histórica sobre futuro, tecnologia e humanidade.',4,'História contemporânea'),
        ('História','Brasil: Uma Biografia','Lilia M. Schwarcz e Heloisa M. Starling','9788535925661','Companhia das Letras',2015,704,'Panorama amplo da formação histórica do Brasil.',4,'História do Brasil'),
        ('História','1808','Laurentino Gomes','9788573029444','Planeta',2007,416,'A chegada da corte portuguesa ao Brasil.',5,'História do Brasil'),
        ('História','1822','Laurentino Gomes','9788525051431','Globo Livros',2010,352,'A independência do Brasil narrada de forma acessível.',5,'História do Brasil'),
        ('História','1889','Laurentino Gomes','9788525057518','Globo Livros',2013,416,'A queda da monarquia e a proclamação da República.',4,'História do Brasil'),
        ('História','A Segunda Guerra Mundial','Antony Beevor','9788501094704','Record',2012,952,'Síntese detalhada do conflito mundial.',3,'Guerras'),
        ('História','Uma Breve História do Mundo','Geoffrey Blainey','9788573029116','Fundamento',2000,352,'Panorama introdutório sobre povos, impérios e sociedades.',4,'História mundial'),

        ('Filosofia','O Mundo de Sofia','Jostein Gaarder','9788535908060','Companhia das Letras',1991,568,'Uma introdução à filosofia por meio de uma narrativa juvenil.',5,'Filosofia clássica'),
        ('Filosofia','Meditações','Marco Aurélio','9788544001837','Martin Claret',2019,176,'Reflexões estoicas sobre disciplina, virtude e vida pública.',5,'Estoicismo'),
        ('Filosofia','A República','Platão','9788572839044','Edipro',2012,416,'Diálogo clássico sobre justiça, política e educação.',4,'Filosofia política'),
        ('Filosofia','Ética a Nicômaco','Aristóteles','9788572839907','Edipro',2014,320,'Obra fundamental sobre ética, virtude e felicidade.',4,'Ética'),
        ('Filosofia','Além do Bem e do Mal','Friedrich Nietzsche','9788544001844','Martin Claret',1886,240,'Crítica filosófica da moral e dos valores tradicionais.',4,'Ética'),
        ('Filosofia','O Mito de Sísifo','Albert Camus','9788501116475','Record',1942,160,'Ensaio central do pensamento absurdo.',3,'Existencialismo'),
        ('Filosofia','Convite à Filosofia','Marilena Chaui','9788508134694','Ática',1994,520,'Introdução brasileira aos principais problemas filosóficos.',5,'Filosofia clássica'),
        ('Filosofia','O Príncipe','Nicolau Maquiavel','9788544001851','Martin Claret',1532,176,'Tratado clássico sobre poder, estratégia e governo.',5,'Filosofia política'),

        ('Psicologia','Rápido e Devagar','Daniel Kahneman','9788539003839','Objetiva',2011,608,'Estudo sobre dois sistemas de pensamento e decisões humanas.',4,'Comportamento'),
        ('Psicologia','O Poder do Hábito','Charles Duhigg','9788539004119','Objetiva',2012,408,'Como hábitos são formados e transformados.',5,'Hábitos'),
        ('Psicologia','Inteligência Emocional','Daniel Goleman','9788573020809','Objetiva',1995,384,'A importância das emoções na vida pessoal e profissional.',5,'Emoções'),
        ('Psicologia','Mindset','Carol S. Dweck','9788547000240','Objetiva',2006,312,'Como mentalidades influenciam aprendizagem e desempenho.',4,'Comportamento'),
        ('Psicologia','O Corpo Fala','Pierre Weil e Roland Tompakow','9788532602084','Vozes',1986,288,'Leitura da comunicação não verbal no cotidiano.',4,'Comportamento'),
        ('Psicologia','Talvez Você Deva Conversar com Alguém','Lori Gottlieb','9786580634309','Vestígio',2019,448,'Relatos de terapia que aproximam profissional e paciente.',3,'Terapia'),
        ('Psicologia','A Coragem de Ser Imperfeito','Brené Brown','9788543102313','Sextante',2012,208,'Vulnerabilidade, coragem e pertencimento.',4,'Emoções'),
        ('Psicologia','Psicologia das Massas','Gustave Le Bon','9788544001868','Martin Claret',1895,192,'Análise clássica do comportamento coletivo.',3,'Psicologia social'),

        ('Autoajuda','Hábitos Atômicos','James Clear','9788550807560','Alta Books',2018,320,'Método prático para construir bons hábitos e abandonar maus hábitos.',6,'Hábitos'),
        ('Autoajuda','O Milagre da Manhã','Hal Elrod','9788576849940','BestSeller',2012,196,'Rotina matinal para desenvolvimento pessoal.',5,'Produtividade'),
        ('Autoajuda','Pai Rico, Pai Pobre','Robert T. Kiyosaki','9788550801483','Alta Books',1997,336,'Educação financeira por meio de duas visões sobre dinheiro.',5,'Finanças pessoais'),
        ('Autoajuda','Os 7 Hábitos das Pessoas Altamente Eficazes','Stephen R. Covey','9788576840626','BestSeller',1989,448,'Princípios para eficácia pessoal e profissional.',4,'Produtividade'),
        ('Autoajuda','Como Fazer Amigos e Influenciar Pessoas','Dale Carnegie','9788504018021','Companhia Editora Nacional',1936,256,'Clássico sobre relações, comunicação e influência.',6,'Desenvolvimento pessoal'),
        ('Autoajuda','Essencialismo','Greg McKeown','9788543102146','Sextante',2014,272,'Como focar no que realmente importa.',4,'Produtividade'),
        ('Autoajuda','O Poder do Agora','Eckhart Tolle','9788575420270','Sextante',1997,224,'Reflexões sobre presença, consciência e vida interior.',4,'Inteligência emocional'),
        ('Autoajuda','A Sutil Arte de Ligar o Foda-se','Mark Manson','9788551002490','Intrínseca',2016,224,'Uma abordagem direta sobre valores, limites e escolhas.',5,'Desenvolvimento pessoal'),

        ('Educação','Entendendo Algoritmos','Aditya Y. Bhargava','9788575225639','Novatec',2016,264,'Introdução visual e prática a algoritmos.',5,'Programação'),
        ('Educação','Código Limpo','Robert C. Martin','9788576082675','Alta Books',2008,425,'Boas práticas para escrever código legível e sustentável.',4,'Programação'),
        ('Educação','Use a Cabeça Java','Kathy Sierra e Bert Bates','9788576081739','Alta Books',2005,720,'Aprendizado visual e prático de Java.',4,'Programação'),
        ('Educação','Java: Como Programar','Paul Deitel e Harvey Deitel','9788543004792','Pearson',2016,968,'Manual completo para programar em Java.',3,'Programação'),
        ('Educação','Aprendendo SQL','Alan Beaulieu','9788575222102','Novatec',2009,336,'Introdução prática a bancos relacionais e SQL.',4,'Tecnologia'),
        ('Educação','Sistema de Banco de Dados','Abraham Silberschatz','9788535245356','Elsevier',2012,904,'Referência sobre bancos de dados relacionais.',3,'Tecnologia'),
        ('Educação','Algoritmos','Thomas H. Cormen','9788535236996','Elsevier',2009,944,'Referência acadêmica em algoritmos.',3,'Ciências'),
        ('Educação','Lógica de Programação e Algoritmos com JavaScript','Edécio Fernando Iepsen','9788575226568','Novatec',2018,312,'Fundamentos de lógica usando JavaScript.',4,'Aprendizagem'),

        ('Infantil','O Pequeno Príncipe','Antoine de Saint-Exupéry','9788595081512','HarperCollins Brasil',1943,96,'Um príncipe viajante ensina sobre amizade, amor e responsabilidade.',8,'Clássico infantil'),
        ('Infantil','Alice no País das Maravilhas','Lewis Carroll','9788537811726','Zahar',1865,200,'Alice entra em um mundo de lógica absurda e personagens marcantes.',5,'Fantasia infantil'),
        ('Infantil','O Menino Maluquinho','Ziraldo','9788506055045','Melhoramentos',1980,112,'A infância alegre e inventiva de um menino inesquecível.',6,'Aventura infantil'),
        ('Infantil','Marcelo, Marmelo, Martelo','Ruth Rocha','9788516071493','Salamandra',1976,64,'Histórias infantis sobre linguagem, curiosidade e imaginação.',5,'Educação infantil'),
        ('Infantil','Reinações de Narizinho','Monteiro Lobato','9788525061232','Globo Livros',1931,352,'Aventuras no Sítio do Picapau Amarelo.',5,'Fantasia infantil'),
        ('Infantil','O Gato Malhado e a Andorinha Sinhá','Jorge Amado','9788535911268','Companhia das Letras',1976,104,'Fábula poética sobre amor e diferença.',4,'Contos'),
        ('Infantil','A Bolsa Amarela','Lygia Bojunga','9788520932964','Casa Lygia Bojunga',1976,136,'Uma menina guarda seus desejos em uma bolsa amarela.',4,'Clássico infantil'),
        ('Infantil','Diário de um Banana','Jeff Kinney','9788576831303','VR Editora',2007,224,'As confusões escolares e familiares de Greg Heffley.',6,'Aventura infantil'),
        ('Infantil','Matilda','Roald Dahl','9788574064389','WMF Martins Fontes',1988,256,'Uma menina genial enfrenta adultos autoritários com inteligência e imaginação.',5,'Fantasia infantil'),

        ('Poesia','Sentimento do Mundo','Carlos Drummond de Andrade','9788535924626','Companhia das Letras',1940,128,'Poemas de maturidade social e existencial de Drummond.',4,'Poesia brasileira'),
        ('Poesia','A Rosa do Povo','Carlos Drummond de Andrade','9788535924633','Companhia das Letras',1945,256,'Livro central da poesia brasileira moderna.',4,'Modernismo'),
        ('Poesia','Antologia Poética','Vinicius de Moraes','9788532508294','Companhia das Letras',1960,352,'Seleção de poemas líricos e populares de Vinicius.',5,'Antologia'),
        ('Poesia','Toda Poesia','Paulo Leminski','9788535923780','Companhia das Letras',2013,424,'Reunião da obra poética de Leminski.',4,'Poesia brasileira'),
        ('Poesia','Livro do Desassossego','Fernando Pessoa','9788535914962','Companhia das Letras',1982,560,'Fragmentos literários de Bernardo Soares.',3,'Poesia portuguesa'),
        ('Poesia','Poemas Completos de Alberto Caeiro','Fernando Pessoa','9788525413833','LPM',1946,224,'Poemas do heterônimo ligado à natureza e simplicidade.',4,'Poesia portuguesa'),
        ('Poesia','Melhores Poemas de Cecília Meireles','Cecília Meireles','9788526007413','Global',1994,224,'Seleção da poesia musical e reflexiva de Cecília Meireles.',4,'Poesia brasileira'),
        ('Poesia','Eu','Augusto dos Anjos','9788572327817','Martin Claret',1912,160,'Poesia singular marcada por ciência, angústia e linguagem forte.',4,'Poesia clássica'),

        ('Drama','A Menina que Roubava Livros','Markus Zusak','9788598078175','Intrínseca',2005,480,'Uma menina encontra palavras e afeto durante a Alemanha nazista.',5,'Drama histórico'),
        ('Drama','O Sol é Para Todos','Harper Lee','9788503009499','José Olympio',1960,364,'Drama sobre justiça, infância e racismo no sul dos EUA.',4,'Drama social'),
        ('Drama','A Lista de Schindler','Thomas Keneally','9788528613346','Bertrand Brasil',1982,432,'A história de Oskar Schindler durante o Holocausto.',3,'Drama histórico'),
        ('Drama','As Vantagens de Ser Invisível','Stephen Chbosky','9788532522337','Rocco',1999,288,'Cartas de um adolescente em processo de amadurecimento.',4,'Formação'),
        ('Drama','O Caçador de Pipas','Khaled Hosseini','9788520917671','Nova Fronteira',2003,368,'Amizade, culpa e redenção atravessam décadas no Afeganistão.',4,'Drama familiar'),
        ('Drama','Extraordinário','R. J. Palacio','9788580573015','Intrínseca',2012,320,'Um garoto com diferença facial enfrenta a escola e o olhar dos outros.',5,'Drama social'),
        ('Drama','Torto Arado','Itamar Vieira Junior','9786580309313','Todavia',2019,264,'Drama social sobre terra, família e memória no Brasil.',5,'Drama social'),
        ('Drama','Quarto de Despejo','Carolina Maria de Jesus','9788508171279','Ática',1960,200,'Diário forte sobre pobreza, cidade e sobrevivência.',4,'Realismo'),

        ('Humor','O Auto da Compadecida','Ariano Suassuna','9788520931707','Nova Fronteira',1955,192,'Comédia teatral nordestina com crítica social e religiosidade popular.',5,'Comédia brasileira'),
        ('Humor','Diário de um Banana: Rodrick é o Cara','Jeff Kinney','9788576832294','VR Editora',2008,224,'Greg enfrenta novas confusões familiares e escolares.',5,'Humor cotidiano'),
        ('Humor','O Guia do Mochileiro das Galáxias','Douglas Adams','9788599296585','Arqueiro',1979,208,'Humor britânico em uma viagem absurda pelo espaço.',4,'Comédia literária'),
        ('Humor','Feliz Ano Velho','Marcelo Rubens Paiva','9788573026375','Objetiva',1982,272,'Memórias com humor, juventude e reconstrução pessoal.',4,'Humor cotidiano'),
        ('Humor','Memórias Póstumas de Brás Cubas','Machado de Assis','9788525406958','LPM',1881,224,'Narrador defunto revisita sua vida com ironia mordaz.',6,'Sátira'),
        ('Humor','O Analista de Bagé','Luis Fernando Verissimo','9788525410450','LPM',1981,112,'Humor brasileiro em torno de um terapeuta nada convencional.',4,'Comédia brasileira'),
        ('Humor','Comédias da Vida Privada','Luis Fernando Verissimo','9788525410665','LPM',1994,176,'Crônicas bem-humoradas sobre relações e cotidiano.',4,'Crônicas'),
        ('Humor','Como Ser Brasileiro','Matthew Shirts','9788573029505','Objetiva',2006,160,'Olhar estrangeiro e divertido sobre costumes brasileiros.',3,'Humor cotidiano'),

        ('Nacionais','Dom Casmurro','Machado de Assis','9788525406064','LPM',1899,256,'Clássico sobre memória, ciúme e ambiguidade.',6,'Clássicos brasileiros'),
        ('Nacionais','Memórias Póstumas de Brás Cubas','Machado de Assis','9788535910667','Companhia das Letras',1881,352,'Romance inovador narrado por um defunto autor.',6,'Realismo brasileiro'),
        ('Nacionais','Capitães da Areia','Jorge Amado','9788535914061','Companhia das Letras',1937,280,'Meninos de rua vivem aventuras e durezas em Salvador.',5,'Romance nacional'),
        ('Nacionais','Vidas Secas','Graciliano Ramos','9788501067340','Record',1938,176,'Família sertaneja enfrenta seca, pobreza e opressão.',5,'Regionalismo'),
        ('Nacionais','Grande Sertão: Veredas','João Guimarães Rosa','9788520923252','Nova Fronteira',1956,624,'Travessia épica e linguística pelo sertão brasileiro.',4,'Regionalismo'),
        ('Nacionais','O Cortiço','Aluísio Azevedo','9788525406347','LPM',1890,272,'Retrato naturalista de um cortiço carioca.',5,'Realismo brasileiro'),
        ('Nacionais','Iracema','José de Alencar','9788525406385','LPM',1865,144,'Romance indianista sobre origem, amor e identidade nacional.',5,'Clássicos brasileiros'),
        ('Nacionais','Macunaíma','Mário de Andrade','9788520926093','Nova Fronteira',1928,240,'Rapsódia modernista sobre o herói sem nenhum caráter.',4,'Modernismo brasileiro')
)
INSERT INTO livro (
    titulo,
    autor,
    isbn,
    editora,
    ano_publicacao,
    paginas,
    descricao,
    quantidade_total,
    quantidade_disponivel,
    id_categoria,
    imagem_capa,
    ativo
)
SELECT
    l.titulo,
    l.autor,
    l.isbn,
    l.editora,
    l.ano_publicacao,
    l.paginas,
    l.descricao,
    l.quantidade_total,
    l.quantidade_total,
    c.id_categoria,
    'https://covers.openlibrary.org/b/isbn/' || l.isbn || '-L.jpg',
    TRUE
FROM livros_seed l
JOIN categoria c ON c.nome = l.categoria
WHERE NOT EXISTS (
    SELECT 1
    FROM livro existente
    WHERE lower(existente.titulo) = lower(l.titulo)
      AND lower(existente.autor) = lower(l.autor)
)
ON CONFLICT (isbn) DO NOTHING;

DO $$
BEGIN
    IF to_regclass('public.livro_subgenero') IS NOT NULL AND to_regclass('public.subgenero') IS NOT NULL THEN
        INSERT INTO livro_subgenero (id_livro, id_subgenero)
        SELECT DISTINCT livro_db.id_livro, s.id_subgenero
        FROM (
            VALUES
                ('Romance','É Assim que Acaba','Colleen Hoover','Romance contemporâneo'), ('Romance','Vermelho, Branco e Sangue Azul','Casey McQuiston','Romance jovem adulto'), ('Romance','Orgulho e Preconceito','Jane Austen','Romance histórico'), ('Romance','Como Eu Era Antes de Você','Jojo Moyes','Romance dramático'), ('Romance','A Culpa é das Estrelas','John Green','Romance jovem adulto'), ('Romance','Um Dia','David Nicholls','Romance contemporâneo'), ('Romance','Teto Para Dois','Beth OLeary','Comédia romântica'), ('Romance','O Morro dos Ventos Uivantes','Emily Brontë','Romance dramático'),
                ('Fantasia','Harry Potter e a Pedra Filosofal','J. K. Rowling','Magia e aventura'), ('Fantasia','O Cálice dos Deuses','Rick Riordan','Mitologia'), ('Fantasia','O Hobbit','J. R. R. Tolkien','Alta fantasia'), ('Fantasia','A Sociedade do Anel','J. R. R. Tolkien','Alta fantasia'), ('Fantasia','O Nome do Vento','Patrick Rothfuss','Alta fantasia'), ('Fantasia','Percy Jackson e o Ladrão de Raios','Rick Riordan','Mitologia'), ('Fantasia','As Crônicas de Nárnia','C. S. Lewis','Magia e aventura'), ('Fantasia','A Guerra dos Tronos','George R. R. Martin','Fantasia sombria'),
                ('Aventura','A Ilha do Tesouro','Robert Louis Stevenson','Aventura clássica'), ('Aventura','Robinson Crusoé','Daniel Defoe','Sobrevivência'), ('Aventura','Viagem ao Centro da Terra','Júlio Verne','Exploração'), ('Aventura','A Volta ao Mundo em 80 Dias','Júlio Verne','Viagem'), ('Aventura','Moby Dick','Herman Melville','Aventura clássica'), ('Aventura','As Minas do Rei Salomão','H. Rider Haggard','Exploração'), ('Aventura','O Conde de Monte Cristo','Alexandre Dumas','Aventura histórica'), ('Aventura','O Chamado da Selva','Jack London','Sobrevivência'),
                ('Ficção Científica','Duna','Frank Herbert','Viagem espacial'), ('Ficção Científica','1984','George Orwell','Distopia'), ('Ficção Científica','Fahrenheit 451','Ray Bradbury','Distopia'), ('Ficção Científica','Fundação','Isaac Asimov','Viagem espacial'), ('Ficção Científica','Eu, Robô','Isaac Asimov','Inteligência artificial'), ('Ficção Científica','Neuromancer','William Gibson','Cyberpunk'), ('Ficção Científica','O Guia do Mochileiro das Galáxias','Douglas Adams','Viagem espacial'), ('Ficção Científica','Admirável Mundo Novo','Aldous Huxley','Distopia'),
                ('Suspense','A Empregada','Freida McFadden','Suspense doméstico'), ('Suspense','Garota Exemplar','Gillian Flynn','Suspense psicológico'), ('Suspense','A Garota no Trem','Paula Hawkins','Suspense psicológico'), ('Suspense','O Silêncio dos Inocentes','Thomas Harris','Thriller criminal'), ('Suspense','O Colecionador','John Fowles','Suspense psicológico'), ('Suspense','Caixa de Pássaros','Josh Malerman','Suspense psicológico'), ('Suspense','Jantar Secreto','Raphael Montes','Thriller criminal'), ('Suspense','O Homem de Giz','C. J. Tudor','Investigação'), ('Suspense','A Paciente Silenciosa','Alex Michaelides','Suspense psicológico'),
                ('Mistério','Assassinato no Expresso do Oriente','Agatha Christie','Detetive clássico'), ('Mistério','E Não Sobrou Nenhum','Agatha Christie','Crime'), ('Mistério','O Código Da Vinci','Dan Brown','Conspiração'), ('Mistério','Sherlock Holmes: Um Estudo em Vermelho','Arthur Conan Doyle','Detetive clássico'), ('Mistério','O Nome da Rosa','Umberto Eco','Mistério histórico'), ('Mistério','A Mulher na Janela','A. J. Finn','Investigação'), ('Mistério','O Chamado do Cuco','Robert Galbraith','Investigação'), ('Mistério','Morte no Nilo','Agatha Christie','Detetive clássico'),
                ('Horror','It: A Coisa','Stephen King','Monstros'), ('Horror','O Iluminado','Stephen King','Terror psicológico'), ('Horror','Drácula','Bram Stoker','Gótico'), ('Horror','Frankenstein','Mary Shelley','Terror clássico'), ('Horror','Coraline','Neil Gaiman','Sobrenatural'), ('Horror','O Exorcista','William Peter Blatty','Sobrenatural'), ('Horror','A Assombração da Casa da Colina','Shirley Jackson','Terror psicológico'), ('Horror','Misery','Stephen King','Terror psicológico'),
                ('Biografia','Steve Jobs','Walter Isaacson','Empreendedorismo'), ('Biografia','Minha História','Michelle Obama','Memórias'), ('Biografia','Eu Sou Malala','Malala Yousafzai','Histórias de vida'), ('Biografia','Longa Caminhada até a Liberdade','Nelson Mandela','Biografia política'), ('Biografia','O Diário de Anne Frank','Anne Frank','Memórias'), ('Biografia','Elon Musk','Ashlee Vance','Empreendedorismo'), ('Biografia','Becoming','Michelle Obama','Memórias'), ('Biografia','Rita Lee: Uma Autobiografia','Rita Lee','Artistas'),
                ('História','Sapiens','Yuval Noah Harari','Civilizações'), ('História','Homo Deus','Yuval Noah Harari','História contemporânea'), ('História','Brasil: Uma Biografia','Lilia M. Schwarcz e Heloisa M. Starling','História do Brasil'), ('História','1808','Laurentino Gomes','História do Brasil'), ('História','1822','Laurentino Gomes','História do Brasil'), ('História','1889','Laurentino Gomes','História do Brasil'), ('História','A Segunda Guerra Mundial','Antony Beevor','Guerras'), ('História','Uma Breve História do Mundo','Geoffrey Blainey','História mundial'),
                ('Filosofia','O Mundo de Sofia','Jostein Gaarder','Filosofia clássica'), ('Filosofia','Meditações','Marco Aurélio','Estoicismo'), ('Filosofia','A República','Platão','Filosofia política'), ('Filosofia','Ética a Nicômaco','Aristóteles','Ética'), ('Filosofia','Além do Bem e do Mal','Friedrich Nietzsche','Ética'), ('Filosofia','O Mito de Sísifo','Albert Camus','Existencialismo'), ('Filosofia','Convite à Filosofia','Marilena Chaui','Filosofia clássica'), ('Filosofia','O Príncipe','Nicolau Maquiavel','Filosofia política'),
                ('Psicologia','Rápido e Devagar','Daniel Kahneman','Comportamento'), ('Psicologia','O Poder do Hábito','Charles Duhigg','Hábitos'), ('Psicologia','Inteligência Emocional','Daniel Goleman','Emoções'), ('Psicologia','Mindset','Carol S. Dweck','Comportamento'), ('Psicologia','O Corpo Fala','Pierre Weil e Roland Tompakow','Comportamento'), ('Psicologia','Talvez Você Deva Conversar com Alguém','Lori Gottlieb','Terapia'), ('Psicologia','A Coragem de Ser Imperfeito','Brené Brown','Emoções'), ('Psicologia','Psicologia das Massas','Gustave Le Bon','Psicologia social'),
                ('Autoajuda','Hábitos Atômicos','James Clear','Hábitos'), ('Autoajuda','O Milagre da Manhã','Hal Elrod','Produtividade'), ('Autoajuda','Pai Rico, Pai Pobre','Robert T. Kiyosaki','Finanças pessoais'), ('Autoajuda','Os 7 Hábitos das Pessoas Altamente Eficazes','Stephen R. Covey','Produtividade'), ('Autoajuda','Como Fazer Amigos e Influenciar Pessoas','Dale Carnegie','Desenvolvimento pessoal'), ('Autoajuda','Essencialismo','Greg McKeown','Produtividade'), ('Autoajuda','O Poder do Agora','Eckhart Tolle','Inteligência emocional'), ('Autoajuda','A Sutil Arte de Ligar o Foda-se','Mark Manson','Desenvolvimento pessoal'),
                ('Educação','Entendendo Algoritmos','Aditya Y. Bhargava','Programação'), ('Educação','Código Limpo','Robert C. Martin','Programação'), ('Educação','Use a Cabeça Java','Kathy Sierra e Bert Bates','Programação'), ('Educação','Java: Como Programar','Paul Deitel e Harvey Deitel','Programação'), ('Educação','Aprendendo SQL','Alan Beaulieu','Tecnologia'), ('Educação','Sistema de Banco de Dados','Abraham Silberschatz','Tecnologia'), ('Educação','Algoritmos','Thomas H. Cormen','Ciências'), ('Educação','Lógica de Programação e Algoritmos com JavaScript','Edécio Fernando Iepsen','Aprendizagem'),
                ('Infantil','O Pequeno Príncipe','Antoine de Saint-Exupéry','Clássico infantil'), ('Infantil','Alice no País das Maravilhas','Lewis Carroll','Fantasia infantil'), ('Infantil','O Menino Maluquinho','Ziraldo','Aventura infantil'), ('Infantil','Marcelo, Marmelo, Martelo','Ruth Rocha','Educação infantil'), ('Infantil','Reinações de Narizinho','Monteiro Lobato','Fantasia infantil'), ('Infantil','O Gato Malhado e a Andorinha Sinhá','Jorge Amado','Contos'), ('Infantil','A Bolsa Amarela','Lygia Bojunga','Clássico infantil'), ('Infantil','Diário de um Banana','Jeff Kinney','Aventura infantil'), ('Infantil','Matilda','Roald Dahl','Fantasia infantil'),
                ('Poesia','Sentimento do Mundo','Carlos Drummond de Andrade','Poesia brasileira'), ('Poesia','A Rosa do Povo','Carlos Drummond de Andrade','Modernismo'), ('Poesia','Antologia Poética','Vinicius de Moraes','Antologia'), ('Poesia','Toda Poesia','Paulo Leminski','Poesia brasileira'), ('Poesia','Livro do Desassossego','Fernando Pessoa','Poesia portuguesa'), ('Poesia','Poemas Completos de Alberto Caeiro','Fernando Pessoa','Poesia portuguesa'), ('Poesia','Melhores Poemas de Cecília Meireles','Cecília Meireles','Poesia brasileira'), ('Poesia','Eu','Augusto dos Anjos','Poesia clássica'),
                ('Drama','A Menina que Roubava Livros','Markus Zusak','Drama histórico'), ('Drama','O Sol é Para Todos','Harper Lee','Drama social'), ('Drama','A Lista de Schindler','Thomas Keneally','Drama histórico'), ('Drama','As Vantagens de Ser Invisível','Stephen Chbosky','Formação'), ('Drama','O Caçador de Pipas','Khaled Hosseini','Drama familiar'), ('Drama','Extraordinário','R. J. Palacio','Drama social'), ('Drama','Torto Arado','Itamar Vieira Junior','Drama social'), ('Drama','Quarto de Despejo','Carolina Maria de Jesus','Realismo'),
                ('Humor','O Auto da Compadecida','Ariano Suassuna','Comédia brasileira'), ('Humor','Diário de um Banana: Rodrick é o Cara','Jeff Kinney','Humor cotidiano'), ('Humor','O Guia do Mochileiro das Galáxias','Douglas Adams','Comédia literária'), ('Humor','Feliz Ano Velho','Marcelo Rubens Paiva','Humor cotidiano'), ('Humor','Memórias Póstumas de Brás Cubas','Machado de Assis','Sátira'), ('Humor','O Analista de Bagé','Luis Fernando Verissimo','Comédia brasileira'), ('Humor','Comédias da Vida Privada','Luis Fernando Verissimo','Crônicas'), ('Humor','Como Ser Brasileiro','Matthew Shirts','Humor cotidiano'),
                ('Nacionais','Dom Casmurro','Machado de Assis','Clássicos brasileiros'), ('Nacionais','Memórias Póstumas de Brás Cubas','Machado de Assis','Realismo brasileiro'), ('Nacionais','Capitães da Areia','Jorge Amado','Romance nacional'), ('Nacionais','Vidas Secas','Graciliano Ramos','Regionalismo'), ('Nacionais','Grande Sertão: Veredas','João Guimarães Rosa','Regionalismo'), ('Nacionais','O Cortiço','Aluísio Azevedo','Realismo brasileiro'), ('Nacionais','Iracema','José de Alencar','Clássicos brasileiros'), ('Nacionais','Macunaíma','Mário de Andrade','Modernismo brasileiro')
        ) AS m(categoria, titulo, autor, subgenero)
        JOIN categoria c ON c.nome = m.categoria
        JOIN subgenero s ON s.id_categoria = c.id_categoria AND s.nome = m.subgenero
        JOIN livro livro_db ON lower(livro_db.titulo) = lower(m.titulo) AND lower(livro_db.autor) = lower(m.autor)
        ON CONFLICT (id_livro, id_subgenero) DO NOTHING;
    END IF;
END $$;

COMMIT;