


sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/core/UIComponent"
], function (Controller, Fragment, UIComponent) {
    "use strict";

    return Controller.extend("hospitalmanage.controller.Home", {
        
        // Function called when the "Doctor List" button/link is pressed
        onDoctorlist: function () {
            this._navigateTo("admin");
        },

        // Function called when the "Patients List" button/link is pressed
        onPatientlist: function () {
            this._navigateTo("patientlist");
        },
         // Function called when the "Appointment" button/link is pressed
         onAppointment: function () {
            this._navigateTo("appointmentlist");
        },

         // Function called when the "Prescription" button/link is pressed
         onPrescription: function () {
            this._navigateTo("prescriptionlist");
        },

         // Function called when the "Add Doctor" button/link is pressed
         onAddDoctor: function () {
            this._navigateTo("adddoctor");
        },
         // Function called when the "Delete Doctor" button/link is pressed
         onDeleteDoctor: function () {
            this._navigateTo("deletedoctor");
        },

        // Private function to handle navigation
        _navigateTo: function (sRouteName) {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo(sRouteName);
        }
    });
});
