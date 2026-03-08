-- TABLE 1: patients
CREATE TABLE `patients` (
  `patient_id` INT AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `date_of_birth` DATE NOT NULL,
  `gender` ENUM('M','F','O'),
  `phone` VARCHAR(20),
  `email` VARCHAR(100),
  `address` TEXT,
  `blood_type` VARCHAR(5),
  `registered_at` DATETIME,
  `emergency_contact` VARCHAR(100),
  `insurance_provider` VARCHAR(100),
  `national_id` VARCHAR(50),
  `clinic_number` VARCHAR(50) UNIQUE
);

-- TABLE 2: doctors
CREATE TABLE `doctors` (
  `doctor_id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `specialization` VARCHAR(100),
  `phone` VARCHAR(20),
  `email` VARCHAR(100),
  `is_active` TINYINT(1)
);
