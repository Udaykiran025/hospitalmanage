## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Tue Sep 10 2024 09:31:21 GMT+0000 (Coordinated Universal Time)|
|**App Generator**<br>@sap/generator-fiori-freestyle|
|**App Generator Version**<br>1.14.5|
|**Generation Platform**<br>SAP Business Application Studio|
|**Template Used**<br>simple|
|**Service Type**<br>SAP System (ABAP On Premise)|
|**Service URL**<br>http://sapbtp.com:8023/sap/opu/odata/sap/ZHM_PROJECT_SRV|
|**Module Name**<br>hospitalmanage|
|**Application Title**<br>Hospital Management|
|**Namespace**<br>|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.114.0|
|**Enable Code Assist Libraries**<br>False|
|**Enable TypeScript**<br>False|
|**Add Eslint configuration**<br>False|

## hospitalmanage

An SAP Fiori application.

### Starting the generated app

-   This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite.  In order to launch the generated app, simply run the following from the generated app root folder:

```
    npm start
```

- It is also possible to run the application using mock data that reflects the OData Service URL supplied during application generation.  In order to run the application with Mock Data, run the following from the generated app root folder:

```
    npm run start-mock
```

#### Pre-requisites:

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version.  (See https://nodejs.org)

#### Detail Description 

# Hospital Management System
## Overview
The Hospital Management System is a web-based application designed to streamline and manage hospital operations efficiently. The system features three user roles: Patient, Doctor, and Admin. Each role is equipped with specific functionalities to ensure smooth interaction and management of appointments, prescriptions, and other hospital activities. The system leverages HTML and JavaScript for the front-end, and SAP ABAP for the back-end.

## Features
## Home Page
The home page consists of three tabs:
Patient
Doctor
Admin
Each tab allows the respective user type to log in and access their specific functionalities.

## Patient Functionality
After logging in with valid credentials, a patient can:

#### 1. Book Appointment:
Patients can book appointments with available doctors by selecting the desired date and time.
#### 2. View Appointments:
Patients can view a list of all their booked appointments, including appointment details such as the doctor's name, date, and time.
#### 3. View Prescriptions:
Patients can access prescriptions provided by doctors for their consultations.
## Navigation
A left menu provides quick access to the functionalities:
#### 1. Book Appointment
View Appointments
#### 2. View Prescriptions
Icons are also available for direct navigation to the respective tabs.


## Doctor Functionality
After logging in with valid credentials, a doctor can:

#### 1. View Appointments:
Doctors can view their schedule of appointments, including patient details and appointment timings.
#### 2. Give Prescription:
Doctors can provide prescriptions for patients after consultations, including details about medications, dosage, and instructions.

## Navigation
A left menu provides quick access to:
View Appointments
Give Prescription


## Admin Functionality
After logging in with valid credentials, an admin can:

#### 1. View Doctors List:
Admins can view a list of all registered doctors, including details like name, specialization, and contact information.
#### 2. View Patients List:
Admins can access a list of all registered patients.
#### 3. View Appointments List:
Admins can view all scheduled appointments across the hospital.
#### 4. View Prescriptions List:
Admins can review all prescriptions provided by doctors.
#### 5. Add Doctor:
Admins can add new doctors to the system by providing necessary details.
#### 6. Remove Doctor:
Admins can remove existing doctors from the system if required.

## Navigation
A left menu provides quick access to:
Doctors List
Patients List
Appointments List
Prescriptions List
Add Doctor
Remove Doctor

## Technologies Used

#### Front-End:
XML: For structuring the web pages.
JavaScript: For dynamic user interactions and client-side validations.
#### Back-End:
SAP ABAP: For managing the database, business logic, and server-side operations.


