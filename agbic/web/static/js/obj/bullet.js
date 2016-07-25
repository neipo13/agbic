export class Bullet extends Phaser.Sprite{
    constructor(game, x, y){
        super(game, x, y, 'bullet');
        this.currentSpeed = 0;
        this.moveSpeed = 400;
        this.active = false;
    }
    create(){
        
        this.animations.add('shoot', [0, 1], 15, true);
        var hitAnim = this.animations.add('hit', [9,10,11,12,13,14,15,16,17], 30, false);
        this.active = false;
        this.visible = false;
        hitAnim.onComplete.add(function(){
            this.visible = false;
        }, this);
        
        this.game.physics.arcade.enable(this);
        this.anchor.setTo(.5, .5);
        this.body.setSize(16, 16, 0, 0);
        this.events.onOutOfBounds.add(this.deactivate, this);   
        this.checkWorldBounds = true;
    }
    
    active(x, y, dir){
        this.x = x;
        this.y = y;
        this.animations.play('shoot');
        this.active = true;
        this.visible = true;
        this.body.enable = true;
        this.rotation = this.game.physics.arcade.angleToPointer(this); //in rads
        this.game.physics.arcade.velocityFromAngle(this.angle, 300, this.body.velocity);
    }
    
    doUpdate(){
        if(!this.active){
            this.body.velocity.x = 0;
        }
    }
    
    processCollide(sprite, collider){
        this.deactivate();
        return true;
    }
    
    deactivate(){
        this.active = false;
        this.animations.play('hit');
        this.body.enable = false;
    }
}