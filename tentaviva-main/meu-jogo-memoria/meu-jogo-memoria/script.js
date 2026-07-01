// ============================================================
// 1. RELÓGIO EM TEMPO REAL
// ============================================================
(function initClock() {
    const timeSpan = document.getElementById('liveTime');
    if (timeSpan) {
        function updateClock() {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            timeSpan.textContent = `${h}:${m}:${s}`;
        }
        updateClock();
        setInterval(updateClock, 1000);
    }
})();

// ============================================================
// 2. LÓGICA DO JOGO (MEMORY SPACE GAME)
// ============================================================
(function gameLogic() {
    // ===== ELEMENTOS DOM =====
    const loginScreen = document.getElementById('login-screen');
    const tutorialScreen = document.getElementById('tutorial-screen');
    const helpScreen = document.getElementById('help-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameBoard = document.getElementById('game-board');
    const turnName = document.getElementById('turnName');
    const scoreVal1 = document.getElementById('scoreVal1');
    const scoreVal2 = document.getElementById('scoreVal2');
    const scoreName1 = document.getElementById('scoreName1');
    const scoreName2 = document.getElementById('scoreName2');
    const levelDisplay = document.getElementById('levelDisplay');
    const pairCountDisplay = document.getElementById('pairCountDisplay');

    // ===== ESTADO DO JOGO =====
    let players = [];
    let currentPlayer = 0;
    let flippedCards = [];
    let matchedPairs = 0;
    let level = 1;
    let scores = [0, 0];
    let totalPairs = 0;
    let isLocked = false;
    let gameActive = false;
    let cardsData = [];
    let moveCount = 0;
    let gameStartTime = null;

    // ===== EMOJIS DISPONÍVEIS =====
    const EMOJIS = ['🚀', '🛸', '🌕', '🌌', '🌟', '☄️', '🪐', '🌍', '👽', '🔭', '⚡', '💫', '🌠', '🛰️', '🧬', '🌀', '🌊', '🔥', '❄️', '🌈'];

    // ===== FUNÇÕES AUXILIARES =====
    function getEmojisForLevel(lvl) {
        const count = Math.min(4 + Math.floor(lvl * 0.6), EMOJIS.length);
        return EMOJIS.slice(0, count);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
    }

    // ===== FUNÇÕES PRINCIPAIS =====
    function startGame() {
        const p1 = document.getElementById('player1').value.trim() || 'Alpha';
        const p2 = document.getElementById('player2').value.trim() || 'Beta';
        players = [p1, p2];
        currentPlayer = 0;
        level = 1;
        matchedPairs = 0;
        scores = [0, 0];
        moveCount = 0;
        gameActive = true;
        gameStartTime = Date.now();

        scoreName1.textContent = p1;
        scoreName2.textContent = p2;

        showScreen('game-screen');
        buildBoard();
        updateUI();
        updateTurnInfo();
    }

    function buildBoard() {
        const emojis = getEmojisForLevel(level);
        const pairCount = Math.min(4 + Math.floor(level * 0.6), emojis.length);
        totalPairs = pairCount;
        const selectedEmojis = emojis.slice(0, pairCount);
        let deck = [...selectedEmojis, ...selectedEmojis];
        deck = shuffleArray(deck);

        cardsData = deck.map((emoji, index) => ({
            id: index,
            emoji: emoji,
            flipped: false,
            matched: false
        }));

        flippedCards = [];
        matchedPairs = 0;
        isLocked = false;

        renderBoard();
        updateUI();
        updateTurnInfo();
    }

    function renderBoard() {
        const total = cardsData.length;
        const cols = Math.min(4, Math.ceil(Math.sqrt(total)));
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gameBoard.innerHTML = '';

        cardsData.forEach((card, index) => {
            const div = document.createElement('div');
            div.className = 'card';
            if (card.matched) {
                div.classList.add('matched');
                div.textContent = card.emoji;
            } else if (card.flipped) {
                div.classList.add('flipped');
                div.textContent = card.emoji;
            } else {
                div.textContent = '';
            }
            div.dataset.index = index;
            div.addEventListener('click', () => onCardClick(index));
            gameBoard.appendChild(div);
        });
    }

    function onCardClick(index) {
        if (isLocked || !gameActive) return;
        const card = cardsData[index];
        if (card.flipped || card.matched) return;
        if (flippedCards.length >= 2) return;

        // Vira a carta
        card.flipped = true;
        flippedCards.push(index);
        moveCount++;
        renderBoard();

        if (flippedCards.length === 2) {
            isLocked = true;
            const idx1 = flippedCards[0];
            const idx2 = flippedCards[1];
            const card1 = cardsData[idx1];
            const card2 = cardsData[idx2];

            if (card1.emoji === card2.emoji) {
                // PAR ENCONTRADO!
                setTimeout(() => {
                    card1.matched = true;
                    card2.matched = true;
                    scores[currentPlayer]++;
                    matchedPairs++;
                    flippedCards = [];
                    isLocked = false;

                    // Animação de match
                    const elements = gameBoard.children;
                    if (elements[idx1]) elements[idx1].classList.add('match-anim');
                    if (elements[idx2]) elements[idx2].classList.add('match-anim');

                    updateUI();
                    renderBoard();

                    // Verifica se completou o nível
                    if (matchedPairs === totalPairs) {
                        setTimeout(() => {
                            const timePlayed = Math.floor((Date.now() - gameStartTime) / 1000);
                            const minutes = Math.floor(timePlayed / 60);
                            const seconds = timePlayed % 60;
                            alert(
                                `🎉 Nível ${level} COMPLETO! 🎉\n\n` +
                                `🏆 ${players[currentPlayer]} fez o último par!\n` +
                                `⏱️ Tempo: ${minutes}m ${seconds}s\n` +
                                `📊 Placar: ${players[0]} ${scores[0]} × ${scores[1]} ${scores[1]}\n` +
                                `🔄 Movimentos: ${moveCount}`
                            );
                        }, 400);
                    }
                    updateTurnInfo();
                }, 300);
            } else {
                // NÃO DEU MATCH
                setTimeout(() => {
                    card1.flipped = false;
                    card2.flipped = false;
                    flippedCards = [];
                    isLocked = false;

                    // Passa a vez
                    currentPlayer = (currentPlayer + 1) % 2;
                    renderBoard();
                    updateUI();
                    updateTurnInfo();
                }, 700);
            }
        } else {
            updateTurnInfo();
        }
    }

    function updateUI() {
        scoreVal1.textContent = scores[0];
        scoreVal2.textContent = scores[1];
        levelDisplay.textContent = level;
        if (pairCountDisplay) {
            pairCountDisplay.textContent = totalPairs;
        }
    }

    function updateTurnInfo() {
        if (players.length === 0) return;
        turnName.textContent = players[currentPlayer];
        // Adiciona um ícone de turno
        const icon = currentPlayer === 0 ? '🪐' : '🌌';
        turnName.innerHTML = `${icon} ${players[currentPlayer]}`;
    }

    function nextLevel() {
        if (!gameActive) {
            alert('⚠️ O jogo não está ativo. Inicie uma partida primeiro!');
            return;
        }
        if (matchedPairs < totalPairs) {
            alert(`❌ Complete todas as cartas (${matchedPairs}/${totalPairs} pares) antes de avançar!`);
            return;
        }
        level++;
        gameStartTime = Date.now();
        moveCount = 0;
        buildBoard();
        updateUI();
        // Não reinicia os scores
        alert(`🚀 Nível ${level} iniciado! ${totalPairs} pares para encontrar.`);
    }

    // ===== NAVEGAÇÃO ENTRE TELAS =====
    function showTutorial() {
        showScreen('tutorial-screen');
    }

    function showHelp() {
        showScreen('help-screen');
    }

    function backToLogin() {
        gameActive = false;
        showScreen('login-screen');
        // Reseta visualmente
        scores = [0, 0];
        currentPlayer = 0;
        level = 1;
        matchedPairs = 0;
        updateUI();
    }

    // ===== EXPOR FUNÇÕES GLOBALMENTE =====
    window.startGame = startGame;
    window.showTutorial = showTutorial;
    window.showHelp = showHelp;
    window.backToLogin = backToLogin;
    window.nextLevel = nextLevel;

    // ===== INICIALIZAÇÃO =====
    // Pré-carrega o board para quando iniciar
    if (gameBoard) {
        cardsData = [];
        renderBoard();
    }

    console.log('🚀 The Memory Space Game carregado!');
    console.log('📋 Use startGame() para iniciar uma partida.');
})();