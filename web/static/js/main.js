import { Socket } from "phoenix"
var game = new Phaser.Game(480 , 288, Phaser.AUTO);
let socket = new Socket("/socket", {params: {token: window.userToken}})

var world = 1;
var level = 1;
var color = new Color();
var health = new Health();

game.antialias = false;

    
game.state.add('Menu', Menu);
game.state.add('Game', Game);

game.state.start('Menu');