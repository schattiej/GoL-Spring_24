import Phaser from 'phaser'

class UpgradedContainer extends Phaser.GameObjects.Container {
  // Adds a text object with correct word wrapping relative to the B.
  // x1: 0 - 1, for x location on the B.
  // x2: 0 - 1 for y location on the B.
  // scaleFactor - how much to scale down or up the text.
  // t - the text.
  // oSize = Original render size of the text. I recommend keeping it at 16; using larger sizes may make sharper text but it will become harder to size correctly.
  addSafeText (scene, x1, y1, scaleFactor, t, oSize = 16) {
    const banktnew = scene.add.text(0, 0, t, { font: oSize + 'pt "Franklin Gothic Book"', color: '#00000', align: 'left' })
    this.add(banktnew)
    const relocate = banktnew.getLocalPoint(this.getBounds().left, this.getBounds().top)
    banktnew.scale = scaleFactor
    banktnew.x += relocate.x
    banktnew.y += relocate.y

    banktnew.x += x1 * this.width
    banktnew.y += y1 * this.height
    const newWrap = banktnew.getLocalPoint(this.getBounds().left + this.displayWidth, 0)
    banktnew.setWordWrapWidth(newWrap.x, true)
  }

  // A simple function for aligning text elements in the container.
  BuddyUpText (spacing = 0) {
    const t1 = this.list[this.list.length - 1]
    const t2 = this.list[this.list.length - 2]
    t1.y = t2.y + t2.displayHeight + spacing
  }

  // Horizontal alignment options.
  RightLeft (a, b) {
    Phaser.Display.Bounds.SetRight(a, Phaser.Display.Bounds.GetLeft(b))
  }

  RightLeftT (b) { Phaser.Display.Bounds.SetRight(this, Phaser.Display.Bounds.GetLeft(b)); return this }

  LeftRight (a, b) {
    Phaser.Display.Bounds.SetLeft(a, Phaser.Display.Bounds.GetRight(b))
  }

  LeftRightT (b) { Phaser.Display.Bounds.SetLeft(this, Phaser.Display.Bounds.GetRight(b)); return this }

  RightRight (a, b) {
    Phaser.Display.Bounds.SetRight(a, Phaser.Display.Bounds.GetRight(b))
  }

  RightRightT (b) { Phaser.Display.Bounds.SetRight(this, Phaser.Display.Bounds.GetRight(b)); return this }

  LeftLeft (a, b) {
    Phaser.Display.Bounds.SetLeft(a, Phaser.Display.Bounds.GetLeft(b))
  }

  LeftLeftT (b) { Phaser.Display.Bounds.SetLeft(this, Phaser.Display.Bounds.GetLeft(b)); return this }

  // Vertical alignment options
  TopTop (a, b) {
    Phaser.Display.Bounds.SetTop(a, Phaser.Display.Bounds.GetTop(b))
  }

  TopTopT (b) { Phaser.Display.Bounds.SetTop(this, Phaser.Display.Bounds.GetTop(b)); return this }

  TopBottom (a, b) {
    Phaser.Display.Bounds.SetTop(a, Phaser.Display.Bounds.GetBottom(b))
  }

  TopBottomT (b) { Phaser.Display.Bounds.SetTop(this, Phaser.Display.Bounds.GetBottom(b)); return this }

  BottomTop (a, b) {
    Phaser.Display.Bounds.SetBottom(a, Phaser.Display.Bounds.GetTop(b))
  }

  BottomTopT (b) { Phaser.Display.Bounds.SetBottom(this, Phaser.Display.Bounds.GetTop(b)); return this }

  BottomBottom (a, b) {
    Phaser.Display.Bounds.SetBottom(a, Phaser.Display.Bounds.GetBottom(b))
  }

  BottomBottomT (b) { Phaser.Display.Bounds.SetBottom(this, Phaser.Display.Bounds.GetBottom(b)); return this }

  getLatest () {
    return this.list[this.list.length - 1]
  }
}

export default UpgradedContainer
