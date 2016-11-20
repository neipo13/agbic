export class Gun extends Phaser.Sprite{
    constructor(game, x, y){
        super(game, x, y, 'bGun');
    }
    create(){
        this.animations.add('idle', [0,1,2,3], 10, true);
        this.animations.add('run', [4,5,6,7,8,9,10],15,true);
        this.game.physics.arcade.enable(this);
        this.anchor.setTo(.5, .5);
        //this.animations.play('idle');
    }
    doUpdate(sprite, facingLeft, rotation){
        this.x = sprite.x;
        this.y = sprite.y;
        if (facingLeft){
            this.scale.setTo(1,-1);
        }
        else{
            this.scale.setTo(1,1);
        }
        this.rotation = rotation;
    }
}