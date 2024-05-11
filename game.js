const velocidad_transicion = 1500;

const eventos = {
    entrada_usuario: "esperando-usuario",
    partida_terminada: "partida-terminada",
    mostrar_resultados: "mostrar-resultados",
    turno_computadora: "turno-computadora",
    juego_terminado: "juego-terminado"
}

class Game {
    constructor(puntosMaximos) {
        this.opciones = {
            papel: 0,
            piedra: 1,
            tijera: 2
        };
        this.puntosMaximos = puntosMaximos;
        this.jugador = { victorias: 0, movimiento: undefined };
        this.computadora = { victorias: 0, movimiento: undefined };
        this.observers = {};
        this.partida = 1;
        this.esperando_usuario = false;
    }

    subscribir(event, observer) {
        if (!this.observers[event]) this.observers[event] = [];
        this.observers[event].push(observer);
    }

    notify(event, data) {
        this.observers[event]?.forEach(observer => observer(data));
    }

    empezar() {
        this.esperando_usuario = true;
        this.notify(eventos.entrada_usuario);
    }

    jugar(opcionUsuario) {
        if (!this.seSigueJugando()) return;
        if (!this.esperando_usuario) return;

        this.jugador.movimiento = opcionUsuario;
        this.esperando_usuario = false;
        this.jugarComputadora();
    }

    jugarComputadora() {
        this.computadora.movimiento = this.obtenerOpcionRandom(Object.values(this.opciones));
        this.notify(eventos.turno_computadora);

        setTimeout(this.evaluarMovimientos.bind(this), velocidad_transicion);
    }

    obtenerOpcionRandom(opciones) {
        const min = 0;
        const max = opciones.length - 1;
        return opciones[Math.floor(Math.random() * (max - min + 1) + min)];
    }

    siguientePartida() {
        this.jugador.movimiento = undefined;
        this.computadora.movimiento = undefined;
        this.partida++;
    }

    evaluarMovimientos() {
        let seSigue = this.seSigueJugando();
        if (!seSigue) return;
        if (this.jugador.movimiento === undefined || this.computadora.movimiento === undefined) return;

        const resultados = {
            [this.opciones.piedra]: {
                [this.opciones.tijera]: 1,
                [this.opciones.papel]: 2,
                [this.opciones.piedra]: 0,
            },
            [this.opciones.papel]: {
                [this.opciones.piedra]: 1,
                [this.opciones.tijera]: 2,
                [this.opciones.papel]: 0,
            },
            [this.opciones.tijera]: {
                [this.opciones.papel]: 1,
                [this.opciones.piedra]: 2,
                [this.opciones.tijera]: 0
            }
        };

        let resultado = resultados[this.jugador.movimiento][this.computadora.movimiento];
        if (resultado === 1) {
            this.jugador.victorias++;
        } else if (resultado === 2) {
            this.computadora.victorias++;
        }

        this.notify(eventos.mostrar_resultados, resultado);

        setTimeout(this.siguientePartida.bind(this), velocidad_transicion);

        setTimeout((function () {
            this.notify(eventos.partida_terminada);

            if (this.seSigueJugando()) {
                this.esperando_usuario = true;
                this.notify(eventos.entrada_usuario);
            } else {
                this.notify(eventos.juego_terminado);
            }

        }).bind(this), velocidad_transicion * 2);
    }

    seSigueJugando() {
        return (this.jugador.victorias + this.computadora.victorias) < this.puntosMaximos;
    }
}

class GameUI {
    constructor(game = new Game(5)) {
        this.game = game;
        this.initElements();
        this.attachEventListeners();
        this.actualizarScore();

        game.subscribir(eventos.partida_terminada, () => {
            this.actualizarScore();
        });

        game.subscribir(eventos.entrada_usuario, () => {
            this.ponerMensaje("Es tu turno...");
        });

        game.subscribir(eventos.turno_computadora, () => {
            this.ponerMensaje("El PC eligió " + Object.keys(this.game.opciones)[this.game.computadora.movimiento]);
        });

        game.subscribir(eventos.mostrar_resultados, (resultado) => {
            let computadora = Object.keys(this.game.opciones)[this.game.computadora.movimiento];
            let jugador = Object.keys(this.game.opciones)[this.game.jugador.movimiento];

            let mensajes = { 0: 'Empate!', 1: 'Ganaste!', 2: 'Perdiste!' };

            this.ponerMensaje(`${computadora} VS ${jugador}: ${mensajes[resultado]}`);
        });

        game.subscribir(eventos.juego_terminado, () => {
            this.actualizarScore();

            this.ponerMensaje(this.game.computadora.victorias > this.game.jugador.victorias ? "¡Perdiste! 😕" : "¡Ganaste! 🎉");
        });
    }

    initElements() {
        this.roundHtml = document.querySelector("#round");
        this.scoreLabelHtml = document.querySelector("#score-label");
        this.pcMessageHtml = document.querySelector("#pc-message");
        this.piedraHtml = document.querySelector("#piedra");
        this.papelHtml = document.querySelector("#papel");
        this.tijeraHtml = document.querySelector("#tijera");
    }

    attachEventListeners() {
        this.piedraHtml.addEventListener("click", () => this.game.jugar(this.game.opciones.piedra));
        this.papelHtml.addEventListener("click", () => this.game.jugar(this.game.opciones.papel));
        this.tijeraHtml.addEventListener("click", () => this.game.jugar(this.game.opciones.tijera));
    }

    actualizarScore() {
        let contenido = `PC: ${this.game.computadora.victorias}<br/>Jugador: ${this.game.jugador.victorias}`;
        this.roundHtml.innerHTML = `RONDA: ${this.game.partida}`;
        this.scoreLabelHtml.innerHTML = contenido;
    }

    capitalize(text) {
        return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
    }

    ponerMensaje(mensaje) {
        this.pcMessageHtml.innerHTML = mensaje;
    }
}

const game = new Game(5);
const ui = new GameUI(game);

game.empezar();