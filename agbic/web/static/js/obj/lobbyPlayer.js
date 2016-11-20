export class LobbyPlayer{
    constructor(game, x, y){
        //set inital vars
        this.game = game;
        this.portrait = game.add.sprite(x,y,'portrait');
        this.arrowR = game.add.button(x + 68, y + 100, 'arrow');
        this.arrowR.onInputUp.add(function(){this.rightArrowClicked;}, this);
        this.arrowL = game.add.button(x + 32, y + 100, 'arrow');
        this.arrowL.onInputUp.add(function(){this.leftArrowClicked;}, this);
        this.arrowL.scale.x = -1;
        this.arrowL.visible = false;
        this.arrowR.visible = false;
        //this.ready = game.add.button(x, y+200, 'ready');
        this.characterId = 0;
        this.playerId = 0;
        this.maxCharacterId = 2;
        
        //set message responses
    }
    changeCharacter(dir){
        this.characterId += dir;
        if(this.characterId < 0){
            this.characterId = 0;
            //change portrait to match
            //load image from some resource file?
            //or just load images as portraitX where x is the characterId
            this.portrait.loadTexture('portrait');
        }
        if(this.characterId > this.maxCharacterId){
            this.characterId = this.maxCharacterId;
            //change portrait to match
            this.portrait.loadTexture('portrait');
        }
    }
    
    leftArrowClicked(){
        this.changeCharacter(-1);
    }
    righttArrowClicked(){
        this.changeCharacter(-1);
    }
    
    playerJoined(playerId, isActivePlayer){
        this.playerId = playerId;
        this.characterId = 1;
        if(isActivePlayer){
            this.arrowL.visible = true;
            this.arrowR.visible = true;
        }
    }
}