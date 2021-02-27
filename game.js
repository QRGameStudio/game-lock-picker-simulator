let SPRITE_LOCK_LOCKED = ['.'];
let SPRITE_LOCK_UNLOCKED = ['.'];
let SPRITE_COIN = ['.'];

/**
 * @type GSongLib
 */
let MUSIC;

/**
 * @type GModal
 */
let MODAL;

/**
 * @type HTMLElement
 */
let EL_CONTENT;
/**
 * @type HTMLElement
 */
let EL_LOCK_CONTAINER;
/**
 * @type HTMLElement
 */
let EL_MONEY;

/**
 * @type GTonesSequence
 */
let SONG;

let COINS = 0;
let COINS_PAINTED = 0;
let INTERVAL_COINS_PAINTING = null;

function gameEntryPoint() {
    COINS = COINS_PAINTED = 2500;
    EL_CONTENT = document.querySelector('#game-layer');
    EL_LOCK_CONTAINER = EL_CONTENT.querySelector('.locks');
    EL_MONEY = EL_CONTENT.querySelector('.money');
    SPRITE_LOCK_LOCKED = [...GUt.ud('8J+Ukg==')];
    SPRITE_LOCK_UNLOCKED = [...GUt.ud('8J+Ukw==')];
    SPRITE_COIN = [...GUt.ud('8J+SsA==')];
    MODAL = new GModal();
    MUSIC = new GSongLib();
    MUSIC.get('songALooping').then((song) => {
        SONG = song;
        song.play(-1);
    });
    paintCoins();
    genLevel();
}

function randint(n) {
    return Math.floor(Math.random() * n);
}

function paintCoins() {
    if (INTERVAL_COINS_PAINTING !== null) {
        return;
    }

    INTERVAL_COINS_PAINTING = setInterval(() => {
        const delta = COINS - COINS_PAINTED;

        if (Math.abs(delta) < 3) {
            COINS_PAINTED = COINS;
            clearInterval(INTERVAL_COINS_PAINTING);
            INTERVAL_COINS_PAINTING = null;
        } else {
            COINS_PAINTED += Math.floor(delta * 0.1);
        }

        EL_MONEY.innerText = `${SPRITE_COIN[0]} ${COINS_PAINTED}`;
    }, 30);
}

function genLevel() {
    EL_LOCK_CONTAINER.innerHTML = '';

    const correctLock = randint(3);
    /**
     * @type {HTMLElement[]}
     */
    const locks = [];

    for (let i = 0; i < 3; i++) {
        const lock = document.createElement('div');
        locks.push(lock);
        lock.classList.add('lock');
        lock.innerText = SPRITE_LOCK_LOCKED[0];
        lock.dataset.w = i === correctLock ? 'yay' : 'nay'; // w stands for winning
        lock.dataset.d = '0';  // d stands for disabled
        lock.onclick = () => {
            if (lock.dataset.d === '1') {
                return;
            }
            if (i === correctLock) {
                lock.innerText = SPRITE_LOCK_UNLOCKED[0];
                COINS += 50 + randint(1000);
                SONG.stop();
                MUSIC.play('success').then(() => SONG.play(-1));
            } else {
                COINS -= 50 + randint(300);
                SONG.stop();
                MUSIC.play('fail').then(() => SONG.play(-1));
            }
            paintCoins();

            locks.forEach((l) => {
                l.dataset.d = '1';
                const disappear = () => l.style.visibility = 'hidden';
                if (l.dataset.w !== 'yay') {
                    disappear();
                } else {
                    setTimeout(async () => {
                        disappear();
                        if (COINS > 0) {
                            genLevel();
                        } else {
                            SONG.stop();
                            SONG = await MUSIC.get('failLong');
                            MODAL.alert('GAME OVER', 'FAIL').then(() => {
                                gameEntryPoint();
                            });
                        }
                    }, 1500);
                }
            });
        };
        EL_LOCK_CONTAINER.appendChild(lock);
    }
}

window.onload = gameEntryPoint;
