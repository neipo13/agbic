import { Gun } from "./gun"

export class Player extends Phaser.Sprite{
    constructor(game, x, y){
        super(game, x, y, 'player');
    }
    preload(){
        //game feels
        this.lastFrameInputX = '';
        this.lastFrameInputY = '';
        this.moveSpeed = 150;
        //health
        this.invincibilityFrames = 120;
        this.invincibilityTimer = 120;
        this.invincible = false;
        this.knockback = {
            'x': 50,
            'y': 150
        }
        this.controlLoss = false;
        this.controlLossFrames = 30;
        this.controlLossTimer = 30;
        
        this.bulletManager = null;
        this.reloadTime = 10;
        this.reloadTimer = 0;
    }
    
    create (bulletGroup, playerId, channel) {
        this.id = playerId;
        this.channel = channel;
        //this = this.game.add.sprite(startX, startY, 'player');
        //Phaser.Sprite.call(this, game, x, y, 'player');
        this.game.add.existing(this);
        this.animations.add('idle', [0,1,2,3], 10, true);
        this.animations.add('run', [4,5,6,7,8,9,10],15,true);
        // this.animations.add('jump', [6,7], 15, false);
        // this.animations.add('fall', [0,1], 15, false);
        // this.animations.add('hit', [4,5], 15, true);
        // this.animations.add('shoot', [12,13], 15, true);
        // this.animations.add('runshoot', [24, 25, 26, 27, 28, 29, 30, 31], 15, true);
        
        this.game.physics.arcade.enable(this);
        this.body.bounce.y = 0;
        this.body.collideWorldBounds = true;
        
        this.anchor.setTo(.5, .5);
        this.body.setSize(18, 16, 0, 8);
        this.scale.setTo(1,1);
        //this.setupHealth();
        //this.bulletManager = new BulletManager(bulletGroup, 3);
        
        
        //gun and gun anims
        this.gun = new Gun(this.game, this.x, this.y);
        this.gun.create();
        this.game.add.existing(this.gun);
    
        this.animate('idle');
    }
    
    getHit(dmg, obstacleX){
        console.log('OWWWWWWW');
        this.game.sound.play('ouch');
        //health.takeDmg(dmg);
        this.animate('hit');
        this.invincible = true;
        this.controlLoss = true;
        this.invincibilityTimer = 0;
        this.controlLossTimer = 0;
        if(this.x < obstacleX){
            //set player velocity up and left
            this.body.velocity.x = -this.knockback.x;
            this.body.velocity.y = -this.knockback.y;
        }
        else if(this.x > obstacleX){
            //set player velocity up and right
            this.body.velocity.x = +this.knockback.x;
            this.body.velocity.y = -this.knockback.y;
        }
    }
    
    /*
     Useful for conditional checks with animations
    */
    animate(name){
        this.animations.play(name);
        this.gun.animations.play(name);
    }
    
}