import { createSyncLabel} from "../common/sync_labels"

export class Lobby extends Phaser.State {
	create() {
		let label = createSyncLabel(this, "Hello, world!", this.channel);
	}

	init(...args) {
		let [channel] = args;
		console.log(channel);
		this.channel = channel;
	}
}