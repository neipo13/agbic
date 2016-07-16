var Player = function(){
    var _this = this;
    
    _this.sprite = null;
    //game feels
    _this.lastFrameInputX = '';
    _this.lastFrameInputY = '';
    _this.moveSpeed = 150;
    //health
    _this.invincibilityFrames = 120;
    _this.invincibilityTimer = 120;
    _this.invincible = false;
    _this.knockback = {
        'x': 50,
        'y': 150
    }
    _this.controlLoss = false;
    _this.controlLossFrames = 30;
    _this.controlLossTimer = 30;
    
    _this.bulletManager = null;
    _this.reloadTime = 10;
    _this.reloadTimer = 0;
    
    _this.preload = function(){
    };
    
    _this.create = function(startX, startY, bulletGroup) {
        _this.sprite = game.add.sprite(startX, startY, 'player');
        _this.realX = startX;
        _this.realY = startY;
        
        _this.sprite.animations.add('idle', [0,1,2,3], 10, true);
        _this.sprite.animations.add('run', [4,5,6,7,8,9,10],15,true);
        // _this.sprite.animations.add('jump', [6,7], 15, false);
        // _this.sprite.animations.add('fall', [0,1], 15, false);
        // _this.sprite.animations.add('hit', [4,5], 15, true);
        // _this.sprite.animations.add('shoot', [12,13], 15, true);
        // _this.sprite.animations.add('runshoot', [24, 25, 26, 27, 28, 29, 30, 31], 15, true);
        
        game.physics.arcade.enable(_this.sprite);
        _this.sprite.body.bounce.y = 0;
        _this.sprite.body.collideWorldBounds = true;
        
        _this.sprite.anchor.setTo(.5, .5);
        _this.sprite.body.setSize(18, 16, 0, 8);
        _this.sprite.scale.setTo(1,1);
    
        _this.animate('idle');
        //_this.setupHealth();
        _this.bulletManager = new BulletManager(bulletGroup, 3);
        
        
        //gun and gun anims
        _this.gun = new Gun();
        _this.gun.create(startX, startY);
        game.add.existing(_this.gun);
        
    }
    
    _this.setupHealth = function(){
        //sprites
        _this.healthSprites = game.add.group();
        _this.healthSprites.x = 24;
        _this.healthSprites.y = 96;
        _this.healthSprites.fixedToCamera = true;
        for(var i = 0; i < _this.maxHp; i++){
            addToHealthBar();
        }
        //variables
        _this.hp = 10;
        
    }
    
    function addToHealthBar(){
        var len = _this.healthSprites.length;
        _this.healthSprites.create(_this.healthSprites.x, _this.healthSprites.y - (len * 8), 'hp');
        //_this.healthSprites.y += 8;
    }
    
    function changeHealthBar(index, visible){
        _this.healthSprites.children[index].visible = visible;
    }
    
    function setHp (newHp){
        var diff = newHp - _this.hp;
        console.log(diff);
        _this.hp = newHp;
        //change sprites
        if(_this.hp >= 0){
            changeHealthBar(_this.hp - diff - 1, diff > 0);
        }
    }
    
    _this.update = function(input){
        if(!this.controlLoss){
            _this.updateMovement(input);
            _this.updateShooting(input);
            _this.sprite.scale.x = (_this.sprite.x > game.input.activePointer.position.x) ? -1 :  1;
        }
        _this.updateInvincibility();
        _this.gun.doUpdate(_this.sprite, _this.sprite.scale.x < 0);
    };
    
    _this.updateMovement = function (input){
        var running = false;
        //handle x movement
        if(input.left)
        {
            _this.lastFrameInputX = 'L';
            running = true;
            _this.sprite.body.velocity.x = -1;
        }
        else if(input.right)
        {
            _this.lastFrameInputX='R';
            running = true;
            _this.sprite.body.velocity.x = 1;
        }
        else
        {
            _this.sprite.body.velocity.x = 0;
            _this.lastFrameInputX = '';
        }
        //handle y movement
        if(input.up)
        {
            _this.lastFrameInputY = 'U';
            running = true;
            _this.sprite.body.velocity.y = -1;
        }
        else if(input.down)
        {
            _this.lastFrameInputY='D';
            running = true;
            _this.sprite.body.velocity.y = 1;
        }
        else
        {
            _this.sprite.body.velocity.y = 0;
            _this.lastFrameInputX = '';
        }
        _this.sprite.body.velocity.normalize();
        _this.sprite.body.velocity.x *= _this.moveSpeed;
        _this.sprite.body.velocity.y *= _this.moveSpeed;
        
        if(running){
            _this.animate('run');
        }
        else{
            _this.animate('idle');
        }
    }
    
    _this.updateShooting = function(input){
        if(input.shoot && _this.reloadTimer <= 0){
            _this.bulletManager.fire(_this.sprite.x, _this.sprite.y, (_this.sprite.scale.x > 0 ? 'R' : 'L'));
            _this.reloadTimer = _this.reloadTime;
            _this.animate('shoot');
        }
        if(_this.reloadTimer > 0){
            _this.reloadTimer--;
        }
    }
    
    _this.updateInvincibility = function(){
        if(_this.invincible){
            
            if(_this.invincibilityTimer >= _this.invincibilityFrames){
                _this.invincibilityTimer = 0;
                _this.invincible = false;
            }
            else{
                _this.invincibilityTimer++;
            }
        }
        if(_this.controlLoss){
            if(_this.controlLossTimer >= _this.controlLossFrames){
                _this.controlLossTimer = 0;
                _this.controlLoss = false;
            }
            else{
                _this.controlLossTimer++;
            }
        }
    }
    
    _this.getHit = function(dmg, obstacleX){
        console.log('OWWWWWWW');
        game.sound.play('ouch');
        health.takeDmg(dmg);
        _this.animate('hit');
        _this.invincible = true;
        _this.controlLoss = true;
        _this.invincibilityTimer = 0;
        _this.controlLossTimer = 0;
        if(_this.sprite.x < obstacleX){
            //set player velocity up and left
            _this.sprite.body.velocity.x = -_this.knockback.x;
            _this.sprite.body.velocity.y = -_this.knockback.y;
        }
        else if(_this.sprite.x > obstacleX){
            //set player velocity up and right
            _this.sprite.body.velocity.x = +_this.knockback.x;
            _this.sprite.body.velocity.y = -_this.knockback.y;
        }
    }
    
    /*
     Useful for conditional checks with animations
    */
    _this.animate = function(name){
        _this.sprite.animations.play(name);
    }
};