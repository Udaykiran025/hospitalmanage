sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent"
], function (Controller, Fragment, MessageToast, UIComponent) {
    "use strict";

    return Controller.extend("hospitalmanage.controller.Home2", {

        // Function called when the "Doctor List" button/link is pressed
        onNavToBookAppointment: function () {
            debugger
            this._navigateTo("bookappoint");
        },

        // Function called when the "Patients List" button/link is pressed
        onNavToAppointmentHistory: function () {
            this._navigateTo("AppointmentHistory");
        },

        // Function called when the "Appointment" button/link is pressed
        onPrescriptionreceived: function () {
            this._navigateTo("Prescriptionsreceived");
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
