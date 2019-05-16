define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",


], function (declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent) {
    "use strict";

    return declare("DynamicRadioButtons.widget.DynamicRadioButtons", [ _WidgetBase ], {

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

        // Internal variables.
        _handles: null,
        _contextObj: null,


        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
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

            this._executeCallback(callback, "_updateRendering");
        },

        // Shorthand for running a microflow
        _execMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        },

        _handleOnChange: function (radioNode) {
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
