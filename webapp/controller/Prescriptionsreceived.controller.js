sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, ODataModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("hospitalmanage.controller.Prescriptionsreceived", {
        onInit: function () {
            // Initialize OData model
            var oModel = new ODataModel("/sap/opu/odata/sap/ZHM_PROJECT_SRV/");
            this.getView().setModel(oModel, "odataModel");

            // Call function to fetch Id and Pid
            this._fetchIdAndPidByEmail();
        },

        _fetchIdAndPidByEmail: function () {
            var oModel = this.getView().getModel("odataModel");
            var sPatientEmail = window.sessionStorage.getItem("loggedInPatientEmail");

            if (!sPatientEmail) {
                MessageToast.show("Patient email is not available.");
                return;
            }

            console.log("Logged in patient email:", sPatientEmail);

            // Fetch appointments using the patient's email
            oModel.read("/zappointmentSet", {
                filters: [new Filter("Email", FilterOperator.EQ, sPatientEmail)],
                success: function (oData) {
                    console.log("Filtered Appointment Data:", oData);

                    if (oData.results.length === 0) {
                        MessageToast.show("No appointments found for the patient.");
                        return;
                    }

                    // Create an array to store Id and Pid of matched records
                    var appointmentDetails = oData.results.map(function (appointment) {
                        if (appointment.Email === sPatientEmail) {
                            return {
                                Id: appointment.Id, // Appointment ID
                                Pid: appointment.Pid  // Patient ID
                            };
                        }
                    }).filter(Boolean);
                    console.log("Matched Appointment Details:", appointmentDetails);

                    // Now fetch prescriptions based on the matched appointment details
                    this._fetchPrescriptions(appointmentDetails);
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Failed to fetch appointment data.");
                    console.error("Error details:", oError);
                }
            });
        },

        _fetchPrescriptions: function (appointmentDetails) {
            var oModel = this.getView().getModel("odataModel");
            var aPrescriptions = []; // Array to hold matched prescriptions
            var totalAppointments = appointmentDetails.length;
            var completedRequests = 0; // Track completed requests
        
            appointmentDetails.forEach(function (appointment) {
                oModel.read("/zprescriptionSet", {
                    filters: [
                        new Filter("Id", FilterOperator.EQ, appointment.Id),
                        new Filter("Pid", FilterOperator.EQ, appointment.Pid)
                    ],
                    success: function (oData) {
                        console.log("Fetched Prescription Data for Appointment ID:", appointment.Id);
                        console.log("Prescription Data:", oData);
        
                        // Only add prescriptions that match both conditions
                        if (oData.results.length > 0) {
                            oData.results.forEach(function (prescription) {
                                if (prescription.Id === appointment.Id && prescription.Pid === appointment.Pid) {
                                    aPrescriptions.push(prescription); // Add matched prescription
                                }
                            });
                        }
        
                        completedRequests++;
                        // Check if all requests are completed
                        if (completedRequests === totalAppointments) {
                            this._displayPrescriptions(aPrescriptions);
                        }
                    }.bind(this),
                    error: function (oError) {
                        console.error("Error details:", oError);
                        if (oError.responseText) {
                            console.error("Response Text:", oError.responseText);
                        }
                        MessageToast.show("Failed to fetch prescription data.");
                    }
                });
            }, this);
        },
        
        _displayPrescriptions: function (prescriptions) {
            // Use a Set to filter out duplicate records
            const uniquePrescriptions = Array.from(new Set(prescriptions.map(p => JSON.stringify(p)))).map(JSON.parse);

            // Logic to display prescriptions in the view
            console.log("Final Prescription Data to Display:", uniquePrescriptions);
            var oTable = this.getView().byId("prescriptionsTable1"); // Replace with your table ID
            if (oTable) {
                var oModel = new sap.ui.model.json.JSONModel(uniquePrescriptions);
                oTable.setModel(oModel);
                oTable.bindItems({
                    path: "/",
                    template: new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Text({ text: "{Id}" }),
                            new sap.m.Text({ text: "{Pid}" }),
                            new sap.m.Text({ text: "{Doctor}" }),
                            new sap.m.Text({ text: "{Fname}" }),
                            new sap.m.Text({ text: "{Lname}" }),
                            new sap.m.Text({ text: "{Appdate}" }),
                            new sap.m.Text({ text: "{Apptime}" }),
                            new sap.m.Text({ text: "{Disease}" }),
                            new sap.m.Text({ text: "{Allergy}" }),
                            new sap.m.Text({ text: "{Prescription}" })
                        ]
                    })
                });
            } else {
                console.error("Table not found.");
            }
        }
    });
});
