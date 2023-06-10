const GOOD_ANSWER = 1;
const BAD_ANSWER = -2;

class Player {
    private _id:string;
    private _name:string;
    private _score:number;

    constructor (id:string, name:string){
        this._id = id;
        this._name = name;
        this._score = 0;
    }

    get id() {return this._id}
    get name() {return this._name}
    get score() {return this._score}

    public incrementScore() {this._score+=GOOD_ANSWER;}
    public decrementScore() {this._score+=BAD_ANSWER;}
}

export default Player