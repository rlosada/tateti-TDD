// Funciones para manipular el GAME
const game_init   = require('../app/game').game_init
const game_status = require('../app/game').game_status

/*------------------------------------------------------------------*
 * post(req, res, next)								                *
 *                                                                  *
 * Entrada:		req           Request HTTP                          *
 *              next          Next Middleware Callback              *
 *                                                                  *
 * Salida:      res           Respuesta HTTP                        *
 *                                                                  *
 * Retorno: 	true o false										*
 *                                                                  *
 * Descripcion:	Procesa un POST en el endpoint                      *
 *------------------------------------------------------------------*/

function post(req, res, next)  {

    if (req.body === undefined) {
        res.sendStatus(400);
        return;
    }

    if(game_init(req.body["players"]) === false) {
        res.sendStatus(400);
        return;
    }

    res.status(200);
    res.send(game_status());
    
    return;
}

module.exports = { 
    post : post 
}