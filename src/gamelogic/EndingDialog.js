import Phaser, { Data } from 'phaser'
import DataMaker from '../gamelogic/DataMaker.js'
import CONFIG from '../config.js'
import UpgradedContainer from '../gamelogic/UpgradedContainer.js'

const EndingText = [
  'You\'ve made it through the event! Here are the final results:',
  '',
  'What a great time! You did it! Mission accomplished! Woohoo!'
]

class EndingDialog extends UpgradedContainer {
  constructor (scene) {
    const x = CONFIG.DEFAULT_WIDTH * 0.5
    const y = CONFIG.DEFAULT_HEIGHT * 0.5
    super(scene)
    this.width = CONFIG.DEFAULT_WIDTH * 0.8
    this.height = CONFIG.DEFAULT_HEIGHT * 0.8
    Phaser.Display.Bounds.CenterOn(this, CONFIG.DEFAULT_WIDTH * 0.5, CONFIG.DEFAULT_HEIGHT * 0.5)

    // const bottom = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.width, this.height, '0xe94394')
    const bottom = scene.add.image(0, 0, 'results_menu')
    this.add(bottom)

    this.addSafeText(this.scene, 0.15, 0.5, 1.9, EndingText[0])
    const mainText = this.list[this.list.length - 1]

    let currentPage = 1
    const megaPage = EndingText
    const endingStats =
    `Final Approval Rating: ${DataMaker.game.popularity}
    Final Attendance: ${DataMaker.game.attendees}
    Remaining Floor Space: ${DataMaker.game.timeSlots}
    `
    megaPage[1] = endingStats
    const B1 = new StartupButton(scene, -600, this.height * 0.25, 'Next', () => {
      if (currentPage < megaPage.length) {
        mainText.setText(megaPage[currentPage])
        currentPage++
      } else {
        this.leave()
      }
    })
    this.add(B1)
    this.depth = 200000000000

    scene.add.existing(this)
    this.enter()
  }

  enter () {
    this.alpha = 0
    this.scene.tweens.add({
      targets: this,
      alpha: 1.0,
      delay: 30,
      duration: 400
    })
  }

  leave () {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      delay: 30,
      duration: 400,
      onComplete: () => {
        this.destroy()
        DataMaker.game.gameScene.start('StartScene')
      }
    })
  }
}

class StartupButton extends UpgradedContainer { // Class for the buttons inside of the ChoiceMenu
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

export default EndingDialog
