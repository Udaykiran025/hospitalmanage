sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel"
], function (Controller, ODataModel) {
    "use strict";

    return Controller.extend("hospitalmanage.controller.Admin", {
        onInit: function () {
            var oModel = new ODataModel("/sap/opu/odata/sap/ZHM_PROJECT_SRV/");
            this.getView().setModel(oModel);

            // Attach route matched event to refresh the table when navigating to the view
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("admin").attachPatternMatched(this.onRouteMatched, this);
        },

        onRouteMatched: function () {
            // Refresh the table when the route matches
            var oTable = this.getView().byId("_IDGenTable1");
            oTable.getBinding("items").refresh();
        }
    });
});
