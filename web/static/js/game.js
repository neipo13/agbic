import { Lobby } from "./states/lobby"

export class Game extends Phaser.Game {
	constructor(width, height, container) {
		super(width, height, Phaser.AUTO, container, null);
		
		// set up game state [name, class, autostart]
		this.state.add("lobby", Lobby, false)
	}

	start(socket) {
		socket.connect();
		
		// create channel
		let channel = socket.channel("games:lobby", {});
		channel.join()
  		.receive("ok", resp => { console.log("Joined lobby successfully", resp) })
  		.receive("error", resp => { console.log("Unable to join lobby", resp) })

		let channel2 = socket.channel("games:room_5", {});
		channel2.join()
			.receive("ok", resp => { console.log("Joined room_5 successfully", resp) })
  		.receive("error", resp => { console.log("Unable to join room_5", resp) })


		// start Lobby state (key, clearWorld, clearCache, parameter to pass to state's init func)
		this.state.start("lobby", true, false, channel);
	}
}
