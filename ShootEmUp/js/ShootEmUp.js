var game = new Phaser.Game("100%", "100%", Phaser.CANVAS, 'SEU', {preload: preload,
	create: create, update: update, resize: resize});

function preload(){
	game.load.image('background', 'assets/sprites/background.png');
	game.load.image('playerbullet', 'assets/sprites/bullet.png');
	game.load.image('bigbossbullet', 'assets/sprites/bigbossbullet.png');
	game.load.spritesheet('character', 'assets/sprites/flyingchicken.png', 48, 45);
	game.load.spritesheet('enemy1', 'assets/sprites/enemy01.png', 49, 33);
	game.load.spritesheet('bigboss', 'assets/sprites/bigboss.png', 32, 32);
	game.load.spritesheet('boom', 'assets/sprites/explode.png', 128, 128);
	game.load.audio('bgm', 'assets/audio/TwinBee (NES) Music - Stage Theme 1.mp3');
	game.load.audio('clearstage', 'assets/audio/TwinBee (NES) Music - Power Up (mp3cut.net).mp3');
	game.load.audio('playerrevive', 'assets/audio/Metroid (NES) - Sound Effects Collection 2 (mp3cut.net).mp3');
	game.load.audio('explodesound', 'assets/audio/Metroid (NES) - Sound Effects Collection.mp3');
	game.load.audio('bossbattle', 'assets/audio/TwinBee (NES) Music - Boss Battle (mp3cut.net).mp3');
	game.load.audio('lose', 'assets/audio/Nes TwinBee 3 Soundtrack (mp3cut.net).mp3');
	game.load.audio('win', 'assets/audio/Super Mario Bros (NES) Music - Level Clear.mp3');
}

function goFullScreen(){
	game.stage.backgroundColor = "#000";
	game.scale.scaleMode = Phaser.ScaleManager.SHOW_FULL;
}

var Bgm;
var clearStage;
var loseMusic;
var winMusic;
var bossBattleMusic;
var explodeFX;
var playerRevive;
var player;
var bigBoss;
var enemyGroup;
var spawnEnemyTimer = 3000;
var spawnBigBossTimer = 0;
var background;
var playerBulletBox;
var enemyBulletBox;
var playerFireTime = 0;
var bossFireTime = 0;
var move;
var restartButton;
var explosionGroup;
var displayLevel = '';
var levelText;
var level = 1;
var displayScore = '';
var scoreText;
var score = 0;
var displayTarget = '';
var targetText;
var targetNum = 300;
var displayLives;
var liveText;
var liveLeft;
var liveNum = 6;
var resultText;

function create(){
	goFullScreen();
	//add and play background music
	Bgm = game.add.audio('bgm', 1, true);
	Bgm.play();

	game.physics.startSystem(Phaser.Physics.ARCADE); //start arcade physics
	//add other sound
	clearStage = game.add.audio('clearstage', 1);
	explodeFX = game.add.audio('explodesound', 3);
	playerRevive = game.add.audio('playerrevive', 2);
	bossBattleMusic = game.add.audio('bossbattle', 1, true);
	loseMusic = game.add.audio('lose', 1);
	winMusic = game.add.audio('win', 1);

	background = game.add.tileSprite(0, 0, 800, 600, 'background');
	player = game.add.sprite(game.world.width / 6, game.world.height / 2, 'character'); //set player's initial position in game
	game.physics.enable(player, Phaser.Physics.ARCADE); //enable arcade physics at player
	player.scale.x = 1.3;
	player.scale.y = 1.3;
	player.anchor.setTo(0.5, 0.5); //set player origin
	player.body.setSize(48, 38);
	player.body.collideWorldBounds = true; //prevent player go out from the screen
	player.animations.add('fly', [0, 1, 2, 3, 4, 5, 6, 7], 15, true); //add player's fly animation
	player.play('fly'); //play fly animation

	//final boss of the game
	bigBoss = game.add.sprite(game.world.width - 100, 10, 'bigboss'); //set big boss initial position in game
	game.physics.enable(bigBoss, Phaser.Physics.ARCADE); //enable arcade physics at bigboss
	bigBoss.scale.x = 3;
	bigBoss.scale.y = 3;
	bigBoss.anchor.setTo(0.5, 0.5); //set bigboss origin
	bigBoss.body.collideWorldBounds = true; //prevent bigboss go out from the screen
	bigBoss.health = 40;
	bigBoss.animations.add('upAndDown', [0, 1, 2, 3,], 15, true); //add player's fly animation
	var tween1 = game.add.tween(bigBoss).to( { y: game.world.height - 10}, 1800, Phaser.Easing.Linear.None, true, 0, 1000, true);
	bigBoss.visible = false;

	//a group of enemies
	enemyGroup = game.add.group();
	enemyGroup.enableBody = true;
	enemyGroup.physicsBodyType = Phaser.Physics.ARCADE;
	enemyGroup.createMultiple(50, 'enemy1');
	setObject(enemyGroup);

	//player's bullets
	playerBulletBox = game.add.group();
	playerBulletBox.enableBody = true;
	playerBulletBox.physicsBodyType = Phaser.Physics.ARCADE;
	playerBulletBox.createMultiple(30, 'playerbullet');
	setObject(playerBulletBox);

	//final boss's bullets
	enemyBulletBox = game.add.group();
	enemyBulletBox.enableBody = true;
	enemyBulletBox.physicsBodyType = Phaser.Physics.ARCADE;
	enemyBulletBox.createMultiple(30, 'bigbossbullet');
	setObject(enemyBulletBox);

	//explosions group
	explosionGroup = game.add.group();
	explosionGroup.createMultiple(30, 'boom');
	setObject(explosionGroup);

	//display score
	displayScore = 'SCORE\n';
	scoreText = game.add.text(10, 10, displayScore + score, {font: 'bold 28px Arial', fill: '#fff', align: 'center'});

	//display target score
	displayTarget = 'TARGET SCORE: ';
	targetText = game.add.text(game.world.width / 2 - 150, game.world.height - 100, displayTarget + targetNum, 
		{font: 'bold 30px Arial', fill: '#fff', align: 'center'});

	//display level
	displayLevel = 'LEVEL\n';
	levelText = game.add.text(game.world.width / 2 - 50, 10, displayLevel + level, {font: 'bold 28px Arial', fill: '#fff', align: 'center'});

	//display player's lives
	liveText = game.add.text(game.world.width - 150, 10, 'PLAYER\n\t\t', {font: 'bold 28px Arial', fill: '#fff'});
	displayLives = game.add.sprite(game.world.width - 120, 65, 'character');
	displayLives.anchor.setTo(0.5, 0.5);
	displayLives.angle = 0;
	displayLives.alpha = 0.8;
	liveLeft = game.add.text(game.world.width - 90, 52, 'x ' + liveNum, {font: 'bold 30px Arial', fill: '#fff'});

	//display the result of game
	resultText = game.add.text(game.world.centerX, game.world.centerY, ' ', {font: 'bold 50px Arial', fill: '#fff', align: 'center'});
	resultText.anchor.setTo(0.5, 0.5);
	resultText.visible = false;

	resize();
}

function setObject(object){
    object.setAll('anchor.x', 0.5); //set origin of all of the object to mid-bottom of texture
    object.setAll('anchor.y', 0.5);
    //this is important for group and create multiple
    object.setAll('checkWorldBounds', true); //check the object whether they are within the world bounds    
    object.setAll('outOfBoundsKill', true); //if the objects out of world bounds, kill the bullet
    //if no kill the bullet, the player cant shoot new bullet group
}

function resize(){
	//resize the background
	background.scale.setTo(game.world.width / 800, game.world.height / 600);
	//relocate all the text and the big boss in the game
	targetText.x = Math.round(game.world.width / 2 - 150);
	targetText.y = game.world.height - 100;
	levelText.x = Math.round(game.world.width / 2 - 50);
	liveText.x = game.world.width - 150;
	displayLives.x = game.world.width - 120;
	liveLeft.x = game.world.width - 90;
	resultText.x = game.world.centerX;
	resultText.y = game.world.centerY;
	bigBoss.x = game.world.width - 100;
}

function update(){
	//background is scrolling
	background.tilePosition.x -= 4;

    //player can do this if he still alive
	if(player.alive)
	{	//character moves follow player's finger on screen
		if(game.physics.arcade.distanceToPointer(player, game.input.activePointer) > 8){
			game.physics.arcade.moveToPointer(player, 450);
		}
		else{
			player.body.velocity.setTo(0, 0);
		}

		playerShoot();

		if(level == 5){
			if(bigBoss.visible){
				bigBossFire();
				game.physics.arcade.overlap(enemyBulletBox, player, bigBossHitPlayer, null, this); //big boss's bullet hit player
				game.physics.arcade.overlap(playerBulletBox, bigBoss, playerHitBigBoss, null, this); //player's bullet hit big boss
				game.physics.arcade.overlap(player, bigBoss, playerCollideBigBoss, null, this); //player itself collide with big boss
			}
			//boss's health 40 means the boss never appear before, so spawn big boss if reach lv 5
			else if(bigBoss.health == 40 && game.time.now > spawnBigBossTimer){
				//spawn big boss
				bigBoss.visible = true;
				bigBoss.play('upAndDown'); //play fly animation
			}
		}
		else{
			spawnSmallEnemies();
		}
		game.physics.arcade.overlap(playerBulletBox, enemyGroup, playerHitEnemy, null, this); //player's bullet hit enemy
		game.physics.arcade.overlap(enemyGroup, player, enemyCollidePlayer, null, this); //player itself collide with enemy
	}
}

function render(){
	/*for(i = 0; i < enemyGroup.length; i++){
		game.debug.body(enemyGroup.children[i]);
	}
	game.debug.body(player);
	game.debug.body(bigBoss);*/
}

function spawnSmallEnemies(){
	//spawn small enemies after certain time
	if(game.time.now > spawnEnemyTimer){
		var enemyAppear = enemyGroup.getFirstExists(false);
		if(enemyAppear){
			enemyAppear.scale.x = 1.2; //set the size of enemy
			enemyAppear.scale.y = 1.2;
			enemyAppear.reset(game.world.width, game.rnd.integerInRange(20, game.world.height - 20)); //spawn at random y coordinate
			enemyAppear.animations.add('enemy1', [0, 1, 2, 3, 4, 5, 6, 7], 20, true);
			enemyAppear.play('enemy1');
			enemyAppear.body.velocity.x = -350;
			//spawn small enemies every certain time
			//higher level, more enemies will be spawn
			if(level == 1){
				spawnEnemyTimer = game.time.now + 2000; //level 1
			}
			else if(level == 2){
				spawnEnemyTimer = game.time.now + 1000; //level 2
			}
			else if(level == 3){
				spawnEnemyTimer = game.time.now + 500; //level 3
			}
			else{
				spawnEnemyTimer = game.time.now + 300; //level 4
			}
		}
	}
}

function playerShoot(){
	if(game.time.now > playerFireTime){
		//grab the empty bullet from bullet box
		var playerbullet = playerBulletBox.getFirstExists(false);
		if(playerbullet){
			playerbullet.reset(player.body.x + 70, player.body.y + 31);
			playerbullet.body.velocity.x = 450;
			playerFireTime = game.time.now + 200; //bullet come out after 1 second
		}
	}
}

function bigBossFire(){
	if(game.time.now > bossFireTime){
		var bigbossbullet = enemyBulletBox.getFirstExists(false);
		if(bigbossbullet){
			bigbossbullet.reset(bigBoss.body.x, bigBoss.body.y + 30);
			game.physics.arcade.moveToObject(bigbossbullet, player, 500);
			bossFireTime = game.time.now + 500; //boss shoot every 0.5 second
		}
	}
}

function playerHitEnemy(playerbullet, enemy1){
	playerbullet.kill(); //kill player's bullet
	enemy1.kill(); //kill enemy
	checkScoreUpdateLvl(true); //update score and update level
	explodeAnimation(enemy1); //play explosion animation on the dead enemy
}

function enemyCollidePlayer(character, enemy1){
	enemy1.kill();
	explodeAnimation(enemy1);
	explodeAnimation(character);
	checkPlayerLive(character);
}

function bigBossHitPlayer(character, bigbossbullet){
	character.kill();
	bigbossbullet.kill();
	explodeAnimation(character);
	checkPlayerLive(character);
}

function playerHitBigBoss(bigboss, playerbullet){
	playerbullet.kill();
	explodeAnimation(bigboss);
	bigBoss.health--; //deduct boss's hp
	targetNum = bigBoss.health; //update boss's hp
	if(bigBoss.health <= 0){
		bigboss.kill(); //kill the boss if hp 0
		targetNum = 0;
		showResult(true); //display win msg
	}
	targetText.text = displayTarget + targetNum;
}

function playerCollideBigBoss(character, bigboss){
	character.kill();
	explodeAnimation(character);
	checkPlayerLive(character);
}

function checkPlayerLive(character){
	if(liveNum > 0){
		--liveNum; //deduct player's live
		if(liveNum == 0){
			character.kill(); //kill player if player's live 0
			showResult(false); //display lose msg
		}
		else{
			character.reset(24, game.rnd.integerInRange(20, game.world.height - 20)); //reset player's position
			playerRevive.play();
			//(move to what position, duration, ease, autostart or not, delay time, repeat, reverse or not)
			var tween = game.add.tween(character).to( { x: 150 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
		}
		liveLeft.text = 'x ' + liveNum;
	}
}

function explodeAnimation(target){
	//explosion animation played on target
	var explosion = explosionGroup.getFirstExists(false);
	explosion.reset(target.x, target.y);
	explosion.animations.add('boom');
	explosion.play('boom', 30, false, true);
	explodeFX.play();
}

function checkScoreUpdateLvl(enemykilled){
	if(enemykilled){
		score += 20; //add score to player
		//update player's level
		if(score == 300){
			background.alpha = 0.9; //make the background darker
			targetNum = 900
			level = 2;
			clearStage.play();
		}
		else if(score == 900){
			background.alpha = 0.7;
			targetNum = 1800;
			level = 3;
			clearStage.play();
		}
		else if(score == 1800){
			background.alpha = 0.5;
			targetNum = 3000;
			level = 4;
			clearStage.play();
		}
		else if(score == 3000){
			Bgm.stop();
			bossBattleMusic.play();
			background.alpha = 0.2;
			level = 5;
			displayTarget = 'Boss Health: '; //change score text to boss health text
			targetNum = bigBoss.health; //change target score to boss health number
			spawnBigBossTimer = game.time.now + 3000; //after 3 seconds only spawn the boss
		}
	}
	else{
		background.alpha = 1.0;
		score = 0; //restart game
		level = 1; //reset level
		displayTarget = 'TARGET SCORE: '; //change the target text
		targetNum = 300;
	}
	targetText.text = displayTarget + targetNum;
	scoreText.text = displayScore + score;
	levelText.text = displayLevel + level;
}


function showResult(condition){
    if(condition){ //if win is true
    	bossBattleMusic.stop();
    	winMusic.play();
        resultText.text = "You Won!\nTap to Play Again";
    }
    else{
    	bossBattleMusic.stop();
    	Bgm.stop();
    	loseMusic.play();
        resultText.text = "GAME OVER\nTap to restart";
    }
    resultText.visible = true; //display the text

    game.input.onTap.addOnce(restartGame, this);
}

function restartGame(){
	loseMusic.stop();
	winMusic.stop();
	Bgm.play();
	liveNum = 6; //revive the live
	enemyGroup.callAll('kill'); //kill all the children in enemyGroup
	playerBulletBox.callAll('kill');
	player.reset(0, game.rnd.integerInRange(20, game.world.height - 20)); //reset player's position
	checkScoreUpdateLvl(false); //reset score
	liveLeft.text = ' x ' + liveNum; //display player's live
	bigBoss.revive(40); //revive the hp of boss
	bigBoss.visible = false; //make the boss invisible
	spawnEnemyTimer = game.time.now + 3000; //reset the spawn enemy time
	resultText.visible = false; //make the text disappear
}