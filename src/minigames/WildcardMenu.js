import Phaser, { Data } from 'phaser'
import DataMaker from '../gamelogic/DataMaker.js'
import CONFIG from '../config.js'
import ChoiceMenu from '../gamelogic/ChoiceMenu.js'
import AlertManager from '../gamelogic/GameAlert.js'
import EndingDialog from '../gamelogic/EndingDialog.js'

function SimpleCM (text, options) {
  return new ChoiceMenu(DataMaker.game.RUI.scene, 0.5 * CONFIG.DEFAULT_WIDTH, 0.5 * CONFIG.DEFAULT_HEIGHT, text, options, true)
}

// The list of possible midgame wildcard events aka curveballs
const MidgameWildcards =
{
  POSSIBLE_WILDCARDS: [

  ],
  INIT: (scene) => { // set the scene for the curveballs
    MidgameWildcards.scene = DataMaker.game.RUI.scene
  },
  POPULATE: () => { // fills the possible wildcards array with integers that can each refer to specific curveballs
    for (let i = 0; i < 10; i++) {
      const random = Phaser.Math.RND.integerInRange(1, 10)
      MidgameWildcards.POSSIBLE_WILDCARDS.push(random)
    }
  },
  PULL: () => { // remove an entry from the possible wildcards array and start a curveball
    if (MidgameWildcards.POSSIBLE_WILDCARDS.length === 0) { return -1 }
    Phaser.Math.RND.shuffle(MidgameWildcards.POSSIBLE_WILDCARDS)
    const curveball = MidgameWildcards.POSSIBLE_WILDCARDS.pop()
    switch (curveball) {
      case 1: {
        MidgameWildcards.DELIVERY_NEEDED()
        break
      } case 2: {
        MidgameWildcards.AUTHORITY_FIRE()
        break
      } case 3: {
        MidgameWildcards.AUTHORITY_FOOD()
        break
      } case 4: {
        MidgameWildcards.AUTHORITY_FOOD()
        break
      } case 5: {
        MidgameWildcards.DELIVERY_NEEDED()
        break
      } case 6: {
        MidgameWildcards.AUTHORITY_FIRE()
        break
      } case 7: {
        MidgameWildcards.AUTHORITY_FOOD()
        break
      } case 8: {
        MidgameWildcards.AUTHORITY_FOOD()
        break
      } case 9: {
        MidgameWildcards.DELIVERY_NEEDED()
        break
      } case 10: {
        MidgameWildcards.AUTHORITY_FIRE()
        break
      } default:
        MidgameWildcards.DELIVERY_NEEDED()
    }
    return 1
  },
  DELIVERY_NEEDED: (cdata) => {
    const C = SimpleCM(
      'Your crew needs space to store products at the hotel before the event. The hotel is going to charge you..',
      [
        ['Pay Hotel', WildCardEvent.LOSEMONEY_HEAVY],
        ['Ignore/Negotiate', WildCardEvent.LOSEAPPROVAL_LIGHT]
      ])
  },
  AUTHORITY_FIRE: () => {
    const C = SimpleCM(
      'The fire marshal has found an issue with the event\'s floor plan. ',
      [
        ['Manually Revisit Floor Plan', WildCardEvent.LOSEMONEY_HEAVY],
        ['Ask Vendors to Move Themselves', WildCardEvent.LOSEMONEY_HEAVY]
      ])
  },
  AUTHORITY_FOOD: () => {
    const C = SimpleCM(
      'The health inspector has found an issue with the safety of the event\'s food!',
      [
        ['Use Plan B', WildCardEvent.LOSEMONEY_HEAVY],
        ['Hire Better Kitchen Staff', WildCardEvent.LOSEMONEY_HEAVY],
        ['Ignore the Risk', WildCardEvent.LOSEMONEY_HEAVY]
      ])
  },
  AV_ORDER: () => {
    const C = SimpleCM(
      'Placeholder text for AV Order Form',
      [
        ['Timboflimbus', WildCardEvent.LOSEMONEY_HEAVY],
        ['Yok Yag Yid', WildCardEvent.LOSEMONEY_HEAVY],
        ['Yorbulin', WildCardEvent.LOSEMONEY_HEAVY]
      ])
  }
}

// The list of possible outcomes for each event. Presented as a sort of pseudo-enum for easy naming and reuse.
const WildCardEvent =
{
  LOSEMONEY_LIGHT: function () {
    DataMaker.game.money -= 30
    AdvanceRUI()
  },
  LOSEAPPROVAL_LIGHT: function () {
    DataMaker.game.approval -= 7
    AdvanceRUI()
  },
  LOSEMONEY_HEAVY: function () {
    DataMaker.game.money -= 100
    AdvanceRUI()
  },
  LOSEAPPROVAL_HEAVY: function () {
    DataMaker.game.approval -= 15
    AdvanceRUI()
  },
  ATROCITY: function () {
    DataMaker.game.approval = 0
    AlertManager.alert('You have done something terrible, and possibly illegal!')
    AdvanceRUI()
  }
}

function AdvanceRUI () { // Simple function for updating the RUI and advancing to the next option.
  DataMaker.game.RUI.updateText()
  if (WildcardManager.isEndOfGameFlag) // Only chains into the next option if we are truly at the end of the game. Untested
  { WildcardManager.makeWarning() }
}

const WildcardManager = { // end of game events
  init: function () { // 'Constructor' for this global Wildcard Manager object. Intended to show the beginning dialogue for the end of the game.
    const scene = DataMaker.game.RUI.scene
    console.log(scene)
    this.choicemenu = SimpleCM(
      `It's time - the fabled day of the event has arrived! \n To date, the approval rating of the event based on marketing is: ${DataMaker.game.approval}. \n\n As the event goes on, there may be hiccups that affect the total approval rating, as well as the additional approval from the entertainment venues themselves. Manage well, and you may make a lot of guests happy!\n\nManage poorly, and you may suffer the consequences...`,
      [
        ['Lets go!', () => { this.hotelStatus() }]
      ])
    this.isEndOfGameFlag = false
  },
  // Checks if you have even picked a hotel.
  hotelStatus: function () {
    const noHotel = (DataMaker.game.hotel === '')

    if (noHotel) {
      DataMaker.game.approval -= 15
      DataMaker.game.RUI.updateText()
      this.choicemenu = SimpleCM('For whatever reason, you have not selected a hotel deal for your guests - they have to fend for themselves. You lose 15 approval!',
        [
          ['Whoops...', () => { this.makeWarning() }]
          // ['Whoops...', () => { this.roomsStatus() }]
        ])
    } else {
      this.roomsStatus()
    }
  },
  // Checks if you have met the room deal minimum sales for the prices to kick in.
  roomsStatus: function () {
    const guestsToRooms = DataMaker.game.attendees / Phaser.Math.RND.between(2, 4)
    let stipulationBroken = false
    // let stipulationBroken = true

    for (const rc in DataMaker.game.hotel.roomcards) {
      const stipulationtoRooms = (rc.stipulation / 100) * DataMaker.game.hotel.main.rooms
      if (guestsToRooms < stipulationtoRooms) {
        AlertManager.alert('BRINGUS')
        stipulationBroken = true
      } else {
        AlertManager.alert('CHORBO')
      }
    }

    if (stipulationBroken) {
      this.choicemenu = SimpleCM("You didn't get enough guests for the event - you will incur a fee for not making your promises to the hotel.",
        [
          ['Whoops...', () => { this.makeWarning() }]
        ])
    } else {
      this.makeWarning()
    }
  },
  // Primary loop for the end of the game - where choices must be made!
  makeWarning: function () {
    this.isEndOfGameFlag = true
    const EC = DataMaker.game.playzone.endcards
    const temp = Phaser.Math.RND.pick(['Hotel', 'Entertainment', 'Food', 'Guests'])
    let warning = `Something has gone wrong! your ${temp} has happened to become Y and such and such.`
    let choices = [
      ['Use Money', WildCardEvent.LOSEMONEY_LIGHT],
      ['Use Time', WildCardEvent.LOSEAPPROVAL_LIGHT],
      ['Ignore It', WildCardEvent.LOSEAPPROVAL_LIGHT]
    ]

    console.log(DataMaker.game.playzone.endcards)
    if (EC.length === 0) {
      const ED = new EndingDialog(DataMaker.game.RUI.scene) // If there are no more cards, create the endgame dialogue.
      return
    }
    const EndgameCard = EC.pop() // Remove an endgame card from the stack
    const ename = EndgameCard.cdata.name

    // change to a switch-------------------------------------------------------------------------------------------------------------------------------------
    // Exhaustive list of possible issues with each card, and possible choices you can make in reponse to them.
    if (ename.includes('Band')) {
      const bandname = ename.split(' ')[0]
      warning = `Oh no - the lead singer of the band ${bandname} has fallen ill, and the band is considering not showing up for the event.\n\nYou could provide a monetary incentive for them to continue, or find another band quickly.\n\nHowever, there's no guarantee that this new band will impress the guests. It may be best to do nothing.`
      // Outcomes
      const c1 = ['Pay Band', 'Find New Band', 'Do Nothing'].reverse()
      choices = choices.map(x => [c1.pop(), x[1]])
      /// -
    } else
    if (ename === 'Laser Tag' || ename === 'Paintball') {
      warning = `Drats - an accident at the ${ename.toLowerCase()} venue has caused it to shut down for the duration of the event!\n\nThe guests who have already paid will expect reimbursement. Of course, you could wait and see if the venue will reimburse you to lesson the load.`
      // Outcomes
      const c1 = ['Pay Guests', 'Wait and See'].reverse()
      choices = choices.map(x => [c1.pop(), x[1]])
      /// -
    } else
    if (ename.includes('A ')) {
      const enttype = ename.split(' ')[1]
      warning = `The ${ename} you hired for the event got injured in a terrible car accident. There is no way they can show up to the event.\n\nYou have a few hours to find someone new or risk having angered customers!`
      // Outcomes
      choices = [
        ['New ' + enttype, WildCardEvent.LOSEMONEY_LIGHT],
        ['Do Nothing ', WildCardEvent.LOSEMONEY_LIGHT]
      ]
      /// -
    } else
    if (ename === 'Hiking Trail') {
      warning = 'One of the guests has suffered from heat stroke and collapsed on the trail. It will take considerable time to discretely bring medical attention to the guest and get them out of here! Rescue workers are en route.'
      // Outcomes
      choices = [
        ['Call Medics', WildCardEvent.LOSEMONEY_LIGHT],
        ['Do Nothing ', WildCardEvent.ATROCITY]
      ]
      /// -
    } else
    if (ename === 'Auction') {
      warning = 'Something unspeakable has been offered for auction and the guests are descending into chaos. If you don\'t act quickly, someone might get hurt.'
      // Outcomes
      choices = [
        ['Evacuate', WildCardEvent.LOSEMONEY_LIGHT],
        ['Stow Item', WildCardEvent.LOSEMONEY_LIGHT]
      ]
      /// -
    }
    if (ename === 'Museum Tour') {
      warning = `A ${Phaser.Math.RND.pick(['terrible leak', 'fire', 'collapse'])} has happened at the museum, and the tour has been called off.`
      // Outcomes
      choices = [
        ['Refund', WildCardEvent.LOSEMONEY_HEAVY],
        ['Ignore', WildCardEvent.LOSEAPPROVAL_HEAVY]
      ]
      /// -
    }

    this.choicemenu.leave()
    this.choicemenu = SimpleCM(warning, choices)
  }
}

export { WildcardManager, MidgameWildcards }
