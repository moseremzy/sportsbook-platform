-- Schema for Gadget Ordering Platform
-- Database: MySQL / MariaDB

CREATE TABLE sports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(255),
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    flag VARCHAR(255),
    status ENUM('enabled','disabled') DEFAULT 'enabled'
);

CREATE TABLE leagues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sport_id INT NOT NULL,
    country_id INT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    logo VARCHAR(255),
    season VARCHAR(50),
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (sport_id) REFERENCES sports(id),
    FOREIGN KEY (country_id) REFERENCES countries(id)
);

CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id VARCHAR(100) NULL,
    sport_id INT NOT NULL,
    country_id INT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    logo VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (sport_id) REFERENCES sports(id),
    FOREIGN KEY (country_id) REFERENCES countries(id)
);


CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sport_id INT NOT NULL,
    league_id INT NOT NULL,
    home_team_id INT NOT NULL,
    away_team_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    status ENUM('pending','live','finished','cancelled','expired') DEFAULT 'pending',
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    external_id VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (sport_id) REFERENCES sports(id),
    FOREIGN KEY (league_id) REFERENCES leagues(id),
    FOREIGN KEY (home_team_id) REFERENCES teams(id),
    FOREIGN KEY (away_team_id) REFERENCES teams(id)
);


CREATE TABLE event_score_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    period VARCHAR(50) NOT NULL,        -- 'p1', 'p2', 'fulltime', 'ot', etc.
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_event_period (event_id, period),
    FOREIGN KEY (event_id) REFERENCES events(id)
);


CREATE TABLE markets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sport_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sport_id) REFERENCES sports(id)
);

CREATE TABLE event_markets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    market_id INT NOT NULL,
    status ENUM('open','suspended','settled') DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_event_market (event_id, market_id),

    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (market_id) REFERENCES markets(id)
);

CREATE TABLE selections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_market_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    odd DECIMAL(10,2) NOT NULL,
    line_value DECIMAL(10,2) NULL,
    external_id VARCHAR(100) NULL,
    status ENUM('open','suspended','won','lost','void') DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (event_market_id) REFERENCES event_markets(id)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE bet_slips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_odd DECIMAL(10,2) NOT NULL,
    stake DECIMAL(12,0) NOT NULL,
    possible_win DECIMAL(12,0),
    status ENUM('pending','won','lost','partial','void') DEFAULT 'pending',
    bet_type ENUM('single','multiple') DEFAULT 'multiple',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    settled_at DATETIME NULL,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE bet_selections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bet_slip_id INT NOT NULL,
    selection_id INT NOT NULL,
    event_id INT NOT NULL,
    market_name VARCHAR(250),
    market_slug VARCHAR(250),
    selection_name VARCHAR(250),
    odd_at_bet_time DECIMAL(10,2) NOT NULL,
    line_value DECIMAL(10,2) NOT NULL,
    home_team VARCHAR(255),
    away_team VARCHAR(255),
    status ENUM('pending','won','lost','void') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (bet_slip_id) REFERENCES bet_slips(id),
    FOREIGN KEY (selection_id) REFERENCES selections(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);
