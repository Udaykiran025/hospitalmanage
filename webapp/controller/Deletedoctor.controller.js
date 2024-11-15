sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/odata/v2/ODataModel"
], function (Controller, MessageBox, MessageToast, ODataModel) {
    "use strict";

    return Controller.extend("hospitalmanage.controller.Deletedoctor", {

        onInit: function () {
            // Initialize OData model and set it to the view
            var oModel = new ODataModel("/sap/opu/odata/sap/ZHM_PROJECT_SRV/");
            this.getView().setModel(oModel);

            // Initialize the local JSON model for form data binding
            var oFormModel = new sap.ui.model.json.JSONModel({
                Doctorid: "",
                Username: "",
                Password: "",
                Email: "",
                Specialization: "",
                Docfees: ""
            });
            this.getView().setModel(oFormModel, "formData");
        },

        onPressFetch: function () {
            debugger
            var oView = this.getView();
            var oModel = oView.getModel();
            var sDoctorId = oView.byId("doctorid").getValue();

            // Ensure Doctorid is treated as an integer
            var iDoctorId = parseInt(sDoctorId, 10);

            if (isNaN(iDoctorId)) {
                MessageToast.show("Please enter a valid Doctor Id.");
                return;
            }

            // Construct the path to fetch the data
            var sPath = "/zdoctorSet(" + iDoctorId + ")";

            // Perform the OData read request to get the record matching the Doctor ID
            oModel.read(sPath, {
                success: function (oData) {
                    // Update the form model with fetched data
                    var oFormModel = oView.getModel("formData");
                    oFormModel.setProperty("/Username", oData.Username);
                    oFormModel.setProperty("/Password", oData.Password);
                    oFormModel.setProperty("/Email", oData.Email);
                    oFormModel.setProperty("/Specialization", oData.Specialization);
                    oFormModel.setProperty("/Docfees", oData.Docfees);
                },
                error: function (oError) {
                    MessageToast.show("Failed to fetch data. Please check the Doctor Id.");
                }
            });
        },

        onPressDelete: function () {
            debugger
            var oView = this.getView();
            var oModel = oView.getModel();
            var oFormData = oView.getModel("formData").getData();
            var sDoctorId = oFormData.Doctorid;
        
            // Ensure Doctorid is treated as an integer
            var iDoctorId = parseInt(sDoctorId, 10);
        
            // Validate required fields (Doctorid cannot be empty)
            if (isNaN(iDoctorId)) {
                MessageBox.error("Please enter a valid Doctor ID.");
                return;
            }
        
            // Construct the path to check for the existing Doctor ID
            var sPath = "/zdoctorSet(" + iDoctorId + ")";
        
            // Perform the OData read request to get the record matching the Doctor ID
            oModel.read(sPath, {
                success: function () {
                    // Doctor ID exists, ask for confirmation to delete
                    MessageBox.confirm("Are you sure you want to delete the record with Doctor ID " + iDoctorId + "?", {
                        title: "Confirm Deletion",
                        onClose: function (sAction) {
                            if (sAction === MessageBox.Action.OK) {
                                // Proceed with deletion if user confirmed
                                oModel.remove(sPath, {
                                    success: function () {
                                        MessageToast.show("Doctor record deleted successfully.");
                                        // Optionally, clear the form data after deletion
                                        oView.getModel("formData").setData({
                                            Doctorid: "",
                                            Username: "",
                                            Password: "",
                                            Email: "",
                                            Specialization: "",
                                            ConsultancyFee: ""
                                        });
                                    },
                                    error: function (oDeleteError) {
                                        try {
                                            var oErrorResponse = JSON.parse(oDeleteError.responseText);
                                            MessageBox.error("Error deleting record: " + oErrorResponse.error.message.value);
                                        } catch (e) {
                                            MessageBox.error("Error deleting record: " + oDeleteError.message);
                                        }
                                    }
                                });
                            }
                        }
                    });
                },
                error: function () {
                    // Display default error message for record not found or other errors
                    MessageBox.error("Record with Doctor ID " + iDoctorId + " not found .");
                }
            });
        }
        
    });
});
