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

-- TABLE 3: doctor_schedule
CREATE TABLE `doctor_schedule` (
  `schedule_id` INT AUTO_INCREMENT PRIMARY KEY,
  `doctor_id` INT NOT NULL,
  `day_of_week` ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun'),
  `start_time` TIME NOT NULL,
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`doctor_id`)
);

-- TABLE 4: appointments
CREATE TABLE `appointments` (
  `appointment_id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `appointment_datetime` DATETIME NOT NULL,
  `reason` TEXT,
  `status` ENUM('Scheduled','Completed','Cancelled','No-show'),
  `created_at` DATETIME,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`doctor_id`)
);
