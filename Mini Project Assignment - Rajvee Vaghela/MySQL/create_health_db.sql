DROP DATABASE IF EXISTS healthdata;

CREATE DATABASE healthdata;

USE healthdata;

DROP USER IF EXISTS 'webuser'@'localhost';

CREATE USER 'webuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'qwerty';
GRANT ALL PRIVILEGES ON healthdata.* TO 'webuser'@'localhost';  

# Remove the tables if they already exist
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS exercise_log;
DROP TABLE IF EXISTS search_exercise;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    firstname VARCHAR(30) NOT NULL,
    lastname VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    age INT NOT NULL,
    password VARCHAR(255) NOT NULL,
    INDEX(username)  -- Add an index on the 'username' column
);

CREATE TABLE exercise_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20), 
    exercise_name VARCHAR(255) NOT NULL,
    log_date VARCHAR(10) NOT NULL,
    duration TIME NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username) 
);


  CREATE TABLE search_exercise (
    exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    ex_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    difficulty ENUM('beginner', 'Intermediate', 'Advanced')
);

INSERT INTO search_exercise (ex_name, description, category, difficulty) VALUES
('Push-ups', 'A classic upper body exercise that targets the chest, shoulders, and triceps.', 'Strength', 'Intermediate'),
('Running', 'A cardiovascular exercise that involves running or jogging.', 'Cardio', 'Beginner'),
('Yoga', 'A series of physical, mental, and spiritual practices originating in ancient India.', 'Flexibility', 'Beginner'),
('Deadlifts', 'A compound exercise that targets multiple muscle groups, including the back and legs.', 'Strength', 'Advanced'),
('Plank', 'An isometric core exercise that helps strengthen the abdominal muscles.', 'Core', 'Intermediate'),
('Cycling', 'A low-impact cardiovascular exercise performed on a stationary bike or outdoors.', 'Cardio', 'Intermediate'),
('Squats', 'A compound exercise that targets the muscles of the lower body, including the quads and glutes.', 'Strength', 'Intermediate'),
('Jumping Jacks', 'A simple and effective cardiovascular exercise that involves jumping and moving the arms.', 'Cardio', 'Beginner'),
('Pilates', 'A low-impact exercise method that focuses on strength, flexibility, and endurance.', 'Flexibility', 'Intermediate'),
('Bench Press', 'A compound exercise for upper body strength, targeting the chest, shoulders, and triceps.', 'Strength', 'Advanced'),
('Hiking', 'A recreational activity that involves walking in natural environments.', 'Cardio', 'Intermediate'),
('Stretching', 'A set of exercises to improve flexibility and range of motion in muscles and joints.', 'Flexibility', 'Beginner');

select * from exercise_log;