/*
    La bruja llega a la pared y aparece un mensaje que dice "Debo poseer el hada para para entrar a la cueva"
    Aparece un signo de exlamación (ruido) en el hada y sale volando (El player debe capturarla)
    Usando el hada debe capturar el escrito mágico cruzando la cueva.


*/
var game = new Phaser.Game(800, 544, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

function preload() {

    game.load.tilemap('level1', 'assets/tilemaps/maps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tilemaps/tiles/level1.png');
   
    game.load.spritesheet('player', 'assets/sprites/dude.png', 38, 80);
    game.load.spritesheet('fairy', 'assets/sprites/fairy.png', 48, 55);    
    game.load.spritesheet('vamp', 'assets/sprites/vamp.png', 54, 32); 
    game.load.spritesheet('rain', 'assets/sprites/rain.png', 17, 17);         
    
    game.load.image('background', 'assets/sprites/background.jpg');
    game.load.image('front', 'assets/sprites/front.png'); 

    game.load.image('logo', 'assets/sprites/logo.png');
    game.load.image('signo', 'assets/sprites/signo.png');    
    game.load.image('boxdialog', 'assets/sprites/boxdialog.png');        
    game.load.image('runa', 'assets/sprites/runa.png');
    game.load.image('magic', 'assets/sprites/magic.png'); 
    game.load.image('portal', 'assets/sprites/portal.png');        

    game.load.audio('music', 'assets/audio/ambient.mp3');  
    game.load.audio('reset', 'assets/audio/reset.mp3'); 



}

var map;
var tileset;
var layer;
var player;
var background;
var cursors;
var dialog = false;
var fairyDialog;
var runaDialog;
var textRuna;
var textFairy;
var music;
var areset;
var music;
var endgame = false;
var fairy;
var runa;
var signo;
var vamps;
var rain;
var haveRuna=false;
var isPlayer= true;
var filter;
var portal;

function create() {
    //Physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 350;

    //Background
    background = game.add.sprite(0, 0, 'background');
    music = game.add.audio('music');
    areset = game.add.audio('reset');

    music.play('',0,1,true);
    
    //Map Level1
    map = game.add.tilemap('level1');
    map.addTilesetImage('mindout-level1', 'tiles');
    map.setCollisionBetween(1,6);
    layer = map.createLayer('level1');
    layer.resizeWorld();
    //layer.debug = true;

    //Player
    player = game.add.sprite(32, 32, 'player');
    game.physics.enable(player);
    player.body.bounce.y = 0.2;
    player.body.linearDamping = 3;
    player.body.collideWorldBounds = true;
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 20, true);
    game.camera.follow(player);

    //Particles
    magic = game.add.emitter(0, 0, 100);
    magic.makeParticles('magic');
    magic.gravity = 200;

    //Fairy
    fairy = game.add.sprite(900, 320, 'fairy');
    game.physics.enable(fairy);  
    fairy.body.allowGravity = false;  
    fairy.body.collideWorldBounds = true;
    fairy.body.bounce.y = 0.2;
    fairy.body.linearDamping = 3;   
    fairy.animations.add('fly', [0,1, 2], 10, true);   
    fairyTween = game.add.tween(fairy).to({ y: 250 }, 2000, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true);
    signo = game.add.sprite(-300, -300, 'signo');  

    generateRuna();

    //vamp

    vamps = game.add.group();
    vamps.enableBody = true;
    vamps.physicsBodyType = Phaser.Physics.ARCADE;


    for (var i = 0; i < 7; i++)
    {
        var vamp = vamps.create(1800+ i * 150,50, 'vamp');
        //This allows your sprite to collide with the world bounds like they were rigid objects
        vamp.body.collideWorldBounds=true;
        vamp.body.gravity.x = 10*game.rnd.integerInRange(-10,10);
        vamp.body.gravity.y = 10 + Math.random() * 20;
        vamp.animations.add('vampfly', [0,1, 2], 20, true);
        vamp.animations.play('vampfly');                      
        vamp.body.velocity.setTo(100, 200);
        vamp.body.bounce.setTo(1, 1);  

    }


    //Rain
    var rain = game.add.emitter(0, 0, 900);

    rain.width = game.world.width;
    rain.makeParticles('rain');
    rain.minParticleScale = 0.2;
    rain.maxParticleScale = 0.9;

    rain.setYSpeed(300, 500);
    rain.setXSpeed(-5, 5);

    rain.minRotation = 0;
    rain.maxRotation = 0;

    rain.start(false, 1600, 5, 0);




    portal = game.add.sprite(-500, 0, 'portal'); 

    front = game.add.sprite(0, 0, 'front');


    //Stone Dialog
    runaDialog = game.add.sprite(100, 100, 'boxdialog');
    textRuna = game.add.text(135, 55, 'Para poder abrir el portal \nnecesito encontrar la Runa');
    textRuna.anchor.set(0.5);
    textRuna.align = 'left';
    // Font style
    textRuna.font = 'Arial';
    textRuna.fontSize = 16;
    textRuna.fill = '#fff';
    textRuna.setShadow(3, 1, 'rgba(0,0,0,0.5)', 5);
    //Dialog a Sprite
    runaDialog.addChild(textRuna);


    //Fairy Dialog
    fairyDialog = game.add.sprite(100, 100, 'boxdialog');
    textFairy = game.add.text(135, 55, 'Si quiero entrar a la cueva \ndebo poseer el hada');
    textFairy.anchor.set(0.5);
    textFairy.align = 'left';
    //  Font style
    textFairy.font = 'Arial';
    textFairy.fontSize = 16;
    textFairy.fill = '#fff';
    textFairy.setShadow(3, 1, 'rgba(0,0,0,0.5)', 5);
    //Dialog a Sprite
    fairyDialog.addChild(textFairy); 


    //Logo
    var logo = game.add.sprite(390, 200, 'logo');
    logo.anchor.setTo(0.5, 0.5);
    logo.alpha = 0;
    game.add.tween(logo).to( { alpha: 1 }, 0, Phaser.Easing.Linear.None, true, 0, 0, false);
    game.add.tween(logo).to({ y: 190 }, 2000, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true);

    //Cursors
    cursors = game.input.keyboard.createCursorKeys();

}

function update() {

    game.physics.arcade.collide(player, layer);
    game.physics.arcade.collide(fairy, layer);    
    game.physics.arcade.collide(vamps, layer); 

    magic.x = fairy.x+17;
    magic.y = fairy.y+35;
    magic.start(true, 200, null, 1);


    if(isPlayer){
        player.body.velocity.x = 0;  
    }else{
        fairy.body.velocity.x = 0;  
    }

    if(dialog==true){
        game.physics.arcade.overlap(player, fairy, possesion, null, this);        
    }

    game.physics.arcade.overlap(vamps, fairy, reset, null, this);
    game.physics.arcade.overlap(runa, fairy, getRuna, null, this);    

    //Discover Runa Stone
    if(player.x >= 280 && player.x  <=380){
        if(haveRuna == false){
            runaDialog.x = 400;
            runaDialog.y= 350;     
        }else{
            //Endgame
            runaDialog.x = -300;
            runaDialog.y= -300;               
            endgame = true;
            portal.x=240; 
            fadeObject(portal,3000)                        
            //  Stand still
            player.animations.stop();
            player.frame = 4;            
            player.body.collideWorldBounds = false;
            player.body.allowGravity = false;             
            player.body.velocity.y = -250; 
        }
  
    }else{
        runaDialog.x = -300;
        runaDialog.y= -300;     
    }

    //Meet Fairy
    if(player.x >= 850 && player.x  <=9500 && isPlayer == true){
        fairyDialog.x = 550;
        fairyDialog.y= 350;
        signo.x = fairy.x+10;
        signo.y = fairy.y-50;       
        game.time.events.add(Phaser.Timer.SECOND * 2, fairyEscape, this);
    }else{
        fairyDialog.x = -300;
        fairyDialog.y= -300;     
    }

    if(isPlayer && endgame == false){
        //Player controls
        if (cursors.up.isDown)
        {
            if (player.body.onFloor())
            {
                player.body.velocity.y = -250;
            }
        }

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -150;
            player.animations.play('left');
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 150;
            player.animations.play('right');
        }    
        else
        {
            //  Stand still
            player.animations.stop();
            player.frame = 4;
        }

    }else{
        //Fairy controls
        if (cursors.up.isDown)
        {
            fairy.body.velocity.y = -250;
        }

        if (cursors.left.isDown)
        {
            fairy.body.velocity.x = -150;
            fairy.animations.play('fly');            
        }
        else if (cursors.right.isDown)
        {
            fairy.body.velocity.x = 150;
            fairy.animations.play('fly');            
        }    
        else
        {
            fairy.frame = 1;
        }

    }


}


function reset(){
    if(isPlayer == false){
        areset.play();
        fairy.x = 900;
        fairy.y = 0;
        if(haveRuna == true){
            haveRuna = false;
            generateRuna();          
        }
    }
}

function possesion(){
    //Player interaction
    if (haveRuna == false && isPlayer == true)
    {
            fairyTween.pause();
            fairy.body.velocity.x = 0;                
            fairy.body.allowGravity = true; 
            game.camera.follow(fairy);
            game.physics.arcade.collide(player, fairy);
            isPlayer = false;
            player.animations.stop();
            player.frame = 4;           
    }
    else if (haveRuna == true && isPlayer == false)
    {
        isPlayer = true;
        fairy.body.allowGravity = false;
        fairyTween.resume();        
        game.camera.follow(player);
    }
}

function getRuna(){
    haveRuna = true;
    runa.destroy();
}

function generateRuna(){
    runa = game.add.sprite(2750, 320, 'runa');
    game.physics.enable(runa);      
    runa.body.allowGravity = false;     
    runaTween = game.add.tween(runa).to({ y: 300 }, 2000, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true);
}

function fairyEscape(){ 
    //TODO: Random Flay fairy function 
    fadeObject(fairyDialog,100);
    fadeObject(signo,100);    
    dialog = true;
    game.paused = false;
}

function fadeObject(object,time) {
    game.add.tween(object).to( { alpha: 0 }, time, Phaser.Easing.Linear.None, true);
}
