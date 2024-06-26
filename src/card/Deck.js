import Phaser from 'phaser'
import CONFIG from '../config.js'
import Card from '../card/Card.js'
import DataMaker from '../gamelogic/DataMaker.js'
import { MidgameWildcards } from '../minigames/WildcardMenu.js'

class Deck extends Phaser.GameObjects.Container {
  constructor (scene, x, y, cardgroup, type = 'mark') {
    super(scene, 0, 0)
    this.width = 140
    this.height = this.width * (363 / 259)
    this.depth = CONFIG.HAND_DEPTH
    this.setInteractive()

    const back = scene.add.image(0, 0, type + '_back')
    back.displayWidth = this.width
    back.displayHeight = this.height
    this.add(back)

    this.on('pointerdown', (pointer, localx, localy) => {
      const random = Phaser.Math.RND.integerInRange(1, 100)
      DataMaker.game.countActions()
      if (random <= 15) {
        // generate a curveball
        const b = MidgameWildcards.PULL()
        if (b === -1) { // if there are no more curveballs left to draw, draw a card instead
          const c = new Card(scene, this.x, this.y, type)
          c.setDepth(this.depth + 1)
          cardgroup.add(c)
        }
      } else { // generate a card
        const c = new Card(scene, this.x, this.y, type)
        c.setDepth(this.depth + 1)
        cardgroup.add(c)
      }
    })

    scene.add.existing(this)
    Phaser.Display.Bounds.CenterOn(this, x, y)
    // console.log('Deck created')
  }
}
export default Deck
