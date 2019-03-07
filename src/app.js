
var controles = {};
var teclas = [];

var nivel = 0;
var maxBloques = 10;
var minBloques = 5;

var velX = 6;
var velY = 3;


var GameLayer  = cc.Layer.extend({
    spritePelota:null,
    velocidadX:null,
    velocidadY:null,
    spriteBarra:null,
    arrayBloques:[],
    arrayBloquesDestructibles:[],
    ctor:function () {
        this._super();
        this.velocidadX = velX;
        this.velocidadY = velY;
        var size = cc.winSize;
        // cachear
        // SIEMPRE AL INICIO DEL CONSTRUCTOR PARA NO OLVIDARSE
        cc.spriteFrameCache.addSpriteFrames(res.animacioncocodrilo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacioncocodrilorojo_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animacionpanda_plist);
        cc.spriteFrameCache.addSpriteFrames(res.animaciontigre_plist);

        this.spritePelota = cc.Sprite.create(res.bola_png);
        this.spritePelota.setPosition(cc.p(size.width/2 , size.height/2));
        this.addChild(this.spritePelota);
        this.spriteBarra = cc.Sprite.create(res.barra_2_png);
        this.spriteBarra.setPosition(cc.p(size.width/2 , size.height*0.1 ));
        this.addChild(this.spriteBarra);
        this.inicializarBloques();
        this.spriteFondo = cc.Sprite.create(res.fondo_png);
        this.spriteFondo.setPosition(cc.p(size.width/2 , size.height/2));
        this.spriteFondo.setScale( size.width / this.spriteFondo.width );
        this.addChild(this.spriteFondo,-10);

        //var actionMoverPelota = cc.MoveTo.create(1, cc.p(size.width, size.height));
        var actionMoverPelota = cc.MoveBy.create(1, cc.p(100, 0));
        this.spritePelota.runAction(actionMoverPelota);
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseDown: this.procesarMouseDown.bind(this)
        }, this)

        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: this.procesarKeyPressed.bind(this),
            onKeyReleased: this.procesarKeyReleased.bind(this)
        }, this);


        this.scheduleUpdate();
        return true;

    },
    procesarMouseDown:function(event) {
        console.log(event.getLocationX());
        console.log(event.getLocationY());

        var actionMoverPelotaAPunto =
            cc.MoveTo.create(1,
                cc.p(event.getLocationX(),
                    event.getLocationY()));

        // Ambito procesarMouseDown
        this.spritePelota.runAction(actionMoverPelotaAPunto);

    },
    procesarKeyPressed(keyCode){
    //console.log("procesarKeyPressed "+keyCode);
    var posicion = teclas.indexOf(keyCode);
    if ( posicion == -1 ) {
        teclas.push(keyCode);
        switch (keyCode ){
            case 39:
                // ir derecha
                //console.log("controles.moverX = 1");
                controles.moverX = 1;
                break;
            case 37:
                // ir izquierda
                controles.moverX = -1;
                break;
        }
    }
},
procesarKeyReleased(keyCode){
    //console.log("procesarKeyReleased "+keyCode);
    var posicion = teclas.indexOf(keyCode);
    teclas.splice(posicion, 1);
    switch (keyCode ){
        case 39:
            if ( controles.moverX == 1){
                controles.moverX = 0;
            }
            break;
        case 37:
            if ( controles.moverX == -1){
                controles.moverX = 0;
            }
            break;
    }
},

update:function (dt) {
    this.procesarControles();

    // Mover barra
    if ( this.spriteBarra.velocidadX == null){
        this.spriteBarra.velocidadX = 0;
    }
    this.spriteBarra.x = this.spriteBarra.x + this.spriteBarra.velocidadX;

        var mitadAncho = this.spritePelota.getContentSize().width/2;
        var mitadAlto = this.spritePelota.getContentSize().height/2;

        // Nuevas posiciones
        this.spritePelota.x = this.spritePelota.x + this.velocidadX;
        this.spritePelota.y = this.spritePelota.y + this.velocidadY;

    var areaPelota = this.spritePelota.getBoundingBox();
    var areaBarra = this.spriteBarra.getBoundingBox();

    if(this.arrayBloquesDestructibles.length == 0 && this.arrayBloques.length == 0){
        nivel++;
        maxBloques += 5;
        minBloques += 5;
        velX += 1;
        velY += 1;
        cc.director.pause();
        this.getParent().addChild(new GameOverLayer());
    }

    if( cc.rectIntersectsRect(areaPelota, areaBarra)){
        //console.log("Colision");
        this.velocidadX = ( this.spritePelota.x - this.spriteBarra.x ) / 5;
        this.velocidadY =  this.velocidadY*-1;
    }
    var destruido = false;
    for(var i = 0; i < this.arrayBloques.length; i++){
        var areaBloque = this.arrayBloques[i].getBoundingBox();
        if(cc.rectIntersectsRect(areaPelota, areaBloque)){
            this.removeChild(this.arrayBloques[i]);
            this.arrayBloques.splice(i, 1);
            console.log("Quedan : "+this.arrayBloques.length);
            destruido = true;
        }
    }
    for(var i = 0; i < this.arrayBloquesDestructibles.length; i++){
        var areaBloque = this.arrayBloquesDestructibles[i].getBoundingBox();
        if(cc.rectIntersectsRect(areaPelota, areaBloque)){
            var posXDes = this.arrayBloquesDestructibles[i].getPosition().x;
            var posYDes = this.arrayBloquesDestructibles[i].getPosition().y;
            var ancho = this.arrayBloquesDestructibles[i].width;
            if(this.buscarBloque(this.arrayBloques,posXDes + ancho,posYDes) != -1){
                var a = this.buscarBloque(this.arrayBloques,posXDes + ancho,posYDes);
                this.removeChild(this.arrayBloques[a]);
                this.arrayBloques.splice(a, 1);
            }
            if(this.buscarBloque(this.arrayBloques,posXDes - ancho,posYDes) != -1){
                var a = this.buscarBloque(this.arrayBloques,posXDes - ancho,posYDes);
                this.removeChild(this.arrayBloques[a]);
                this.arrayBloques.splice(a, 1);
            }
            if(this.buscarBloque(this.arrayBloques,posXDes,posYDes + ancho) != -1){
                var a = this.buscarBloque(this.arrayBloques,posXDes,posYDes + ancho);
                this.removeChild(this.arrayBloques[a]);
                this.arrayBloques.splice(a, 1);
            }
            if(this.buscarBloque(this.arrayBloques,posXDes,posYDes - ancho) != -1){
                var a = this.buscarBloque(this.arrayBloques,posXDes,posYDes - ancho);
                this.removeChild(this.arrayBloques[a]);
                this.arrayBloques.splice(a, 1);
            }
            this.removeChild(this.arrayBloquesDestructibles[i]);
            this.arrayBloquesDestructibles.splice(i, 1);
            destruido = true;
        }
    }
    if(destruido){
        this.velocidadX = this.velocidadX*-1;
        this.velocidadY = this.velocidadY*-1;
    }
    // Rebote
    if (this.spritePelota.x < 0 + mitadAncho){
        this.spritePelota.x = 0 + mitadAlto;
        this.velocidadX = this.velocidadX*-1;
    }
    if (this.spritePelota.x > cc.winSize.width - mitadAncho){
        this.spritePelota.x = cc.winSize.width - mitadAncho;
        this.velocidadX = this.velocidadX*-1;
    }
    if (this.spritePelota.y < 0 + mitadAlto){
        // No rebota, se acaba el juego
        cc.director.pause();
        this.getParent().addChild(new GameOverLayer());
    }
    if (this.spritePelota.y > cc.winSize.height - mitadAlto){
        this.spritePelota.y = cc.winSize.height - mitadAlto;
        this.velocidadY = this.velocidadY*-1;
        }
},
    procesarControles(){
        if ( controles.moverX > 0){
            this.spriteBarra.velocidadX = 5;
        }
        if ( controles.moverX < 0){
            this.spriteBarra.velocidadX = -5;
        }
        if ( controles.moverX == 0 ){
            this.spriteBarra.velocidadX = 0;
        }
    },
    buscarBloque(array,x,y){
        var a = -1;
        for(var j = 0; j < array.length; j++){
            if(array[j].getPosition().x == x && array[j].getPosition().y == y){
                a = j;
                return a;
            }
        }
        return a;
    },
    inicializarBloques:function() {
        var insertados = 0;
        var fila = 0;
        var columna = 0;
        this.arrayBloques = [];
        this.arrayBloquesDestructibles = [];

        var framesBloqueCocodrilo = [];
        for (var i = 1; i <= 8; i++) {
            var nombre = "cocodrilo" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(nombre);
            framesBloqueCocodrilo.push(frame);
        }
        var animacionBloqueCocodrilo = new cc.Animation(framesBloqueCocodrilo, 0.1);

        var framesBloqueCocodrilorojo = [];
        for (var i = 1; i <= 8; i++) {
            var nombre = "cocodrilorojo" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(nombre);
            framesBloqueCocodrilorojo.push(frame);
        }
        var animacionBloqueCocodrilorojo = new cc.Animation(framesBloqueCocodrilorojo, 0.1);

        var framesBloquePanda = [];
        for (var i = 1; i <= 8; i++) {
            var nombre = "panda" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(nombre);
            framesBloquePanda.push(frame);
        }
        var animacionBloquePanda = new cc.Animation(framesBloquePanda, 0.1);

        var framesBloqueTigre = [];
        for (var i = 1; i <= 8; i++) {
            var nombre = "tigre" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(nombre);
            framesBloqueTigre.push(frame);
        }
        var animacionBloqueTigre = new cc.Animation(framesBloqueTigre, 0.1);

        var randomNumBloques = Math.floor(Math.random() *(maxBloques - minBloques + 1)) + minBloques;
        while (insertados < randomNumBloques ){
            var a = Math.floor((Math.random() * 4) + 1);
            switch(a){
                case 1:
                    var accionAnimacionBloqueCocodrilo = new cc.RepeatForever(new cc.Animate(animacionBloqueCocodrilo));
                    var spriteBloqueActual = cc.Sprite.create(res.cocodrilo_1_png);
                    spriteBloqueActual.runAction(accionAnimacionBloqueCocodrilo);
                    var x = (spriteBloqueActual.width / 2 ) + ( spriteBloqueActual.width * columna );
                    var y = (cc.winSize.height - spriteBloqueActual.height/2 ) - (spriteBloqueActual.height * fila );
                    spriteBloqueActual.setPosition(cc.p(x,y));
                    this.arrayBloques.push(spriteBloqueActual);
                    this.addChild(spriteBloqueActual);
                    insertados++;
                    columna++;
                    if( x + spriteBloqueActual.width > cc.winSize.width){
                        columna = 0;
                        fila++;
                    }
                    break;
                case 2:
                    var accionAnimacionBloquePanda= new cc.RepeatForever(new cc.Animate(animacionBloquePanda));
                    var spriteBloqueActual = cc.Sprite.create(res.panda_1_png);
                    spriteBloqueActual.runAction(accionAnimacionBloquePanda);
                    var x = (spriteBloqueActual.width / 2 ) + ( spriteBloqueActual.width * columna );
                    var y = (cc.winSize.height - spriteBloqueActual.height/2 ) - (spriteBloqueActual.height * fila );
                    spriteBloqueActual.setPosition(cc.p(x,y));
                    this.arrayBloques.push(spriteBloqueActual);
                    this.addChild(spriteBloqueActual);
                    insertados++;
                    columna++;
                    if( x + spriteBloqueActual.width > cc.winSize.width){
                        columna = 0;
                        fila++;
                    }
                    break;
                case 3:
                    var accionAnimacionBloqueTigre= new cc.RepeatForever(new cc.Animate(animacionBloqueTigre));
                    var spriteBloqueActual = cc.Sprite.create(res.tigre_1_png);
                    spriteBloqueActual.runAction(accionAnimacionBloqueTigre);
                    var x = (spriteBloqueActual.width / 2 ) + ( spriteBloqueActual.width * columna );
                    var y = (cc.winSize.height - spriteBloqueActual.height/2 ) - (spriteBloqueActual.height * fila );
                    spriteBloqueActual.setPosition(cc.p(x,y));
                    this.arrayBloques.push(spriteBloqueActual);
                    this.addChild(spriteBloqueActual);
                    insertados++;
                    columna++;
                    if( x + spriteBloqueActual.width > cc.winSize.width){
                        columna = 0;
                        fila++;
                    }
                    break;
                case 4:
                    var accionAnimacionBloqueCocodrilorojo = new cc.RepeatForever(new cc.Animate(animacionBloqueCocodrilorojo));
                    var spriteBloqueActual = cc.Sprite.create(res.cocodrilorojo_1_png);
                    spriteBloqueActual.runAction(accionAnimacionBloqueCocodrilorojo);
                    var x = (spriteBloqueActual.width / 2 ) + ( spriteBloqueActual.width * columna );
                    var y = (cc.winSize.height - spriteBloqueActual.height/2 ) - (spriteBloqueActual.height * fila );
                    if(this.buscarBloque(this.arrayBloquesDestructibles,x + spriteBloqueActual.width,y) == -1 &&
                        this.buscarBloque(this.arrayBloquesDestructibles,x - spriteBloqueActual.width,y) == -1 &&
                        this.buscarBloque(this.arrayBloquesDestructibles,x,y + spriteBloqueActual.width) == -1){
                        spriteBloqueActual.setPosition(cc.p(x, y));
                        this.arrayBloquesDestructibles.push(spriteBloqueActual);
                        this.addChild(spriteBloqueActual);
                        insertados++;
                        columna++;
                        if (x + spriteBloqueActual.width > cc.winSize.width) {
                            columna = 0;
                            fila++;
                        }
                    }
                    break;
            }
        }
    }

});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        cc.director.resume();
        this.addChild(new GameLayer());
    }
});

