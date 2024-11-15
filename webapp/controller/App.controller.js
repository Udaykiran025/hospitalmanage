sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (BaseController, JSONModel, MessageToast, ODataModel, Filter, FilterOperator, MessageBox, Fragment) {
    "use strict";

    return BaseController.extend("hospitalmanage.controller.App", {
        onInit: function () {
            this.getOwnerComponent().getRouter().initialize();

            var sServiceUrl = "/sap/opu/odata/sap/ZHM_PROJECT_SRV/";
            this.oModel = new ODataModel(sServiceUrl, { useBatch: false });

            this.getView().setModel(this.oModel);
            // Initialize the logged-in user data
            this._loggedInDoctor = null;
            this._loggedInPatient = null;
            // Initialize empty user data
            this._userData = [];
            this._doctorData = [];
            this._patientData = [];

            // Get data for Admin, Doctor, and Patient tables
            this._getAdminTableData();
            this._getDoctorTableData();
            this._getPatientTableData();
        },

        // Fetch Admin data
        _getAdminTableData: function () {
            var that = this;
            var sEntitySet = "/zadminSet"; // Admin entity set
            this.getView().getModel().read(sEntitySet, {
                success: function (oData) {
                    var oTableModel = new JSONModel();
                    oTableModel.setData(oData);
                    that._userData = oData.results; // Store admin data
                },
                error: function (oError) {
                    MessageToast.show("Error fetching Admin data");
                    console.error(oError);
                }
            });
        },

        // Fetch Doctor data
        _getDoctorTableData: function () {
            var that = this;
            var sEntitySet = "/zdoctorSet"; // Doctor entity set
            this.getView().getModel().read(sEntitySet, {
                success: function (oData) {
                    var oTableModel = new JSONModel();
                    oTableModel.setData(oData);
                    that._doctorData = oData.results; // Store doctor data
                },
                error: function (oError) {
                    MessageToast.show("Error fetching Doctor data");
                    console.error(oError);
                }
            });
        },

        // Fetch Patient data
        _getPatientTableData: function () {
            debugger
            var that = this;
            var sEntitySet = "/zpatientSet"; // Patient entity set
            this.getView().getModel().read(sEntitySet, {
                success: function (oData) {
                    var oTableModel = new JSONModel();
                    oTableModel.setData(oData);
                    that._patientData = oData.results; // Store patient data
                },
                error: function (oError) {
                    MessageToast.show("Error fetching Patient data");
                    console.error(oError);
                }
            });
        },

        onItemSelect: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("listItem");
            var oContext = oSelectedItem.getBindingContext("leftmenuModel");

            if (oContext) {
                var sRoute = oContext.getProperty("route");
                if (sRoute) {
                    this.getOwnerComponent().getRouter().navTo(sRoute);
                } else {
                    console.error("Route not found for the selected item.");
                }
            } else {
                console.error("Binding context not found for the selected item.");
            }
        },

        // Handle Admin login
        onLoginPress: function () {
            debugger
            var sUsername = this.byId("usernameInput").getValue();
            var sPassword = this.byId("passwordInput").getValue();
            var oLoggedInUser = this._validateAdminCredentials(sUsername, sPassword);

            if (oLoggedInUser) {
                MessageBox.success("Admin login successful!");
                this._setNavigationForRole("Admin");
                this._navigateAfterLogin("home");
            } else {
                MessageBox.error("Invalid Admin Username or Password.");
            }
        },

        // Handle Patient login
        onPatientLogin: function () {
            debugger
            var sEmail = this.byId("patientEmail").getValue();
            var sPassword = this.byId("patientPassword").getValue();
            var oLoggedInPatient = this._validatePatientCredentials(sEmail, sPassword);
        
            if (oLoggedInPatient) {
                this._loggedInPatient = oLoggedInPatient; // Store logged-in patient data
                // Store the patient's email in sessionStorage
                window.sessionStorage.setItem("loggedInPatientEmail", sEmail);
                console.log("Stored Patient Email:", sEmail); // Debug statement

                MessageBox.success("Patient login successful!");
                this._setNavigationForRole("Patient");
                this._navigateAfterLogin("home2");
            } else {
                MessageBox.error("Invalid Patient Email or Password.");
            }
        },
        onShowLoginPress: function () {
            this.byId("loginFormContainer").setVisible(true);
            this.byId("registerFormContainer").setVisible(false);
        },

        onShowRegisterPress: function () {
            this.byId("loginFormContainer").setVisible(false);
            this.byId("registerFormContainer").setVisible(true);
        },
        onRegisterPress1: function () {
            // Read form data
            var sFirstName = this.byId("firstNameInput").getValue().trim();
            var sLastName = this.byId("lastNameInput").getValue().trim();
            var oGenderGroup = this.byId("genderGroup");
            var oSelectedButton = oGenderGroup.getSelectedButton();
            var sGender = oSelectedButton ? oSelectedButton.getText().trim() : "";
            var sEmail = this.byId("emailInput").getValue().trim();
            var sContact = this.byId("phoneInput").getValue().trim();
            var sPassword = this.byId("passwordInput1").getValue().trim();
            var sCPassword = this.byId("confirmPasswordInput").getValue().trim();
        
            // Log all values to check if they are correct
            console.log("First Name:", sFirstName);
            console.log("Last Name:", sLastName);
            console.log("Gender:", sGender);
            console.log("Email:", sEmail);
            console.log("Contact:", sContact);
            console.log("Password:", sPassword);
            console.log("Confirm Password:", sCPassword);
        
            // Validate input fields
            if (!sFirstName || !sLastName || !sGender || !sEmail || !sContact || !sPassword || !sCPassword) {
                MessageBox.error("All fields are required.");
                return;
            }
        
            if (sPassword !== sCPassword) {
                MessageBox.error("Password and Confirm Password do not match.");
                return;
            }
        
            // Prepare the patient data payload
            var oData = {
                "Fname": sFirstName,          // First Name
                "Lname": sLastName,           // Last Name
                "Gender": sGender,            // Gender
                "Email": sEmail,              // Email
                "Contact": sContact,          // Contact
                "Password": sPassword,        // Password
                "Cpassword": sCPassword       // Confirm Password
            };
        
            // Log the entire payload in compact format
            console.log("Payload for Registration: ", JSON.stringify(oData));
        
            // Make OData create request
            this.getView().getModel().create("/zpatientSet", oData, {
                success: function (oData, response) {
                    MessageToast.show("Registration successful");
                },
                error: function (oError) {
                    MessageToast.show("Registration failed. Please try again.");
                    console.error("Error details:", oError);
                }
            });
        },

        // Handle Doctor login
        onDoctorLogin: function () {
            debugger
            var sUsername = this.byId("doctorUser").getValue();
            var sPassword = this.byId("doctorPassword").getValue();
            var oLoggedInDoctor = this._validateDoctorCredentials(sUsername, sPassword);
        
            if (oLoggedInDoctor) {
                this._loggedInDoctor = oLoggedInDoctor; // Store logged-in doctor data
                var oLoggedInDoctorModel = new JSONModel(oLoggedInDoctor);
                this.getOwnerComponent().setModel(oLoggedInDoctorModel, "loggedInDoctorModel");
        
                // Store the username in sessionStorage
                window.sessionStorage.setItem("loggedInDoctorUsername", sUsername);
                console.log("Stored Doctor Username:", sUsername); // Debug statement
        
                MessageBox.success("Doctor login successful!");
                
                this._setNavigationForRole("Doctor");
                this._navigateAfterLogin("home1");
            } else {
                MessageBox.error("Invalid Doctor Username or Password.");
            }
        },
        
        
        // Navigate after successful login
        _navigateAfterLogin: function (sRoute) {
            this.byId("splitApp").setVisible(true);
            this.getOwnerComponent().getRouter().navTo(sRoute);
            this.byId("loginPage").destroy(); // Hide login page after login
        },

        // Set navigation based on the role
        _setNavigationForRole: function (role) {
            var aNavigation = [];

            switch (role) {
                case "Admin":
                    aNavigation = [
                        { title: "Home", route: "home" },
                        { title: "Doctors List", route: "admin" },
                        { title: "Patients List", route: "patientlist" },
                        { title: "Appointment Details", route: "appointmentlist" },
                        { title: "Prescription List", route: "prescriptionlist" },
                        { title: "Add Doctor", route: "adddoctor" },
                        { title: "Delete Doctor", route: "deletedoctor" }
                    ];
                    break;

                case "Doctor":
                    aNavigation = [
                        { title: "Home1", route: "home1" },
                        { title: "Appoint ", route: "appoint" },
                        { title: "Prescriptions given ", route: "Prescriptionsgiven" }
                        
                        
                    ];
                    break;

                case "Patient":
                    aNavigation = [
                        { title: "Home", route: "home2" },
                        { title: "Book Appointment", route: "bookappoint" },
                        { title: "Appointment History ", route: "AppointmentHistory" },
                        { title: "Prescriptions received", route: "Prescriptionsreceived" }
                       
                    ];
                    break;

                default:
                    console.error("Unknown role");
            }

            // Update the navigation model
            var oModel = new JSONModel({ navigation: aNavigation });
            this.getView().setModel(oModel, "leftmenuModel");
        },

        // Validate Admin credentials (renamed fields for Admin to avoid conflicts)
        _validateAdminCredentials: function (sUsername, sPassword) {
            return this._userData.find(function (oAdmin) {
                return oAdmin.Username === sUsername && oAdmin.Password === sPassword;
            });
        },
        
        // Validate Patient credentials
        _validatePatientCredentials: function (sEmail, sPassword) {
            var that = this;
            if (!this._patientData) {
                this._getPatientTableData();  // Fetch doctor data if not already fetched
            }

            return this._patientData.find(function (oPatient) {
                return oPatient.Email === sEmail && oPatient.Password === sPassword;
            });
        },

        // Validate Doctor credentials (renamed fields for Doctor to avoid conflicts)
       _validateDoctorCredentials: function (sUsername, sPassword) {
            var that = this;
            if (!this._doctorData) {
                this._getDoctorTableData();  // Fetch doctor data if not already fetched
            }

            return this._doctorData.find(function (oDoctor) {
                return oDoctor.Username === sUsername && oDoctor.Password === sPassword;
            });
        },
    });
});
