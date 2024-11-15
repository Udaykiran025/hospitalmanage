sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/odata/v2/ODataModel"
], function (Controller, MessageToast, ODataModel) {
    "use strict";

    return Controller.extend("hospitalmanage.controller.Bookappoint", {
        onInit: function () {
            // Bind OData model
            this.getView().setModel(new ODataModel("/sap/opu/odata/sap/ZHM_PROJECT_SRV/"), "odataModel");

            // Fetch patient data based on logged-in email
            this._fetchPatientData();
        },
        _fetchPatientData: function () {
            var oModel = this.getView().getModel("odataModel");
            var patientEmail = this._getLoggedInPatientEmail(); // Retrieve patient's email from sessionStorage

            if (patientEmail) {
                console.log("Logged-in patient's email:", patientEmail); // Log to check correctness

                // Apply filter to match patient email in OData request
                var sFilter = new sap.ui.model.Filter("Email", sap.ui.model.FilterOperator.EQ, patientEmail);
                
                // OData read request with filter for email
                oModel.read("/zpatientSet", {
                    filters: [sFilter],  // Apply the email filter
                    success: function (oData) {
                        if (oData.results && oData.results.length > 0) {
                            // Find the patient record that matches the email, if necessary
                            var foundPatient = oData.results.find(function (patient) {
                                return patient.Email === patientEmail; // Ensure the email matches exactly
                            });
                        
                            if (foundPatient) {
                                this._patientData = foundPatient; // Store the matched patient data
                                console.log("Fetched patient data:", this._patientData); // Log the fetched data
                            } else {
                                MessageToast.show("No patient data found for the email: " + patientEmail);
                                console.log("No patient data found for email:", patientEmail); // Log no match found
                            }
                        } else {
                            MessageToast.show("No patient data found for the email: " + patientEmail);
                            console.log("No patient data found for email:", patientEmail); // Log no match found
                        }
                        
                    }.bind(this),
                    error: function (oError) {
                        var errorMessage = oError.message || "Error fetching patient data.";
                        MessageToast.show(errorMessage);
                        console.error("Error fetching patient data:", oError); // Log error details
                    }
                });
            } else {
                MessageToast.show("No logged-in patient email found.");
                console.log("No patient email found in sessionStorage."); // Log if no email is found
            }
        },
        _getLoggedInPatientEmail: function () {
            // Retrieve email stored during login
            var email = window.sessionStorage.getItem("loggedInPatientEmail");
            console.log("Retrieved email from sessionStorage:", email); // Log to verify correct email
            return email;
        },
        onDoctorChange: function (oEvent) {
            var selectedDoctorId = oEvent.getSource().getSelectedKey();
            var oModel = this.getView().getModel("odataModel");
        
            var sPath = "/zdoctorSet(" + selectedDoctorId + ")";
            oModel.read(sPath, {
                success: function (oData) {
                    this.getView().byId("doctorFees").setValue(oData.Docfees);
                    this._selectedDoctorName = oData.Username; // Store the doctor's name
                }.bind(this),
                error: function (oError) {
                    var errorMessage = oError.message || "Error fetching doctor fees.";
                    MessageToast.show(errorMessage);
                    console.error("Error Details:", oError);
                }
            });
        },
        onSubmit: function () {
            // Appointment creation logic using fetched patient data
            var oModel = this.getView().getModel("odataModel");

            if (!this._patientData) {
                MessageToast.show("Patient data is missing.");
                return;
            }

            // Prepare appointment data using fetched patient details
            var oAppointmentData = {
                Doctor: this._selectedDoctorName,
                Docfees: parseInt(this.getView().byId("doctorFees").getValue(), 10),
                Appdate: this._formatDate(this.getView().byId("appointmentDate").getDateValue()),
                Apptime: this._convertTimeToISO8601Duration(this.getView().byId("appointmentTime").getDateValue()),
                Pid: this._patientData.Pid,   // Use the patient's ID
                Fname: this._patientData.Fname, // Use patient's first name
                Lname: this._patientData.Lname, // Use patient's last name
                Gender: this._patientData.Gender, // Use patient's gender
                Email: this._patientData.Email, // Use patient's email
                Contact: this._patientData.Contact // Use patient's contact number
            };
            console.log("Appointment data:", oAppointmentData); // Log appointment data to verify correctness

            // Create appointment
            oModel.create("/zappointmentSet", oAppointmentData, {
                success: function () {
                    MessageToast.show("Appointment created successfully!");
                    console.log("Appointment successfully created:", oAppointmentData);
                    var oEventBus = sap.ui.getCore().getEventBus();
                    oEventBus.publish("appointment", "refreshHistory");
        
                },
                error: function (oError) {
                    var errorMessage = oError.message || "Error creating appointment.";
                    MessageToast.show(errorMessage);
                    console.error("Error creating appointment:", oError);
                },
                

            });
            
        },
        _formatDate: function (oDate) {
            if (!oDate) {
                return null;
            }
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern: "yyyy-MM-ddTHH:mm:ss"
            });
            return oDateFormat.format(oDate, true); // UTC
        },
        _convertTimeToISO8601Duration: function (oDate) {
            if (!oDate) {
                return null;
            }
            var hours = oDate.getHours().toString().padStart(2, '0');
            var minutes = oDate.getMinutes().toString().padStart(2, '0');
            var seconds = oDate.getSeconds().toString().padStart(2, '0');
            return `PT${hours}H${minutes}M${seconds}S`;
        }
    });
});
