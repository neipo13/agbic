import { Lobby } from "./states/lobby"
import { GameRoom } from "./states/game_room"

export class Game extends Phaser.Game {
	constructor(width, height, container) {
		super(width, height, Phaser.AUTO, container, null);
		
		// set up game state [name, class, autostart]
		this.state.add("lobby", Lobby, false);
		this.state.add("gameRoom", GameRoom, false);
	}

	start(socket) {
		this.socket = socket;
		socket.connect();
		
		// create channel
		let channel = socket.channel("games:lobby", {});
		channel.join()
  		.receive("ok", resp => { console.log("Joined lobby successfully", resp) })
  		.receive("error", resp => { console.log("Unable to join lobby", resp) })

		// start Lobby state (key, clearWorld, clearCache, parameter to pass to state's init func)
		this.state.start("lobby", true, false, channel);
	}
}
