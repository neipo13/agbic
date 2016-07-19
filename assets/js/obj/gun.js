Gun = function(){
}
Gun.prototype = Object.create(Phaser.Sprite.prototype);
Gun.prototype.constructor = Gun;
Gun.prototype.create = function(x, y) {
    Phaser.Sprite.call(this, game, 0, 0, 'bGun');
    this.animations.add('idle', [0,1,2,3], 10, true);
    this.animations.add('run', [4,5,6,7,8,9,10,11],15,true);
    
    
    this.anchor.setTo(.5, .5);
}

Gun.prototype.doUpdate = function(sprite, facingLeft){
    this.x = sprite.x;
    this.y = sprite.y;
    var rotation = game.physics.arcade.angleToPointer(sprite); //in rads;
    if (facingLeft){
        this.scale.setTo(1,-1);
    }
    else{
        this.scale.setTo(1,1);
    }
    this.rotation = rotation;
    // if(facingLeft){
    //     this.scale.setTo(-1,-1);
    //     this.rotation = game.physics.arcade.angleToPointer(sprite); //in rads
    // }
    // else{
    //     this.scale.setTo(1,1);
    //     this.rotation = game.physics.arcade.angleToPointer(sprite); //in rads
    // }
    
}