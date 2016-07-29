export class Flash extends Phaser.Sprite{
    constructor(game, x, y){
        super(game, x, y, 'bullet');
    }
    
    create(){
        var anim = this.animations.add('start', [7,8], 30, false);
        //start animation
        this.animations.play('start');
        this.visible = false;
        this.anchor.setTo(.5, .5);
        //turn visibility off on animation end 
        anim.onComplete.add(function(){
            this.visible = false;
        }, this);
    }
    
    activate(x,y){
        //move to location
        this.x = x;
        this.y = y;
        this.visible = true;
        //start animation
        this.animations.currentAnim.restart();
    }
}