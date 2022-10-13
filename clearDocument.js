function ClearDocument(document) {
    this.document = document;
    this.dialogWindow;
    this.log = "Logger Clear Document\n";
    this.ui();
}

ClearDocument.prototype._pageItems = [
    "Graph Items", "Compound Path Items", "Group Items", "Legacy Text Items", "Mesh Items", "Non Native Items", "Path Items", "Placed Items", "Plugin Items", "Raster Items", "Symbol Items", "Text Frames"
]
ClearDocument.prototype._collections = [
    "Graphic Styles", "Paragraph Styles", "Character Styles", "Swatches", "Swatch Groups", "Gradients", "Patterns", "Spots", "Data Sets", "Symbols", "Tags", "Variables", "Artboards", "Layers"
]

ClearDocument.prototype.ui = function () {
    if (!this.dialogWindow) {
        // DIALOG
        // ======
        var dialog = new Window("dialog");
        dialog.text = "Clear Document";
        dialog.orientation = "row";
        dialog.alignChildren = ["center", "top"];
        dialog.spacing = 10;
        dialog.margins = 16;

        this.dialogWindow = dialog;

        // _ELEMENTS
        // =========
        var _elements = dialog.add("panel", undefined, undefined, { name: "_elements" });
        _elements.text = "Collections";
        _elements.preferredSize.width = 200;
        _elements.orientation = "column";
        _elements.alignChildren = ["left", "top"];
        _elements.spacing = 10;
        _elements.margins = 10;

        for (var i = 0; i < this._collections.length; i++) {
            var collection = this._collections[i]
            var name = collection[0].toLowerCase() + collection.slice(1).split(" ").join("");
            var itm = _elements.add("checkbox", undefined, undefined, { name: "_" + name });
            itm.text = collection + " = " + this.document[name].length;
            if (this.document[name].length > 0) {
                itm.value = true;
            } else {
                itm.enabled = false;
            }
        }

        // PAGEITEMS
        // =========
        var pageItems = dialog.add("panel", undefined, undefined, { name: "pageItems" });
        pageItems.text = "Page Items";
        pageItems.preferredSize.width = 200;
        pageItems.orientation = "column";
        pageItems.alignChildren = ["left", "top"];
        pageItems.spacing = 10;
        pageItems.margins = 10;

        var _all = pageItems.add("checkbox", undefined, undefined, { name: "_all" });
        _all.text = "All page Items";
        _all.value = true;

        // _ITEMS
        // ======
        var _items = pageItems.add("group", undefined, { name: "_items" });
        _items.orientation = "column";
        _items.alignChildren = ["left", "center"];
        _items.spacing = 10;
        _items.margins = 0;


        for (var j = 0; j < this._pageItems.length; j++) {
            var pageItms = this._pageItems[j]
            var name = pageItms[0].toLowerCase() + pageItms.slice(1).split(" ").join("");
            var itm = _items.add("checkbox", undefined, undefined, { name: "_" + name });
            itm.text = pageItms + " = " + this.document[name].length;
            if (this.document[name].length > 0) {
                itm.value = true;
            } else {
                itm.enabled = false;
            }
        }

        // BTNS
        // ====
        var btns = dialog.add("group", undefined, { name: "btns" });
        btns.orientation = "column";
        btns.alignChildren = ["left", "center"];
        btns.spacing = 10;
        btns.margins = 0;

        var ok = btns.add("button", undefined, undefined, { name: "ok" });
        ok.text = "OK";

        var cancel = btns.add("button", undefined, undefined, { name: "cancel" });
        cancel.text = "Cancel";

        btns.add("statictext", undefined,"Programado por:")
        btns.add("statictext", undefined,"Diego Lopez")
        btns.add("statictext", undefined,"Agencia Pantera")

        // ======
        // EVENTS
        // ======
        _all.onClick = function(){
            for(var i = 0; i< _items.children.length; i++){
                if(_items.children[i].enabled){
                    _items.children[i].value = this.value;
                }
            }
        }

        ok.onClick = this.run();

        dialog.show();
    }
    return this.dialogWindow;
}

ClearDocument.prototype.run = function () {
    var self = this;
    return function () { self.process() }
}

ClearDocument.prototype.process = function () {

    var allOptions = this._pageItems.concat(this._collections);

    for (var i = 0; i < allOptions.length; i++) {
        var optionName = allOptions[i];
        var docPropertyName = optionName[0].toLowerCase() + optionName.slice(1).split(" ").join("");
        var docProperty = this.document[docPropertyName];
        var uiElement = this.dialogWindow.findElement("_" + docPropertyName);

        if (uiElement.value) {
            try {
                docProperty.removeAll();
                this.log += optionName + " all removed \n";
            } catch (err) {
                try {
                    this.log += optionName + ".removeAll() ==> F A I L \n";
                    this.log += optionName + " loop: " + docProperty.length + "\n";

                    var prev_length = docProperty.length;
                    while (docProperty.length > 0) {
                        docProperty[docProperty.length - 1].remove();
                        --prev_length;
                        if (prev_length < docProperty.length) {
                            break;
                        }
                    }
                } catch (e) {
                    this.log += optionName + " : " + err + "\n";
                }
            }
        }

    }
    //alert(this.log, "Resumen logger")
    this.dialogWindow.close()
}


var doc = app.documents.length > 0 ? app.activeDocument || app.documents[0] : app.documents.add();
var clear_doc = new ClearDocument(doc);