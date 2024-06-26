import Phaser from 'phaser'
import UpgradedContainer from './UpgradedContainer'
class StyleIndicator extends UpgradedContainer {
  constructor (scene, x, y, wordsPre, value) {
    super(scene, x, y)
    this.addSafeText(this.scene, 0, 0, 1, wordsPre)
    this.addSafeText(this.scene, 0, 0, 1, value)

    this.title = this.list[0]
    this.val = this.list[1]
    this.val.setOrigin(0.5, 0.5)
    this.LeftRight(this.val, this.title)
    this.BottomBottom(this.val, this.title)
    this.height = Math.max(this.val.displayHeight, this.title.displayHeight)
    // this.width = Phaser.Display.Bounds.GetRight(this.val) - Phaser.Display.Bounds.GetLeft(this.title)
  }

  bounceMove () {
    this.LeftRight(this.val, this.title)
    const oX = this.val.x
    const T1 = {
      targets: this.val,
      x: oX,
      duration: 120
    }

    this.scene.tweens.add({
      targets: this.val,
      x: oX + 8,
      duration: 120,
      onComplete: () => {
        this.scene.tweens.add(T1)
      }
    })
  }

  textGlide (v) { // Unused, attempt to glide or interpolate numbers
    const oV = Number(this.val)
    const nV = Number(v)
    this.scene.tweens.add({
      targets: this.val,
      text: nV,
      duration: 300
    })
  }

  growMove () {
    const T1 = {
      targets: this.val,
      scale: 1,
      duration: 300,
      onComplete: () => {
        // this.list[1].x = this.list[0].x + this.list[0].displayWidth + this.list[0].displayWidth/2
        this.LeftRight(this.val, this.title)
      }
    }

    this.scene.tweens.add({
      targets: this.val,
      scale: 2,
      duration: 300,
      onComplete: () => {
        this.scene.tweens.add(T1)
      }
    })
  }

  setVal (v) {
    if (v === this.val.text) { return }
    this.val.setText(v)
    // this.textGlide(v)
    // this.growMove()
    this.bounceMove()
  }
}

export default StyleIndicator
