import Phaser from 'phaser'
import DataMaker from '../gamelogic/DataMaker.js'
import CONFIG from '../config.js'

const AlertManager = {
  messages: [],
  mIndex: 0,
  alertN: function (g) {
    this.mIndex = 0
    this.messages = g
    this.advance()
  },
  advance: function () { // Say the next alert.
    if (this.mIndex < this.messages.length) {
      const scene = DataMaker.game.RUI.scene
      const a = new GameAlert(scene, this.messages[this.mIndex])
      a.manager = this
      this.mIndex += 1
    }
  },
  alert: function (text) { // General alert handler. Used for on-off messages.
    const scene = DataMaker.game.RUI.scene
    const a = new GameAlert(scene, text)
  }
}

class GameAlert extends Phaser.GameObjects.Container {
  constructor (scene, text = '') {
    super(scene, 0, 0)
    this.width = CONFIG.DEFAULT_WIDTH * 0.4
    this.height = this.width * 0.2
    this.setInteractive()

    const bottom = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.width, this.height, '0xD5B623')
    this.add(bottom)

    const message = this.scene.add.text(-this.width / 2, -this.height / 2, text, { font: '24.11pt "Franklin Gothic Book"', color: '#231f20', align: 'center' })
    this.add(message)

    scene.add.existing(this)

    this.x = -this.width / 2
    this.y = CONFIG.DEFAULT_HEIGHT * 0.4
    const ReadWaitTime = 700 * 3
    const PassTime = 250
    scene.tweens.add({
      targets: this,
      x: 30 + this.width / 2,
      duration: PassTime
    })

    this.scene.tweens.add({
      targets: this,
      x: -this.width / 2,
      delay: PassTime + ReadWaitTime,
      duration: PassTime,
      onComplete: function () {
        this.targets[0].destroy()
      }
    })
  }

  destroy () {
    super.destroy()
    if (this.manager != null) {
      this.manager.advance()
    }
  }
}

export default AlertManager
