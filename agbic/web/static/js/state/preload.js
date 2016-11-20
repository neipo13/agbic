export class Preload extends Phaser.State {
    preload() {
        this.game.load.image('particle', 'images/particle.png');
        this.game.load.image('grassTiles', 'images/tiles_packed.png');
        this.game.load.image('portrait', 'images/Portrait.png');
        this.game.load.image('arrow', 'images/RightArrow.png');
        this.game.load.tilemap('arena1', 'levels/arena1.json', null, Phaser.Tilemap.TILED_JSON);

        this.game.load.spritesheet('player', 'images/blastressa.png', 32, 32, 12);
        this.game.load.spritesheet('bGun', 'images/blastressaGun.png', 32, 32, 12);
        this.game.load.spritesheet('bullet', 'images/bulletsheet.png', 32, 32, 18);
        this.game.load.spritesheet('xplo', 'images/explosion.png', 32, 32, 8);

        this.game.load.audio('jump', 'sounds/effects/jump.wav');
        this.game.load.audio('land', 'sounds/effects/land.wav');
        this.game.load.audio('step', 'sounds/effects/step.wav');
        this.game.load.audio('ouch', 'sounds/effects/dmg.wav');
    
    }
    
    create() {
        this.isFindingMatch = true;
	    //this.findMatch();
	    this.channel.push("match", {});
    }
    
    init(...args) {
		this.isFindingMatch = false;
		let [channel] = args;
		console.log(channel);
		this.channel = channel;
		this.channel.on("match", this.startGame.bind(this));
	}
	
	startGame(message) {
		console.log("received message");
		console.log(message);
		let {room_id} = message;
		
		let gameChannel = this.game.socket.channel("games:" + room_id, {});
		gameChannel.join()
			.receive("ok", resp => 
			{ 
			    resp.channel = gameChannel;
			    console.log("Joined game room successfully", resp);
                // leave the lobby!
                this.channel.leave(); 
                this.game.state.start('lobby', true, false, resp); 
			})
			.receive("error", resp => 
			{ 
			    console.log("Unable to join game room", resp);
			});
// 		this.game.state.start('gameRoom', true, false, gameChannel);
	}
}