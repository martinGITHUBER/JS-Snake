import Config from "./config.js";
import Vector2 from "./vector2.js";

export default class Game {
	constructor(ctx) {
		this.config = new Config();
		this.ctx = ctx || document.body.appendChild(document.createElement("canvas")).getContext("2d");
		this.ctx.canvas.width = this.config.width * window.devicePixelRatio;
		this.ctx.canvas.height = this.config.height * window.devicePixelRatio;
		this.ctx.canvas.style.width = this.config.width + "px";
		this.ctx.canvas.style.height = this.config.height + "px";
		this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
	}

	restart() {
		const center = new Vector2(this.config.width / this.config.tile_size / 2, this.config.height / this.config.tile_size / 2);
		this.snake = [center, new Vector2(center.x + 1, center.y), new Vector2(center.x + 2, center.y)];
		this.direction = "left";
		this.generate_apple();
	}

	generate_apple() {
		if(this.snake.length >= this.config.width / this.tile_size * this.config.height / this.config.tile_size) return this.restart();
		while(!this.apple || this.snake.some(v => v.x == this.apple.x && v.y == this.apple.y)) {
			this.apple = new Vector2(Math.floor(Math.random() * (this.config.width / this.config.tile_size - 1)), Math.floor(Math.random() * (this.config.height / this.config.tile_size - 1)));
		}
	}

	start() {
		this.restart();

		window.addEventListener("keydown", event => {
			switch(event.key) {
				case "ArrowUp":
					if(this.direction == "down") break;
					this.direction = "up";
					break;
				case "ArrowDown":
					if(this.direction == "up") break;
					this.direction = "down";
					break;
				case "ArrowLeft":
					if(this.direction == "right") break;
					this.direction = "left";
					break;
				case "ArrowRight":
					if(this.direction == "left") break;
					this.direction = "right";
					break;
			}
		});

		setTimeout(() => {
			this.update();
		}, 1000 / (this.config.tps * this.config.speed_multiplier));

		requestAnimationFrame(() => {
			this.render();
		});
	}

	update() {
		if(!this.config.paused) {
			const last_vector = new Vector2(this.snake[this.snake.length - 1]);
			for(let i = this.snake.length - 1; i >= 0; i--) {
				const s = this.snake[i];
				if(i == 0) {
					switch(this.direction) {
						case "up":
							s.y--;
							break;
						case "down":
							s.y++;
							break;
						case "left":
							s.x--;
							break;
						case "right":
							s.x++;
							break;
					}
				} else {
					s.x = this.snake[i - 1].x;
					s.y = this.snake[i - 1].y;
				}
			}

			if(new Set(this.snake.map(v => {
				return 0.5 * (v.x + v.y) * (v.x + v.y + 1) + v.y;
			})).size != this.snake.length || this.snake.some(v => v.x < 0 || v.x + 1 > this.config.width / this.config.tile_size || v.y < 0 || v.y + 1 > this.config.height / this.config.tile_size)) {
				this.restart();
			}
			if(this.snake.some(v => v.x == this.apple.x && v.y == this.apple.y)) {
				this.snake.push(last_vector);
				this.generate_apple();
			}
		}

		setTimeout(() => {
			this.update();
		}, 1000 / (this.config.tps * this.config.speed_multiplier));
	}

	render() {
		this.ctx.clearRect(0, 0, this.config.width, this.config.height);

		for(let x = 0; x < this.config.width / this.config.tile_size; x++) {
			for(let y = 0; y < this.config.height / this.config.tile_size; y++) {
				this.ctx.fillStyle = this.config.tile_color;
				this.ctx.fillRect(x * this.config.tile_size, y * this.config.tile_size, this.config.tile_size, this.config.tile_size);
			}
		}

		this.ctx.fillStyle = this.config.apple_color;
		this.ctx.fillRect(this.apple.x * this.config.tile_size, this.apple.y * this.config.tile_size, this.config.tile_size, this.config.tile_size);

		for(let i = 0; i < this.snake.length; i++) {
			this.ctx.fillStyle = this.config.snake_color;
			this.ctx.fillRect(this.snake[i].x * this.config.tile_size, this.snake[i].y * this.config.tile_size, this.config.tile_size, this.config.tile_size);
		}

		for(let x = 0; x < this.config.width / this.config.tile_size; x++) {
			for(let y = 0; y < this.config.height / this.config.tile_size; y++) {
				this.ctx.strokeStyle = this.config.tile_outline;
				this.ctx.strokeRect(x * this.config.tile_size, y * this.config.tile_size, this.config.tile_size, this.config.tile_size);
			}
		}

		requestAnimationFrame(() => {
			this.render();
		});
	}
}