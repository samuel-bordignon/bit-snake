const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const score = document.querySelector('.pontuacao-value-p1')
const finalScore = document.querySelector('.pontuacao-final > span')
const conatiner = document.querySelector('.container')
const menu = document.querySelector('.menu-screen')
const stateGame = document.querySelector('.state-game')
const buttonPlay = document.querySelector('.btn-play')
const buttonMenu = document.querySelector('.btn-menu')
const minuteSpan = document.getElementById('minute')
const secondSpan = document.getElementById('second')
const millisecondSpan = document.getElementById('millisecond')
const minuteSpanFinal = document.getElementById('minute-final')
const secondSpanFinal = document.getElementById('second-final')
const millisecondSpanFinal = document.getElementById('millisecond-final')



const size = 30

const audio = new Audio('audio.mp3')
const background = new Audio('background.mp3')
const death = new Audio('death.mp3')

background.volume = 0.5
background.loop = true
background.play()

const initiaPosition = { x: 210, y: 210 }

let isGameOver = false
let minute = 0
let second = 0
let millisecond = 0
let cron
let cobrinha = [initiaPosition]



const incrementScore = () => {
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

let direction, loopId

const desenhaComida = () => {

    const { x, y, color } = food

    ctx.shadowBlur = 6
    ctx.shadowColor = color
    ctx.fillStyle = food.color
    ctx.fillRect(food.x, food.y, size, size)
    ctx.shadowBlur = 0
}

const desenhaCobra = () => {
    ctx.fillStyle = '#DEDDDE'

    cobrinha.forEach((position, index) => {
        if (index == cobrinha.length - 1) {
            ctx.fillStyle = '#FFFFFF'
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

const moveCobrinha = () => {
    if (!direction) return
    const head = cobrinha[cobrinha.length - 1]

    if (direction == 'right') {
        cobrinha.push({ x: head.x + size, y: head.y })
    }

    if (direction == 'left') {
        cobrinha.push({ x: head.x - size, y: head.y })
    }

    if (direction == 'down') {
        cobrinha.push({ x: head.x, y: head.y + size })
    }

    if (direction == 'up') {
        cobrinha.push({ x: head.x, y: head.y - size })
    }

    cobrinha.shift()

}

const chackEat = () => {
    const head = cobrinha[cobrinha.length - 1]

    if (head.x == food.x && head.y == food.y) {
        incrementScore()
        cobrinha.push(head)
        audio.play()

        let x = randomPosition()
        let y = randomPosition()

        while (cobrinha.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
        }

        food.x = x
        food.y = y
        food.color = randomColor()

    }
}

const chackColision = () => {
    const head = cobrinha[cobrinha.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = cobrinha.length - 2

    const wallColision =
        head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    const selfColision = cobrinha.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })


    if (wallColision || selfColision) {
        gameOver()
    }
}

const checkScore = () => {

    if (score.innerText == 2250) {
        playAgain()
    }
}

const gameOver = () => {
    if (isGameOver) return // Evitar chamada repetida de gameOver

    direction = undefined
    stateGame.innerText = 'game over'
    isGameOver = true

    menu.style.display = 'flex'
    finalScore.innerText = score.innerText
    conatiner.style.filter = 'blur(6px)'

    death.play() // Reproduzir som de morte
    background.pause()
    clearTimeout(loopId)// Parar o loop do jogo
    pause()
    minuteSpanFinal.innerText = returnData(minute)
    secondSpanFinal.innerText = returnData(second)
    millisecondSpanFinal.innerText = returnData(millisecond)
}

const playAgain = () => {
    direction = undefined
    stateGame.innerText = 'you win'
    isGameOver = true

    menu.style.display = 'flex'
    finalScore.innerText = score.innerText
    canvas.style.filter = 'blur(6px)'
    pause()
    minuteSpanFinal.innerText = returnData(minute)
    secondSpanFinal.innerText = returnData(second)
    millisecondSpanFinal.innerText = returnData(millisecond)
}

const start = () => {
    pause()
    cron = setInterval(() => { timer() }, 10)
}

const pause = () => {
    clearInterval(cron)
}

const reset = () => {
    minute = 0
    second = 0
    millisecond = 0
    document.getElementById('minute').innerText = '00'
    document.getElementById('second').innerText = '00'
    document.getElementById('millisecond').innerText = '000'
}

const timer = () => {
    if ((millisecond += 10) == 1000) {
        millisecond = 0
        second++
    }
    if (second == 60) {
        second = 0
        minute++
    }
    minuteSpan.innerText = returnData(minute)
    secondSpan.innerText = returnData(second)
    millisecondSpan.innerText = returnData(millisecond)
}

const returnData = (input) => {
    return input >= 10 ? input : `0${input}`
}

const gameLoop = () => {
    console.log(score.innerText)
    clearInterval(loopId)
    ctx.clearRect(0, 0, 600, 600)
    desenhaGrade()
    desenhaComida()
    moveCobrinha()
    desenhaCobra()
    chackEat()
    chackColision()
    checkScore()

    loopId = setTimeout(() => {
        gameLoop()
    }, 200)
}

gameLoop()

let directionLocked = false // Variável para controlar o delay entre mudanças de direção

document.addEventListener('keydown', ({ key }) => {
    if (isGameOver) return // Impedir movimento se o jogo acabou

    if (directionLocked) return // Se a direção estiver bloqueada, ignorar o comando

    if(key != undefined){
        start()
    }
    // Verifica a direção atual para evitar a mudança para a direção oposta
    if ((key === "ArrowRight" || key === 'd') && direction !== "left") {
        direction = 'right'
        directionLocked = true
    }

    if ((key === "ArrowLeft" || key === 'a') && direction !== "right") {
        direction = 'left'
        directionLocked = true
    }

    if ((key === "ArrowDown" || key === 's') && direction !== "up") {
        direction = 'down'
        directionLocked = true
    }

    if ((key === "ArrowUp" || key === 'w') && direction !== "down") {
        direction = 'up'
        directionLocked = true
    }

    setTimeout(() => {
        directionLocked = false
    }, 110)
})

buttonPlay.addEventListener('click', () => {

    background.play()

    isGameOver = false
    score.innerText = '00'
    menu.style.display = 'none'
    conatiner.style.filter = 'none'

    cobrinha = [initiaPosition]
    
    location.reload()

    reset()
    
})

buttonMenu.addEventListener('click', () => window.location.href = 'menu.html')

