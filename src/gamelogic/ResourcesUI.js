import Phaser, { Data } from 'phaser'
import CONFIG from '../config.js'
import UpgradedContainer from './UpgradedContainer.js'
import DataMaker from '../gamelogic/DataMaker.js'
import StyleIndicator from './StyleIndicator.js'

class ResourcesUI extends UpgradedContainer {
  constructor (scene, x, y) {
    super(scene, x, y)
    this.width = CONFIG.DEFAULT_WIDTH * 0.3 * 0.5
    this.height = this.width
    // Colored rectangle
    const resourceBox = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.width, this.height, '0x24B3B8')
    this.add(resourceBox)
    this.makeNineSlice()

    // Set up text
    this.add(new StyleIndicator(scene, 0, 0, 'Player Resources:', ''))
    const resourceText = this.getLatest()
    resourceText.LeftLeftT(resourceBox)
    resourceText.TopTopT(resourceBox)

    this.add(new StyleIndicator(scene, 0, 0, 'Money: $', ''))
    const moneyText = this.getLatest()
    this.BuddyUpText(13)
    moneyText.LeftLeftT(resourceBox)

    this.add(new StyleIndicator(scene, 0, 0, 'Popularity: ', ''))
    const approvalText = this.getLatest()
    this.BuddyUpText(13)
    approvalText.LeftLeftT(resourceBox)

    this.add(new StyleIndicator(scene, 0, 0, 'Attendees: ', ''))
    const attendeesText = this.getLatest()
    this.BuddyUpText(13)
    attendeesText.LeftLeftT(resourceBox)

    this.add(new StyleIndicator(scene, 0, 0, 'Time Slots: ', ''))
    const timeIndicator = this.getLatest()
    this.BuddyUpText(13)
    timeIndicator.LeftLeftT(resourceBox)

    this.add(new StyleIndicator(scene, 0, 0, 'Player Actions Remaining: ', ''))
    const turnText = this.getLatest()
    this.BuddyUpText(13)
    turnText.LeftLeftT(resourceBox)

    this.addSafeText(scene, 0, 0.5, 1, '')
    const turnsIndicator = this.getLatest()
    this.BuddyUpText(13)

    // Methods
    this.updateText = function () {
      moneyText.setVal(DataMaker.game.money)
      approvalText.setVal(DataMaker.game.popularity)
      attendeesText.setVal(DataMaker.game.attendees)
      timeIndicator.setVal(DataMaker.game.timeSlots)
    }

    this.setTurns = function (t) {
      turnsIndicator.setText('🃏'.repeat(t))
    }

    this.updateText()
    this.setTurns(CONFIG.DRAWS_PER_ROUND)

    // Positioning
    Phaser.Display.Bounds.SetRight(this, x)
    Phaser.Display.Bounds.SetBottom(this, y)
    DataMaker.game.RUI = this
    scene.add.existing(this)
  }

  makeNineSlice () {
    const drambo = this.scene.make.nineslice({
      x: 0,
      y: 0,
      key: 'bruh',
      width: this.width,
      height: this.height,
      leftWidth: 10,
      rightWidth: 10,
      topHeight: 10,
      bottomHeight: 10,
      scale: {
        x: 1,
        y: 1
      },
      origin: { x: 0.5, y: 0.5 }
    })

    this.add(drambo)
  }
}

export default ResourcesUI
