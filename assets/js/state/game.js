var Game = {
    preload: preload,
    create: create,
    update: update,
    render:render
};

var player = null,
    input = null,
    ready = false,
    bullets = null,
    map = null,
    bgLayer = null,
    blockLayer = null;

function preload() {
    player = new Player();
    player.preload();
    input = Input;
}

function create() {
    ready = false;
    ///https://gamedevacademy.org/html5-phaser-tutorial-top-down-games-with-tiled/
    map = game.add.tilemap('arena1');
    map.addTilesetImage('agbicTexture', 'grassTiles');
    bgLayer = map.createLayer('Ground');
    blockLayer = map.createLayer('Player Collision');
    game.physics.arcade.enable(bgLayer);
    game.physics.arcade.enable(blockLayer);
    
    //map.setCollisionByExclusion([], true, 'Player Collision');
    map.setCollisionByExclusion([0, -1], true, 'Ground');
    game.stage.backgroundColor = "#0E0518";
    game.stage.smoothed = false;
    
    input.create();
    bullets = game.add.group();
    
    //for calculations & roomGen
    game.tileSize = 16; //adjust if needed
    game.roomCols = 30;
    game.roomRows = 30;
    
    
    player.create(144, 160, bullets);
    game.camera.follow(player.sprite, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
    game.physics.arcade.isPaused = false;
    
    blockLayer.resizeWorld();
    ready = true;
}

function update(){
    if(ready){
        var grounded = game.physics.arcade.overlap(player.sprite, bgLayer, null, overlapsPit);
        if(!grounded){
            console.log("im falling")
        }
        bullets.callAll('doUpdate', null);
        
        var commands = input.update();
        player.update(commands);
    }
}

function bulletHit (obj, bullet){
    return function(objSprite, bulletSprite){
        bulletSprite.collide(bulletSprite, objSprite);
        if(typeof objSprite.collide == 'function'){
            objSprite.collide(objSprite, bulletSprite, true)
        }
    }
}

function render(){
    //game.debug.spriteInfo(player.sprite, 32, 32);
    //game.debug.spriteInfo(player.gun, 32, 32);
}

function overlapsPit(player, tile){
    if(tile.index > 0){
        return true;
    }
    return false;
}