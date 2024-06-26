import Phaser from 'phaser'
import CONFIG from '../config.js'

class ChoiceMenu extends Phaser.GameObjects.Container { // Class for choosing between different options. May be reusable for multiple situations.
  constructor (scene, x, y, WarningText, options, autoClose = true) {
    super(scene, x, y)
    this.width = CONFIG.DEFAULT_WIDTH * 0.6
    this.height = CONFIG.DEFAULT_HEIGHT * 0.5
    // const bottom = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.width, this.height, '0x9938')
    const bottom = scene.add.image(0, 0, 'curveball_menu')
    this.add(bottom)

    const message = this.scene.add.text(-this.width * 0.55, -this.height * 0.2, WarningText, { font: '30pt "Franklin Gothic Book"', color: '#231f20', align: 'center' })
    message.setWordWrapWidth(800)
    this.add(message)

    if (options.length > 1) { // Generally places buttons correctly.
      const buttonSize = (this.height * 0.6)
      for (const i in options) {
        const Choice = options[i]
        const start = ((-this.height * 0.45)) + (buttonSize / 2)
        const end = ((this.height * 0.95)) - (buttonSize / 2)
        const divy = Phaser.Math.Linear(start, end, i / (options.length - 1))

        const NewButton = new WildcardButton(scene, this.width * 0.42, divy, Choice[0], Choice[1])
        // NewButton.displayWidth = buttonSize

        if (autoClose) { NewButton.on('pointerup', () => { this.leave() }) } // If AutoClose is true, picking an option will close the dialog box.
        this.add(NewButton)
      }
    } else { // If there's only one option, special placement of that button
      const Choice = options[0]
      const NewButton = new WildcardButton(scene, this.width * 0.42, 0, Choice[0], Choice[1])
      NewButton.displayWidth = this.displayWidth * 0.25
      if (autoClose) { NewButton.on('pointerup', () => { this.leave() }) } // If AutoClose is true, picking an option will close the dialog box.
      this.add(NewButton)
    }

    this.setDepth(1000)
    this.y = 0
    this.scale = 0.5
    this.scene.tweens.add({ // Every ChoiceMenu flies in from the top of the screen.
      targets: this,
      y: y,
      scale: 1,
      duration: 400
    })
    scene.add.existing(this)
  }

  setMessage (newMessage) {
    this.list[1].setText(newMessage)
  }

  leave () {
    this.scene.sound.play('confirm')
    this.scene.tweens.add({
      targets: this,
      y: -this.height,
      delay: 30,
      duration: 400
    })
  }
}

class WildcardButton extends Phaser.GameObjects.Container { // Class for the buttons inside of the ChoiceMenu
  constructor (scene, x, y, text, callback) {
    super(scene, x, y)
    this.width = 300
    this.height = 300 * 0.25
    const bottom = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.width, this.height, '0xe94394')
    this.add(bottom)

    const message = this.scene.add.text(0, 0, text, { font: '24.11pt "Franklin Gothic Book"', color: '#231f20', align: 'center' })
    Phaser.Display.Bounds.CenterOn(message, 0, 0)
    message.setWordWrapWidth(bottom.width)
    this.add(message)

    this.setInteractive()
    this
      .on('pointerover', () => {
        bottom.setFillStyle('0x390383')
      })
      .on('pointerout', () => {
        bottom.setFillStyle('0xe94394')
      })
      .on('pointerdown', () => {
        bottom.setFillStyle('0xeE390c')
        callback()
      })
      .on('pointerup', () => {
        bottom.setFillStyle('0x390383')
      })

    this.setDepth(1000)
    Phaser.Display.Bounds.CenterOn(this, x, y)
    scene.add.existing(this)
  }
}

export default ChoiceMenu
