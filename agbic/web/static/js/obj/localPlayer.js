import { Player } from "./player"

export class LocalPlayer extends Player{
    constructor(game, x, y){
        super(game, x, y);
    }
    preload(){
        super.preload();
    }
    create(bulletGroup, playerId, channel){
        super.create(bulletGroup, playerId, channel);
        //add any local specific stuff here
    }
    doUpdate(input){
        
        if(!this.controlLoss && input){
            this.updateMovement(input);
            //this.updateShooting(input);
            this.scale.x = (this.x > this.game.input.activePointer.position.x) ? -1 :  1;
        }
        //this.updateInvincibility();
        var rotation = this.game.physics.arcade.angleToPointer(this);
        this.gun.doUpdate(this, this.scale.x < 0, rotation);
    }
    
    doPostUpdate(){
        this.channel.push("movement", { 
            x: this.x, 
            y: this.y, 
            rotation:this.gun.rotation, 
            scaleX: this.scale.x,
            velocity: this.body.velocity,
            playerId: this.id
        });
    }
    
    updateMovement(input){
        var running = false;
        //handle x movement
        if(input.left)
        {
            this.lastFrameInputX = 'L';
            running = true;
            this.body.velocity.x = -1;
        }
        else if(input.right)
        {
            this.lastFrameInputX='R';
            running = true;
            this.body.velocity.x = 1;
        }
        else
        {
            this.body.velocity.x = 0;
            this.lastFrameInputX = '';
        }
        //handle y movement
        if(input.up)
        {
            this.lastFrameInputY = 'U';
            running = true;
            this.body.velocity.y = -1;
        }
        else if(input.down)
        {
            this.lastFrameInputY='D';
            running = true;
            this.body.velocity.y = 1;
        }
        else
        {
            this.body.velocity.y = 0;
            this.lastFrameInputX = '';
        }
        this.body.velocity.normalize();
        this.body.velocity.x *= this.moveSpeed;
        this.body.velocity.y *= this.moveSpeed;
        
        if(running){
            this.animate('run');
        }
        else{
            this.animate('idle');
        }
    }
    
    updateShooting(input){
        if(input.shoot && this.reloadTimer <= 0){
            this.bulletManager.fire(this.x, this.y, (this.scale.x > 0 ? 'R' : 'L'));
            this.reloadTimer = this.reloadTime;
            this.animate('shoot');
        }
        if(this.reloadTimer > 0){
            this.reloadTimer--;
        }
    }
    
    updateInvincibility(){
        if(this.invincible){
            
            if(this.invincibilityTimer >= this.invincibilityFrames){
                this.invincibilityTimer = 0;
                this.invincible = false;
            }
            else{
                this.invincibilityTimer++;
            }
        }
        if(this.controlLoss){
            if(this.controlLossTimer >= this.controlLossFrames){
                this.controlLossTimer = 0;
                this.controlLoss = false;
            }
            else{
                this.controlLossTimer++;
            }
        }
    }
}