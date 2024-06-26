import Phaser, { Data } from 'phaser'
import DataMaker from '../gamelogic/DataMaker.js'
import CONFIG from '../config.js'
import UpgradedContainer from '../gamelogic/UpgradedContainer.js'
import AlertManager from '../gamelogic/GameAlert.js'

class Card extends UpgradedContainer {
  constructor (scene, x, y, type = 'mark', data = null) {
    super(scene, x, y)
    this.width = CONFIG.CARD_WIDTH
    this.height = CONFIG.CARD_WIDTH * (363 / 259)
    this.setInteractive()
    this.data = data

    if (type === 'partnership') {
      // Part for adding card contents. Might get complex towards endgame.
      const bottom = scene.add.image(0, 0, 'funds_front')
      this.add(bottom)
      this.front = bottom
      bottom.displayWidth = this.width
      bottom.displayHeight = this.height
    } else {
      // Part for adding card contents. Might get complex towards endgame.
      const bottom = scene.add.image(0, 0, type + '_front')
      this.add(bottom)
      this.front = bottom
      bottom.displayWidth = this.width
      bottom.displayHeight = this.height
    }

    const back = scene.add.image(0, 0, type + '_back')
    back.flipX = true
    this.add(back)
    this.cardback = back

    back.displayWidth = this.width
    back.displayHeight = this.height

    const cardTitle = this.scene.add.text(0, 0, 'CARD NAME', { font: '24.11pt "Franklin Gothic Book"', color: '#231f20', align: 'center' })
    cardTitle.scale = 0.7
    this.add(cardTitle)
    cardTitle.x -= this.width / 2.2
    cardTitle.setAngle(-90)

    this.titleText = cardTitle
    this.inHand = false
    this.inPlay = false
    this.GetAndDrawInfo(type)
    // If card is event, do not flip?
    this.flipFront(scene, back)

    // Event listeners for dragging the card.
    scene.input.setDraggable(this)
    this.beingDragged = false
    this.on('dragstart', (pointer) => {
      scene.sound.play('cardgrab')
      this.setDepth(100)
      this.setRotation(0)
      this.beingDragged = true
      // Dragging a card should prioritize removing it from a hand.
      this.inHand = false
      this.inPlay = false
    })
    this.on('drag', (pointer, dragX, dragY) => {
      this.x = dragX
      this.y = dragY
    })
    this.on('dragend', (pointer) => {
      scene.sound.play('carddrop')
      if (this.scale !== 1) this.scale = 1
      this.beingDragged = false
      this.setDepth(CONFIG.HAND_DEPTH + 1)
    })

    // Use the scrollwheel to grow and shrink the card!
    this.on('wheel', (pointer, deltaX, deltaY, deltaZ) => {
      if (this.beingDragged) {
        if (deltaY > 0) {
          this.scale = Math.min(this.scale + 0.6, 4)
        } else {
          this.scale = Math.max(this.scale - 0.6, 1)
        }
      }
    })

    // Alternate growing and shrinking for laptops; press Z to zoom in and release Z to zoom out.
    scene.input.keyboard.on('keydown-Z', () => {
      if (this.beingDragged) {
        scene.tweens.add({
          targets: this,
          scale: 4,
          duration: 250
        })
      }
    })
    scene.input.keyboard.on('keyup-Z', () => {
      if (this.scale !== 1 && !this.inPlay) {
        scene.tweens.add({
          targets: this,
          scale: 1,
          duration: 250
        })
      }
    })

    scene.add.existing(this)
  }

  // Safely change the card title.
  ChangeCardTitle (text) {
    const bw = this.titleText.displayWidth
    this.titleText.setText(text)
    const aw = this.titleText.displayWidth
    this.titleText.y += (aw - bw)
  }

  // Intelligently creates text on the card
  GetAndDrawInfo (t) {
    this.cardtype = t
    switch (t) {
      case 'guest': {
        const d = DataMaker.card.makeHotelData1()

        if (d.type === 'amenities') {
          this.ChangeCardTitle(d.name)
          this.addSafeText(this.scene, 0.2, 0.5, 0.55, 'Adds $' + d.cost + ' to the hotel cost')
          this.addSafeText(this.scene, 0.2, 0.6, 0.55, 'Adds ' + d.hotelAttendees + ' attendees and ' + d.hotelPopularity + ' popularity to the hotel card')
        }
        if (d.type === 'hotel') {
        // Set title
          this.ChangeCardTitle(d.name)
          this.addSafeText(this.scene, 0.2, 0.5, 0.5, 'Costs: $' + d.cost)
          this.addSafeText(this.scene, 0.2, 0.55, 0.5, 'Pay this cost at the hotel cut-off date')
          this.addSafeText(this.scene, 0.2, 0.6, 0.5, 'Attendees cannot go above ' + d.attendeeCap)
          this.addSafeText(this.scene, 0.2, 0.7, 0.5, 'If attendees is at least ' + d.attendeeCap * d.feePercent + ' by the 12th month, get a discount of: ' + d.discount)
          this.addSafeText(this.scene, 0.2, 0.8, 0.5, 'If attendees does not reach ' + d.attendeeCap * d.feePercent + ' by the 12th month, pay the attrition fee of: ' + d.fee)
        }

        this.cdata = d
        break
      } case 'funds': {
        const d = DataMaker.card.makeFundData1()
        // Set title
        this.ChangeCardTitle(d.name)

        if (d.type === 'partnership') {
          this.addSafeText(this.scene, 0.2, 0.5, 0.6, 'Playing this card gives you another card that you most play within ' + d.pTurns + ' turns')
          this.addSafeText(this.scene, 0.2, 0.7, 0.6, 'The new card will give $' + d.pMoney + ' but if you do not play it, it will cost you $' + d.pFee)
          this.addSafeText(this.scene, 0.2, 0.85, 0.6, 'You can only have one partnership')
        } else {
          this.addSafeText(this.scene, 0.25, 0.5, 0.6, 'Costs ' + d.actions + ' actions')

          this.addSafeText(this.scene, 0.25, 0.6, 0.6, 'Money Recieved: ' + d.money)
          if (d.turns) {
            this.addSafeText(this.scene, 0.25, 0.7, 0.6, 'Repeats every turn for ' + d.turns + ' turns')
          }
        }

        this.cdata = d
        break
      } case 'enter': {
        const d = DataMaker.card.makeEntertainmentData1()
        // Set title
        this.ChangeCardTitle(d.name)
        if (d.travelFee) {
          this.addSafeText(this.scene, 0.25, 0.4, 0.6, 'Initial Cost: $' + d.cost + ' + travel fees of $' + d.travelFee)
        } else {
          this.addSafeText(this.scene, 0.25, 0.4, 0.6, 'Initial Cost: $' + d.cost)
        }
        if (d.eventPayment) {
          this.addSafeText(this.scene, 0.25, 0.5, 0.6, 'Payment at event: $' + d.eventPayment)
        }
        this.addSafeText(this.scene, 0.25, 0.6, 0.6, 'Popularity: ' + d.popularity)

        if (d.timeSlots > 0) {
          this.addSafeText(this.scene, 0.25, 0.7, 0.6, 'Time Slots: ' + d.timeSlots)
          this.BuddyUpText(5)
        }
        this.cdata = d
        break
      } case 'event': {
        const d = DataMaker.card.makeHotelData1()
        // Set title
        this.ChangeCardTitle(d.name)
        // Draw deals
        let packageText = ''
        for (let i = 0; i < d.deals.length; i++) {
          packageText += d.deals[i][0] + ' rooms for ' + '$'.repeat(d.deals[i][1]) + '\n'
        }
        this.addSafeText(this.scene, 0.25, 0.5, 0.6, packageText)
        this.addSafeText(this.scene, 0.25, 0.7, 0.6, 'Details: ' + d.details)
        this.addSafeText(this.scene, 0.25, 0.8, 0.6, 'Options: ' + d.options)

        const alignptext = this.list[this.list.length]
        console.log(alignptext)
        this.cdata = d
        break
      } case 'mark': {
        const d = DataMaker.card.makeMarketingData1()
        // Set title
        this.ChangeCardTitle(d.name)
        this.addSafeText(this.scene, 0.25, 0.4, 0.6, 'Cost: $' + d.cost)
        if (d.turns) {
          this.addSafeText(this.scene, 0.25, 0.45, 0.6, 'Pay the cost every month for ' + d.turns + ' months')
        }
        this.addSafeText(this.scene, 0.25, 0.6, 0.6, 'Attendees: ' + d.attendees)
        this.addSafeText(this.scene, 0.25, 0.7, 0.6, 'Popularity: ' + d.popularity)
        this.BuddyUpText(15)
        this.cdata = d
        break
      } case 'partnership': {
        const d = DataMaker.card.makePartnershipData1(this.data.fee, this.data.money, this.data.turns, this.data.deadline)
        // Set title
        this.ChangeCardTitle(d.name)
        this.addSafeText(this.scene, 0.25, 0.4, 0.6, 'Money Received: $' + d.money)
        this.addSafeText(this.scene, 0.25, 0.6, 0.6, 'You have ' + d.turns + ' to play this card')
        this.addSafeText(this.scene, 0.25, 0.7, 0.6, 'If you do not play the card, you have to pay a ' + d.fee + ' fee')
        this.BuddyUpText(15)
        this.cdata = d
        break
      } default:
        alert(t)
        this.addSafeText(this.scene, 0.25, 0.5, 0.6, DataMaker.card.makeBetterDummyData())
        this.addSafeText(this.scene, 0.25, 0.8, 0.6, DataMaker.card.makeDummyData())
    }
  }

  flipFront (scene, back) {
    scene.sound.play('cardflip')

    // Hides the front of the card initially
    this.scaleX = -1
    this.list.forEach((c) => {
      c.visible = false
    })
    back.visible = true

    // Shows the front face of the card once halfway turned
    const halftween = scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 125,
      onComplete: () => {
        this.list.forEach((c) => {
          c.visible = true
        })
        back.visible = false
      }
    })

    // Creates the illusion of flipping a card
    scene.tweens.add({
      targets: this,
      scaleX: 1,
      duration: 250
    })
  }
}

export default Card
