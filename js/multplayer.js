const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const scoreP1 = document.querySelector('.pontuacao-value-p1')
const scoreP2 = document.querySelector('.pontuacao-value-p2')
const conatiner = document.querySelector('.container')
const finalScore = document.querySelector('.pontuacao-final > span')
const menu = document.querySelector('.menu-screen')
const stateGame = document.querySelector('.state-game')
const buttonPlay = document.querySelector('.btn-play')
const buttonMenu = document.querySelector('.btn-menu')

const audio = new Audio('audio.mp3')
const background = new Audio('background.mp3')
const death = new Audio('death.mp3')

const dbCobrinha1 = { x: 150, y: 300, corCabeca: '#FF0000', corCorpo: '#D40000' }
const dbCobrinha2 = { x: 450, y: 300, corCabeca: '#0000FF', corCorpo: '#0000D4' }
const size = 30

background.volume = 0.5
background.loop = true
background.play()

let isGameOver = false
let cobrinha1 = [dbCobrinha1]
let cobrinha2 = [dbCobrinha2]
let directionLocked = false // Variável para controlar o delay entre mudanças de direção


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
    const red = randomNmber(50, 255)
    const green = randomNmber(50, 255)
    const blue = randomNmber(50, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

const fruits = [
    { x: randomPosition(), y: randomPosition(), color: randomColor() },
    { x: randomPosition(), y: randomPosition(), color: randomColor() },
    { x: randomPosition(), y: randomPosition(), color: randomColor() },
    { x: randomPosition(), y: randomPosition(), color: randomColor() },
    { x: randomPosition(), y: randomPosition(), color: randomColor() },
]

let directionP1, directionP2, loopId

const desenhaComida = () => {

    fruits.forEach(({ x, y, color }) => {
        ctx.shadowBlur = 6
        ctx.shadowColor = color
        ctx.fillStyle = color
        ctx.fillRect(x, y, size, size)
        ctx.shadowBlur = 0

    })



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
        ctx.lineTo(i, 630)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(630, i)
        ctx.stroke()
    }
}

const moveCobrinha = (cobra, direction) => {
    if (!direction) return
    const head = cobra[cobra.length - 1]

    let newHead
    if (direction === 'right') {
        newHead = { x: head.x + size, y: head.y }
        if (newHead.x >= canvas.width) newHead.x = 0 // Teletransporta para o lado esquerdo
    }
    if (direction === 'left') {
        newHead = { x: head.x - size, y: head.y }
        if (newHead.x < 0) newHead.x = canvas.width - size // Teletransporta para o lado direito
    }
    if (direction === 'down') {
        newHead = { x: head.x, y: head.y + size }
        if (newHead.y >= canvas.height) newHead.y = 0 // Teletransporta para o topo
    }
    if (direction === 'up') {
        newHead = { x: head.x, y: head.y - size }
        if (newHead.y < 0) newHead.y = canvas.height - size // Teletransporta para a parte inferior
    }

    // Adiciona o novo segmento com a cor correta
    cobra.push({ ...newHead, corCabeca: head.corCabeca, corCorpo: head.corCorpo })
    cobra.shift()
}

const checkEat = (cobra, score) => {
    const head = cobra[cobra.length - 1]

    fruits.forEach((fruit, index) => {
        if (head.x === fruit.x && head.y === fruit.y) {
            incrementScore(score)
            cobra.push({ ...head, corCabeca: head.corCabeca, corCorpo: head.corCorpo })
            audio.preload = 'auto'
            audio.play()

            // Garante que a nova fruta não apareça em cima das cobras
            let x = randomPosition()
            let y = randomPosition()

            while (cobrinha1.find(position => position.x === x && position.y === y) || cobrinha2.find(position => position.x === x && position.y === y)) {
                x = randomPosition()
                y = randomPosition()
            }

            // Atualiza a fruta consumida com nova posição e cor
            fruits[index] = { x, y, color: randomColor() }
        }
    })
}

const checkHeadCollidesWithBody = (head, body) => {
    return body.some(segment => segment.x === head.x && segment.y === head.y)
}

const chackColision = (cobra1, cobra2) => {
    const head1 = cobra1[cobra1.length - 1] // Cabeça da Cobra 1
    const head2 = cobra2[cobra2.length - 1] // Cabeça da Cobra 2
    const neckIndex1 = cobra1.length - 2
    const neckIndex2 = cobra2.length - 2

    // Verifica colisão com o próprio corpo
    const selfColision1 = checkHeadCollidesWithBody(head1, cobra1.slice(0, neckIndex1))
    const selfColision2 = checkHeadCollidesWithBody(head2, cobra2.slice(0, neckIndex2))

    // Verifica colisão entre as cabeças das cobras e o corpo da outra cobra
    const playerColision1 = checkHeadCollidesWithBody(head1, cobra2)
    const playerColision2 = checkHeadCollidesWithBody(head2, cobra1)

    console.log(head1.x, head2.x)

    // Verifica e determina o resultado
    if (head1.x == head2.x && head1.y == head2.y) {
        empate()

    } else if (selfColision2 || playerColision2) {
        gameOver("Jogador 1 venceu!", 'red')

    }else if(selfColision1 || playerColision1){
        gameOver("Jogador 2 venceu!", 'blue')
        
    }
}

const checkScore = (player) => {

    if (player.innerText == 2250) {
        playAgain()
    }
}

const gameOver = (player, color) => {
    if (isGameOver) return // Evitar chamada repetida de gameOver
    
    directionP1 = undefined
    directionP2 = undefined
    stateGame.innerText = player
    stateGame.style.color = color
    isGameOver = true
    
    menu.style.display = 'flex'
    conatiner.style.filter = 'blur(5px)'

    death.play() // Reproduzir som de morte
    background.pause()
    clearTimeout(loopId)// Parar o loop do jogo
}

const empate = () =>{
    if (isGameOver) return // Evitar chamada repetida de gameOver

    directionP1 = undefined
    directionP2 = undefined
    stateGame.innerText = 'Empate'
    stateGame.style.color = 'white'
    isGameOver = true

    menu.style.display = 'flex'
    conatiner.style.filter = 'blur(5px)'

    death.play() // Reproduzir som de morte
    background.pause()
    clearTimeout(loopId)// Parar o loop do jogo
}

const gameLoop = () => {
    clearInterval(loopId)
    ctx.clearRect(0, 0, 630, 630)
    desenhaGrade()
    desenhaComida()
    desenhaCobra(cobrinha1)
    desenhaCobra(cobrinha2)
    moveCobrinha(cobrinha1, directionP1)
    moveCobrinha(cobrinha2, directionP2)
    checkEat(cobrinha1, scoreP1)
    checkEat(cobrinha2, scoreP2)
    chackColision(cobrinha1, cobrinha2)

    loopId = setTimeout(() => {
        gameLoop()
    }, 150)
}

gameLoop()

document.addEventListener('keydown', ({ key }) => {
    if (isGameOver) return // Impedir movimento se o jogo acabou
    
    if (directionLocked) return // Se a direção estiver bloqueada, ignorar o comando

    // Verifica a direção atual para evitar a mudança para a direção oposta
    if (key === "ArrowRight" && directionP2 !== "left") {
        directionP2 = 'right'
        directionLocked = true
    }

    if (key === "ArrowLeft" && directionP2 !== "right") {
        directionP2 = 'left'
        directionLocked = true
    }

    if (key === "ArrowDown" && directionP2 !== "up") {
        directionP2 = 'down'
        directionLocked = true
    }

    if (key === "ArrowUp" && directionP2 !== "down") {
        directionP2 = 'up'
        directionLocked = true
    }

    setTimeout(() => {
        directionLocked = false
    }, 100)
})

document.addEventListener('keydown', ({ key }) => {
    if (isGameOver) return // Impedir movimento se o jogo acabou
    
    if (directionLocked) return // Se a direção estiver bloqueada, ignorar o comando

    //movimentação do player 2

    if ((key === "d" || key === 'D') && directionP1 !== "left") {
        directionP1 = 'right'
        directionLocked = true
    }

    if ((key === "a" || key === 'A') && directionP1 !== "right") {
        directionP1 = 'left'
        directionLocked = true
    }

    if ((key === "S" || key === 's') && directionP1 !== "up") {
        directionP1 = 'down'
        directionLocked = true
    }
    if ((key === "W" || key === 'w') && directionP1 !== "down") {
        directionP1 = 'up'
        directionLocked = true
    }

    setTimeout(() => {
        directionLocked = false
    }, 100)
})

buttonPlay.addEventListener('click', () => {

    background.play()

    isGameOver = false
    scoreP1.innerText = '00'
    scoreP2.innerText = '00'

    menu.style.display = 'none'
    conatiner.style.filter = 'none'

    cobrinha1 = [dbCobrinha1]
    cobrinha2 = [dbCobrinha2]

    location.reload()
})

buttonMenu.addEventListener('click', () => window.location.href = 'menu.html')