//needs to import player and input
import { Input } from "../util/input"
import { LocalPlayer } from "../obj/localPlayer"
import { OtherPlayer } from "../obj/otherPlayer"

export class Play extends Phaser.State {
    
    init(...args) {
        // note: we have to handle the first players state msg here,
        // as we'll receive the player_joined bcast before we can handle the event
        // alternately, subscribe to the event before joining the game_room
        // back in preload
		let [{playerId, otherPlayers, channel}] = args;
		this.channel = channel;
		this.playerId = playerId;
		this.otherPlayers = otherPlayers;
        console.log(playerId);
        console.log(otherPlayers);


        // all future player joins can be handled here
        this.channel.on("player_joined", this.playerJoined.bind(this))
        this.channel.on("player_left", this.playerLeft.bind(this))
        this.channel.on("start", this.start.bind(this))
        
	}
	
    preload() {
        console.log("in play preload");
        this.ready = false;
        this.bullets = null;
        this.map = null;
        this.bgLayer = null;
        this.blockLayer = null;
        this.input = new Input(this.game);
		
		this.stage.disableVisibilityChange = true;
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
        
        this.player = new LocalPlayer(this.game, 144, 160);
        this.player.preload();
        this.player.create(this.bullets, this.playerId, this.channel);
        if(!this.playerId){ console.log("WE HAVE NO ID");}
        for(var i = 0; i < this.otherPlayers.length; i++){
            //console.log(this.otherPlayers[i]);
            if(this.otherPlayers[i] != this.playerId){
                this.otherPlayer = new OtherPlayer(this.game, 300, 160);
                this.otherPlayer.preload();
                this.otherPlayer.create(this.bullets, this.otherPlayers[i], this.channel);
            }
        }
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
            this.player.doUpdate(commands);
            this.player.doPostUpdate();
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

    playerJoined(players_state) {
        console.log("player joined, current state:")
        console.log(players_state);
        this.otherPlayer = new OtherPlayer(this.game, 300, 300);
        this.otherPlayer.preload();
        this.otherPlayer.create(this.bullets, players_state.player, this.channel);
    }

    playerLeft(msg) {
        console.log("player left: " + msg.player);
    }

    start(msg) {
        console.log("received start!");
        console.log(msg);
    }
}