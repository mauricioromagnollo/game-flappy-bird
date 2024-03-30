function newElement(tagName, className) {
  const component = document.createElement(tagName)
  component.className = className
  return component
}

function Barrier(reverse = false) {
  this.component = newElement('div', 'barrier')

  const barrierBorder = newElement('div', 'barrier-border')
  const barrierBody = newElement('div', 'barrier-body')

  this.component.appendChild(reverse ? barrierBody : barrierBorder)
  this.component.appendChild(reverse ? barrierBorder : barrierBody)

  this.setHeight = height => barrierBody.style.height = `${height}px`
}

function PairOfBarries(height, aperture, x) {
  this.component = newElement('div', 'pair-of-barriers')

  this.upper = new Barrier(true)
  this.bottom = new Barrier(false)

  this.component.appendChild(this.upper.component)
  this.component.appendChild(this.bottom.component)

  this.raffleAperture = () => {
    const upperHeight = Math.random() * (height - aperture)
    const bottomHeight = height - aperture - upperHeight

    this.upper.setHeight(upperHeight)
    this.bottom.setHeight(bottomHeight)
  }

  this.getX = () => parseInt(this.component.style.left.split('px')[0])
  this.setX = x => this.component.style.left = `${x}px`
  this.getWidth = () => this.component.clientWidth

  this.raffleAperture()
  this.setX(x)
}

function Barriers(height, width, aperture, space, notifyPoint) {
  this.pairs = [
    new PairOfBarries(height, aperture, width),
    new PairOfBarries(height, aperture, width + space),
    new PairOfBarries(height, aperture, width + space * 2),
    new PairOfBarries(height, aperture, width + space * 3)
  ]

  const displacement = 3

  this.animate = () => {
    this.pairs.forEach(pair => {
      pair.setX(pair.getX() - displacement)

      if (pair.getX() < -pair.getWidth()) {
        pair.setX(pair.getX() + space * this.pairs.length)
        pair.raffleAperture()
      }

      const middle = (width / 2)
      const crossTheMiddle = pair.getX() + displacement >= middle
        && pair.getX() < middle

      if (crossTheMiddle) {
        notifyPoint()
      }

    })

  }
}

function Bird(gameHeight) {
  let flying = false

  this.component = newElement('img', 'bird')
  this.component.src = 'imgs/bird.png'

  this.getY = () => parseInt(this.component.style.bottom.split('px')[0])
  this.setY = y => this.component.style.bottom = `${y}px`

  window.onkeydown = e => flying = true
  window.onkeyup = e => flying = false

  this.animate = () => {
    const newY = this.getY() + (flying ? 8 : -5)
    const maxHeight = (gameHeight - this.component.clientHeight)

    if (newY <= 0) {
      this.setY(0)
    } else if (newY >= maxHeight) {
      this.setY(maxHeight)
    } else {
      this.setY(newY)
    }

  }

  this.setY(gameHeight / 2)
}

function Progress() {
  this.component = newElement('span', 'progress')

  this.updateScores = scores => {
    this.component.innerHTML = scores
  }

  this.updateScores(0)
}

function isOverlapping(elementA, elementB) {
  const a = elementA.getBoundingClientRect()
  const b = elementB.getBoundingClientRect()

  const horizontal = a.left + a.width >= b.left
    && b.left + b.width >= a.left

  const vertical = a.top + a.height >= b.top
    && b.top + b.height >= a.top

  return horizontal && vertical
}

function isCollided(bird, barriers) {
  let collision = false

  barriers.pairs.forEach(PairOfBarries => {
    if (!collision) {
      const upper = PairOfBarries.upper.component
      const bottom = PairOfBarries.bottom.component
      collision = isOverlapping(bird.component, upper) || isOverlapping(bird.component, bottom)
    }
  })

  return collision
}

function FlappyBird() {
  let scores = 0
  const PIPES_DISTANCE = 210

  const gameArea = document.querySelector('[game-flappy]')
  const height = gameArea.clientHeight
  const width = gameArea.clientWidth

  const progress = new Progress()
  const barriers = new Barriers(height, width, PIPES_DISTANCE, 400, () => progress.updateScores(++scores))
  const bird = new Bird(height)

  gameArea.appendChild(progress.component)
  gameArea.appendChild(bird.component)
  barriers.pairs.forEach(pair => gameArea.appendChild(pair.component))
  this.start = () => {

    const timer = setInterval(() => {
      barriers.animate()
      bird.animate()

      if (isCollided(bird, barriers)) {
        clearInterval(timer)
        alert('Bateu Caraii!!')
        window.location.reload()
        // Reestart Game / Save Scores       
      }
    }, 20)
  }
}

new FlappyBird().start()