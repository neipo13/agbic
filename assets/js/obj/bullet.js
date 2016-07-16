Bullet = function(){
    this.currentSpeed = 0;
    this.moveSpeed = 400;
    this.active = false;
}
Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;
Bullet.prototype.create = function(x, y) {
    Phaser.Sprite.call(this, game, x, y, 'bullet');
    this.animations.add('shoot', [0, 1], 15, true);
    var hitAnim = this.animations.add('hit', [9,10,11,12,13,14,15,16,17], 30, false);
    this.active = false;
    this.visible = false;
    hitAnim.onComplete.add(function(){
        this.visible = false;
    }, this);
    
    game.physics.arcade.enable(this);
    this.anchor.setTo(.5, .5);
    this.body.setSize(16, 16, 0, 0);
    this.events.onOutOfBounds.add(this.deactivate, this);   
    this.checkWorldBounds = true;
}

Bullet.prototype.activate = function(x, y, dir){
    this.x = x;
    this.y = y;
    this.animations.play('shoot');
    this.active = true;
    this.visible = true;
    this.body.enable = true;
    this.rotation = game.physics.arcade.angleToPointer(this); //in rads
    game.physics.arcade.velocityFromAngle(this.angle, 300, this.body.velocity);
}

Bullet.prototype.doUpdate = function(){
    if(!this.active){
        this.body.velocity.x = 0;
    }
}

Bullet.prototype.processCollide = function(){
    console.log('Bullet collide', this.active);
    this.deactivate();
    return this.active;
}

Bullet.prototype.collide = function(sprite, collider){
    this.deactivate();
    return true;
}

Bullet.prototype.deactivate = function(){
    this.active = false;
    this.animations.play('hit');
    this.body.enable = false;
}