sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Input"
], function (Controller, ODataModel, JSONModel, MessageToast,MessageBox, Dialog, Button, VBox, Label, Input) {
    "use strict";

    return Controller.extend("hospitalmanage.controller.Appoint", {
        onInit: function () {
            var oModel = new ODataModel("/sap/opu/odata/sap/ZHM_PROJECT_SRV/");
            this.getView().setModel(oModel, "odataModel");

            var oViewModel = new JSONModel({ appointments: [] });
            this.getView().setModel(oViewModel, "viewModel");

            this._loadAppointments();
        },

        _loadAppointments: function () {
            var oModel = this.getView().getModel("odataModel");
            var oViewModel = this.getView().getModel("viewModel");

            var doctorUsername = window.sessionStorage.getItem("loggedInDoctorUsername");
            if (!doctorUsername) {
                MessageToast.show("Doctor username is not available.");
                return;
            }

            oModel.read("/zappointmentSet", {
                success: function (oData) {
                    console.log("Fetched Appointments:", oData); // Log fetched data

                    var filteredAppointments = oData.results.filter(function (appointment) {
                        return appointment.Doctor === doctorUsername;
                    });

                    // Log filtered appointments
                    console.log("Filtered Appointments:", filteredAppointments);

                    // Map Userstatus to a readable text
                    filteredAppointments = filteredAppointments.map(function (appointment) {
                        console.log("Userstatus for appointment:", appointment.Userstatus); // Log Userstatus

                        switch (appointment.Userstatus) {
                            case 0:
                                appointment.StatusText = "Booked";
                                break;
                            case 1:
                                appointment.StatusText = "Cancelled by Patient";
                                break;
                            case 2:
                                appointment.StatusText = "Cancelled by Doctor";
                                break;
                            default:
                                appointment.StatusText = "Unknown Status"; // Fallback for unexpected values
                        }
                        return appointment;
                    });

                    oViewModel.setProperty("/appointments", filteredAppointments);
                },
                error: function (oError) {
                    console.error("Error fetching appointments:", oError); // Log error details
                    MessageToast.show("Failed to load appointments.");
                }
            });
        },
        onPrescribe: function (oEvent) {
            debugger
            var oButton = oEvent.getSource();
            var oListItem = oButton.getParent();
            var oContext = oListItem.getBindingContext("viewModel");

            if (!oContext) {
                MessageToast.show("No context found for the selected appointment.");
                return;
            }

            var oAppointment = oContext.getObject();
            var sAppointmentId = oAppointment.Id;
            var sPatientId = oAppointment.Pid;

            // Check if prescription already exists for this appointment
            this._checkIfAlreadyPrescribed(sAppointmentId, sPatientId, oAppointment);
        },

        _checkIfAlreadyPrescribed: function (sAppointmentId, sPatientId, oAppointment) {
            var oModel = this.getView().getModel("odataModel");
            var that = this;
        
            // Create filters to check if prescription already exists
            var aFilters = [
                new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, sAppointmentId),
                new sap.ui.model.Filter("Pid", sap.ui.model.FilterOperator.EQ, sPatientId)
            ];
        
            // Read from zprescriptionSet to get all records and filter client-side
            oModel.read("/zprescriptionSet", {
                success: function (oData) {
                    // Filter results client-side based on Id and Pid
                    var existingPrescriptions = oData.results.filter(function (record) {
                        return record.Id === sAppointmentId && record.Pid === sPatientId;
                    });
        
                    // Check if there are results
                    if (existingPrescriptions.length > 0) {
                        // Prescription already exists
                        MessageToast.show("This appointment has already been prescribed.");
                    } else {
                        // No existing prescription, open dialog for new prescription entry
                        that._openPrescriptionDialog(oAppointment);
                    }
                },
                error: function (oError) {
                    MessageToast.show("Failed to check prescription.");
                    console.error("Error details:", oError);
                }
            });
        },
        _openPrescriptionDialog: function (oAppointment) {
            var sAppointmentId = oAppointment.Id;
            var sPatientId = oAppointment.Pid;
            var sPatientName = oAppointment.Fname + " " + oAppointment.Lname;

            if (!this._oDialog) {
                this._oDialog = new Dialog({
                    id: "prescriptionDialog",
                    title: "Enter Prescription Details",
                    content: [
                        new VBox({
                            items: [
                                new Label({ text: "Disease" }),
                                new Input({ id: this.createId("dialogDisease") }),

                                new Label({ text: "Allergy" }),
                                new Input({ id: this.createId("dialogAllergy") }),

                                new Label({ text: "Prescription" }),
                                new Input({ id: this.createId("dialogPrescription") })
                            ]
                        })
                    ],
                    beginButton: new Button({
                        text: "Save",
                        press: this.onSavePrescription.bind(this)
                    }),
                    endButton: new Button({
                        text: "Close",
                        press: this.onDialogClose.bind(this)
                    })
                });

                this.getView().addDependent(this._oDialog);
            }

            this.byId("dialogDisease").setValue(oAppointment.Disease || "");
            this.byId("dialogAllergy").setValue(oAppointment.Allergy || "");
            this.byId("dialogPrescription").setValue(oAppointment.Prescription || "");

            // Store data in dialog
            this._oDialog.data("appointmentId", sAppointmentId);
            this._oDialog.data("patientId", sPatientId);
            this._oDialog.data("patientName", sPatientName);

            this._oDialog.open();
        },

        onSavePrescription: function () {
            var oModel = this.getView().getModel("odataModel");

            if (!this._oDialog) {
                MessageToast.show("Dialog is not available.");
                return;
            }

            var sDisease = this.byId("dialogDisease").getValue();
            var sAllergy = this.byId("dialogAllergy").getValue();
            var sPrescription = this.byId("dialogPrescription").getValue();
            var sAppointmentId = this._oDialog.data("appointmentId");
            var sPatientId = this._oDialog.data("patientId");
            var sPatientName = this._oDialog.data("patientName");
            var sDoctorName = window.sessionStorage.getItem("loggedInDoctorUsername");

            if (!sAppointmentId || !sPatientId || !sDoctorName) {
                MessageToast.show("Required details are missing.");
                return;
            }

            // Get the current date and time
            var currentDate = new Date();
            var oFormattedDate = this._formatDate(currentDate);
            var oFormattedTime = this._convertTimeToISO8601Duration(currentDate);

            var oPayload = {
                Id: sAppointmentId,
                Pid: sPatientId,
                Fname: sPatientName.split(" ")[0],
                Lname: sPatientName.split(" ")[1],
                Doctor: sDoctorName,
                Disease: sDisease,
                Allergy: sAllergy,
                Prescription: sPrescription,
                Appdate: oFormattedDate, // Formatted date
                Apptime: oFormattedTime // Formatted time
            };

            // Create a new prescription record
            oModel.create("/zprescriptionSet", oPayload, {
                success: function () {
                    MessageToast.show("Prescription created successfully.");
                    // Publish an event to refresh the prescriptions
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.publish("Prescriptions", "RefreshPrescriptions");
                    
                },
                error: function (oError) {
                    var errorMsg = JSON.parse(oError.responseText).error.message.value;
                    MessageToast.show("Failed to save prescription: " + errorMsg);
                    console.error("Error details:", oError);
                }
            });

            this._oDialog.close();
        },

        onDialogClose: function () {
            if (this._oDialog) {
                this._oDialog.close();
            } else {
                MessageToast.show("Dialog is not available.");
            }
        },

        _formatDate: function (oDate) {
            if (!oDate) {
                return null;
            }
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern: "yyyy-MM-ddTHH:mm:ss"
            });
            return oDateFormat.format(oDate, true); // 'true' for UTC
        },

        _convertTimeToISO8601Duration: function (date) {
            if (!date) {
                return null;
            }
            var hours = date.getUTCHours().toString().padStart(2, '0');
            var minutes = date.getUTCMinutes().toString().padStart(2, '0');
            var seconds = date.getUTCSeconds().toString().padStart(2, '0');
            return `PT${hours}H${minutes}M${seconds}S`;
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
            debugger
            var oTable = this.byId("appointmentsTable");
            var oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageToast.show("Please select an appointment to cancel.");
                return;
            }

            var oAppointment = oSelectedItem.getBindingContext("viewModel").getObject();

            if (oAppointment.Userstatus === 0) { // Only allow cancellation for booked appointments
                this._confirmCancellation(oAppointment);
            } else {
                MessageToast.show("This appointment cannot be cancelled.");
            }
        },

        _confirmCancellation: function (oAppointment) {
            MessageBox.confirm("Are you sure you want to cancel this appointment?", {
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

            var oUpdateData = {
                Userstatus: 2 // Set status to cancelled by doctor
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
                }
            });
        }
    });
});
