var canvas;
var context;
var game;

function init() {
	canvas = document.getElementById('canvas1');
	context = canvas.getContext('2d');
	game = new Game(context);
	game.Draw();
}

function Game(context) {
	this.Context = context;
	this.Balls = [];
	this.BallSize = 5;
	this.BallCount = 2;
	this.Ricochet = -0.8;
	for(let i = 0; i < this.BallCount; i++) {
		this.Balls.push({ x: Math.random(), y: Math.random(), dx: Math.random()/100, dy: Math.random()/100 });
	}
	
	this.Draw = function() {
		let c = this.Context;
		c.clearRect(0, 0, 600, 600);
		
		let avg = { x: 0, y: 0 };
		
		for(let i = 0, l = this.BallCount; i < l; i++) {
			let b = this.Balls[i];
			let x = Math.floor(b.x * 600);
			let y = Math.floor(b.y * 600);
			avg.x += x;
			avg.y += y;
			
			let color = Math.floor(Math.atan(100*Math.sqrt((b.dx ** 2) + (b.dy ** 2))) * 255.9);
			
			c.fillStyle = 'rgb(' + color + ',0,' + (255 - color) + ')';
			c.beginPath();
			c.arc(x, y, this.BallSize, 0, 2*Math.PI);
			c.fill();
		}
		/*
		avg.x = Math.floor(avg.x / this.BallCount);
		avg.y = Math.floor(avg.y / this.BallCount);
		
		c.beginPath();
		c.arc(avg.x, avg.y, this.BallSize, 0, 2*Math.PI);
		c.fillStyle = 'green';
		c.fill();
		c.fillStyle = 'black';
		*/
	};
	
	//	Positive means repulsive
	this.Forces = {
		gravity: (d) => -0.000005/d/d,
		someRepulsion: (d) => 0.000005/d - 0.0005
	};
	
	this.Force = this.Forces.gravity;
	
	this.Speed = 1/Math.sqrt(this.BallCount);
	
	this.Update = function() {
		let newBalls = [];
		for(let i = 0, l = this.BallCount; i < l; i++) {
			let me = this.Balls[i];
			let dx = me.dx, dy = me.dy;
			for(let j = 0; j < l; j++) {
				if(i != j) {
					let you = this.Balls[j];
					let difx = (me.x - you.x);
					let dify = (me.y - you.y);
					let d = this.Speed * this.Force(Math.sqrt((difx ** 2) + (dify ** 2)));
					
					dx += d * difx;
					dy += d * dify;
				}
			}
			
			let newX = me.x + dx;
			let newY = me.y + dy;
			
			if(newX < 0) {
				newX = 0;
				dx *= this.Ricochet;
			}
			else if(newX > 1) {
				newX = 1;
				dx *= this.Ricochet;
			}
			if(newY < 0) {
				newY = 0;
				dy *= this.Ricochet;
			}
			else if(newY > 1) {
				newY = 1;
				dy *= this.Ricochet;
			}
			
			
			newBalls.push({ x: newX, y: newY, dx: dx, dy: dy });
		}
		
		this.Balls = newBalls;
	};
	
	this.Start = function() {
		var that = this;
		var loop = function() {
			that.Draw();
			that.Update();
			window.requestAnimationFrame(loop);
		}
		window.requestAnimationFrame(loop);
	};
	
	this.AddBall = function(x, y) {
		this.BallCount++;
		this.Balls.push({ x: x/600, y: y/600, dx: 0, dy: 0 });
		this.Speed = 1/Math.sqrt(this.BallCount);
	};
	
	return this;
}
