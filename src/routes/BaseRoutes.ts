import express                  from 'express';
import { StatusCodes }          from 'http-status-codes';
import db                       from '../database/database';
import bcrypt                   from 'bcryptjs';
import jwt                      from 'jsonwebtoken';


const router: express.Router = express.Router();

const secretToken = process.env.FAKE_JWT_SECRET;

// returns userId or -1 if token doesn't exists
function getJWTUserId(req: express.Request): number {
    if (!req.headers.authorization) return -1;

    let token:string = req.headers.authorization.toString().split(" ")[1];
    let payload:string = token.split(".")[1];
    let decodedPayload = JSON.parse(Buffer.from(payload, "base64").toString("binary"));

    return +decodedPayload.user_id;
}

// MIDDLEWARE
const adminJwtVerifier = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.headers.authorization) {
        res.send("Token missing !");
        res.status(StatusCodes.FORBIDDEN).end();
        return;
    }

    let token:string = req.headers.authorization.toString().split(" ")[1];
    let payload:string = token.split(".")[1];

    
    jwt.verify(token, secretToken, (error) => {
        if (error) {
            res.send("Invalid token !");
            res.status(StatusCodes.FORBIDDEN).end();
            return;
        }

        let decodedPayload = JSON.parse(Buffer.from(payload, "base64").toString("binary"));

        if (decodedPayload.user_type_id !== 1){
            res.send("You need to be admin to perform this operation.");
            res.status(StatusCodes.FORBIDDEN).end();
            return;
        }

        req.headers.userId = decodedPayload.user_id;

        next();
    });
};

// main route (useless) (OK)
router.get('/', (req: express.Request, res: express.Response) => {
    res.send("Welcome to API root directory !");
    res.status(StatusCodes.OK).end();
});

// list question (OK)
router.get('/questions/:id', adminJwtVerifier, (req: express.Request, res: express.Response) => {
    let requestId: number = +req.params.id;
    let query: string = "SELECT * FROM Question WHERE question_id = ?";

    if (requestId < 1){
        res.status(StatusCodes.BAD_REQUEST).end();
        return;
    }

    db.get(query, requestId, (error: any, row:any) => {
        if (error) {
            res.send(error);
            res.status(StatusCodes.NOT_FOUND).end();
            return;
        }

        res.send(row);
        res.status(StatusCodes.OK).end();
    });
});

// list questions (OK)
router.get('/questions', adminJwtVerifier, (req: express.Request, res: express.Response) => {
    let query: string = "SELECT * FROM Question";

    db.all(query, (error: any, rows:any) => {
        if (error) {
            res.send(error);
            res.status(StatusCodes.NOT_FOUND).end();
            return;
        }

        res.send(rows);
        res.status(StatusCodes.OK).end();
    });
});

// create question (OK)
router.post('/questions', adminJwtVerifier, (req: express.Request, res: express.Response) => {
    let question = req.body.question;
    let creatorId = req.body.creator_id; // get current user id ?
    let catergoryId = req.body.category_id;
    let query: string = "INSERT INTO Question (question_text, question_creator_id, question_category_id) VALUES (?,?,?)";


    if (question == null || creatorId == null || catergoryId == null) {
        res.send("ERROR: parameters missing !");
        res.status(StatusCodes.BAD_REQUEST).end();
        return;
    }
    
    
    db.run(query, question, creatorId, catergoryId, (error: any, rows:any) => {
        if (error) {
            res.send(error);
            res.status(StatusCodes.NOT_FOUND).end();
            return;
        }

        res.send("Insertion successfully done !");
        res.status(StatusCodes.CREATED).end();
    });
});

// get a question with x possible answers (OK)
router.get('/questions/:id/:nb', adminJwtVerifier, (req: express.Request, res: express.Response) => {
    let questionId: number = +req.params.id;
    let nbAnswers: number = +req.params.nb;
    let query: string = "SELECT question_text, answer_text FROM Question INNER JOIN Answer ON (question_category_id = answer_category_id) WHERE question_id = ? LIMIT ?";

    if (questionId < 1){
        res.status(StatusCodes.BAD_REQUEST).end();
        return;
    }

    if (nbAnswers < 2){
        res.send("The number of answers must be at least of 2.");
        res.status(StatusCodes.BAD_REQUEST).end();
        return;
    }

    
    db.all(query, questionId, nbAnswers, (error: Error, rows:any) => {
        if (error) {
            res.send(error);
            res.status(StatusCodes.NOT_FOUND).end();
            return;
        }

        res.send(rows);
        res.status(StatusCodes.OK).end();
    });
});

// update question (OK)
router.put('/questions/:id', adminJwtVerifier, (req: express.Request, res: express.Response) => {
    let requestId: number = +req.params.id;
    let question: string = req.body.question;
    let creatorId: string = req.body.creator_id;
    let catergoryId: string = req.body.category_id;
    let answerId: string = req.body.answer_id;
    let updateContent :string = "";
    let query: string = "";


    if (requestId < 1){
        res.status(StatusCodes.BAD_REQUEST).end();
        return;
    }

    if (!question && !creatorId && !catergoryId && !answerId) {
        res.send("ERROR: parameters missing !");
        res.status(StatusCodes.BAD_REQUEST).end();
        return;    
    }

    // setting UPDATE content depending on what we received
    if (question != null) updateContent += "question_text = \"" + question + "\","; 
    if (creatorId != null) updateContent += "question_creator_id = " + creatorId + ","; 
    if (catergoryId != null) updateContent += "question_category_id = " + catergoryId + ","; 
    if (answerId != null) updateContent += "question_answer_id = " + answerId + ","; 

    updateContent = updateContent.slice(0, -1); // get rid of last ','
    
    query = "UPDATE Question SET "+ updateContent +" WHERE question_id = ?"

    db.run(query, requestId, (error: Error, rows:any) => {
        if (error) {
            res.send(error);
            res.status(StatusCodes.NOT_FOUND).end();
            return;
        }

        res.send("Question successfully updated !");
        res.status(StatusCodes.OK).end();
    });
});

// delete question (OK)
router.delete('/questions/:id', adminJwtVerifier, (req: express.Request, res: express.Response) => {
    let requestId: number = +req.params.id;
    let query: string = "DELETE FROM Question WHERE question_id = ?";

    if (requestId < 1){
        res.status(StatusCodes.BAD_REQUEST).end();
        return;
    }
    
    db.run(query,requestId, (error: Error, rows:any) => {
        if (error) {
            res.status(StatusCodes.NOT_FOUND).end();
            return;
        }

        res.send("Question successfully deleted !");
        res.status(StatusCodes.OK).end();
    });
});

// list user (OK)
router.get('/users/:id', adminJwtVerifier, (req: express.Request, res: express.Response) => {
    let requestId: number = +req.params.id;
    let query: string = "SELECT * FROM User WHERE user_id = ?";

    if (requestId < 1){
        res.status(StatusCodes.BAD_REQUEST).end();
        return;
    }
    
    db.all(query, requestId, (error: Error, rows:any) => {
        if (error) {
            res.send(error);
            res.status(StatusCodes.NOT_FOUND).end();
            return;
        }
        
        res.send(rows);
        res.status(StatusCodes.OK).end();
    });
});

// list users (OK)
router.get('/users', adminJwtVerifier, (req: express.Request, res: express.Response) => {
    let query: string = "SELECT * FROM User";

    db.all(query, (error: Error, rows:any) => {
        if (error) {
            res.send(error);
            res.status(StatusCodes.NOT_FOUND).end();
            return;
        }

        res.send(rows);
        res.status(StatusCodes.OK).end();
    });
});

// create user (OK)
router.post('/users', (req: express.Request, res: express.Response) => {
    let username = req.body.username;
    let password = req.body.password;
    let userType = getJWTUserId(req) != -1 ? req.body.user_type : 2; // adapts if its admin insert or guest insert
    let hashedPwd: string = "";
    let query:string = "INSERT INTO User (user_name, user_password, user_type_id) VALUES (?,?,?)";

    if (username == null || password == null) {
        res.send("ERROR: parameters missing !");
        res.status(StatusCodes.BAD_REQUEST).end();
        return;
    }



    hashedPwd = bcrypt.hashSync(password.toString(), 5);

    db.run(query,username, hashedPwd, userType, (error: Error, rows:any) => {
        if (error) {
            res.send("Insertion error: " + error);
            res.status(StatusCodes.NOT_FOUND).end();
            return;
        }

        res.send("User successfully created !");
        res.status(StatusCodes.CREATED).end();
    });
});

// update user (OK)
router.put('/users/:id', adminJwtVerifier, (req: express.Request, res: express.Response) => {
    let requestId: number = +req.params.id;
    let currentUserId: number = +req.headers.userId;
    let username: string = req.body.username;
    let password: string = req.body.password;
    let userType: string = req.body.user_type;
    let updateContent :string = "";
    let hashedPwd: string = "";
    let query: string = "";

    if (requestId < 1){
        res.status(StatusCodes.BAD_REQUEST).end();
        return;
    }

    if (username == null && password == null && userType == null) {
        res.send("ERROR: parameters missing !");
        res.status(StatusCodes.BAD_REQUEST).end();
        return;    
    }

    // setting UPDATE content depending on what we received
    if (username != null) updateContent += "user_name = \"" + username + "\","; 
    if (password != null) {
        hashedPwd = bcrypt.hashSync(password.toString(), 5);
        updateContent += "user_password = \"" + hashedPwd + "\",";  
    }
    // avoid own type update
    if (userType != null && currentUserId != requestId) updateContent += "user_type_id = " + userType + ","; 

    updateContent = updateContent.slice(0, -1); // get rid of last ','

    query = "UPDATE User SET " + updateContent + " WHERE user_id = ?";
    db.run(query, requestId, (error: Error, rows:any) => {
        if (error) {
            console.log(error);
            res.send(error);
            res.status(StatusCodes.NOT_FOUND).end();
            return;
        }

        res.send("User successfully updated !");
        res.status(StatusCodes.OK).end();
    });
});

// delete user (OK)
router.delete('/users/:id', adminJwtVerifier, (req: express.Request, res: express.Response) => {
    let requestId: number = +req.params.id;
    let query: string = "DELETE FROM User WHERE user_id = ?";
    let userId: number = +req.headers.userId;


    if (requestId < 1 || userId == requestId){
        res.send("Cannot delete this user");
        res.status(StatusCodes.BAD_REQUEST).end();
        return;
    }
    
    db.run(query, requestId, (error: Error, rows:any) => {
        if (error) {
            res.send(error);
            res.status(StatusCodes.NOT_FOUND).end();
            return;
        }

        res.send("User successfully deleted !");
        res.status(StatusCodes.OK).end();
    });
});


export default router;