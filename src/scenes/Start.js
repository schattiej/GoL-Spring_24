import Phaser from 'phaser'
import CONFIG from '../config.js'
import CustomButton from '../scenes/CustomButton.ts'

class StartScene extends Phaser.Scene {
  init () {
    this.loadingText = this.add.text(
      CONFIG.DEFAULT_WIDTH / 2,
      CONFIG.DEFAULT_HEIGHT / 2,
      'Loading ...', { font: '16pt Arial', color: '#FFFFFF', align: 'center' }
    )
    this.loadingText.setOrigin(0.5, 0.5)
  }

  preload () {
    this.load.svg('board', 'assets/sprites/board/GameBoard.svg', { scale: 12 })
    this.load.svg('player_token', 'assets/sprites/tokens/GoL_PlayerToken.svg', { scale: 12 })
    this.load.svg('event_token', 'assets/sprites/tokens/GoL_EventDateToken.svg', { scale: 12 })
    // this.load.svg('start_token', 'assets/sprites/tokens/GoL_Start.svg', { scale: 12 })
    this.load.svg('contract_token', 'assets/sprites/tokens/GoL_ContractSigningToken.svg', { scale: 12 })
    this.load.svg('card', 'assets/sprites/TestCard.svg', { scale: 6 })
    this.load.svg('cardBtest', 'assets/sprites/CardBack.svg', { scale: 6 })
    this.load.image('cardbackTest', 'assets/sprites/CardBack_Venues.png')
    this.load.image('playspace', 'assets/ArtAssets/Playspace_NoButtons.png')
    this.load.image('curveball_menu', 'assets/ArtAssets/Curveball_Menu.png')
    this.load.image('results_menu', 'assets/ArtAssets/Results_Menu.png')

    // Background image
    this.load.image('BackgroundImage', 'assets/ArtAssets/Start_NoButtons.png', { scale: 6 })

    // GOL_MenuButton
    this.load.image('GOL_MenuButton', 'assets/ArtAssets/MenuButton.png', { scale: 8 })

    // GOL_StartButton
    this.load.image('GOL_StartButton', 'assets/ArtAssets/StartButton.png', { scale: 8 })

    // GOL_OptionsButton
    this.load.image('GOL_OptionsButton', 'assets/ArtAssets/OptionsButton.png', { scale: 8 })

    // GoLLogo
    this.load.svg('GoLLogo', 'assets/sprites/GoLLogo.svg', { scale: 6 })

    // Loading card SVGs
    this.load.svg('catering_back', 'assets/sprites/cards/Catering_back.svg', { scale: 6 })
    this.load.svg('catering_front', 'assets/sprites/cards/edited/caterfront.svg', { scale: 6 })

    this.load.svg('enter_back', 'assets/sprites/cards/Entertainment_back.svg', { scale: 6 })
    this.load.svg('enter_front', 'assets/sprites/cards/edited/enterfront.svg', { scale: 6 })

    this.load.svg('funds_back', 'assets/sprites/cards/Fundraising_back.svg', { scale: 6 })
    this.load.svg('funds_front', 'assets/sprites/cards/edited/fundfront.svg', { scale: 6 })

    this.load.svg('guest_back', 'assets/sprites/cards/GuestAccommodations_back.svg', { scale: 6 })
    this.load.svg('guest_front', 'assets/sprites/cards/edited/accofront.svg', { scale: 6 })

    this.load.svg('venue_back', 'assets/sprites/cards/Venue_back.svg', { scale: 6 })
    this.load.svg('venue_front', 'assets/sprites/cards/edited/venuefront.svg', { scale: 6 })

    this.load.svg('event_back', 'assets/sprites/cards/Event_back.svg', { scale: 6 })
    this.load.svg('event_front', 'assets/sprites/cards/edited/eventfront.svg', { setScale: 6 })

    this.load.svg('mark_back', 'assets/sprites/cards/Marketing_back.svg', { scale: 6 })
    this.load.svg('mark_front', 'assets/sprites/cards/edited/marketfront.svg', { scale: 6 })
    this.load.image('bruh', 'assets/sprites/Full.png', { scale: 6 })

    // Loading audio
    this.load.audio('button', 'assets/audio/button.wav')
    this.load.audio('cardgrab', 'assets/audio/cardpickup.wav')
    this.load.audio('cardflip', 'assets/audio/cardflip.wav')
    this.load.audio('carddrop', 'assets/audio/cardplace.wav')
    this.load.audio('confirm', 'assets/audio/confirm.wav')
  }

  create () {
    // Remove loading text
    this.loadingText.destroy()

    // Set the background of the menu screen
    const background = new CustomButton(this, 0, 0, 'BackgroundImage', 'BackgroundImage', 'Start')
    this.add.existing(background)
    // background.setScale(0.35, 0.35)
    Phaser.Display.Bounds.CenterOn(background, 0.5 * CONFIG.DEFAULT_WIDTH, 0.5 * CONFIG.DEFAULT_HEIGHT)
    background.setDepth(0)

    // create buttons for start and menu
    const startButton = new CustomButton(this, 660, 500, 'GOL_StartButton', 'GOL_StartButton', 'Start')
    this.add.existing(startButton)
    startButton.setScale(0.7, 0.7)
    startButton.setDepth(1)

    const menuButton = new CustomButton(this, 960, 500, 'GOL_MenuButton', 'GOL_MenuButton', 'Menu')
    this.add.existing(menuButton)
    menuButton.setScale(0.7, 0.7)
    menuButton.setDepth(1)

    const optionsButton = new CustomButton(this, 1310, 500, 'GOL_OptionsButton', 'GOL_OptionsButton', 'Options')
    this.add.existing(optionsButton)
    optionsButton.setScale(0.65, 0.65)
    optionsButton.setDepth(1)

    // starts game
    startButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.scene.start('ExampleScene')
      })

    // TODO This needs to be changed to an actual menu screen ----------------------------------------------
    menuButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.scene.start('ExampleScene')
      })

    // Add a callback when a key is released
    this.input.keyboard.on('keyup-SPACE', this.keyReleased, this)
  }

  keyReleased () {
    // console.log('Key released')
    this.scene.start('ExampleScene')
  }
}

export default StartScene
