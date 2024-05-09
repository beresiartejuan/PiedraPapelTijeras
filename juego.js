const round_html = document.querySelector("#round"); // RONDA: X
const score_html = document.querySelector("#score"); // Maquina - Yo
const pc_message_html = document.querySelector("#pc-message"); // Mensaje de la maquina!

const piedra_html = document.querySelector("#piedra");
const papel_html = document.querySelector("#papel");
const tijera_html = document.querySelector("#tijera");

/**
 * 
 *   FUNCIONES AUXILIARES
 * 
 */

function obtenerOpcionRandom(opciones = []) {
    const max = opciones.length - 1;
    const min = 0;
    return opciones[Math.floor(Math.random() * (max - min + 1) + min)];
}

/**
 * 
 *   FUNCIONES DE LOGICA
 * 
 */

/**
 * 
 *   VARIABLES
 * 
 */


/**
 * 
 *   BUCLES
 * 
 */