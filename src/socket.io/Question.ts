import syncDb from "better-sqlite3";
const db = new syncDb("src/database/data.db", { readonly:true });

class Question {
    private _id: number;
    private _text: string;
    private _idCategory: number;
    private _nbAnswers: number;
    private _answers: Map<number, string>;
    private _realAnswer: number;

    constructor(nbAnswers: number) {
        this._nbAnswers = nbAnswers;
        this._id = Math.floor(Math.random() * this.nbQuestionsInDb());
        if (this._id < 1) this._id = 1;
        this.generateQuestion();
        this._answers = new Map<number, string>();
        this.generateRealAnswer();
        this.generateFakeAnswers();
    }


    get question():string { return this._text }
    get answers():Array<string> { return Array.from(this._answers.values()); }


    private generateQuestion(): void {
        let query: string = "SELECT * FROM Question WHERE question_id = ?";
        
        const question = db.prepare(query).get(Math.trunc(this._id));
        const items: Array<any> = Object.values(question);

        this._text = String(items[1]);
        this._idCategory = +items[3];
        this._realAnswer = +items[4];
    }


    private generateRealAnswer() {
        let query: string = "SELECT answer_id, answer_text FROM Answer WHERE answer_id = ?";
        const result = db.prepare(query).all(this._realAnswer);

        let id: number = +result[0].answer_id;
        let text: string = String(result[0].answer_text);
        this._answers.set(id, text);
    }


    private generateFakeAnswers(){
        let query: string = "SELECT answer_id, answer_text FROM Answer WHERE answer_category_id = ? AND answer_id != ? LIMIT ?";
        const result = db.prepare(query).all(this._idCategory, this._realAnswer, this._nbAnswers-1);

        result.forEach(item => {
            let id: number = +item.answer_id;
            let text: string = String(item.answer_text);
            this._answers.set(id, text);
        });
    }


    private nbQuestionsInDb(): number {
        let query: string = "SELECT COUNT(question_id) FROM Question";
        let result: JSON = db.prepare(query).get()
        return +Object.values(result)[0];
    }


    public toString(): string {
        let result: string = "";

        result += "Question: " + this._text;
        this._answers.forEach(answer => {
            result += "\n - " + answer;
        });

        result += "\nReal answer is: " + this._answers.get(this._realAnswer);;

        return result;
    }


    public getIdOfAnswer(answer: string): number {
        for (let [k,v] of this._answers.entries()){
            if (v == answer) return k;
        }
        return -1;
    }


    public isRealAnswer(answerId: number): boolean {
        return answerId == this._realAnswer;
    }
}

export default Question;