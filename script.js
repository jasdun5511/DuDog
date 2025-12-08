// --- 1. 核心数据与常量 ---

// 牌面值映射 (与Python类似：3-17)
const RANKS = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: '2', 16: 'w', 17: 'W' };
const SUITS = ['S', 'H', 'D', 'C']; // 黑桃、红心、方块、梅花 (暂时简化处理)

const GAME_STATE = {
    // 简化版状态，用于单机测试
    hands: {
        south: [], // 玩家手牌 (数组 of {value, suit})
        north: [], // 电脑1手牌
        east: []   // 电脑2手牌
    },
    deck: [],       // 牌堆
    bottomCards: [],// 底牌
    currentPlayer: 'south', // 当前回合玩家
    lastPlayed: {
        player: null,
        cards: [],
        type: null,
        mainValue: 0
    }
};

// --- 2. DOM 元素获取 ---
const southHandEl = document.getElementById('south-hand');
const controlsEl = document.getElementById('controls');
const statusMessageEl = document.getElementById('status-message');

// --- 3. 核心卡牌函数 (用于创建和渲染卡牌) ---

/**
 * 创建一副完整的54张牌
 */
function createDeck() {
    let deck = [];
    // 3-15 (3-2) 共 13 * 4 = 52 张
    for (let value = 3; value <= 15; value++) {
        for (const suit of SUITS) {
            deck.push({ value, suit });
        }
    }
    // 大小王
    deck.push({ value: 16, suit: 'JokerS' });
    deck.push({ value: 17, suit: 'JokerB' });
    return deck;
}

/**
 * 洗牌 (Fisher-Yates)
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * 将牌面值转换为可显示的字符串
 */
function getCardRank(value) {
    return RANKS[value] || String(value);
}

/**
 * 渲染玩家手牌到 DOM
 */
function renderHand() {
    southHandEl.innerHTML = '';
    // 确保手牌是按值排序的 (方便玩家查看)
    GAME_STATE.hands.south.sort((a, b) => a.value - b.value);

    GAME_STATE.hands.south.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.textContent = getCardRank(card.value);
        cardEl.dataset.value = card.value; // 用于JS逻辑获取值
        cardEl.dataset.suit = card.suit;
        
        // 绑定点击事件，用于选中/取消选中
        cardEl.addEventListener('click', () => {
            cardEl.classList.toggle('selected');
        });

        southHandEl.appendChild(cardEl);
    });
}


// --- 4. 游戏流程函数 ---

function startGame() {
    GAME_STATE.deck = createDeck();
    shuffle(GAME_STATE.deck);

    // 1. 发牌
    for (let i = 0; i < 17; i++) {
        GAME_STATE.hands.south.push(GAME_STATE.deck.pop());
        GAME_STATE.hands.north.push(GAME_STATE.deck.pop());
        GAME_STATE.hands.east.push(GAME_STATE.deck.pop());
    }

    // 2. 底牌
    GAME_STATE.bottomCards = GAME_STATE.deck.splice(0, 3); 
    
    // 3. 渲染
    renderHand();
    statusMessageEl.textContent = '请叫地主！';

    // 启用叫地主按钮
    document.getElementById('btn-call-landlord').disabled = false;
}

function handleCallLandlord() {
    // 简化处理：玩家直接抢地主
    const player = 'south'; 
    statusMessageEl.textContent = '您成为了地主！';

    // 玩家获得底牌
    GAME_STATE.hands[player].push(...GAME_STATE.bottomCards);
    
    // 隐藏底牌
    document.getElementById('bottom-cards').innerHTML = '';
    // 重新渲染手牌
    renderHand();

    // 切换控制按钮
    document.getElementById('btn-call-landlord').style.display = 'none';
    document.getElementById('btn-pass').disabled = false;
    document.getElementById('btn-play').disabled = false;
    // ... 开始出牌流程 ...
    GAME_STATE.currentPlayer = 'south';
}

function handlePlayCards() {
    const selectedCardsEl = Array.from(southHandEl.querySelectorAll('.card.selected'));
    const playedCards = selectedCardsEl.map(el => ({ 
        value: parseInt(el.dataset.value), 
        suit: el.dataset.suit 
    }));

    if (playedCards.length === 0) {
        alert("请选择要出的牌！");
        return;
    }

    // *** 在这里调用上一个回答中的核心校验逻辑 ***
    // 1. 牌型校验：checkCardType(playedCards)
    // 2. 牌型比较：compareCards(playedCards, GAME_STATE.lastPlayed.cards)
    
    // 假设校验通过
    const isValid = true; // 替换为真实的校验结果

    if (isValid) {
        // 1. 从手牌中移除
        const playedValues = playedCards.map(c => c.value);
        GAME_STATE.hands.south = GAME_STATE.hands.south.filter(card => {
            // 简单的移除逻辑，对于有重复值的牌需要更复杂的处理
            const index = playedValues.indexOf(card.value);
            if (index !== -1) {
                playedValues.splice(index, 1); // 找到并消耗一个值
                return false;
            }
            return true;
        });

        // 2. 更新出牌区 (Player South)
        const playArea = document.getElementById('player-south-play') || document.createElement('div');
        playArea.id = 'player-south-play';
        playArea.className = 'played-cards';
        // ... 渲染 playedCards 到 playArea ...
        
        // 3. 更新游戏状态
        // GAME_STATE.lastPlayed = { player: 'south', cards: playedCards, ... };
        
        // 4. 切换回合
        // GAME_STATE.currentPlayer = 'north'; 

        // 5. 重新渲染手牌
        renderHand();
        statusMessageEl.textContent = '出牌成功！轮到电脑玩家...';
    } else {
        statusMessageEl.textContent = '牌型不合法或不能打过上家！';
    }
}


// --- 5. 事件绑定与初始化 ---

// 绑定按钮事件
document.getElementById('btn-call-landlord').addEventListener('click', handleCallLandlord);
document.getElementById('btn-play').addEventListener('click', handlePlayCards);
document.getElementById('btn-pass').addEventListener('click', () => {
    // 简单的“不出”逻辑，需要加入回合切换
    statusMessageEl.textContent = '您选择了不出。';
    // GAME_STATE.currentPlayer = 'north'; 
});
// document.getElementById('btn-tip').addEventListener('click', handleTip); // 提示逻辑较复杂，待实现

// 初始化游戏
startGame();
