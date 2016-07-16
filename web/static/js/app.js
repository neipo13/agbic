// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

//import socket from "./socket"
import { Socket } from "phoenix"

// start socket, using token to ID user
// let socket = new Socket("/socket", {params: {token: window.userToken}})
// let game = new Game(700, 500, "phaser")
// game.start(socket)

var game = new Phaser.Game(480 , 288, Phaser.AUTO);
// let socket = new Socket("http://162.243.209.109:4000/", {params: {token: window.userToken}})
let socket = new Socket("/socket", {params: {token: window.userToken}})

var world = 1;
var level = 1;
var color = new Color();
var health = new Health();

game.antialias = false;

    
game.state.add('Menu', Menu);
game.state.add('Game', Game);

function start(socket) {
	game.socket = socket;
	socket.connect();
	
	// create channel
	let channel = socket.channel("games:lobby", {});
	channel.join()
  	.receive("ok", resp => { console.log("Joined lobby successfully", resp) })
  	.receive("error", resp => { console.log("Unable to join lobby", resp) })

	// start Lobby state (key, clearWorld, clearCache, parameter to pass to state's init func)
	
    game.state.start('Menu');
}

