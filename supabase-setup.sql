-- ============================================================================
-- SQL COMPLETO PARA SUPABASE - JOGO ADULTO GAMIFICADO
-- ============================================================================
-- Execute este script no Supabase SQL Editor
-- Database: PostgreSQL
-- Gerado automaticamente do Prisma Schema
-- ============================================================================

-- Habilitar extensão para UUIDs (se não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA 1: USERS (Autenticação)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT,
    provider TEXT NOT NULL DEFAULT 'credentials',
    email_verified TIMESTAMP,
    image TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- TABELA 2: PROFILES (Perfis de usuários)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT UNIQUE NOT NULL,
    nickname TEXT UNIQUE NOT NULL,
    bio TEXT,
    orientation TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);

-- ============================================================================
-- TABELA 3: CONNECTIONS (Conexões entre usuários)
-- ============================================================================
CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    from_id TEXT NOT NULL,
    to_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_connection_from FOREIGN KEY (from_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_connection_to FOREIGN KEY (to_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT unique_connection UNIQUE (from_id, to_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_from_id ON connections(from_id);
CREATE INDEX IF NOT EXISTS idx_connections_to_id ON connections(to_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- ============================================================================
-- TABELA 4: CARDS (Cartas oficiais)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    content TEXT NOT NULL,
    is_official BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category);
CREATE INDEX IF NOT EXISTS idx_cards_difficulty ON cards(difficulty);
CREATE INDEX IF NOT EXISTS idx_cards_is_official ON cards(is_official);

-- ============================================================================
-- TABELA 5: USER_CARDS (Cartas personalizadas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_cards (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    content TEXT NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_card_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_approved ON user_cards(approved);
CREATE INDEX IF NOT EXISTS idx_user_cards_likes_count ON user_cards(likes_count DESC);

-- ============================================================================
-- TABELA 6: CARD_LIKES (Curtidas em cartas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS card_likes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL,
    card_id TEXT,
    user_card_id TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_card_like_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_card_like_card FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    CONSTRAINT fk_card_like_user_card FOREIGN KEY (user_card_id) REFERENCES user_cards(id) ON DELETE CASCADE,
    CONSTRAINT unique_like_card UNIQUE (user_id, card_id),
    CONSTRAINT unique_like_user_card UNIQUE (user_id, user_card_id)
);

CREATE INDEX IF NOT EXISTS idx_card_likes_user_id ON card_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_card_likes_card_id ON card_likes(card_id);
CREATE INDEX IF NOT EXISTS idx_card_likes_user_card_id ON card_likes(user_card_id);

-- ============================================================================
-- TABELA 7: GAME_SESSIONS (Sessões de jogo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    creator_id TEXT NOT NULL,
    session_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    average_rating DOUBLE PRECISION,
    cards_played INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_game_session_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_creator_id ON game_sessions(creator_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_session_type ON game_sessions(session_type);

-- ============================================================================
-- TABELA 8: SESSION_PARTICIPANTS (Participantes das sessões)
-- ============================================================================
CREATE TABLE IF NOT EXISTS session_participants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    session_id TEXT NOT NULL,
    profile_id TEXT NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_session_participant_session FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_participant_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT unique_session_participant UNIQUE (session_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_profile_id ON session_participants(profile_id);

-- ============================================================================
-- TABELA 9: PLAYED_CARDS (Cartas jogadas nas sessões)
-- ============================================================================
CREATE TABLE IF NOT EXISTS played_cards (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    session_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    rating INTEGER,
    played_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_played_card_session FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_played_card_card FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    CONSTRAINT check_rating_range CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5))
);

CREATE INDEX IF NOT EXISTS idx_played_cards_session_id ON played_cards(session_id);
CREATE INDEX IF NOT EXISTS idx_played_cards_card_id ON played_cards(card_id);

-- ============================================================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_connections_updated_at ON connections;
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_cards_updated_at ON user_cards;
CREATE TRIGGER update_user_cards_updated_at BEFORE UPDATE ON user_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON game_sessions;
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POPULAR BANCO COM 80 CARTAS INICIAIS
-- ============================================================================

-- Limpar cartas existentes (caso já existam)
DELETE FROM cards WHERE is_official = TRUE;

-- Inserir 80 cartas oficiais
INSERT INTO cards (type, category, difficulty, content, is_official) VALUES
-- CASAIS - PERGUNTAS FÁCEIS (3)
('pergunta', 'casais', 'facil', 'Qual foi o momento em que você percebeu que estava apaixonado(a) por mim?', TRUE),
('pergunta', 'casais', 'facil', 'Qual é a sua memória favorita de nós dois juntos?', TRUE),
('pergunta', 'casais', 'facil', 'O que você mais admira em mim?', TRUE),

-- CASAIS - PERGUNTAS MÉDIAS (3)
('pergunta', 'casais', 'medio', 'Qual é a sua fantasia sexual mais secreta?', TRUE),
('pergunta', 'casais', 'medio', 'Há algo que você sempre quis experimentar na cama, mas nunca teve coragem de pedir?', TRUE),
('pergunta', 'casais', 'medio', 'Qual parte do meu corpo você mais gosta?', TRUE),

-- CASAIS - PERGUNTAS DIFÍCEIS (2)
('pergunta', 'casais', 'dificil', 'Você já imaginou estar com outra pessoa enquanto está comigo?', TRUE),
('pergunta', 'casais', 'dificil', 'Qual é o seu maior arrependimento em nossa vida íntima?', TRUE),

-- CASAIS - PERGUNTAS EXTREMAS (2)
('pergunta', 'casais', 'extremo', 'Você toparia um ménage? Com quem?', TRUE),
('pergunta', 'casais', 'extremo', 'Qual é o seu limite absoluto no sexo?', TRUE),

-- CASAIS - TAREFAS FÁCEIS (3)
('tarefa', 'casais', 'facil', 'Dê 3 beijos carinhosos no pescoço do seu parceiro(a).', TRUE),
('tarefa', 'casais', 'facil', 'Faça uma massagem relaxante nos pés do seu parceiro(a) por 2 minutos.', TRUE),
('tarefa', 'casais', 'facil', 'Olhe nos olhos do seu parceiro(a) por 30 segundos sem rir.', TRUE),

-- CASAIS - TAREFAS MÉDIAS (3)
('tarefa', 'casais', 'medio', 'Tire uma peça de roupa e deixe seu parceiro(a) escolher qual.', TRUE),
('tarefa', 'casais', 'medio', 'Dê um beijo quente de 1 minuto no seu parceiro(a).', TRUE),
('tarefa', 'casais', 'medio', 'Faça uma dança sensual para seu parceiro(a).', TRUE),

-- CASAIS - TAREFAS DIFÍCEIS (2)
('tarefa', 'casais', 'dificil', 'Venda os olhos do seu parceiro(a) e faça-o(a) adivinhar partes do seu corpo pelo toque.', TRUE),
('tarefa', 'casais', 'dificil', 'Mostre ao seu parceiro(a) como você se toca quando está sozinho(a).', TRUE),

-- CASAIS - TAREFAS EXTREMAS (2)
('tarefa', 'casais', 'extremo', 'Deixe seu parceiro(a) fazer o que quiser com você por 5 minutos.', TRUE),
('tarefa', 'casais', 'extremo', 'Pratique sexo oral no seu parceiro(a) até que ele(a) peça para parar.', TRUE),

-- TRIOS - PERGUNTAS FÁCEIS (2)
('pergunta', 'trios', 'facil', 'O que cada um de vocês espera dessa experiência?', TRUE),
('pergunta', 'trios', 'facil', 'Quem aqui teve mais experiência com mais de uma pessoa?', TRUE),

-- TRIOS - PERGUNTAS MÉDIAS (2)
('pergunta', 'trios', 'medio', 'Qual é o maior medo de vocês em relação a essa experiência?', TRUE),
('pergunta', 'trios', 'medio', 'Quem vocês acham que ficará mais confortável?', TRUE),

-- TRIOS - PERGUNTAS DIFÍCEIS (1)
('pergunta', 'trios', 'dificil', 'Há algum limite que não pode ser ultrapassado?', TRUE),

-- TRIOS - PERGUNTAS EXTREMAS (1)
('pergunta', 'trios', 'extremo', 'Vocês estariam dispostos a repetir essa experiência?', TRUE),

-- TRIOS - TAREFAS FÁCEIS (2)
('tarefa', 'trios', 'facil', 'Todos devem tirar um sapato.', TRUE),
('tarefa', 'trios', 'facil', 'Façam um brinde e compartilhem o que mais os atraiu nessa experiência.', TRUE),

-- TRIOS - TAREFAS MÉDIAS (2)
('tarefa', 'trios', 'medio', 'Duas pessoas devem se beijar enquanto a terceira observa.', TRUE),
('tarefa', 'trios', 'medio', 'Cada pessoa deve remover uma peça de roupa de outra.', TRUE),

-- TRIOS - TAREFAS DIFÍCEIS (1)
('tarefa', 'trios', 'dificil', 'Duas pessoas devem fazer carícias na terceira por 2 minutos.', TRUE),

-- TRIOS - TAREFAS EXTREMAS (1)
('tarefa', 'trios', 'extremo', 'A pessoa do meio recebe atenção simultânea das outras duas.', TRUE),

-- GRUPOS - PERGUNTAS FÁCEIS (2)
('pergunta', 'grupos', 'facil', 'O que cada um espera dessa noite?', TRUE),
('pergunta', 'grupos', 'facil', 'Quem aqui já participou de algo assim antes?', TRUE),

-- GRUPOS - PERGUNTAS MÉDIAS (2)
('pergunta', 'grupos', 'medio', 'Qual é o maior tabu de vocês?', TRUE),
('pergunta', 'grupos', 'medio', 'Quem vocês acham que surpreenderá o grupo?', TRUE),

-- GRUPOS - PERGUNTAS DIFÍCEIS (1)
('pergunta', 'grupos', 'dificil', 'Há alguém no grupo com quem você tem mais curiosidade?', TRUE),

-- GRUPOS - PERGUNTAS EXTREMAS (1)
('pergunta', 'grupos', 'extremo', 'Vocês estariam abertos a trocar de parceiros?', TRUE),

-- GRUPOS - TAREFAS FÁCEIS (2)
('tarefa', 'grupos', 'facil', 'Cada pessoa deve compartilhar uma expectativa.', TRUE),
('tarefa', 'grupos', 'facil', 'Façam um círculo e se cumprimentem com abraços.', TRUE),

-- GRUPOS - TAREFAS MÉDIAS (2)
('tarefa', 'grupos', 'medio', 'Cada pessoa deve tirar uma peça de roupa.', TRUE),
('tarefa', 'grupos', 'medio', 'Joguem garrafa e quem a garrafa apontar deve beijar quem girou.', TRUE),

-- GRUPOS - TAREFAS DIFÍCEIS (1)
('tarefa', 'grupos', 'dificil', 'Formem pares aleatórios e façam uma dança sensual.', TRUE),

-- GRUPOS - TAREFAS EXTREMAS (1)
('tarefa', 'grupos', 'extremo', 'O grupo escolhe duas pessoas para protagonizar uma cena íntima enquanto assistem.', TRUE),

-- CASAIS - PERGUNTAS FÁCEIS ADICIONAIS (2)
('pergunta', 'casais', 'facil', 'Qual foi o nosso melhor beijo?', TRUE),
('pergunta', 'casais', 'facil', 'Onde você mais gosta de ser tocado(a)?', TRUE),

-- CASAIS - PERGUNTAS MÉDIAS ADICIONAIS (2)
('pergunta', 'casais', 'medio', 'Qual é o seu lugar favorito para fazer amor?', TRUE),
('pergunta', 'casais', 'medio', 'Qual foi a vez que você mais sentiu desejo por mim?', TRUE),

-- CASAIS - PERGUNTAS DIFÍCEIS ADICIONAIS (2)
('pergunta', 'casais', 'dificil', 'Você já fingiu um orgasmo comigo?', TRUE),
('pergunta', 'casais', 'dificil', 'O que eu faço que te deixa louco(a) de tesão?', TRUE),

-- CASAIS - PERGUNTAS EXTREMAS ADICIONAIS (2)
('pergunta', 'casais', 'extremo', 'Você toparia gravar um vídeo íntimo comigo?', TRUE),
('pergunta', 'casais', 'extremo', 'Qual é a sua posição sexual favorita e por quê?', TRUE),

-- CASAIS - TAREFAS FÁCEIS ADICIONAIS (2)
('tarefa', 'casais', 'facil', 'Beije suavemente a orelha do seu parceiro(a).', TRUE),
('tarefa', 'casais', 'facil', 'Sussurre algo sensual no ouvido do seu parceiro(a).', TRUE),

-- CASAIS - TAREFAS MÉDIAS ADICIONAIS (2)
('tarefa', 'casais', 'medio', 'Massageie as coxas do seu parceiro(a) por 2 minutos.', TRUE),
('tarefa', 'casais', 'medio', 'Sente no colo do seu parceiro(a) e olhe nos olhos dele(a) por 1 minuto.', TRUE),

-- CASAIS - TAREFAS DIFÍCEIS ADICIONAIS (2)
('tarefa', 'casais', 'dificil', 'Tire toda a roupa do seu parceiro(a) lentamente.', TRUE),
('tarefa', 'casais', 'dificil', 'Faça uma trilha de beijos do pescoço até a barriga do seu parceiro(a).', TRUE),

-- CASAIS - TAREFAS EXTREMAS ADICIONAIS (2)
('tarefa', 'casais', 'extremo', 'Realize a fantasia sexual que seu parceiro(a) acabou de revelar.', TRUE),
('tarefa', 'casais', 'extremo', 'Tenha uma relação completa agora.', TRUE),

-- TRIOS - PERGUNTAS FÁCEIS ADICIONAIS (1)
('pergunta', 'trios', 'facil', 'Quem você acha mais atraente aqui e por quê?', TRUE),

-- TRIOS - PERGUNTAS MÉDIAS ADICIONAIS (1)
('pergunta', 'trios', 'medio', 'Você prefere ser o centro das atenções ou observar?', TRUE),

-- TRIOS - PERGUNTAS DIFÍCEIS ADICIONAIS (1)
('pergunta', 'trios', 'dificil', 'Existe alguma combinação específica que você gostaria de experimentar?', TRUE),

-- TRIOS - PERGUNTAS EXTREMAS ADICIONAIS (1)
('pergunta', 'trios', 'extremo', 'Qual é o seu maior desejo nesse momento?', TRUE),

-- TRIOS - TAREFAS FÁCEIS ADICIONAIS (1)
('tarefa', 'trios', 'facil', 'Cada pessoa deve dar um elogio sincero a outra.', TRUE),

-- TRIOS - TAREFAS MÉDIAS ADICIONAIS (1)
('tarefa', 'trios', 'medio', 'Todos devem se tocar simultaneamente por 1 minuto.', TRUE),

-- TRIOS - TAREFAS DIFÍCEIS ADICIONAIS (1)
('tarefa', 'trios', 'dificil', 'Formem uma configuração onde todos estão se tocando ao mesmo tempo.', TRUE),

-- TRIOS - TAREFAS EXTREMAS ADICIONAIS (1)
('tarefa', 'trios', 'extremo', 'Experimentem uma posição sexual a três.', TRUE),

-- GRUPOS - PERGUNTAS FÁCEIS ADICIONAIS (1)
('pergunta', 'grupos', 'facil', 'Qual é a sua maior fantasia em grupo?', TRUE),

-- GRUPOS - PERGUNTAS MÉDIAS ADICIONAIS (1)
('pergunta', 'grupos', 'medio', 'Você se sente confortável com todos aqui?', TRUE),

-- GRUPOS - PERGUNTAS DIFÍCEIS ADICIONAIS (1)
('pergunta', 'grupos', 'dificil', 'Há algo que você não faria de jeito nenhum?', TRUE),

-- GRUPOS - PERGUNTAS EXTREMAS ADICIONAIS (1)
('pergunta', 'grupos', 'extremo', 'Quem você mais quer ver em ação?', TRUE),

-- GRUPOS - TAREFAS FÁCEIS ADICIONAIS (1)
('tarefa', 'grupos', 'facil', 'Todos devem compartilhar um desejo.', TRUE),

-- GRUPOS - TAREFAS MÉDIAS ADICIONAIS (1)
('tarefa', 'grupos', 'medio', 'Façam um trem de massagens (cada um massageia a pessoa da frente).', TRUE),

-- GRUPOS - TAREFAS DIFÍCEIS ADICIONAIS (1)
('tarefa', 'grupos', 'dificil', 'O grupo deve escolher alguém para receber atenção de todos por 3 minutos.', TRUE),

-- GRUPOS - TAREFAS EXTREMAS ADICIONAIS (1)
('tarefa', 'grupos', 'extremo', 'Livre para experimentarem o que quiserem pelos próximos 10 minutos.', TRUE);

-- ============================================================================
-- VERIFICAÇÃO: Contar cartas inseridas
-- ============================================================================
SELECT
    type,
    category,
    difficulty,
    COUNT(*) as total
FROM cards
WHERE is_official = TRUE
GROUP BY type, category, difficulty
ORDER BY category, type,
    CASE difficulty
        WHEN 'facil' THEN 1
        WHEN 'medio' THEN 2
        WHEN 'dificil' THEN 3
        WHEN 'extremo' THEN 4
    END;

-- Total geral
SELECT COUNT(*) as total_cartas FROM cards WHERE is_official = TRUE;

-- ============================================================================
-- SCRIPT CONCLUÍDO COM SUCESSO! ✅
-- ============================================================================
-- Próximos passos:
-- 1. Copie a Connection String do Supabase
-- 2. Adicione no .env como DATABASE_URL
-- 3. Teste a aplicação localmente
-- 4. Deploy na Vercel!
-- ============================================================================
