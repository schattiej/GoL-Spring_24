import Phaser from 'phaser'
import CONFIG from '../config.js'

class Hand extends Phaser.GameObjects.Container {
  constructor (scene, cardgroup, x, y) {
    super(scene, x, y)
    this.width = CONFIG.DEFAULT_WIDTH * 0.68
    this.height = CONFIG.CARD_WIDTH
    this.setDepth(CONFIG.HAND_DEPTH)
    this.setInteractive()
    // Phaser.display.color(0, 0, 0, 1).transparent()
    // potentially no rectangle for hand
    const bottom = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.width, this.height, '0xfff000')
    bottom.setVisible(false)
    this.add(bottom)

    this.scrollOffset = 0
    this.incards = []
    scene.input.on('pointerup', () => {
      // Get the array of cards from cardgroup. Filter it and remove any card not touching the hand.
      this.incards = cardgroup.children.getArray().filter((c) => { return (Phaser.Geom.Intersects.RectangleToRectangle(bottom.getBounds(), c.getBounds()) || c.inHand) })
      this.incards.sort((a, b) => { return a.x - b.x })
      // Z-index trickery
      this.incards.forEach((c) => { c.setDepth(CONFIG.HAND_DEPTH + 1) })
      // According to their current positions, shift and align the cards over the hand.
      this.SortCards()
    })

    scene.input.on('wheel', (pointer, over, deltaX, deltaY, deltaZ) => {
      if ((over.length > 0) && (over[0].inHand || over[0] === this)) {
        this.scrollOffset += (deltaY > 0) ? 0.3 : -0.3
        this.SortCards()
      }
    })

    // Alternate controls - Z and X to scroll left and right. Only works when the mouse is over the deck.
    // MIGHT WANT TO REVISIT / CHANGE LATER.
    this.okaymove = false
    this.SetupInOut()
    scene.input.keyboard.on('keydown-Z', () => {
      if (this.okaymove) {
        this.scrollOffset -= 0.3
        this.SortCards()
      }
    })
    scene.input.keyboard.on('keydown-X', () => {
      if (this.okaymove) {
        this.scrollOffset += 0.3
        this.SortCards()
      }
    })

    scene.add.existing(this)
    Phaser.Display.Bounds.CenterOn(this, x, y)
  }

  SetupInOut () {
    this.on('pointerover', () => { this.okaymove = true })
    this.on('pointerout', () => { this.okaymove = false })
  }

  SortCards () {
    let div = 0
    const RefPoint = new Phaser.Geom.Point(Phaser.Display.Bounds.GetCenterX(this), Phaser.Display.Bounds.GetCenterY(this) + CONFIG.HAND_ORBITAL)
    this.incards.forEach((c) => {
      const startP = new Phaser.Geom.Point(Phaser.Display.Bounds.GetLeft(this), Phaser.Display.Bounds.GetBottom(this))
      const cardRad = (Math.PI / 25) * (div + this.scrollOffset)
      Phaser.Math.RotateAround(startP, RefPoint.x, RefPoint.y, cardRad)
      c.setRotation(Phaser.Math.Angle.BetweenPoints(startP, RefPoint) + 3 * (Math.PI / 2))
      c.x = startP.x
      c.y = startP.y

      div += 1
      c.inHand = true
    })
  }
}

export default Hand
