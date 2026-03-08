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

-- TABLE 5: medical_visits
CREATE TABLE `medical_visits` (
  `visit_id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `appointment_id` INT,
  `visit_date` DATE NOT NULL,
  `notes` TEXT,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`doctor_id`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`appointment_id`)
);

-- TABLE 6: diagnoses
CREATE TABLE `diagnoses` (
  `diagnosis_id` INT AUTO_INCREMENT PRIMARY KEY,
  `visit_id` INT NOT NULL,
  `description` TEXT,
  FOREIGN KEY (`visit_id`) REFERENCES `medical_visits`(`visit_id`)
);

-- TABLE 7: prescriptions
CREATE TABLE `prescriptions` (
  `prescription_id` INT AUTO_INCREMENT PRIMARY KEY,
  `visit_id` INT NOT NULL,
  `drug_name` VARCHAR(150) NOT NULL,
  `dosage` VARCHAR(100),
  `duration` VARCHAR(50),
  `end_time` DATETIME,
  FOREIGN KEY (`visit_id`) REFERENCES `medical_visits`(`visit_id`)
);

-- TABLE 8: services
CREATE TABLE `services` (
  `service_id` INT AUTO_INCREMENT PRIMARY KEY,
  `service_name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `category` VARCHAR(50)
);

-- TABLE 9: invoices
CREATE TABLE `invoices` (
  `invoice_id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `appointment_id` INT,
  `invoice_date` DATE NOT NULL,
  `total_amount` DECIMAL(10,2),
  `discount` DECIMAL(10,2),
  `amount_due` DECIMAL(10,2),
  `payment_status` ENUM('Unpaid','Partial','Paid'),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`appointment_id`)
);

-- TABLE 10: invoice_items
CREATE TABLE `invoice_items` (
  `item_id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_id` INT NOT NULL,
  `service_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `unit_price` DECIMAL(10,2),
  `subtotal` DECIMAL(10,2),
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`invoice_id`),
  FOREIGN KEY (`service_id`) REFERENCES `services`(`service_id`)
);

-- TABLE 11: payments
CREATE TABLE `payments` (
  `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_id` INT NOT NULL,
  `payment_date` DATE NOT NULL,
  `amount_paid` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('Cash','Card','Mobile','Insurance'),
  `reference_no` VARCHAR(100),
  `received_by` VARCHAR(100),
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`invoice_id`)
);
