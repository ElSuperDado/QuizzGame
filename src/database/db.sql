PRAGMA foreign_keys = ON;
PRAGMA strict = ON;
CREATE TABLE IF NOT EXISTS Type (
    type_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    type_name TEXT NOT NULL
) STRICT;
CREATE TABLE IF NOT EXISTS User (
    user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL, 
    user_password TEXT NOT NULL,
    user_type_id INTEGER NOT NULL,
    UNIQUE(user_name),
    FOREIGN KEY (user_type_id) REFERENCES Type(type_id)
) STRICT;
CREATE TABLE IF NOT EXISTS Category (
    category_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL
) STRICT;
CREATE TABLE IF NOT EXISTS Answer (
    answer_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    answer_text TEXT NOT NULL,  
    answer_creator_id INTEGER NOT NULL,
    answer_category_id INTEGER NOT NULL,
    FOREIGN KEY (answer_category_id) REFERENCES Category(category_id),
    FOREIGN KEY (answer_creator_id) REFERENCES User(user_id)  
) STRICT;
CREATE TABLE IF NOT EXISTS Question (
    question_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,  
    question_creator_id INTEGER NOT NULL,
    question_category_id INTEGER NOT NULL,
    question_answer_id INTEGER,
    FOREIGN KEY (question_category_id) REFERENCES Category(category_id),
    FOREIGN KEY (question_creator_id) REFERENCES User(user_id),
    FOREIGN KEY (question_answer_id) REFERENCES Answer(answer_id)
) STRICT;