import { LobbyPlayer } from "../obj/lobbyPlayer"

export class Lobby extends Phaser.State {
  init(...args) {
        // note: we have to handle the first players state msg here,
        // as we'll receive the player_joined bcast before we can handle the event
        // alternately, subscribe to the event before joining the game_room
        // back in preload
		let [{player, players, channel}] = args;
		this.channel = channel;
		this.playerId = player;
		this.otherPlayers = players;
    console.log(player);
    console.log(players);

    // all future player joins can be handled here
    this.channel.on("player_joined", this.playerJoined.bind(this)); // doesn't seem to recv self?
    this.channel.on("start", this.startGame.bind(this));
    
    // now, ready for game start -> can move if we want players to control,
    // but as far as server is concerned, can receive start signal effectively
    console.log('about to send ready');
    this.channel.push("ready", {player: player, ready: true});
    // note: may need to handle player_leave here as well?
	}
	
	create() {
	    //create 4 lobbyPlayerItems
	    this.lobbyPlayers = [];
	    this.lobbyPlayers.push(new LobbyPlayer(this.game,  15, 20))
	    this.lobbyPlayers.push(new LobbyPlayer(this.game, 130, 20))
	    this.lobbyPlayers.push(new LobbyPlayer(this.game, 250, 20))
	    this.lobbyPlayers.push(new LobbyPlayer(this.game, 365, 20))
	    this.lobbyPlayers[this.playerId-1].playerJoined(this.playerId, true);
	}
	
	playerJoined(players_state) {
		if(players_state.player != this.playerId){
      console.log("player joined, current state:")
      console.log(players_state);
      var id = players_state.player;
      var index = id - 1;
      this.otherPlayers = players_state.players;
	    this.lobbyPlayers[index].playerJoined(id, false);
	    this.lobbyPlayers[index].portrait.tint = Math.random() * 0xffffff;
		}
  }
    
  startGame(){
  	var data = {
  		channel: this.channel,
  		playerId: this.playerId,
  		otherPlayers: this.otherPlayers
  	};
    this.game.state.start('play', true, false, data);
  }
}