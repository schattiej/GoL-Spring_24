import Phaser from 'phaser'
import CONFIG from '../config.js'
import DataMaker from '../gamelogic/DataMaker.js'
import AlertManager from '../gamelogic/GameAlert.js'
import StyleIndicator from '../gamelogic/StyleIndicator.js'
import Card from '../card/Card.js'

class PlayZone extends Phaser.GameObjects.Container {
  constructor (scene, cardgroup, x, y) {
    super(scene, 0, 0)
    this.width = CONFIG.DEFAULT_WIDTH * 0.2 * 0.6
    this.height = this.width * (363 / 259)
    this.cardqueue = []
    this.endcards = []
    this.incards = []
    this.locked = false

    const playBox = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.width, this.height, '0xff5500')
    playBox.setVisible(false)
    this.add(playBox)
    this.makeNineSlice()

    this.add(new StyleIndicator(scene, -100, -150, 'Play Cards Here', ''))

    scene.input.on('pointerup', () => {
      /* To add more 'play during a turn' functionality,
      remove the filter at the end that only allows market cards in.
      Then below in Play Cards, filter using a switch / if statements. Only use the cardqueue for cards that will have an effect later. */
      this.incards = cardgroup.children.getArray().filter((c) => { return (Phaser.Geom.Intersects.RectangleToRectangle(playBox.getBounds(), c.getBounds())) })
      if (this.incards.length === 0) {
        this.notDonePlaying = false
      }
      this.incards.forEach(element => { this.ReadyForPlay(element) })
    })

    DataMaker.game.playzone = this
    scene.add.existing(this)
    Phaser.Display.Bounds.CenterOn(this, x, y)
  }

  ReadyForPlay (card) {
    if (card.inPlay === false) {
      this.scene.tweens.add({
        targets: card,
        x: this.x,
        y: this.y - (this.height * 0.2),
        displayWidth: this.displayWidth * 0.6,
        displayHeight: this.displayHeight * 0.6,
        duration: 50
      })
    }

    card.inPlay = true
    this.PlayCards()
  }

  DiscardCard (c) {
    this.scene.tweens.add({
      targets: c,
      y: CONFIG.DEFAULT_HEIGHT * 0.8,
      x: CONFIG.DEFAULT_WIDTH * 0.5,
      duration: 600
    })
  }

  PlayCards () {
    console.log(this.incards)
    console.log(DataMaker.game.hotel.main)
    if (this.notDonePlaying) { console.log('Not done'); return }
    this.incards.forEach(card => {
      if (card.cdata.type === 'hotel') {
        if (DataMaker.game.hotel.name !== '') { // Don't play the card if you already played a hotel
          AlertManager.alert('You can only have one hotel deal')
          this.DiscardCard(card)
          return
        }
      }

      if (card.cdata.cost > DataMaker.game.money && card.cdata.type !== 'hotel') { // Don't play the card if you don't have enough money. Warn the player!
        AlertManager.alert('This card costs too much.')
        this.DiscardCard(card)
        return
      }

      if (card.cdata.turnsNeeded) {
        if ((DataMaker.game.dueDate - DataMaker.game.turnCount) < card.cdata.turnsNeeded) { // Don't play the card if there isn't enough time to play it. Not sure if the functionality for this is in, other than that it won't let you play it.
          AlertManager.alert("There isn't enough time to prepare this card!")
          this.DiscardCard(card)
          return
        }
      }
      if (card.cdata.actions) {
        if (DataMaker.game.actions > 2) { // Don't play the card if there isn't enough time to play it. Not sure if the functionality for this is in, other than that it won't let you play it.
          AlertManager.alert("You don't have enough actions to play this card!")
          this.DiscardCard(card)
          return
        }
      }

      if (card.cdata.timeSlots > 0) {
        if (DataMaker.game.timeSlots < card.cdata.timeSlots) {
          AlertManager.alert("You don't have enough time slots to play this card.")
          this.DiscardCard(card)
          return
        }
      }

      if (card.cardtype === 'enter') {
        this.endcards.push(card) // Put the card in the endcards stack to be used later
      }

      if (card.cdata.turns) {
        this.cardqueue.push([DataMaker.game.turnCount + card.cdata.turns, card.cdata]) // Put the card in the queue to have an effect on future turns.
      }
      if (card.cdata.type === 'partnership') {
        this.cardqueue.push([DataMaker.game.turnCount + 1, card.cdata]) // Put the card in the queue to have an effect on future turns.
      }
      DataMaker.card.play(card.cdata)

      this.notDonePlaying = true
      this.scene.tweens.add({
        targets: card,
        y: this.y + (this.height / 2 - card.height),
        duration: 250,
        onComplete: function () {
          card.destroy()
        }
      })
    })
    this.incards = []
  }

  EndTurnCards () {
    let costSum = 0
    let moneySum = 0
    for (let i = 0; i < this.cardqueue.length; i++) {
      const queuepiece = this.cardqueue[i]
      const cturn = queuepiece[0]
      const cdata = queuepiece[1]

      // if the player gets money or pays money
      if (cdata.money) {
        moneySum += cdata.money
        DataMaker.card.addMoney(cdata.money)
      } else if (cdata.cost) {
        costSum += cdata.cost
        // Pay the cost of the card every turn until the turns are up
        DataMaker.card.payCost(cdata.cost)
      } else if (cdata.type === 'partnership') {
        const data = {
          fee: cdata.pFee,
          money: cdata.pMoney,
          turns: cdata.pTurns,
          deadline: cdata.deadline
        }
        const c = new Card(this.scene, CONFIG.DEFAULT_WIDTH * 0.5, CONFIG.DEFAULT_HEIGHT * 0.8, cdata.type, data)
        c.setDepth(this.depth + 1)
        this.cardgroup.add(c)
      }

      // Remove the card from the queue if the turns are up. -1 is so that the user pays the proper number of times
      if (DataMaker.game.turnCount === cturn - 1) {
        this.cardqueue.splice(i, 1)
        i--
      }
    }

    // tell the player the amount they paid or received
    if (costSum !== 0) {
      AlertManager.alertN([`You paid ${costSum} in end of turn fees`])
    } else if (moneySum !== 0) {
      AlertManager.alertN([`You received ${moneySum} at the end of the turn`])
    }
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
export default PlayZone
