sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/odata/v2/ODataModel"
], function (Controller, MessageBox, MessageToast, ODataModel) {
    "use strict";

    return Controller.extend("hospitalmanage.controller.AddDoctor", {
        onInit: function () {
            // Initialize OData model and set it to the view
            var oModel = new ODataModel("/sap/opu/odata/sap/ZHM_PROJECT_SRV/");
            this.getView().setModel(oModel);

            // Initialize the local JSON model for form data binding
            var oFormModel = new sap.ui.model.json.JSONModel({
                Username: "",
                Specialization: "",
                Email: "",
                Password: "",
                Docfees: ""
            });
            this.getView().setModel(oFormModel, "formData");
        },

        // Fetches the highest Doctor ID in the table and returns the next incremental Doctor ID
        getNextIncrementalDoctorID: function (oModel, callback) {
            // Ensure the model is refreshed to avoid cached data
            oModel.refresh(true);  // Forcefully refresh the data

            var sPath = "/zdoctorSet?$orderby=Doctorid desc&$top=1"; // Fetches the highest Doctor ID

            oModel.read(sPath, {
                success: function (oData) {
                    var maxDoctorID = 0;

                    // Check if data is returned
                    if (oData.results && oData.results.length > 0) {
                        maxDoctorID = parseInt(oData.results[0].Doctorid, 10);  // Get the highest Doctor ID and convert it to an integer
                    }

                    // Return the next Doctor ID by incrementing the max Doctor ID
                    callback(maxDoctorID + 1);
                },
                error: function (oError) {
                    MessageBox.error("Error fetching the maximum Doctor ID: " + oError.message);
                }
            });
        },

        handleSave: function () {
            debugger
            var oView = this.getView();
            var oModel = oView.getModel();
            var oFormData = oView.getModel("formData").getData();

            // Validate required fields
            if (!oFormData.Username || !oFormData.Specialization || !oFormData.Email || !oFormData.Password) {
                MessageBox.error("Please fill all required fields.");
                return;
            }

            // Fetch the next incremental Doctor ID
            this.getNextIncrementalDoctorID(oModel, function (newDoctorID) {
                // Prepare the payload with the new Doctor ID and form data
                var oPayload = {
                    Doctorid: newDoctorID,  // Use the newly generated incremental Doctor ID
                    Username: oFormData.Username,
                    Specialization: oFormData.Specialization,
                    Email: oFormData.Email,
                    Password: oFormData.Password,
                    Docfees: parseFloat(oFormData.Docfees) || 0  // Ensure Docfees is a valid number
                };

                // Call OData service to create the new record
                oModel.create("/zdoctorSet", oPayload, {
                    success: function () {
                        MessageToast.show("Doctor record created successfully ");

                        // Refresh the table to display the newly created record
                        oModel.refresh(true);

                        // Optionally clear the form fields after creation
                        oView.getModel("formData").setData({
                            Username: "",
                            Specialization: "",
                            Email: "",
                            Password: "",
                            Docfees: ""
                        });
                    },
                    error: function (oError) {
                        MessageBox.error("Error creating record: " + oError.message);
                    }
                });
            });
        },

        onReset: function () {
            // Reset the form fields
            this.getView().getModel("formData").setData({
                Username: "",
                Specialization: "",
                Email: "",
                Password: "",
                Docfees: ""
            });
        }
    });
});
