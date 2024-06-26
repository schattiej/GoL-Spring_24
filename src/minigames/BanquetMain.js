import Phaser, { Data } from 'phaser'
import UpgradedContainer from '../gamelogic/UpgradedContainer.js'
import CONFIG from '../config.js'
import ChoiceMenu from '../gamelogic/ChoiceMenu.js'
import DataMaker from '../gamelogic/DataMaker.js'

function SimpleCM (text, options) {
  return new ChoiceMenu(DataMaker.game.RUI.scene, 0.5 * CONFIG.DEFAULT_WIDTH, 0.5 * CONFIG.DEFAULT_HEIGHT, text, options, true)
}

/*
Simple and quick selection of data for the banquet foodstuffs. Comes with a minimum and maximum price and other values can be added later.
*/

/*
const dishtypes = `Chicken dinner,18,25
omelette,5,6
bean destroyer,3,800
chimbus,6,5
zombo,5,6
alveo,10,10
crantagolon,3,800
eeeeeeeeee,6,5`
*/

const dishtypes = `Chicken dinner,18,25
Omelette, 5, 6
Steak (high end), 3, 800
Chicken alfredo, 18,20
Caesar salad,13,20
Smoked herring,40,56
Side of watermelons,2,3
Wild rice,15,30
Yogurt,8,16`

let dishparse = dishtypes.split('\n')
dishparse = dishparse.map(x => x.split(','))
console.log(dishparse)

// An option for a single dish. Must be rapidly swapped and juggled during the game.
class BanquetOption extends UpgradedContainer {
  constructor (parent, x, y) {
    super(parent.scene, x, y)
    this.width = parent.displayWidth * 0.8 * 0.4
    this.height = this.width * 0.1
    const bottom = new Phaser.GameObjects.Rectangle(parent.scene, 0, 0, this.width, this.height, '0x24B3B8')
    this.add(bottom)
    parent.add(this)

    this.setDepth(parent.depth + 2)

    this.setInteractive()
    this.logLocation()
    parent.scene.input.setDraggable(this)

    this.on('pointerdown', () => { parent.scene.sound.play('cardgrab') })
      .on('drag', (pointer, dragX, dragY) => {
        this.x = dragX
        this.y = dragY
      })
      .on('dragend',(pointer, dragX, dragY) => {
        parent.scene.sound.play('carddrop')
        // Remove this option from whatever slot contains it
        const containingSlot = parent.slots.filter((c) => { return c.option == this })[0]
        if (containingSlot != undefined) { containingSlot.option = undefined }

        let shouldFloatBack = true
        // Add the option to the slot that it's touching.
        for (let i = 0; i < parent.slots.length; i++) {
          const slot = parent.slots[i]
          if (Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), slot.getBounds())) {
            this.x = slot.x
            this.y = slot.y
            if (slot.option !== undefined) { this.LeftRight(slot.option, parent.list[0]); slot.option.x -= 5 }
            shouldFloatBack = false
            slot.option = this
          }
        }
        if (shouldFloatBack) { this.floatBack() }

        // Make sense of what meals are chosen.
        parent.QueryMeals()
      })


    this.generateContent()
  }

  generateContent () {
    const r = Phaser.Math.RND.pick(dishparse)
    this.meal = r[0]
    this.price = Phaser.Math.RND.between(parseInt(r[1]), parseInt(r[2]))
    this.addSafeText(this.scene, 0, 0, 0.8, this.meal, 32)
    this.addSafeText(this.scene, 0.8, 0, 0.8, this.price, 32)
  }

  logLocation () {
    this.returnLocation = { x: this.x, y: this.y }
  }

  floatBack () {
    this.scene.tweens.add({
      targets: this,
      x: this.returnLocation.x,
      y: this.returnLocation.y,
      duration: 400
    })
  }
}

// A slot to place the dish option.
class BanquetOptionSlot extends Phaser.GameObjects.Container {
  constructor (parent, x, y) {
    super(parent.scene, x, y)
    this.width = parent.displayWidth * 0.8
    this.height = this.width * 0.1
    const bottom = new Phaser.GameObjects.Rectangle(parent.scene, 0, 0, this.width, this.height, '0x24B3B8')
    this.add(bottom)
    const w = 15
    const bottom2 = new Phaser.GameObjects.Rectangle(parent.scene, 0, 0, this.width - w, this.height - w, 'green')
    this.add(bottom2)

    this.option = undefined
    parent.add(this)
    this.setDepth(parent.depth + 1)
  }
}

class BanquetGame extends UpgradedContainer {
  constructor (scene, x, y) {
    super(scene, x, y)
    this.width = CONFIG.DEFAULT_WIDTH * 0.6
    this.height = CONFIG.DEFAULT_HEIGHT * 0.5
    const bottom = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.width, this.height, '0x083BB8')
    this.add(bottom)

    const optionsArea = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.width / 3, this.height, '0x2428')
    this.add(optionsArea)
    this.RightLeft(optionsArea, bottom)
    this.BottomBottom(optionsArea, bottom)

    // this.MakeTimer(scene)

    this.slots = [new BanquetOptionSlot(this, 0, 0), new BanquetOptionSlot(this, 0, 0), new BanquetOptionSlot(this, 0, 0), new BanquetOptionSlot(this, 0, 0)]
    let oHeight = -100
    for (let i = 0; i < this.slots.length; i++) {
      const s = this.slots[i]
      s.y = oHeight
      oHeight += s.height + 5
    }

    // Enhanced generation of the banquet options.
    this.options = []
    let expensiveOnes = 0
    while (this.options.length < 8) {
      const newOption = new BanquetOption(this, 5, 5)
      if (newOption.price > 100) {
        expensiveOnes++
        if (expensiveOnes > 1) {
          continue
        }
      }
      this.options.push(newOption)
    }

    this.setDepth(1000)
    Phaser.Display.Bounds.CenterOn(this, x, y)

    this.addSafeText(this.scene, 0.3, 0.2 / 2, 0.8, 'Bogos Binted', 32)
    this.moneytext = this.list[this.list.length - 1]
    this.RightRight(this.moneytext, this.list[0])
    this.startingBudget = 120
    this.valid = false

    this.Intro(scene)
    this.OrganizeChoices()

    scene.add.existing(this)
  }

  QueryMeals () {
    let price = this.startingBudget
    let anyEmpty = false
    for (const s of this.slots) {
      if (s.option != null) { price -= s.option.price } else { anyEmpty = true }
    }

    this.moneytext.setText(price)
    if (price < 0) {
      this.moneytext.setFill('#Ff0000')
      this.valid = false
    } else {
      this.moneytext.setFill('#00000')
      this.valid = true
    }
    if (anyEmpty) { this.valid = false }
  }

  MakeTimer (scene) {
    const timebar = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.width * 0.05, this.height * 0.8, '0xff0000')
    this.LeftLeft(timebar, this.list[0])
    timebar.x += 8

    this.add(timebar)

    scene.tweens.add({
      targets: timebar,
      height: 0,
      duration: 1200 * 8,
      onComplete: () => {
        this.Leave()
      }
    })
  }

  Leave () {
    this.scene.tweens.add({
      targets: this,
      y: -this.height,
      delay: 30,
      duration: 400,
      onComplete: () => {
        DataMaker.game.banquet_complete = this.valid
        const outcome = this.valid ? 'You did it!' : "You couldn't stay within budget. Be prepared to negotiate later!"
        const goodMenu = SimpleCM(outcome,
          [
            ['OK', () => {
              goodMenu.leave()
              this.ReleaseControl()
              this.destroy(this)
            }]
          ], true)
      }
    })
  }

  Intro (s) {
    this.TakeControl()
    const introMenu = SimpleCM('Time to select the banquet meal lineup! Time is of the essence - choose wisely before you run out!',
      [
        ['Lets go!', () => { this.MakeTimer(s) }]
      ], true)
    introMenu.setDepth(this.depth + 1)
  }

  OrganizeChoices () {
    const startOption = this.options[0]
    // Move the first option to the top of the options section
    this.LeftLeft(startOption, this.list[1])
    this.TopTop(startOption, this.list[1])
    startOption.y += 8
    startOption.x += 2
    startOption.logLocation()
    // Move every other option below the first option in a vertical stack.
    for (let i = 1; i < this.options.length; i++) {
      this.LeftLeft(this.options[i], this.options[i - 1])
      this.TopBottom(this.options[i], this.options[i - 1])
      this.options[i].y += 8
      this.options[i].logLocation()
    }
  }

  TakeControl () {
    DataMaker.game.board.disableInteractive()
  }

  ReleaseControl () {
    DataMaker.game.board.setInteractive()
  }
}
export default BanquetGame
