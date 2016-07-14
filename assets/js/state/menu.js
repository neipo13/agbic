var Menu = {
    preload: preload,
    create: create
};

function preload() {
    game.load.image('particle', 'assets/img/particle.png');
    game.load.image('grassTiles', 'assets/img/tiles_packed.png');
    game.load.tilemap('arena1', 'assets/js/levels/arena1.json', null, Phaser.Tilemap.TILED_JSON);
    
    game.load.spritesheet('player', 'assets/img/blastressa.png', 32, 32, 12);
    game.load.spritesheet('bGun', 'assets/img/blastressaGun.png', 32, 32, 12);
    game.load.spritesheet('bullet', 'assets/img/bulletsheet.png', 32, 32, 18);
    game.load.spritesheet('xplo', 'assets/img/explosion.png', 32, 32, 8);
    
    game.load.audio('jump', 'assets/sounds/effects/jump.wav');
    game.load.audio('land', 'assets/sounds/effects/land.wav');
    game.load.audio('step', 'assets/sounds/effects/step.wav');
    game.load.audio('ouch', 'assets/sounds/effects/dmg.wav');

}



function create() {
    game.state.start('Game');
}