CREATE DATABASE IF NOT EXISTS bank;
USE bank;

-- 1. Bank
CREATE TABLE IF NOT EXISTS Bank (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200) NOT NULL
);

-- 2. Branch
CREATE TABLE IF NOT EXISTS Branch (
    branch_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200) NOT NULL,
    bank_code VARCHAR(10),
    FOREIGN KEY (bank_code) REFERENCES Bank(code) ON DELETE CASCADE
);

-- 3. Customer
CREATE TABLE IF NOT EXISTS Customer (
    custid INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    address VARCHAR(200),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- 4. Account
CREATE TABLE IF NOT EXISTS Account (
    account_no BIGINT PRIMARY KEY,
    acc_type VARCHAR(50) NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0,
    branch_id INT,
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id) ON DELETE SET NULL
);

-- 5. Loan
CREATE TABLE IF NOT EXISTS Loan (
    loan_id INT PRIMARY KEY AUTO_INCREMENT,
    loan_type VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    branch_id INT,
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id) ON DELETE SET NULL
);

-- 6. Hold_By
CREATE TABLE IF NOT EXISTS Hold_By (
    custid INT,
    account_no BIGINT,
    PRIMARY KEY(custid, account_no),
    FOREIGN KEY (custid) REFERENCES Customer(custid) ON DELETE CASCADE,
    FOREIGN KEY (account_no) REFERENCES Account(account_no) ON DELETE CASCADE
);

-- 7. Availed_By
CREATE TABLE IF NOT EXISTS Availed_By (
    custid INT,
    loan_id INT,
    balance DECIMAL(12,2),
    PRIMARY KEY(custid, loan_id),
    FOREIGN KEY (custid) REFERENCES Customer(custid) ON DELETE CASCADE,
    FOREIGN KEY (loan_id) REFERENCES Loan(loan_id) ON DELETE CASCADE
);

-- 8. Transaction_Log
CREATE TABLE IF NOT EXISTS Transaction_Log (
    txn_id INT AUTO_INCREMENT PRIMARY KEY,
    account_no BIGINT,
    txn_type ENUM('CREDIT', 'DEBIT', 'TRANSFER', 'UPI') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    txn_date DATETIME DEFAULT NOW(),
    description VARCHAR(255),
    category VARCHAR(100) DEFAULT 'General',
    FOREIGN KEY (account_no) REFERENCES Account(account_no) ON DELETE SET NULL
);

-- 9. Admin
CREATE TABLE IF NOT EXISTS Admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- =========================================
-- TRIGGERS
-- =========================================
DELIMITER //

CREATE TRIGGER check_negative_balance
BEFORE INSERT ON Transaction_Log
FOR EACH ROW
BEGIN
    DECLARE current_balance DECIMAL(12,2);
    
    -- Only check for DEBIT and TRANSFER types that decrease balance
    IF NEW.txn_type IN ('DEBIT', 'TRANSFER') THEN
        -- Check if it's a negative amount inserted or regular check
        SELECT balance INTO current_balance FROM Account WHERE account_no = NEW.account_no;
        
        IF current_balance < NEW.amount THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance for this transaction';
        END IF;
    END IF;
END //

CREATE TRIGGER check_loan_amount
BEFORE INSERT ON Loan
FOR EACH ROW
BEGIN
    IF NEW.amount < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Loan amount cannot be negative';
    END IF;
END //

DELIMITER ;

-- =========================================
-- VIEWS
-- =========================================
CREATE OR REPLACE VIEW Customer_Account_View AS
SELECT 
    c.custid, 
    c.name AS customer_name, 
    c.email, 
    c.phone,
    a.account_no, 
    a.acc_type, 
    a.balance,
    b.name AS branch_name,
    bk.name AS bank_name
FROM 
    Customer c
JOIN 
    Hold_By hb ON c.custid = hb.custid
JOIN 
    Account a ON hb.account_no = a.account_no
LEFT JOIN 
    Branch b ON a.branch_id = b.branch_id
LEFT JOIN 
    Bank bk ON b.bank_code = bk.code;

-- =========================================
-- SEED DATA
-- =========================================

-- Note: All passwords below are 'password123' hashed using bcrypt 10 rounds
-- Hash: $2b$10$wTf7Jm4p7XWTo2Z68o0CFeI87/5jVXXiL.Z69Q5Gg1/m0D0T6tEGO
INSERT IGNORE INTO Bank (code, name, address) VALUES 
('B001', 'ABC Bank', 'Hyderabad');

INSERT IGNORE INTO Branch (branch_id, name, address, bank_code) VALUES 
(1, 'T NAGAR BRANCH', 'Chennai', 'B001'),
(2, 'ANNA NAGAR BRANCH', 'Chennai', 'B001'),
(3, 'POTHERI BRANCH', 'Kanchipuram', 'B001'),
(4, 'CHENGALPATTU BRANCH', 'Chengalpattu', 'B001'),
(5, 'TIRUSULAM BRANCH', 'Chennai', 'B001'),
(6, 'TAMBARAM BRANCH', 'Chennai', 'B001');

INSERT IGNORE INTO Customer (custid, name, phone, address, email, password) VALUES 
(1, 'Ravi Kumar', '9876543210', 'Hyderabad', 'ravi@example.com', '$2b$10$wTf7Jm4p7XWTo2Z68o0CFeI87/5jVXXiL.Z69Q5Gg1/m0D0T6tEGO'),
(2, 'Sita Devi', '9876543211', 'Hyderabad', 'sita@example.com', '$2b$10$wTf7Jm4p7XWTo2Z68o0CFeI87/5jVXXiL.Z69Q5Gg1/m0D0T6tEGO'),
(3, 'Arjun Rao', '9876543212', 'Bangalore', 'arjun@example.com', '$2b$10$wTf7Jm4p7XWTo2Z68o0CFeI87/5jVXXiL.Z69Q5Gg1/m0D0T6tEGO');

INSERT IGNORE INTO Admin (admin_id, username, password) VALUES
(1, 'admin', '$2b$10$wTf7Jm4p7XWTo2Z68o0CFeI87/5jVXXiL.Z69Q5Gg1/m0D0T6tEGO');

INSERT IGNORE INTO Account (account_no, acc_type, balance, branch_id) VALUES 
(100001, 'Savings', 50000.00, 1),
(100002, 'Savings', 75000.00, 1),
(100003, 'Current', 120000.00, 2);

INSERT IGNORE INTO Hold_By (custid, account_no) VALUES 
(1, 100001),
(2, 100002),
(3, 100003);

INSERT IGNORE INTO Loan (loan_id, loan_type, amount, branch_id) VALUES 
(1, 'Home Loan', 2500000.00, 1),
(2, 'Education Loan', 800000.00, 2);

INSERT IGNORE INTO Availed_By (custid, loan_id) VALUES 
(1, 1),
(3, 2);

-- Add some seed transactions
INSERT IGNORE INTO Transaction_Log (account_no, txn_type, amount, description) VALUES
(100001, 'CREDIT', 20000.00, 'Initial Deposit'),
(100001, 'DEBIT', 5000.00, 'ATM Withdrawal'),
(100002, 'CREDIT', 75000.00, 'Salary Credit'),
(100003, 'CREDIT', 120000.00, 'Business Income');

