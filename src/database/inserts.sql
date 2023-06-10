INSERT OR IGNORE INTO Type VALUES
(1, "guest"),
(2, "player"),
(3, "admin");
INSERT OR IGNORE INTO Category VALUES
(1, "Cinéma"),
(2, "Sports"),
(3, "Informatique"),
(4, "Musique");
INSERT OR IGNORE INTO User VALUES
(1, "eldado", "$2a$05$TH6TPumgRkwHD/MIa62Iw.XwzLaaQyyelJxW71EMzVbErZWPboWua", 1),
(2, "Flibustier", "$2a$05$XfEI9FXA9OPwb1WFYIzQQuOCwyAY3nK0Xn.F3JqzqxSn40hYYZCfq", 1),
(3, "Scooter", "$2a$05$cTCVlEMnYX7ODjPOw2eLEuI9ejiBKNXvKsv0so94D/ZSvGcwe6Z26", 2);
INSERT OR IGNORE INTO Answer VALUES
(1, "C", 1, 3),
(2, "Java", 1, 3),
(3, "Binaire", 1, 3),
(4, "Fortran", 1, 3),
(5, "SQL", 1, 3),
(6, "Eagles", 1, 4),
(7, "Michael Jackson", 1, 4),
(8, "ACDC", 1, 4),
(9, "Redbone", 1, 4),
(10, "The Rolling Stones", 1, 4),
(11, "Elton John", 1, 4),
(12, "Elvis Presley", 1, 4),
(13, "Pulp fiction", 1, 1),
(14, "Titanic", 1, 1),
(15, "Star Wars", 1, 1),
(16, "Avatar", 1, 1),
(17, "Robert lewandowski", 1, 2),
(18, "Usain Bolt", 1, 2),
(19, "René Higuita", 1, 2),
(20, "Rafael Nadal", 1, 2);
INSERT OR IGNORE INTO Question VALUES
(1, "Quel est le langage de programmation le plus vieux encore utilisé ?", 1, 3, 4),
(2, "Quel langage de programmation fut crée en 1972 ?", 1, 3, 1),
(3, "Quel est le langage le plus populaire pour ce qui concerne les base de données ?", 1, 3, 5),
(4, "Quel est le nom pour désigner le langage machine d'un PC ?", 1, 3, 3),
(5, "Qui chante 'Hotel California' ?", 1, 4, 6),
(6, "Qui chante 'Billie Jean' ?", 1, 4, 7),
(7, "Qui chante 'Highway to hell' ?", 1, 4, 8),
(8, "Qui chante 'Come and get your love' ?", 1, 4, 9),
(9, "Quel film met en scene des humain envaissant des êtres humanoïdes bleus ?", 1, 1, 16),
(10, "Quel film met en scène le plus gros naufrage connu à ce jour ?", 1, 1, 14),
(11, "Quel film met en scène la guerre des étoiles ?", 1, 1, 15),
(12, "Quel excellent film de 1994 met en scène John Travolta et Samuel L. Jackson ?", 1, 1, 13),
(13, "A qui appartient le record du monde de course sur 100m (9s 58) ?", 1, 2, 18),
(14, "Quel joueur de foot reussi un quintuplé en 9 minutes ?", 1, 2, 17),
(15, "Quel joueur de foot (gardien) reussi a faire un 'scorpion' devant son propre but ?", 1, 2, 19),
(16, "Qui est le meilleur tenisman espagnol de tous les temps ?", 1, 2, 20);