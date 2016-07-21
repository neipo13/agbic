export class Input {
    constructor(gameInstance){
        this.wasd = null;
        this.cursors = null;
        this.menu = null;
        this.shoot = null;
        this.game = gameInstance;
    }
    
    create(){
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.cursors.jump = this.game.input.keyboard.addKey(Phaser.Keyboard.Z);
        this.wasd = {
            up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
            space: this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        };
        this.menu = {
            p: this.game.input.keyboard.addKey((Phaser.Keyboard.P))
        };
        this.shoot = this.game.input.activePointer.leftButton;
    }
    
    update(){
        return {
            left: this.cursors.left.isDown || this.wasd.left.isDown,
            right: this.cursors.right.isDown || this.wasd.right.isDown,
            up: this.cursors.up.isDown || this.wasd.up.isDown || this.wasd.space.isDown || this.cursors.jump.isDown,
            down: this.cursors.down.isDown || this.wasd.down.isDown,
            shoot: this.shoot.isDown,
            colors: this.menu.p.isDown
        };
    }
    
    // This function should return true when the player activates the "jump" control
    // In this case, either holding the up arrow or tapping or clicking on the center
    // part of the screen.
    inputIsActive(input, duration) {
        var isActive = false;
    
        isActive = this.input.keyboard.downDuration(input, duration);
        isActive |= (this.game.input.activePointer.justPressed(duration + 1000/60) &&
            this.game.input.activePointer.x > this.game.width/4 &&
            this.game.input.activePointer.x < this.game.width/2 + this.game.width/4);
    
        return isActive;
    }
}