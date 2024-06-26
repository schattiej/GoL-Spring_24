import Phaser, { Data } from 'phaser'
import DataMaker from '../gamelogic/DataMaker.js'
import CONFIG from '../config.js'
import UpgradedContainer from '../gamelogic/UpgradedContainer.js'

const HowToPlay = [
  `This game approximates the yearly planning cycle of a large-scale event.
  You will be managing groups of interest, guest participation, and curveballs or unexpected events throughout the year.`,
  `Money is required to play most cards; as such it should be the first resource you focus on obtaining.`,
  `Rating is your Approval Rating. The higher your Approval Rating is, the more successful you are as an event planner once the end of the year rolls around.
  Throughout the year, your Approval Rating will also contribute to guest count.`,
  `Floor Space is as the name suggests; throughout the year you must use up as much floor space as possible with new attractions and vendors. Don't run out, though!`,
  `🃏🃏🃏🃏 This is your Turns Indicator. It displays how many cards you can draw before the game automatically resumes to the next month. Choose carefully which decks you draw from!`
]

const DecksDescription = [
  `Logistics (Gray)
  The Logistics deck handles several aspects of event planning - mainly the selection of a Hotel and deals related to it.
  Take a look at the wheel; the orange marker is the cutoff date for locking in what hotel you have chosen.
  With this deck you must try to satisfy four elements:

  The hotel you are choosing
  The room package for that hotel
  The amenities for that hotel
  Solving staffing issues - who will support the event?`,
  `Marketing (Blue)
  Marketing cards directly effect the guest count of the event, by generating additional interest.`,
  `Fundraising (Green)
  Fundraising is how you make money - there are recurring income methods and one-time payments.
  Most of this is vendors paying you for a spot at the event.
  Be aware that some of these sponsors may need extra help at the event throughout the year!`,
  `Entertainment (Orange)
  Entertainment cards generate approval at the event itself, and contribute greatly to your final approval score.
  As with most things, though, be prepared to accept risks regarding these entertaining activities!`
]

class StartupDialog extends UpgradedContainer {
  constructor (scene) {
    const x = CONFIG.DEFAULT_WIDTH * 0.5
    const y = CONFIG.DEFAULT_HEIGHT * 0.5
    super(scene)
    this.width = CONFIG.DEFAULT_WIDTH * 0.8
    this.height = CONFIG.DEFAULT_HEIGHT * 0.8
    Phaser.Display.Bounds.CenterOn(this, CONFIG.DEFAULT_WIDTH * 0.5, CONFIG.DEFAULT_HEIGHT * 0.5)

    const bottom = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.width, this.height, '0xe94394')
    this.add(bottom)

    const introTitle = this.scene.add.text(0, 0, 'Welcome to the Game of Life!', { font: '48.11pt "Franklin Gothic Book"', color: '#231f20' })
    this.LeftLeft(introTitle, bottom)
    this.TopTop(introTitle, bottom)
    introTitle.x += 8
    this.add(introTitle)

    this.addSafeText(this.scene, 0, 0.25, 1.9, HowToPlay[0])
    const mainText = this.list[this.list.length - 1]

    let currentPage = 1
    const megaPage = HowToPlay.concat(DecksDescription)

    const IntroStats =
    `
    Floor space currently available: ${DataMaker.game.floorSpace} square meters
    Your guaranteed guest count is: ${DataMaker.game.attendees}
    You currently have ${DataMaker.game.money} dollars
    `
    megaPage.push(IntroStats)

    const B1 = new StartupButton(scene, 300, this.height * 0.25, 'Next', () => {
      if (currentPage < megaPage.length) {
        mainText.setText(megaPage[currentPage])
        currentPage++
      } else {
        this.leave()
      }
      scene.sound.play('button')
    }).LeftLeftT(bottom).BottomBottomT(bottom)
    this.add(B1)

    /*
    this.addSafeText(this.scene, 0, 0.25, 1.9, 'Floor space currently available: ' + DataMaker.game.floorSpace + ' square meters')
    this.addSafeText(this.scene, 0, 0.25, 1.9, 'Your guaranteed guest count is: ' + DataMaker.game.attendees + ' guests')
    this.BuddyUpText()
    this.addSafeText(this.scene, 0, 0.25, 1.9, 'Your currently have: $' + DataMaker.game.money)
    this.BuddyUpText()
    */
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

export default StartupDialog
