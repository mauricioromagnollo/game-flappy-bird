/*
 * Exceptions
 */

class InvalidParamTypeException extends Error {
  constructor(message = '') {
    super(message);
    this.name = 'InvalidParamTypeException';
  }
}

class DOM {
  static createNewHtmlElement({ tagName = 'div', cssClassName = '' }) {
    if (typeof tagName !== 'string') {
      throw new InvalidParamTypeException(`DOM.createNewHtmlElement: The param tagName must be of type 'string', but received the type '${typeof tagName}'.`);
    }

    if (typeof cssClassName !== 'string') {
      throw new InvalidParamTypeException(`DOM.createNewHtmlElement: The param cssClassName must be of type 'string', but received the type '${typeof cssClassName}'.`);
    }

    const $newHtmlElement = document.createElement(tagName);
    $newHtmlElement.className = cssClassName ? cssClassName : '';
    return $newHtmlElement;
  }
}

function Barrier(reverse = false) {
  this.component = DOM.createNewHtmlElement({ cssClassName: 'barrier' });
  
  const barrierBorder =  DOM.createNewHtmlElement({ cssClassName: 'barrier-border' });
  const barrierBody =  DOM.createNewHtmlElement({ cssClassName: 'barrier-body' });

  this.component.appendChild(reverse ? barrierBody : barrierBorder)
  this.component.appendChild(reverse ? barrierBorder : barrierBody)

  this.setHeight = height => barrierBody.style.height = `${height}px`
}

function PairOfBarries( height, aperture, x) {
  this.component =  DOM.createNewHtmlElement({ cssClassName: 'pair-of-barriers' });

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

      if(pair.getX() < -pair.getWidth()) {
        pair.setX(pair.getX() + space * this.pairs.length)
        pair.raffleAperture()
      }

      const middle = (width / 2)
      const crossTheMiddle = pair.getX() + displacement >= middle 
        && pair.getX() < middle
      
      if(crossTheMiddle) {
        notifyPoint()
      }

    })

  }
}

function Bird(gameHeight) {
  let flying = false 

  this.component = DOM.createNewHtmlElement({ tagName: 'img', cssClassName: 'bird' });
  this.component.src = 'imgs/bird.png'

  this.getY = () => parseInt(this.component.style.bottom.split('px')[0])
  this.setY = y => this.component.style.bottom = `${y}px`

  window.onkeydown = e => flying = true
  window.onkeyup = e => flying = false

  this.animate = () => {
    const newY = this.getY() + (flying ? 8 : -5)
    const maxHeight = (gameHeight - this.component.clientHeight)

    if(newY <= 0) {
      this.setY(0)
    } else if(newY >= maxHeight) {
      this.setY(maxHeight) 
    } else {
      this.setY(newY)
    }

  }

  this.setY(gameHeight / 2)
}

function Progress() {
  this.component = DOM.createNewHtmlElement({ tagName: 'span', cssClassName: 'progress' });
  
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
  let hasCollision = false
  const { pairs: pairsOfBarriers  } = barriers
  
  pairsOfBarriers.forEach(PairOfBarries => {
    if(!hasCollision) {
      const upper = PairOfBarries.upper.component
      const bottom = PairOfBarries.bottom.component 
      hasCollision = isOverlapping(bird.component, upper) || isOverlapping(bird.component, bottom)
    }
  })
  
  return hasCollision
}

function FlappyBird() {
  let scores = 0
  const GAME_SPEED = 20

  const gameArea = document.querySelector('[game-flappy]')
  const height = gameArea.clientHeight
  const width = gameArea.clientWidth

  const progress = new Progress()
  const barriers = new Barriers(height, width, 200, 400, () => progress.updateScores(++scores))
  const bird = new Bird(height)

  gameArea.appendChild(progress.component)
  gameArea.appendChild(bird.component)
  barriers.pairs.forEach(pair => gameArea.appendChild(pair.component))

  this.start = () => {
    const timer = setInterval(() => {
        barriers.animate()
        bird.animate()
  
        if(isCollided(bird, barriers)) {
          clearInterval(timer)
          alert('Collided')
          // Reestart Game / Save Scores       
        }
    }, GAME_SPEED)
  }
}

new FlappyBird().start()