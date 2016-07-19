var Input = {
    create: create,
    update: update
};


var wasd = null,
    cursors = null,
    menu = null,
    shoot = null;
    


function create(){
    
    cursors = game.input.keyboard.createCursorKeys();
    cursors.jump = game.input.keyboard.addKey(Phaser.Keyboard.Z);
    wasd = {
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        down: game.input.keyboard.addKey(Phaser.Keyboard.S),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        space: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    };
    menu = {
        p: game.input.keyboard.addKey((Phaser.Keyboard.P))
    };
    shoot = game.input.activePointer.leftButton
}

function update(){
    return {
        left: cursors.left.isDown || wasd.left.isDown,
        right: cursors.right.isDown || wasd.right.isDown,
        up: cursors.up.isDown || wasd.up.isDown || wasd.space.isDown || cursors.jump.isDown,
        down: cursors.down.isDown || wasd.down.isDown,
        shoot: shoot.isDown,
        colors: menu.p.isDown
    };
}

// This function should return true when the player activates the "jump" control
// In this case, either holding the up arrow or tapping or clicking on the center
// part of the screen.
function inputIsActive(input, duration) {
    var isActive = false;

    isActive = this.input.keyboard.downDuration(input, duration);
    isActive |= (game.input.activePointer.justPressed(duration + 1000/60) &&
        game.input.activePointer.x > game.width/4 &&
        game.input.activePointer.x < game.width/2 + game.width/4);

    return isActive;
}