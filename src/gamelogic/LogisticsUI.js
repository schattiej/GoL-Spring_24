import Phaser, { Data } from 'phaser'
import CONFIG from '../config.js'
import UpgradedContainer from './UpgradedContainer.js'
import DataMaker from '../gamelogic/DataMaker.js'
import StyleIndicator from './StyleIndicator.js'

class LogisticsUI extends UpgradedContainer {
  constructor (scene, x, y) {
    super(scene, x, y)
    this.width = CONFIG.DEFAULT_WIDTH * 0.3 * 0.5
    this.height = this.width
    // Colored rectangle
    const bottom = new Phaser.GameObjects.Rectangle(scene, 0, 0, this.width, this.height, '0x8473B8')
    this.add(bottom)
    this.makeNineSlice()
    // Set up text

    // this.addSafeText(this.scene, 0, 0.5, 1, 'Hotel: X')
    // const hotelIndicator = this.getLatest()
    const hotelIndicator = new StyleIndicator(scene, -30, 0, 'Hotel: ', 'X')
    const amenitiesIndicator = new StyleIndicator(scene, 0, 0, 'Amenities: ', '0')
    const attendeeCapsIndicator = new StyleIndicator(scene, 0, 0, 'Attendee Cap: ', '0')
    const popularityIndicator = new StyleIndicator(scene, 0, 0, 'Popularity: ', '0')
    const goalIndicator = new StyleIndicator(scene, 0, 0, 'Attendee Goal: ', '0')
    const costIndicator = new StyleIndicator(scene, 0, 0, 'Hotel Cost: ', '0')
    const discountIndicator = new StyleIndicator(scene, 0, 0, 'Discount: ', '0')
    const feeIndicator = new StyleIndicator(scene, 0, 0, 'Fee: ', '0')
    const attendeeIndicator = new StyleIndicator(scene, 0, 0, 'Attendees: ', '0')

    this.add(hotelIndicator)
    hotelIndicator.LeftLeftT(bottom)
    hotelIndicator.TopTopT(bottom)
    //
    this.add(attendeeCapsIndicator)
    this.BuddyUpText()
    attendeeCapsIndicator.LeftLeftT(bottom)
    //
    this.add(goalIndicator)
    this.BuddyUpText()
    goalIndicator.LeftLeftT(bottom)
    //
    this.add(costIndicator)
    this.BuddyUpText()
    costIndicator.LeftLeftT(bottom)
    //
    this.add(amenitiesIndicator)
    this.BuddyUpText()
    amenitiesIndicator.LeftLeftT(bottom)
    //
    this.add(discountIndicator)
    this.BuddyUpText()
    discountIndicator.LeftLeftT(bottom)
    //
    this.add(feeIndicator)
    this.BuddyUpText()
    feeIndicator.LeftLeftT(bottom)
    //
    this.add(popularityIndicator)
    this.BuddyUpText()
    popularityIndicator.LeftLeftT(bottom)
    //
    this.add(attendeeIndicator)
    this.BuddyUpText()
    attendeeIndicator.LeftLeftT(bottom)

    this.updateStatus = function () {
      if (DataMaker.game.hotel.amenities > 0) {
        amenitiesIndicator.setVal(DataMaker.game.hotel.amenities)
      }
      if (DataMaker.game.hotel.cost > 0) {
        costIndicator.setVal(DataMaker.game.hotel.cost)
      }
      if (DataMaker.game.hotel.popularity > 0) {
        popularityIndicator.setVal(DataMaker.game.hotel.popularity)
      }
      if (DataMaker.game.hotel.attendeeCap > 0) {
        attendeeCapsIndicator.setVal(DataMaker.game.hotel.attendeeCap)
      }
      if (DataMaker.game.hotel.attendeeGoal > 0) {
        goalIndicator.setVal(DataMaker.game.hotel.attendeeGoal)
      }
      if (DataMaker.game.hotel.discount > 0) {
        discountIndicator.setVal(DataMaker.game.hotel.discount)
      }
      if (DataMaker.game.hotel.fee > 0) {
        feeIndicator.setVal(DataMaker.game.hotel.fee)
      }
      if (DataMaker.game.hotel.attendees > 0) {
        attendeeIndicator.setVal(DataMaker.game.hotel.attendees)
      }
      if (DataMaker.game.hotel.name !== '') {
        hotelIndicator.setVal(DataMaker.game.hotel.name)
      }
    }

    // Positioning
    Phaser.Display.Bounds.CenterOn(this, x, y)
    Phaser.Display.Bounds.SetTop(this, y)
    this.y += 13
    DataMaker.game.LUI = this
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

export default LogisticsUI
