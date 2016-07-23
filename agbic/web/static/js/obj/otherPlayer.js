import { Player } from "./player"

export class OtherPlayer extends Player{
    constructor(game, x, y){
        super(game, x, y);
    }
    preload(){
        super.preload();
    }
    create (bulletGroup, playerId, channel) {
        super.create(bulletGroup, playerId, channel);
        this.channel.on("movement", this.updatePosition.bind(this));
    }
    
    updatePosition(movement){
        console.log("got movement", movement);
        this.x = movement.x;
        this.y = movement.y;
        this.gun.x = movement.x;
        this.gun.y = movement.y;
        this.gun.body.velocity = movement.velocity;
        this.gun.rotation = movement.rotation;
        this.scale.x = movement.scaleX;
        this.gun.scale.setTo(1, this.scale.x);
        this.body.velocity = movement.velocity;
        if(movement.velocity.x != 0 || movement.velocity.y != 0){
            this.animate('run');
        }
        else{
            this.animate('idle');
        }
    }
}