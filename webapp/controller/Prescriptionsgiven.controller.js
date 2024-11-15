sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, ODataModel, JSONModel, MessageToast) {
    return Controller.extend("hospitalmanage.controller.Prescriptionsgiven", {
        onInit: function () {
            // Initialize OData model and view model
            var oModel = new ODataModel("/sap/opu/odata/sap/ZHM_PROJECT_SRV/");
            this.getView().setModel(oModel, "odataModel");

            var oViewModel = new JSONModel({ prescriptions: [] });
            this.getView().setModel(oViewModel, "viewModel");

            // Load prescriptions for the logged-in doctor
            this._loadPrescriptions();

             // Subscribe to the event for refreshing prescriptions
            var oEventBus = sap.ui.getCore().getEventBus();
    oEventBus.subscribe("Prescriptions", "RefreshPrescriptions", this._loadPrescriptions, this);
        },

        _loadPrescriptions: function () {
            var oModel = this.getView().getModel("odataModel");
            var oViewModel = this.getView().getModel("viewModel");
            var sDoctorName = window.sessionStorage.getItem("loggedInDoctorUsername");

            if (!sDoctorName) {
                MessageToast.show("Doctor username is not available.");
                return;
            }

            // Create filter to fetch prescriptions by the logged-in doctor
            var aFilters = [
                new sap.ui.model.Filter("Doctor", sap.ui.model.FilterOperator.EQ, sDoctorName)
            ];

            oModel.read("/zprescriptionSet", {
                filters: aFilters,
                success: function (oData) {
                    // Process only the required fields from the result
                    var aFilteredPrescriptions = oData.results.map(function (record) {
                        // Ensure to only include records where 'Doctor' matches
                        if (record.Doctor === sDoctorName) {
                            return {
                                Id: record.Id,
                                Pid: record.Pid,
                                Doctor: record.Doctor,
                                Fname: record.Fname,
                                Lname: record.Lname,
                                Disease: record.Disease,
                                Allergy: record.Allergy,
                                Prescription: record.Prescription,
                                Appdate: record.Appdate,
                                Apptime: record.Apptime
                            };
                        }
                    }).filter(Boolean); // Remove undefined entries

                    oViewModel.setProperty("/prescriptions", aFilteredPrescriptions);
                },
                error: function (oError) {
                    MessageToast.show("Failed to load prescriptions.");
                    console.error("Error details:", oError);
                },
                onExit: function () {
                    var oEventBus = sap.ui.getCore().getEventBus();
                    oEventBus.unsubscribe("Prescriptions", "RefreshPrescriptions", this._loadPrescriptions, this);
                },
            });
        }
    });
});
