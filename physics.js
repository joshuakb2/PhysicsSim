function Game(context) {
	this.Context = context;
	this.Balls = [];
	this.BallSize = 5;
	this.BallCount = 2;
	this.Ricochet = -0.8;
	this.Running = false;
	for(let i = 0; i < this.BallCount; i++) {
		this.Balls.push({ x: Math.random(), y: Math.random(), dx: Math.random()/100, dy: Math.random()/100 });
	}
	
	this.RenderAverage = false;
	
	this.Draw = function() {
		let c = this.Context;
		c.clearRect(0, 0, 600, 600);
		
		let avg = { x: 0, y: 0 };
		let totalSpeed = this.Balls.map(b => Math.sqrt(b.dx ** 2 + b.dy ** 2)).aggregate((a, b) => a + b);
		
		for(let i = 0, l = this.BallCount; i < l; i++) {
			let b = this.Balls[i];
			let x = Math.floor(b.x * 600);
			let y = Math.floor(b.y * 600);
			if(this.RenderAverage) {
				avg.x += x;
				avg.y += y;
			}
			
			let color = Math.floor(255.99 * Math.sqrt((b.dx ** 2) + (b.dy ** 2)) / totalSpeed);
			
			c.fillStyle = 'rgb(' + color + ',0,' + (255 - color) + ')';
			c.beginPath();
			c.arc(x, y, this.BallSize, 0, 2*Math.PI);
			c.fill();
		}
		
		if(this.RenderAverage) {
			avg.x = Math.floor(avg.x / this.BallCount);
			avg.y = Math.floor(avg.y / this.BallCount);

			c.beginPath();
			c.arc(avg.x, avg.y, this.BallSize, 0, 2*Math.PI);
			c.fillStyle = 'green';
			c.fill();
			c.fillStyle = 'black';
		}
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
	
	this.Run = function(yes) {
		if(yes && !this.Running) {
			var that = this;
			var loop = function() {
				if(that.Running) {
					that.Step();
					window.requestAnimationFrame(loop);
				}
			}
			window.requestAnimationFrame(loop);
			this.Running = true;
		}
		else if(!yes && this.Running) {
			this.Running = false;
		}
	};
	
	this.Step = function(loop) {
		this.Update();
		this.Draw();
	}
	
	this.AddBall = function(x, y) {
		this.BallCount++;
		this.Balls.push({ x: x/600, y: y/600, dx: 0, dy: 0 });
		this.Speed = 1/Math.sqrt(this.BallCount);
		this.Draw();
	};
	
	return this;
}

//-----------------------------
//----- Utility functions -----
//-----------------------------

function range(n) {
	let r = [];
	for(let i = 0; i < n; i++)
		r.push(i);
	return r;
}

Array.prototype.where = function(f) {
	let result = [];
	for(let i = 0; i < this.length; i++) {
		if(f(this[i]))
			result.push(this[i]);
	}
	return result;
}

Array.prototype.aggregate = function(f) {
	if(this.length == 0)
		return null;
	let r = this[0];
	for(let i = 1; i < this.length; i++)
		r = f(r, this[i]);
	return r;
}

function square(n, margin = 1/(n + 1)) {
	let coords = range(n)
			.map(c => range(n)
					.map(k => ({ x: c, y: k})))
			.aggregate((a, b) => a.concat(b))
			.where(t => t.x == 0 || t.y == 0 || t.x == (n - 1) || t.y == (n - 1))
			.map(c => ({  x: (1 - 2*margin) * c.x / (n - 1) + margin, y: (1 - 2*margin) * c.y / (n - 1) + margin }));
					
	for(let i = 0; i < coords.length; i++)
		game.AddBall(600 * coords[i].x, 600 * coords[i].y);
}

function circle(n, diameter = 0.75, offset = 0) {
	for(let i = 0; i < n; i++) {
		let x = (diameter * Math.cos(2*Math.PI * i / n + offset) + 1) / 2;
		let y = (diameter * Math.sin(2*Math.PI * i / n + offset) + 1) / 2
		game.AddBall(600*x, 600*y);
	}
}

function spiral(n, spokes = 4, offset = 0, rotationFactor = 1) {
	for(let i = 0; i < n; i++) {
		let c = 2 * Math.PI * i / n;
		let d = 0.8 / n;
		circle(spokes, 0.1 + i * d, c * rotationFactor + offset);
	}
}

function reset() {
	game.BallCount = 0;
	game.Balls = [];
	game.Draw();
}

//	Some really neat ones to try:
//	reset(); circle(16); game.Speed *= 2;
//	reset(); spiral(6, 4);
