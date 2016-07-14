export class GameRoom extends Phaser.State {
	create() {
		console.log("creating GameRoom");
	}

	init(...args) {
		// create another channel based on socket?
		let [channel] = args;
		console.log(channel);
		this.channel = channel;

	}
}