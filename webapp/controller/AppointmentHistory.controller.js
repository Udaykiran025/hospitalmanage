sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, ODataModel, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("hospitalmanage.controller.AppointmentHistory", {
        onInit: function () {
            // Set up OData model for the backend service
            var oModel = new ODataModel("/sap/opu/odata/sap/ZHM_PROJECT_SRV/");
            this.getView().setModel(oModel, "odataModel");

            // Create a JSON model for storing appointment data
            var oViewModel = new JSONModel({ appointments: [] });
            this.getView().setModel(oViewModel, "viewModel");

            // Load appointment data when the view is initialized
            this._loadAppointments();

             // Subscribe to the event from the Bookappoint controller
             var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("appointment", "refreshHistory", this._loadAppointments, this);
        },
        
        _loadAppointments: function () {
            var oModel = this.getView().getModel("odataModel");
            var oViewModel = this.getView().getModel("viewModel");
            var patientEmail = window.sessionStorage.getItem("loggedInPatientEmail");

            console.log("Retrieved Patient Email:", patientEmail); // Debug statement

            if (!patientEmail) {
                MessageToast.show("Patient email is not available.");
                return;
            }

            // Fetch all appointments from the backend OData service
            oModel.read("/zappointmentSet", {
                success: function (oData) {
                    console.log("Fetched Appointments:", oData); // Debug statement

                    // Filter appointments client-side based on the patient's email
                    var filteredAppointments = oData.results.filter(function (appointment) {
                        return appointment.Email === patientEmail;
                    });

                    // Map user status to readable text
                    filteredAppointments = filteredAppointments.map(function (appointment) {
                        switch (appointment.Userstatus) {
                            case 0:
                                appointment.UserstatusText = "BOOKED";
                                break;
                            case 1:
                                appointment.UserstatusText = "CANCELLED BY PATIENT";
                                break;
                            case 2:
                                appointment.UserstatusText = "CANCELLED BY DOCTOR";
                                break;
                            default:
                                appointment.UserstatusText = "UNKNOWN STATUS"; // Fallback for unexpected values
                        }
                        return appointment;
                    });

                    // Log the filtered appointments
                    console.log("Filtered Appointments with Userstatus Text:", filteredAppointments);

                    // Update the view model with the filtered appointments
                    if (filteredAppointments.length === 0) {
                        MessageToast.show("No appointments found for this patient.");
                    } else {
                        oViewModel.setProperty("/appointments", filteredAppointments);
                    }
                },
                error: function (oError) {
                    console.error("Error fetching appointments:", oError);
                    MessageToast.show("Failed to load appointments.");
                }
            });
        },

        onAppointmentSelect: function (oEvent) {
            console.log("Item Press Event Triggered");
            var oSelectedItem = oEvent.getParameter("listItem");
            if (!oSelectedItem) {
                MessageToast.show("No appointment selected.");
                return;
            }

            // Get the binding context of the selected item
            var oAppointment = oSelectedItem.getBindingContext("viewModel").getObject();
            console.log("Selected Appointment:", oAppointment);

            // Check appointment status
            if (oAppointment.Userstatus === 0) { // Only allow cancellation for booked appointments
                this._confirmCancellation(oAppointment);
            } else {
                MessageToast.show("This appointment cannot be cancelled.");
            }
        },

        onCancelAppointment: function () {
            var oTable = this.byId("appointmentTable");
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageToast.show("No appointment selected.");
                return;
            }

            // Get the binding context of the selected item
            var oAppointment = oSelectedItem.getBindingContext("viewModel").getObject();

            // Check appointment status
            if (oAppointment.Userstatus === 0) { // Only allow cancellation for booked appointments
                this._confirmCancellation(oAppointment);
            } else {
                MessageToast.show("This appointment cannot be cancelled.");
            }
        },

        _confirmCancellation: function (oAppointment) {
            MessageBox.confirm("Are you sure you want to cancel this booking?", {
                title: "Confirm Cancellation",
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this._cancelAppointment(oAppointment);
                    }
                }.bind(this)
            });
        },

        _cancelAppointment: function (oAppointment) {
            var oModel = this.getView().getModel("odataModel");
            var sPath = "/zappointmentSet(" + oAppointment.Id + ")"; // Assuming Id is the key

            // Update user status to 1 (CANCELLED BY PATIENT)
            var oUpdateData = {
                Userstatus: 1 // Set status to cancelled by patient
            };

            oModel.update(sPath, oUpdateData, {
                method: "PATCH",
                success: function () {
                    MessageToast.show("Appointment cancelled successfully!");
                    this._loadAppointments(); // Refresh the appointment list
                }.bind(this),
                error: function (oError) {
                    console.error("Error cancelling appointment:", oError);
                    MessageToast.show("Failed to cancel appointment.");
                },
                onExit: function () {
                    var oEventBus = sap.ui.getCore().getEventBus();
                    oEventBus.unsubscribe("appointment", "refreshHistory", this._loadAppointments, this);
                }
            });
        }
    });
});
