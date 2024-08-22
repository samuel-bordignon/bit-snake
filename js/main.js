const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const scoreP1 = document.querySelector('.pontuacao-value-p1')
const scoreP2 = document.querySelector('.pontuacao-value-p2')
const finalScore = document.querySelector('.pontuacao-final > span')
const menu = document.querySelector('.menu-screen')
const stateGame = document.querySelector('.state-game')
const buttonPlay = document.querySelector('.btn-play')
const buttonMenu = document.querySelector('.btn-menu')


const size = 30

const audio = new Audio('audio.mp3')

const dbCobrinha1 = { x: 120, y: 240, corCabeca: 'red', corCorpo: 'red' }
const dbCobrinha2 = { x: 420, y: 240, corCabeca: 'blue', corCorpo: 'blue' }

let isGameOver = false

let cobrinha1 = [dbCobrinha1]
let cobrinha2 = [dbCobrinha2]



const incrementScore = (score) => {
    score.innerText = +score.innerText + 10
}

const randomNmber = (min, max) => {
    return Math.round(Math.random() * (max + min) + min)
}

const randomPosition = () => {
    const number = randomNmber(0, canvas.width - size)
    return Math.round(number / 30) * 30
}

const randomColor = () => {
    const red = randomNmber(0, 255)
    const green = randomNmber(0, 255)
    const blue = randomNmber(0, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

let directionP1, directionP2, loopId

const desenhaComida = () => {

    const { x, y, color } = food

    ctx.shadowBlur = 6
    ctx.shadowColor = color
    ctx.fillStyle = food.color
    ctx.fillRect(food.x, food.y, size, size)
    ctx.shadowBlur = 0

}

const desenhaCobra = (cobra) => {
    cobra.forEach((position, index) => {
        if (index === cobra.length - 1) {
            ctx.fillStyle = position.corCabeca // Cor da cabeça
        } else {
            ctx.fillStyle = position.corCorpo // Cor do corpo
        }
        ctx.fillRect(position.x, position.y, size, size)
    })
}

const desenhaGrade = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = '191919'

    for (let i = size; i < canvas.width; i += size) {
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }
}

const moveCobrinha = (cobra, direction) => {
    if (!direction) return;
    const head = cobra[cobra.length - 1];

    let newHead;
    if (direction === 'right') {
        newHead = { x: head.x + size, y: head.y };
    }
    if (direction === 'left') {
        newHead = { x: head.x - size, y: head.y };
    }
    if (direction === 'down') {
        newHead = { x: head.x, y: head.y + size };
    }
    if (direction === 'up') {
        newHead = { x: head.x, y: head.y - size };
    }

    // Adiciona o novo segmento com a cor correta
    cobra.push({ ...newHead, corCabeca: head.corCabeca, corCorpo: head.corCorpo });
    cobra.shift();
};

const checkEat = (cobra, score) => {
    const head = cobra[cobra.length - 1];

    if (head.x === food.x && head.y === food.y) {
        incrementScore(score);
        cobra.push({ ...head, corCabeca: head.corCabeca, corCorpo: head.corCorpo });
        audio.play();

        let x = randomPosition();
        let y = randomPosition();

        // Garante que a comida não apareça em cima da cobra
        while (cobrinha1.find((position) => position.x === x && position.y === y) || cobrinha2.find((position) => position.x === x && position.y === y)) {
            x = randomPosition();
            y = randomPosition();
        }

        food.x = x;
        food.y = y;
        food.color = randomColor();
    }
};

const chackColision = (cobra) => {
    const head = cobra[cobra.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = cobra.length - 2

    const wallColision =
        head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    const selfColision = cobra.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    const playerColision = cobra.find((position, index) => {
        position.x == head.x && position.y == head.y
    })


    if (wallColision || selfColision) {
        gameOver()
    }
}

const checkScore = (player) => {

    if (player.innerText == 2250) {
        playAgain()
    }
}

const gameOver = () => {
    directionP1 = undefined
    directionP2 = undefined
    stateGame.innerText = 'game over'
    isGameOver = true

    menu.style.display = 'flex'
    finalScore.innerText = scoreP1.innerText
    canvas.style.filter = 'blur(2px)'
}

const playAgain = () => {
    directionP1 = undefined
    directionP2 = undefined
    stateGame.innerText = 'you win'
    isGameOver = true

    menu.style.display = 'flex'
    finalScore.innerText = scoreP1.innerText
    canvas.style.filter = 'blur(2px)'
}

const gameLoop = () => {
    clearInterval(loopId)
    ctx.clearRect(0, 0, 600, 600)
    desenhaGrade()
    desenhaComida()
    desenhaCobra(cobrinha1)
    desenhaCobra(cobrinha2)
    moveCobrinha(cobrinha1, directionP1)
    moveCobrinha(cobrinha2, directionP2)
    checkEat(cobrinha1, scoreP1)
    checkEat(cobrinha2, scoreP2)
    chackColision(cobrinha1)
    chackColision(cobrinha2)

    console.log(cobrinha1[0].x, cobrinha1[0].y)

    loopId = setTimeout(() => {
        gameLoop()
    }, 150);
}

gameLoop()

let directionLocked = false; // Variável para controlar o delay entre mudanças de direção

document.addEventListener('keydown', ({ key }) => {
    if (isGameOver) return // Impedir movimento se o jogo acabou

    if (directionLocked) return; // Se a direção estiver bloqueada, ignorar o comando

    // Verifica a direção atual para evitar a mudança para a direção oposta
    if (key === "ArrowRight" && directionP2 !== "left") {
        directionP2 = 'right';
        directionLocked = true;
    }

    if (key === "ArrowLeft" && directionP2 !== "right") {
        directionP2 = 'left';
        directionLocked = true;
    }

    if (key === "ArrowDown" && directionP2 !== "up") {
        directionP2 = 'down';
        directionLocked = true;
    }

    if (key === "ArrowUp" && directionP2 !== "down") {
        directionP2 = 'up';
        directionLocked = true;
    }

    //movimentação do player 2

    if((key === "d" || key === 'D') && directionP1 !== "left") {
        directionP1 = 'right';
        directionLocked = true;
    }

    if((key === "a" || key === 'A') && directionP1 !== "right") {
        directionP1 = 'left';
        directionLocked = true;
    }

    if((key === "S" || key === 's') && directionP1 !== "up") {
        directionP1 = 'down';
        directionLocked = true;
    }
    if((key === "W" || key === 'w') && directionP1 !== "down") {
        directionP1 = 'up';
        directionLocked = true;
    }

    setTimeout(() => {
        directionLocked = false;
    }, 1);
});

buttonPlay.addEventListener('click', () => {

    isGameOver = false
    scoreP1.innerText = '00'
    scoreP2.innerText = '00'

    menu.style.display = 'none'
    canvas.style.filter = 'none'

    cobrinha1 = [dbCobrinha1]
    cobrinha2 = [dbCobrinha2]
})

buttonMenu.addEventListener('click', () => window.location.href = 'menu.html')