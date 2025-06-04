class Jogador {
  constructor(x, y, largura, altura) {
      this.x = x;
      this.y = y;
      this.largura = largura;
      this.altura = altura;
      this.velocidade = 10; 
  }

  desenhar(ctx) {
      ctx.fillStyle = "#00FF00"; 
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00FF00";
      ctx.fillRect(this.x, this.y, this.largura, this.altura);
      ctx.shadowBlur = 0; 
  }

 
}

class Bola {
  constructor(x, y, raio) {
      this.x = x;
      this.y = y;
      this.raio = raio;
      this.velocidadeX = 5;
      this.velocidadeY = -5;
      this.iniciada = false;
  }

  desenhar(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
      ctx.fillStyle = "#FF0000"; 
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#FF0000";
      ctx.fill();
      ctx.closePath();
      ctx.shadowBlur = 0; 
  }

  mover() {
      if (this.iniciada) {
          this.x += this.velocidadeX;
          this.y += this.velocidadeY;
      }
  }

  colisaoParede(larguraCanvas, alturaCanvas) {
      if (this.x + this.raio > larguraCanvas || this.x - this.raio < 0) {
          this.velocidadeX = -this.velocidadeX;
      }
      if (this.y - this.raio < 0) {
          this.velocidadeY = -this.velocidadeY;
      }
  }

  colisaoRaquete(raquete) {
      if (
          this.y + this.raio > raquete.y &&
          this.y + this.raio < raquete.y + raquete.altura &&
          this.x + this.raio > raquete.x &&
          this.x - this.raio < raquete.x + raquete.largura
      ) {
          if (this.velocidadeY > 0) {
              this.velocidadeY = -this.velocidadeY;
              this.y = raquete.y - this.raio;
          }
      }
  }

  colisaoBloco(bloco) {
      if (
          bloco.vivo &&
          this.x + this.raio > bloco.x &&
          this.x - this.raio < bloco.x + bloco.largura &&
          this.y + this.raio > bloco.y &&
          this.y - this.raio < bloco.y + bloco.altura
      ) {
          const centroBolaX = this.x;
          const centroBolaY = this.y;
          const centroBlocoX = bloco.x + bloco.largura / 2;
          const centroBlocoY = bloco.y + bloco.altura / 2;

          const diffX = centroBolaX - centroBlocoX;
          const diffY = centroBolaY - centroBlocoY;

          if (Math.abs(diffY) > Math.abs(diffX)) {
              this.velocidadeY = -this.velocidadeY;
          } else {
              this.velocidadeX = -this.velocidadeX;
          }

          bloco.colidir();
          return true;
      }
      return false;
  }
}

class Bloco {
  constructor(x, y, largura, altura) {
      this.x = x;
      this.y = y;
      this.largura = largura;
      this.altura = altura;
      this.vivo = true;
  }

  desenhar(ctx) {
      if (this.vivo) {
          ctx.fillStyle = "#0000FF"; // Azul vibrante
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#0000FF";
          ctx.fillRect(this.x, this.y, this.largura, this.altura);
          ctx.shadowBlur = 0;
      }
  }

  colidir() {
      this.vivo = false;
  }
}

class Jogo {
  constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.jogador = new Jogador(this.canvas.width / 2 - 50, this.canvas.height - 50, 100, 20);
      this.bola = new Bola(this.canvas.width / 2, this.canvas.height - 70, 10);
      this.blocos = [];
      this.pontuacao = 0;
      this.gameOver = false;
      this.recorde = localStorage.getItem("recorde") || 0;
      this.loopId = null;
      this.mensagemFinal = "";

      this.reiniciarBtn = document.getElementById("reiniciar-btn");
      this.pontuacaoDisplay = document.getElementById("pontuacao");
      this.recordeDisplay = document.getElementById("recorde");

      this.mousePressionado = false;
      this.offsetMouseX = 0; 

      this.inicializar();

      this.canvas.addEventListener("click", () => {
          if (!this.bola.iniciada && !this.gameOver) {
              this.bola.iniciada = true;
          }
      });

      this.canvas.addEventListener("mousedown", this.lidarComMouseDown.bind(this));
      this.canvas.addEventListener("mousemove", this.lidarComMouseMove.bind(this));
      this.canvas.addEventListener("mouseup", this.lidarComMouseUp.bind(this));
      this.canvas.addEventListener("mouseout", this.lidarComMouseUp.bind(this)); // Caso o mouse saia do canvas

      this.reiniciarBtn.addEventListener("click", () => {
          this.resetarJogo();
      });

      this.recordeDisplay.textContent = this.recorde;
  }

  inicializar() {
      this.blocos = [];
      const numLinhas = 5;
      const numColunas = 8;
      const larguraBloco = 80;
      const alturaBloco = 30;
      const espacamentoX = 20;
      const espacamentoY = 15;
      const offsetTopo = 30;

      const larguraTotalBlocos = numColunas * (larguraBloco + espacamentoX) - espacamentoX;
      const startX = (this.canvas.width - larguraTotalBlocos) / 2;

      for (let i = 0; i < numLinhas; i++) {
          for (let j = 0; j < numColunas; j++) {
              const x = startX + j * (larguraBloco + espacamentoX);
              const y = offsetTopo + i * (alturaBloco + espacamentoY);
              this.blocos.push(new Bloco(x, y, larguraBloco, alturaBloco));
          }
      }
  }

  lidarComMouseDown(event) {
      
      const mouseX = event.clientX - this.canvas.getBoundingClientRect().left;
      const mouseY = event.clientY - this.canvas.getBoundingClientRect().top;

      if (
          mouseX > this.jogador.x &&
          mouseX < this.jogador.x + this.jogador.largura &&
          mouseY > this.jogador.y &&
          mouseY < this.jogador.y + this.jogador.altura
      ) {
          this.mousePressionado = true;
          this.offsetMouseX = mouseX - this.jogador.x;
      }
  }

  lidarComMouseMove(event) {
      if (this.mousePressionado && !this.gameOver) {
          
          const mouseX = event.clientX - this.canvas.getBoundingClientRect().left;
          let novaRaqueteX = mouseX - this.offsetMouseX;

          if (novaRaqueteX < 0) {
              novaRaqueteX = 0;
          } else if (novaRaqueteX + this.jogador.largura > this.canvas.width) {
              novaRaqueteX = this.canvas.width - this.jogador.largura;
          }
          this.jogador.x = novaRaqueteX;
      }
  }

  lidarComMouseUp() {
      this.mousePressionado = false;
  }
  


  atualizar() {
      if (this.gameOver) return;

      this.bola.mover();
      this.bola.colisaoParede(this.canvas.width, this.canvas.height);
      this.bola.colisaoRaquete(this.jogador);

      let todosBlocosDestruidos = true;
      for (let i = this.blocos.length - 1; i >= 0; i--) {
          const bloco = this.blocos[i];
          if (bloco.vivo) {
              todosBlocosDestruidos = false;
              if (this.bola.colisaoBloco(bloco)) {
                  this.pontuacao += 10;
                  this.pontuacaoDisplay.textContent = this.pontuacao;
              }
          }
      }

      if (todosBlocosDestruidos) {
          this.gameOver = true;
          this.mostrarMensagemVitoria();
      }

      if (this.bola.y + this.bola.raio > this.canvas.height) {
          this.gameOver = true;
          this.mostrarGameOver();
      }
  }

  mostrarMensagemVitoria() {
      if (this.pontuacao > this.recorde) {
          this.recorde = this.pontuacao;
          localStorage.setItem("recorde", this.recorde);
          this.recordeDisplay.textContent = this.recorde;
      }
      this.reiniciarBtn.classList.remove("hidden");
      this.reiniciarBtn.classList.add("visible");
      cancelAnimationFrame(this.loopId);
      this.mensagemFinal = "VOCÊ VENCEU!";
      this.canvas.classList.add("game-over-effect");
  }

  mostrarGameOver() {
      if (this.pontuacao > this.recorde) {
          this.recorde = this.pontuacao;
          localStorage.setItem("recorde", this.recorde);
          this.recordeDisplay.textContent = this.recorde;
      }

      this.reiniciarBtn.classList.remove("hidden");
      this.reiniciarBtn.classList.add("visible");

      cancelAnimationFrame(this.loopId);
      this.mensagemFinal = "Game Over";
      this.canvas.classList.add("game-over-effect");
  }

  resetarJogo() {
      this.gameOver = false;
      this.pontuacao = 0;
      this.pontuacaoDisplay.textContent = this.pontuacao;
      this.bola = new Bola(this.canvas.width / 2, this.canvas.height - 70, 10);
      this.jogador = new Jogador(this.canvas.width / 2 - 50, this.canvas.height - 50, 100, 20);
      this.inicializar();
      this.reiniciarBtn.classList.remove("visible");
      this.reiniciarBtn.classList.add("hidden");
      this.mensagemFinal = "";
      this.canvas.classList.remove("game-over-effect");
      this.loop();
  }

  renderizar() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.jogador.desenhar(this.ctx);
      this.bola.desenhar(this.ctx);
      for (let bloco of this.blocos) {
          bloco.desenhar(this.ctx);
      }

      if (this.gameOver) {
          this.ctx.fillStyle = "white";
          this.ctx.font = "40px 'Press Start 2P', cursive";
          this.ctx.textAlign = "center";
          this.ctx.fillText(this.mensagemFinal, this.canvas.width / 2, this.canvas.height / 2 - 30);
          this.ctx.font = "20px 'Press Start 2P', cursive";
          this.ctx.fillText(`Pontuação Final: ${this.pontuacao}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      }
  }

  loop() {
      this.atualizar();
      this.renderizar();
      if (!this.gameOver) {
          this.loopId = requestAnimationFrame(() => this.loop());
      }
  }
}

window.onload = () => {
  const canvas = document.getElementById("canvas");
  const jogo = new Jogo(canvas);
  jogo.loop();
};