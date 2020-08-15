var game = new Phaser.Game(1500, 1200, Phaser.AUTO);


var GameState = {
	preload: function() {
		this.load.image('shownimage', 'assets/images/background.jpg')
	},
	create: function() {
		this.background = this.game.add.sprite(0, 0, 'shownimage');

		/*var textGroup = game.add.group();

		for (var i = 0; i < 10; i++)
		{
			textGroup.add(game.make.text(100, 50 + i *30, 'I am a game engine',  { font: "32px Arial", fill: generateHexColor() }));
		}*/

		},
	update: function() {

	}
};

/*function generateHexColor() { 
    return '#' + ((0.5 + 0.5 * Math.random()) * 0xFFFFFF << 0).toString(16);
}*/

game.state.add('GameState', GameState);
game.state.start('GameState');