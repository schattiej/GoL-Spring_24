import Phaser from 'phaser'
import CONFIG from '../config.js'
import DataMaker from '../gamelogic/DataMaker.js'
import { WildcardManager } from '../minigames/WildcardMenu.js'

class Board extends Phaser.GameObjects.Container {
  constructor (scene, x, y) {
    super(scene, x, y)
    const bImage = scene.add.image(0, 0, 'board')
    this.add(bImage)

    this.width = (0.8 * 0.92) * CONFIG.DEFAULT_WIDTH
    this.height = this.width
    bImage.displayWidth = this.width
    bImage.displayHeight = this.height
    this.bstate = 'none'
    this.player_loc = DataMaker.game.startDate + 1

    this.setInteractive()

    this.on('pointerdown', (pointer, localX, localY) => {
      this.AdvanceTurn()
    })

    this.returntween = 0
    this.on('wheel', (pointer, deltaX, deltaY, deltaZ) => {
      if (this.bstate === 'mainevent') { return }
      this.y += (deltaY > 0 ? 1 : -1) * CONFIG.DEFAULT_HEIGHT / 30
      if (this.returntween !== 0) {
        this.returntween.remove()
        this.returntween = 0
      }
      this.returntween = scene.tweens.add({
        targets: this,
        y: 0,
        duration: 300,
        delay: 700
      })
    })

    // Alternate controls for observing board. Z down to move board down. Releasing Z moves it back up.
    this.okaymove = false
    this.SetupInOut()
    scene.input.keyboard.on('keydown-Z', () => {
      if (!this.okaymove || this.bstate === 'mainevent') { return }
      const p = scene.input.activePointer
      const b = this.list[0].getBounds()
      if (b.contains(p.x, p.y)) {
        scene.tweens.add({
          targets: this,
          y: CONFIG.DEFAULT_HEIGHT / 2,
          duration: 300
        })
      }
    })

    scene.input.keyboard.on('keyup-Z', () => {
      if (this.y !== 0 && this.bstate !== 'mainevent') {
        scene.tweens.add({
          targets: this,
          y: 0,
          duration: 300
        })
      }
    })

    const ft = this.PlaceToken('event_token', DataMaker.game.dueDate)
    const ht = this.PlaceToken('contract_token', DataMaker.game.hotelDate)
    const nt = this.PlaceToken('player_token', DataMaker.game.startDate)
    this.playerToken = nt

    this.RealignBoard()

    // this.FinalPhaseTransition()
    DataMaker.game.board = this
    scene.add.existing(this)
    Phaser.Display.Bounds.CenterOn(x, y)
  }

  SetupInOut () {
    this.on('pointerover', () => { this.okaymove = true })
    this.on('pointerout', () => { this.okaymove = false })
  }

  FinalPhaseTransition () {
    this.bstate = 'mainevent'
    this.scene.tweens.add({
      targets: this,
      scale: 4,
      y: CONFIG.DEFAULT_HEIGHT * 0.4,
      duration: 300
    })

    this.scene.tweens.add({
      targets: this.list.slice(1),
      y: CONFIG.DEFAULT_HEIGHT * 0.12,
      scale: 0.2 * 0.6,
      duration: 300
    })

    // look into alternate ways of finding decks. This works pretty well though.
    this.scene.tweens.add({
      targets: this.scene.deckg.getChildren(),
      y: 0,
      x: 0.5 * CONFIG.DEFAULT_WIDTH,
      duration: 600,
      delay: 300,
      easing: 'Power4'
    })
  }

  AdvanceTurn () {
    if (this.bstate !== 'turning' && this.bstate !== 'mainevent') {
      this.MoveToken(this.playerToken, this.player_loc)
      this.SpinBoard(this.player_loc)
      this.player_loc += 1
      this.bstate = 'turning'
    }
  }

  PlaceToken (kind, boardCoord, boardDepth = false) {
    const tempSpot = this.GetSpot(boardCoord, boardDepth)
    const aImage = this.scene.add.image(tempSpot.x, tempSpot.y, kind)
    aImage.displayWidth = CONFIG.HAND_ORBITAL / 12
    aImage.displayHeight = CONFIG.HAND_ORBITAL / 12
    aImage.bCoord = boardCoord
    aImage.bDepth = boardDepth
    this.add(aImage)
    return aImage
  }

  MoveToken (t, nDir, nDepth = false) {
    const a = this.GetSpot(nDir, nDepth)
    this.scene.tweens.add({
      targets: t,
      x: a.x,
      y: a.y,
      duration: 250,
      onComplete: () => {
        t.bCoord = nDir
        t.bDepth = nDepth
      }
    })
  }

  RealignBoard () {
    const SpotAngle = (Math.PI) / 6
    this.scene.tweens.add({
      targets: this,
      rotation: SpotAngle * DataMaker.game.startDate,
      duration: 250
    })

    const token = this.list.slice(1)
    this.scene.tweens.add({
      targets: token,
      rotation: -SpotAngle * DataMaker.game.startDate,
      duration: 260
    })
  }

  SpinBoard (turns) {
    // DataMaker.game.RUI.scene.sound.play
    this.scene.sound.play('confirm')
    if (this.bstate === 'mainevent') {
      return
    }
    const SpotAngle = (Math.PI) / 6
    const token = this.list.slice(1)

    this.scene.tweens.add({
      targets: this,
      rotation: this.rotation + SpotAngle,
      duration: 250,
      onComplete: () => {
        this.bstate = 'none'
        DataMaker.game.RUI.setTurns(CONFIG.DRAWS_PER_ROUND) // When the board stops moving, set the current actions possible to 4
      }
    })

    this.scene.tweens.add({
      targets: token,
      rotation: -this.rotation - SpotAngle,
      duration: 260
    })

    DataMaker.game.turnCount += 1
    DataMaker.game.playzone.EndTurnCards()
    DataMaker.game.turnNotifications()
    DataMaker.game.postTurn()

    if (DataMaker.game.turnCount === DataMaker.game.dueDate) {
      DataMaker.game.HotelAttrition()
      this.bstate = 'mainevent'
      console.log(DataMaker.game.hotel.noHotelDraws)
      this.scene.tweens.add({
        targets: this.playerToken,
        x: 0,
        y: 0,
        duration: 2500
      })

      this.scene.tweens.add({
        targets: this,
        x: CONFIG.DEFAULT_WIDTH / 2,
        y: CONFIG.DEFAULT_HEIGHT / 2,
        duration: 2500,
        onComplete: () => {
          WildcardManager.init()
        }
      })

      const noShrink = this.scene.children.getChildren().filter((c) => { return (c !== this) })
      console.log(noShrink)
      for (const index in noShrink) {
        if (index === 0 || index === 1) continue
        const child = noShrink[index]
        this.scene.tweens.add({
          targets: child,
          scale: 0,
          duration: 2500
        })
      }
    }
  }

  GetSpot (travel, isInner) {
    const RefPoint = new Phaser.Geom.Point(Phaser.Display.Bounds.GetCenterX(this.list[0]), Phaser.Display.Bounds.GetCenterY(this.list[0]))
    const spacer = isInner ? this.height * 0.2 : this.height * 0.31
    const SpotPoint = new Phaser.Geom.Point(RefPoint.x, RefPoint.y + spacer)
    const SpotAngle = (Math.PI) / 6
    Phaser.Math.RotateAround(SpotPoint, RefPoint.x, RefPoint.y, SpotAngle * -travel)
    return SpotPoint
  }
}
export default Board
