
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/core/UIComponent"
], function (Controller, Fragment, UIComponent) {
    "use strict";

    return Controller.extend("hospitalmanage.controller.Home1", {
        
        // Function called when the "List" button/link is pressed
        
        onPrescriptiongiven: function () {
            debugger
            this._navigateTo("Prescriptionsgiven");
        },
        onNavToAppointment: function () {
            debugger
            this._navigateTo("appoint");
        },
        onNavToAppointmentHistory: function () {
            this._navigateTo("AppointmentHistory");
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


        // Private function to handle navigation
        _navigateTo: function (sRouteName) {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo(sRouteName);
        }
    });
});
