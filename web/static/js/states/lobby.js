import { createSyncLabel} from "../common/sync_labels"

export class Lobby extends Phaser.State {
	create() {
		this.keyboard = this.game.input.keyboard;
		let label = createSyncLabel(this, "Hello, world!", this.channel);
	}

	init(...args) {
		this.isFindingMatch = false;
		let [channel] = args;
		console.log(channel);
		this.channel = channel;
		this.channel.on("match", this.startGame.bind(this));
	}

	update() {
		// hack for now to join
		if (this.keyboard.isDown(Phaser.Keyboard.J) && !this.isFindingMatch) {
			this.isFindingMatch = true;
			this.findMatch();
		}
	}

	findMatch() {
		this.channel.push("match", {});
	}

	startGame(message) {
		console.log("received message");
		console.log(message);
		let {room_id} = message;
		
		let gameChannel = this.game.socket.channel("games:" + room_id, {});
		gameChannel.join()
			.receive("ok", resp => { console.log("Joined game room successfully", resp) })
			.receive("error", resp => { console.log("Unable to join game room", resp) })
		this.game.state.start('gameRoom', true, false, gameChannel);
	}
}