import Phaser from 'phaser'
import CustomButton from '../scenes/CustomButton'

export default class CustomButtonDemoScene extends Phaser.Scene
{


  preload()
  {
    this.load.image('glassPanel', 'assets/sprites/glassPanel.png')
    
  }

  create()
  {
    const button = new CustomButton(this, 400, 300, 'glassPanel', 'glassPanel', 'button')
    this.add.existing(button)

    button.setInteractive()
    .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
      this.scene.start('Start')
    })
  }
}