// Funciones para manipular el GAME
const game_update   = require('../app/game').game_update
const game_status   = require('../app/game').game_status


/*------------------------------------------------------------------*
 * put(req, res, next)								                *
 *                                                                  *
 * Entrada:		req           Request HTTP                          *
 *              next          Next Middleware Callback              *
 *                                                                  *
 * Salida:      res           Respuesta HTTP                        *
 *                                                                  *
 * Retorno: 	true o false										*
 *                                                                  *
 * Descripcion:	Procesa un PUT en el endpoint                       *
 *------------------------------------------------------------------*/

function put(req, res, next) {

    if(game_update(req.body) === false) {
        res.sendStatus(409)
        return
    }

    res.status(200);
    res.send(game_status());

    return;
}

module.exports = { 
    put : put 
}