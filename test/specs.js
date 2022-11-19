
let chai     = require("chai");
let chaihttp = require("chai-http");
let server   = require("../app");
let should   = chai.should();

chai.use(chaihttp);

// Nombres de los campos buscados en los objetos json recibidos como respuesta
const NEXT_TURN_PARAM = "nextTurn";
const BOARD_PARAM     = "board";
const WINNER_PARAM    = "winner";
const TIE_PARAM       = "tie";

describe("Juego del Tateti", () => {

    let game = {
        players: ['Juan', 'Pedro']
    }

    let movements = [
        { player : 'Juan',  column : 0, row : 0 },
        { player : 'Pedro', column : 1, row : 0 },
        { player : 'Juan',  column : 0, row : 1 },
        { player : 'Pedro', column : 1, row : 1 },
        { player : 'Juan',  column : 0, row : 2 },  
        { player : 'Pedro', column : 1, row : 2 },
    ]

    describe("Intentos de inicializacion", () => {


         it("Caso 1 : Inicializar sin enviar body", async () => {
             res = await chai.request(server).post("/begin").send();
             res.should.have.status(400);
         });

        it("Caso 2 : Inicializar enviando un body incorrecto", async () => {
            res = await chai.request(server).post("/begin").send({ });
            res.should.have.status(400);
        });

        it("Caso 3 : Inicializar enviando un arreglo de jugadores vacio", async () => {
            res = await chai.request(server).post("/begin").send({ players : [] });
            res.should.have.status(400);
        });

        it("Caso 4 : Inicializar enviando un arreglo de menos jugadores que lo permitido", async () => {
            res = await chai.request(server).post("/begin").send({ players : ["Juan"] });
            res.should.have.status(400);
        });

        it("Caso 5 : Inicializar enviando un arreglo de mas jugadores que lo permitido", async () => {
            res = await chai.request(server).post("/begin").send({ players : ["Juan", "Maria", "Ana"] });
            res.should.have.status(400);
        });

        it("Caso 6 : Inicializar enviando un arreglo con dos jugadores con el mismo nombre", async () => {
            res = await chai.request(server).post("/begin").send({ players : ["Juan", "Juan"] });
            res.should.have.status(400);
        });

        it("Caso 7 : Inicializar enviando un arreglo con un elemento que no es string", async () => {
            res = await chai.request(server).post("/begin").send({ players : ["Juan", 45] });
            res.should.have.status(400);
        });     

        it("Caso 8 : Inicializar enviando un arreglo con dos jugadores con el mismo nombre pero distinto case", async () => {
            res = await chai.request(server).post("/begin").send({ players : ["Juan", "JUAN"] });
            res.should.have.status(400);
        });        
        
        it("Caso 9 : Inicializar correctamente", async () => {
            let players              = ["Juan", "Pedro"]
            let expected_player      = players[0]
            let expected_response    =  [
                                            [' ', ' ', ' '],
                                            [' ', ' ', ' '],
                                            [' ', ' ', ' '],
                                        ];            

            res = await chai.request(server).post("/begin").send({ players : players });
            res.should.have.status(200);
            
            res.should.to.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property(NEXT_TURN_PARAM).eql(expected_player);
            res.body.should.have.property(BOARD_PARAM).eql(expected_response);            
        });   

     });

     describe("Movimientos", () => {

        it("Se comienza el juego , Juan realiza su movimiento",  (done) => {

            let expected_next_player = game.players[1];
            let expected_response    =  [
                                            ['x', ' ', ' '],
                                            [' ', ' ', ' '],
                                            [' ', ' ', ' '],
                                        ];
            
            chai.request(server).post("/begin").send(game).end();

            chai.request(server).put("/movement").send(movements[0]).end((err, res) => { 
                res.should.have.status(200);
                res.should.to.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property(NEXT_TURN_PARAM).eql(expected_next_player);
                res.body.should.have.property(BOARD_PARAM).eql(expected_response);
                done();
            });
        });

        it("Se comienza el juego. Juan realiza su movimiento y luego Pedro",  (done) => {
            let expected_next_player = game.players[0];
            let expected_response    = [
                ['x', 'o', ' '],
                [' ', ' ', ' '],
                [' ', ' ', ' '],
            ];
            
            chai.request(server).post("/begin").send(game).end();
            chai.request(server).put("/movement").send(movements[0]).end();    
            chai.request(server)
                .put("/movement")
                .send(movements[1])
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property(NEXT_TURN_PARAM).eql(expected_next_player);
                    res.body.should.have.property(BOARD_PARAM).eql(expected_response);
                    done();
                });
        });
     });
    
    describe("Movimientos incorrectos", () => {

        it("Se comienza el juego. Juan realiza un movimiento invalido (columna)",  (done) => {
            
            chai.request(server).post("/begin").send(game).end();
            chai.request(server)
                .put("/movement")
                .send({ player : 'Juan', column : 90, row : 0})
                .end((err, res) => {
                    res.should.have.status(409);
                    done();
                });
        });
    
        it("Se comienza el juego. Juan realiza un movimiento invalido (fila)",  (done) => {
            
            chai.request(server).post("/begin").send(game).end();
            chai.request(server)
                .put("/movement")
                .send({ player : 'Juan', column : 0, row : -2})
                .end((err, res) => {
                    res.should.have.status(409);
                    done();
                });
        });
    
        it("Se comienza el juego. Un tercer jugador pretende hacer un movimiento",  (done) => {

            let game = {
                players: ['Juan', 'Pedro']
            }
            
            chai.request(server).post("/begin").send(game).end();
            chai.request(server)
                .put("/movement")
                .send({ player : 'Clara', column : 0, row : 2})
                .end((err, res) => {
                    res.should.have.status(409);
                    done();
                });
        });            

        it("Juan pretende hacer dos movimientos consecutivos", (done) => {
            
            chai.request(server).post("/begin").send(game).end();                // Movimientos:
            chai.request(server).put("/movement").send(movements[0]).end();     // Juan         
            chai.request(server).put("/movement").send(movements[1]).end();     // Pedro
            chai.request(server).put("/movement").send(movements[2]).end();     // Juan

            chai.request(server)
                .put("/movement")
                .send(movements[4])                                             // Juan
                .end((err, res) => {
                    res.should.have.status(409);
                    done();
                });
        });

        it("Juan intenta realizar un movimiento sobre una casilla a ocupada", (done) => {

            chai.request(server).post("/begin").send(game).end();                // Movimientos:
            chai.request(server).put("/movement").send(movements[0]).end();     // Juan
            chai.request(server).put("/movement").send(movements[1]).end();     // Pedro
            chai.request(server).put("/movement").send(movements[2]).end();     // Juan
            chai.request(server).put("/movement").send(movements[3]).end();     // Pedro
   
            chai.request(server)
                .put("/movement")
                .send(movements[0])                                             // Juan
                .end((err, res) => {
                    res.should.have.status(409);
                    done();
                });
        });    
        
        it("Se intenta realizar un movimiento sin enviar el body", (done) => {

            chai.request(server).post("/begin").send(game).end();                // Movimientos:
            chai.request(server).put("/movement").send(movements[0]).end();     // Juan
            chai.request(server).put("/movement").send(movements[1]).end();     // Pedro
            chai.request(server).put("/movement").send(movements[2]).end();     // Juan
            chai.request(server).put("/movement").send(movements[3]).end();     // Pedro
            
            chai.request(server)
                .put("/movement")
                .send()                                             // Juan
                .end((err, res) => {
                    res.should.have.status(409);
                    done();
                });
        });           
    });  
    
    describe("Resultados partida", () => {
        
        it("Juan gana completando una columna", (done) => {

            let expected_winner = game.players[0];
            
            chai.request(server).post("/begin").send(game).end();                // Movimientos:
            chai.request(server).put("/movement").send(movements[0]).end();     // Juan
            chai.request(server).put("/movement").send(movements[1]).end();     // Pedro
            chai.request(server).put("/movement").send(movements[2]).end();     // Juan
            chai.request(server).put("/movement").send(movements[3]).end();     // Pedro

            chai.request(server)
                .put("/movement")
                .send(movements[4])                                             // Juan
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property(WINNER_PARAM).eql(expected_winner);
                    done();
                });
        });

        it("Pedro gana completando una fila", (done) => {

            let expected_winner = 'Pedro';

            let movements = [
                { player : 'Juan',  column : 0, row : 0 },
                { player : 'Pedro', column : 0, row : 1 },
                { player : 'Juan',  column : 2, row : 2 },
                { player : 'Pedro', column : 1, row : 1 },
                { player : 'Juan',  column : 1, row : 2 },  
                { player : 'Pedro', column : 2, row : 1 },
            ]
            
            chai.request(server).post("/begin").send(game).end();                // Movimientos:
            chai.request(server).put("/movement").send(movements[0]).end();     // Juan
            chai.request(server).put("/movement").send(movements[1]).end();     // Pedro
            chai.request(server).put("/movement").send(movements[2]).end();     // Juan
            chai.request(server).put("/movement").send(movements[3]).end();     // Pedro
            chai.request(server).put("/movement").send(movements[4]).end();     // Juan

            chai.request(server)
                .put("/movement")
                .send(movements[5])                                             // Pedro
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property(WINNER_PARAM).eql(expected_winner);
                    done();
                });
        });   
        
        it("Pedro gana completando una diagonal", (done) => {

            let expected_winner = 'Pedro';

            let movements = [
                { player : 'Juan',  column : 0, row : 0 },
                { player : 'Pedro', column : 0, row : 2 },
                { player : 'Juan',  column : 2, row : 2 },
                { player : 'Pedro', column : 1, row : 1 },
                { player : 'Juan',  column : 1, row : 2 },  
                { player : 'Pedro', column : 2, row : 0 },
            ]
            
            chai.request(server).post("/begin").send(game).end();                // Movimientos:
            chai.request(server).put("/movement").send(movements[0]).end();     // Juan
            chai.request(server).put("/movement").send(movements[1]).end();     // Pedro
            chai.request(server).put("/movement").send(movements[2]).end();     // Juan
            chai.request(server).put("/movement").send(movements[3]).end();     // Pedro
            chai.request(server).put("/movement").send(movements[4]).end();     // Juan

            chai.request(server)
                .put("/movement")
                .send(movements[5])                                             // Pedro
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property(WINNER_PARAM).eql(expected_winner);
                    done();
                });
        });   

        it("Juan gana completando una diagonal", (done) => {

            let expected_winner = 'Juan';

            let movements = [
                { player : 'Juan',  column : 0, row : 0 },
                { player : 'Pedro', column : 0, row : 2 },
                { player : 'Juan',  column : 1, row : 1 },
                { player : 'Pedro', column : 0, row : 1 },
                { player : 'Juan',  column : 2, row : 2 },  
            ]
            
            chai.request(server).post("/begin").send(game).end();                // Movimientos:
            chai.request(server).put("/movement").send(movements[0]).end();     // Juan
            chai.request(server).put("/movement").send(movements[1]).end();     // Pedro
            chai.request(server).put("/movement").send(movements[2]).end();     // Juan
            chai.request(server).put("/movement").send(movements[3]).end();     // Pedro

            chai.request(server)
                .put("/movement")
                .send(movements[4])                                             // Pedro
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property(WINNER_PARAM).eql(expected_winner);
                    done();
                });
        });         

        it("Empate", (done) => {

            let movements = [
                { player : 'Juan',  column : 1, row : 0 },
                { player : 'Pedro', column : 0, row : 0 },
                { player : 'Juan',  column : 2, row : 0 },
                { player : 'Pedro', column : 1, row : 1 },
                { player : 'Juan',  column : 0, row : 1 },  
                { player : 'Pedro', column : 1, row : 2 },
                { player : 'Juan',  column : 0, row : 2 },
                { player : 'Pedro', column : 2, row : 1 },  
                { player : 'Juan',  column : 2, row : 2 },
            ]

            chai.request(server).post("/begin").send(game).end();                // Movimientos:
            
            // Los primeros 8 movimientos
            for(let i = 0; i < 8; i++) 
                chai.request(server).put("/movement").send(movements[i]).end();     
            
            // Ultimo movimiento
            chai.request(server)
                .put("/movement")
                .send(movements[8])                                             // Pedro
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.to.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property(TIE_PARAM).eql(true);
                    done();
                });
        });           
      
    }); 
})