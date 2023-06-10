import * as IO  from 'socket.io';
import logger   from '../logging/WinstonLogger';
import http     from 'http';
import Player   from './Player';
import Question from './Question';
import jwt      from "jsonwebtoken"


const MAX_PLAYERS: number = 3;
const NB_QUESTIONS: number = 10;
const NB_POSSIBLEANSWERS: number = 3;
const secretToken = process.env.FAKE_JWT_SECRET;

class ServerIO extends IO.Server {
    private players: Array<Player>;
    private questions: Array<Question>;

    constructor(server: http.Server) {
        super(server, {
            cors: {
                origin: '*'
            }
        });

        this.players = [];
        this.questions = [];

        this.on('connection', (socket: IO.Socket) => {
            logger.info("Socket " + socket.id + " for " + socket.client.conn.remoteAddress + " created");
            socket.emit("clean page");
            this.registerEventsOnSocket(socket);
        });
    }


    private addPlayer(socket: IO.Socket, username:string) {
        let player: Player = new Player(socket.id, username);
        console.log("Player \"" + player.name + "\" with id "+ player.id + " added");
        this.players.push(player);
    }
    

    private launchGame(){
        let playersNames: Array<string> = [];


        this.players.forEach(player => {
            playersNames.push(player.name);
        });

        this.sockets.emit("message", "The game is going to start !");
        this.sockets.emit("game ready", playersNames);
        this.createAndSendQestion();
    }

    
    private createAndSendQestion() {
        let newQuestion: Question = new Question(NB_POSSIBLEANSWERS);
        this.questions.push(newQuestion);
        this.sockets.emit("question", { question : newQuestion.question, answers : Array.of(newQuestion.answers)});
    }


    private registerEventsOnSocket(socket: IO.Socket) {
        socket.on("message", (message: string) => {
            console.log(message)
        });
        

        socket.on("create player", (data) => {
            let username: string = data.username;
            let token: string = data.token;

            if (!this.verifyJWT(token)) {
                socket.emit("connection refused");
                socket.disconnect();

            } else if (this.players.length < MAX_PLAYERS) {
                this.addPlayer(socket, username);
                console.log(this.players.length + "/" + MAX_PLAYERS + " players currently in room");
                socket.send("Welcome " + username);
                socket.broadcast.emit("message", username + " joined the game");
    
                if (this.players.length == MAX_PLAYERS) this.launchGame();
    
            } else {
                console.log(username + " rejected");
                socket.emit("message", "Game room is full, cannot join");
                socket.disconnect();
            }
        });



        socket.on("answer", (answer: string) => {
            let player: Player = this.getPlayerBySocketId(socket.id);
            let currentQuestion: Question = this.questions.at(-1);
            this.sockets.emit("message",  player.name + " answered.");

            let answer_id: number = currentQuestion.getIdOfAnswer(answer);
            let isCorrect: boolean = currentQuestion.isRealAnswer(answer_id);
            console.log(player.name + " says its " + answer + " which is " + isCorrect);

            if (isCorrect) player.incrementScore();
            else player.decrementScore();

            if (this.questions.length < NB_QUESTIONS) {
                this.createAndSendQestion();
            } else {
                this.sockets.emit("message", "The game has ended");
                let leaderboard: Array<string> = [];
                this.players.sort((a, b) => (a.score < b.score) ? 1:-1);

                this.players.forEach(player => {
                    leaderboard.push(player.name + ", score: " + player.score);
                });

                this.sockets.emit("end game");
                this.sockets.emit("leaderboard", leaderboard);
                this.sockets.disconnectSockets();     
            }
        });


        socket.on('disconnect', _ => {
            let leavingPlayer: Player = this.players.filter(player => player.id == socket.id)[0];
            this.players = this.players.filter(player => player.id != socket.id);

            logger.warn("Socket "+ socket.id +" for " + socket.client.conn.remoteAddress+" closed");
            if (leavingPlayer)
                socket.broadcast.emit("message",  leavingPlayer.name + " left the game, " + this.players.length + " player(s) remaining");
        });

    }

    private verifyJWT(token: string) {
        if (!token) return false;  
        let status: boolean = true;
    
        jwt.verify(token, secretToken, (error: Error) => {
            if (error) status = false;
        });
        
        return status;
    }


    private getPlayerBySocketId (socketId:string): Player {
        return this.players.find(player => player.id == socketId);
    }
}


export default ServerIO;