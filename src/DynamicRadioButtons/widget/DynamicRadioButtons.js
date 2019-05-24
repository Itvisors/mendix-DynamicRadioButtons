define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/dom-attr",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "dojo/text!DynamicRadioButtons/widget/template/DynamicRadioButtons.html",


], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoOn, dojoAttr, dojoArray, lang, dojoText, dojoHtml, dojoEvent, widgetTemplate) {
    "use strict";

    return declare("DynamicRadioButtons.widget.DynamicRadioButtons", [ _WidgetBase, _TemplatedMixin ], {
        templateString: widgetTemplate,

        //Parameters configured in the Modeler
        enumAttr: "",
        enumValues: [],
        enumKey: "",
        captionBefore: "",
        captionAttr: "",
        captionAfter: "",
        mfOrNano: "",
        onChangeMF: "",
        onChangeNano: null,
        readonly: false,
        direction: "",
        showLabel: false,
        labelCaption: "",
        labelWidth: 0,

        // DOM elements
        inputNode: null,
        widgetNode: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _initialized: false,


        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            if (!this._initialized) {
                this._setupRadioButtons();
            }
            this._updateRendering(callback);
        },

        resize: function (box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function () {
            logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._clearValidations();

            this._executeCallback(callback, "_updateRendering");
        },

        _setupRadioButtons: function () {
            logger.debug(this.id + "._setupRadioButtons");
            //Check whether the widget should be readonly
            if (this.readOnly || this.get("disabled") || this.readonly) {
                this._isReadOnly = true;
            }
            if (this.showLabel === "useLabel") {
                var labelHtml = "<label class='control-label col-sm-" + this.labelWidth + "'>" + 
                    this.labelCaption + "</label>";
                dojoConstruct.place(labelHtml, this.widgetNode, "first");
                dojoClass.add(this.widgetNode, "form-group");
                dojoClass.add(this.inputNode, "col-sm-" + (12-this.labelWidth));
            }
            dojo.forEach(this.enumValues, lang.hitch(this, function(enumValue){
                var html, 
                    disabled = "",
                    checked = "",
                    name = this._contextObj.getGuid() + "-" + this.id;
                
                if (this._isReadOnly) {
                    disabled = "disabled";
                }

                if (this._contextObj.get(this.enumAttr) === enumValue.enumKey) {
                    checked = "checked";
                }

                var captionAttr;
                if (this._contextObj.isEnum(enumValue.captionAttr)) {
                    captionAttr = this._contextObj.getEnumCaption(enumValue.captionAttr);
                } else {
                    captionAttr = this._contextObj.get(enumValue.captionAttr);
                }

                html = "<input type='radio' name='"+ name +"' value='" + enumValue.enumKey + "' " + disabled + " " + checked + "></input>"
                + enumValue.captionBefore + captionAttr + enumValue.captionAfter ;
                if (this.direction === "horizontal") {
                    html = "<label class='radio-inline'>" + html + "</label>";
                } else {
                    html = "<div class='radio'><label>" + html + "</label></div>";
                }

                var buttonNode = dojoConstruct.place(html, this.inputNode);
                dojoOn(buttonNode, "click", lang.hitch(this, function() {this._handleOnClick(buttonNode, enumValue.enumKey);}));
            }));
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        },

        // Handle validations.
        _handleValidation: function (validations) {
            logger.debug(this.id + "._handleValidation");
            this._clearValidations();

            var validation = validations[0],
                message = validation.getReasonByAttribute(this.enumAttr);

            if (this._readOnly) {
                validation.removeAttribute(this.enumAttr);
            } else if (message) {
                this._addValidation(message);
                validation.removeAttribute(this.enumAttr);
            }
        },

        // Clear validations.
        _clearValidations: function () {
            logger.debug(this.id + "._clearValidations");
            dojoConstruct.destroy(this._alertDiv);
            this._alertDiv = null;
        },

        // Show an error message.
        _showError: function (message) {
            logger.debug(this.id + "._showError");
            if (this._alertDiv !== null) {
                dojoHtml.set(this._alertDiv, message);
                return true;
            }
            this._alertDiv = dojoConstruct.create("div", {
                "class": "alert alert-danger",
                "innerHTML": message
            });
            dojoConstruct.place(this._alertDiv, this.domNode);
        },

        // Add a validation.
        _addValidation: function (message) {
            logger.debug(this.id + "._addValidation");
            this._showError(message);
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            this.unsubscribeAll();

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });

                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.enumAttr,
                    callback: lang.hitch(this, function (guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: lang.hitch(this, this._handleValidation)
                });
            }
        },

        _handleOnClick: function (radioNode, key) {
            if (this._isReadOnly) {
                return;
            }

            dojoAttr.set(radioNode, "checked", true);
            this._contextObj.set(this.enumAttr, key);

            if (this.mfOrNano === "mf") {               
                if (this.onChangeMF) {
                    mx.data.action({
                        params: {
                            applyto: "selection",
                            actionname: this.onChangeMF,
                            guids: [this._contextObj.getGuid()]
                        },
                        store: {
                            caller: this.mxform
                        },
                        callback: function () {}, // stub function
                        error: lang.hitch(this, function (error) {
                            console.log(this.id + ": An error occurred while executing microflow: " + error.description);
                        })
                    }, this);
                }
            } else if (this.mfOrNano === "nano") { 
                if (this.onChangeNano.nanoflow !== undefined) {
                    mx.data.callNanoflow({
                        nanoflow: this.onChangeNano,
                        origin: this.mxform,
                        context: this.mxcontext,
                        callback: function() {},
                        error: function(error) {
                            alert(error.message);
                        }
                    });
                }
            }
        }
    });
});

require(["DynamicRadioButtons/widget/DynamicRadioButtons"]);
