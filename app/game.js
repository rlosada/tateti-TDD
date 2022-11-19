const EMPTY_SYMBOL      = ' ';          // simbolo usado para inicializar el tablero
const PLAYER_SYMBOLS    = ["x", "o"];   // simbolos para los jugadores
const NUMBER_OF_PLAYERS = 2;            
const MAX_COL_INDEX     = 2;
const MIN_COL_INDEX     = 0;
const MAX_ROW_INDEX     = 2;
const MIN_ROW_INDEX     = 0;

let game = { inited : false }; // Objeto que contiene el estado de la partida de tateti

module.exports = {
    game_init   : init,
    game_status : get_status,
    game_update : update
}

/*------------------------------------------------------------------*
 * init(players)											        *
 *                                                                  *
 * Entrada:		players      Arreglo de strings que tiene los nom-  *
 *                           bres de los jugadores.                 *
 *                                                                  *
 * Retorno: 	true o false										*
 *                                                                  *
 * Descripcion:	Inicializa la estructura que contiene el estado de  *
 *              la partida de tateti.                               *
 *------------------------------------------------------------------*/

function init(players) {

    // Validar
    if(players === undefined) {
        return false;
    }
    
    if(!Array.isArray(players) ||  players.length !== NUMBER_OF_PLAYERS)
        return false;
    
    if(typeof(players[0]) !== "string" || typeof(players[1]) !== "string")        
        return false;

    if(players[0].toLowerCase() === players[1].toLowerCase())
        return false;

    // Inicializar
    game.inited    = true;
    game.players   = players;
    game.nextTurn  = game.players[0];
    game.winner    = "";
    game.finished  = false;
    game.board     = [
        [EMPTY_SYMBOL, EMPTY_SYMBOL, EMPTY_SYMBOL],
        [EMPTY_SYMBOL, EMPTY_SYMBOL, EMPTY_SYMBOL],
        [EMPTY_SYMBOL, EMPTY_SYMBOL, EMPTY_SYMBOL],
    ];    

    return true;
}

/*------------------------------------------------------------------*
 * init(movement)											        *
 *                                                                  *
 * Entrada:		movement     Movimiento a realizar                  *
 *                                                                  *
 * Retorno: 	true o false										*
 *                                                                  *
 * Descripcion:	Realiza un movimiento sobre el tablero              *
 *------------------------------------------------------------------*/

function update(movement) {
    
    let mov_obj;

    mov_obj = parse_movement(movement)
    if (mov_obj === null)
        return false;

    // El player que llego en la peticion debe ser igual al que se esperaba
    if(mov_obj.player !== game.nextTurn) 
        return false;

    return game_move(mov_obj);
}

/*------------------------------------------------------------------*
 * get_status()											            *
 *                                                                  *
 * Entrada:		No posee                                            *
 *                                                                  *
 * Retorno: 	status        Objeto que representa el nuevo estado	*
 *                                                                  *
 * Descripcion:	Devuelve el estado actual del juego                 *
 *------------------------------------------------------------------*/

function get_status() {

    let status; 

    if (game.finished === true) {
        if(game.tie === true) 
            status =  { "tie" : true };
        else 
            status =  { "winner" : game.winner };
    } else {
        status = {
            "nextTurn"  : game.nextTurn,
            "board"     : game.board,
        };
    }

    return status;
}

// =====================================================================
// Funciones internas
// =====================================================================

/*------------------------------------------------------------------*
 * game_move(mov_obj)									            *
 *                                                                  *
 * Entrada:		mov_obj       Movimiento a realizar                 *
 *                                                                  *
 * Retorno: 	status        Objeto que representa el nuevo estado	*
 *                                                                  *
 * Descripcion:	Realiza el movimiento y actualiza el estado del     *
 *              juego.                                              *
 *------------------------------------------------------------------*/

function game_move(mov_obj) {
    
    let symbol;

      // Si la casilla ya esta en uso, salir sin modificar el turno
    if(game.board[mov_obj.row][mov_obj.column] !== EMPTY_SYMBOL)  
        return false;

    if (mov_obj.player === game.players[0]) {
        symbol        = PLAYER_SYMBOLS[0];
        game.nextTurn = game.players[1];    
    } else {
        symbol        = PLAYER_SYMBOLS[1];
        game.nextTurn = game.players[0];    
    }

    game.board[mov_obj.row][mov_obj.column] = symbol;
    
    check_game(mov_obj);
    
    return true;
}

/*------------------------------------------------------------------*
 * check_game(mov_obj)									            *
 *                                                                  *
 * Entrada:		mov_obj       Movimiento realizado                  *
 *                                                                  *
 * Retorno: 	No posee                                            *
 *                                                                  *
 * Descripcion:	Verifica si el juego termino                        *
 *------------------------------------------------------------------*/

function check_game(mov_obj) {

    // Recorrer las columnas y verificar si todas poseen el mismo simbolo
    for(let column = 0; column < 3; column++) {
        if(game.board[0][column] === game.board[1][column] && game.board[0][column] === game.board[2][column] && game.board[0][column] != EMPTY_SYMBOL) {
            game.finished = true;
            game.winner = mov_obj.player;
            return;
        }
    }
    // Recorrer las filas y verificar si todas poseen el mismo simbolo
    for(let row = 0; row < 3; row++) {
        if(game.board[row][0] === game.board[row][1] && game.board[row][0] === game.board[row][2] && game.board[row][0] != EMPTY_SYMBOL) {
            game.finished = true;
            game.winner = mov_obj.player;
            return;
        }
    }    
    // Verificar las diagonales
    if(game.board[0][0] === game.board[1][1] && game.board[0][0] === game.board[2][2] && game.board[0][0] != EMPTY_SYMBOL) {
        game.finished = true;
        game.winner = mov_obj.player;
        return;
    }
    if(game.board[2][0] === game.board[1][1] && game.board[2][0] === game.board[0][2] && game.board[2][0] != EMPTY_SYMBOL) {
        game.finished = true;
        game.winner = mov_obj.player;
        return;
    }    
    //  Verificar si todavia quedan movimientos
    let pending_moves = 0
    for(let column = 0;  column < 3; column++) {
        for(let row = 0; row < 3; row++) {
            if(game.board[column][row] === EMPTY_SYMBOL) 
                pending_moves++;
        }
    }

    if(pending_moves === 0) {
        game.tie      = true;
        game.finished = true;
    }

    return;
}

/*------------------------------------------------------------------*
 * parse_movement(movement)									        *
 *                                                                  *
 * Entrada:		movement       Movimiento a realizar                *
 *                                                                  *
 * Retorno: 	Un objeto que representa el movimiento              *
 *                                                                  *
 * Descripcion:	Parsea el movimiento recibido y genera un objeto    *
 *              que lo representa.                                  *
 *------------------------------------------------------------------*/

function parse_movement(movement) {
    
    const PARAMETERS = [
        { name: "player", type : "string" },
        { name: "column", type : "number" },
        { name: "row",    type : "number" },
    ];

    // Verificar que todos los parametros esten y sean del tipo adecuado
    for(let i = 0; i < PARAMETERS.length; i++) {
        let key = PARAMETERS[i].name;
        let type = PARAMETERS[i].type;
        if (movement[key] === undefined || typeof(movement[key]) !== type) 
            return null;
    }

    let player = movement[PARAMETERS[0].name];
    let column = movement[PARAMETERS[1].name];
    let row    = movement[PARAMETERS[2].name];   

    if (game.players.find((p) => p === player) === undefined)
        return null;

    if(column < MIN_COL_INDEX || column > MAX_COL_INDEX)
        return null;

    if(row < MIN_ROW_INDEX || row > MAX_ROW_INDEX)
        return null;

    // Devolver los parametros
    return {
        player : movement[PARAMETERS[0].name],
        column : movement[PARAMETERS[1].name],
        row    : movement[PARAMETERS[2].name],    
    };
}


