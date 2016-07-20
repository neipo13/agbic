//needs to import player and input
import { Input } from "../util/input"
import { Player } from "../obj/player"

export class Play extends Phaser.State {
    preload() {
        console.log("in play preload");
        this.ready = false;
        this.bullets = null;
        this.map = null;
        this.bgLayer = null;
        this.blockLayer = null;
        this.input = new Input(this.game);
    }
    
    create() {
        console.log("in play create");
        this.ready = false;
        ///https://gamedevacademy.org/html5-phaser-tutorial-top-down-games-with-tiled/
        this.map = this.game.add.tilemap('arena1');
        this.map.addTilesetImage('agbicTexture', 'grassTiles');
        this.bgLayer = this.map.createLayer('Ground');
        this.blockLayer = this.map.createLayer('Player Collision');
        this.game.physics.arcade.enable(this.bgLayer);
        this.game.physics.arcade.enable(this.blockLayer);
        
        //map.setCollisionByExclusion([], true, 'Player Collision');
        this.map.setCollisionByExclusion([0, -1], true, 'Ground');
        this.game.stage.backgroundColor = "#0E0518";
        this.game.stage.smoothed = false;
        
        this.input.create();
        this.bullets = this.game.add.group();
        
        //for calculations & roomGen
        // this.game.tileSize = 16; //adjust if needed
        // this.game.roomCols = 30;
        // this.game.roomRows = 30;
        
        this.player = new Player(this.game, 144, 160);
        this.player.preload();
        this.player.create(this.game, 144, 160, this.bullets);
        this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
        this.game.physics.arcade.isPaused = false;
        
        this.blockLayer.resizeWorld();
        this.ready = true;
    }
    
    update(){
        if(this.ready){
            var grounded = this.game.physics.arcade.overlap(this.player, this.bgLayer, null, this.overlapsPit);
            if(!grounded){
                console.log("im falling");
            }
            this.bullets.callAll('doUpdate', null);
            
            var commands = this.input.update();
            this.player.update(commands);
        }
    }
    
    bulletHit (obj, bullet){
        return function(objSprite, bulletSprite){
            bulletSprite.collide(bulletSprite, objSprite);
            if(typeof objSprite.collide == 'function'){
                objSprite.collide(objSprite, bulletSprite, true);
            }
        };
    }
    
    // render(){
    //     //game.debug.spriteInfo(player, 32, 32);
    //     //game.debug.spriteInfo(player.gun, 32, 32);
    // }
    
    overlapsPit(player, tile){
        if(tile.index > 0){
            return true;
        }
        return false;
    }
}