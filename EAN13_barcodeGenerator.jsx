function Codebar(data, width, height) {
    this.data;
    this.width = new UnitValue(width).as("pt");
    this.height = new UnitValue(height).as("pt");
    this.document = this.setDocument();

    if (data.search(/^[0-9]{12}$/) > -1) {
        data += this.checksum(data);
        this.data = data;
    } else {
        throw new Error( "Codebar: not valid data format.\nData: " + data)
    }
}
Codebar.prototype.SIDE_GUARD = '101';
Codebar.prototype.MIDDLE_GUARD = '01010';
Codebar.prototype.ENCODING = {
    'L': ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'],
    'G': ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'],
    'R': ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100']
}
Codebar.prototype.STRUCTURE = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL']
Codebar.prototype.checksum = function (numberString) {
    var n = numberString ? numberString.substr(0, 12) : this.data;
    var nToArray = n.split('');
    var n_ToArrayNumbers = [];
    var sum = 0;
    var res;

    // array items to numbers
    for (var i = 0; i < nToArray.length; i++) {
        n_ToArrayNumbers.push(+nToArray[i]);
    }

    // sum array items
    for (var i = 0; i < n_ToArrayNumbers.length; i++) {
        var valItem = n_ToArrayNumbers[i];
        sum += ((i % 2) > 0) ? valItem * 3 : valItem;
    }

    res = (10 - (sum % 10)) % 10;
    return res;
}
Codebar.prototype.valid = function () {
    var isLengthOK = this.data.search(/^[0-9]{13}$/) !== -1;
    var isChecksumOK = +this.data[12] === this.checksum();
    return (isLengthOK && isChecksumOK);
}
Codebar.prototype.leftEncode = function () {
    var struc = this.STRUCTURE[+this.data[0]];
    var n_str = this.data.substr(1, 6);
    var n_arr = n_str.split("");
    var encoded = [];
    
    // arr item to numbers
    for (var i = 0; i < n_arr.length; i++) {
        var numericItem = +n_arr[i];
        var encodingType = struc[i];
        var encNumber = this.ENCODING[encodingType][numericItem];
        encoded.push( {
            number: numericItem,
            encodingType: encodingType,
            encoded: encNumber,
        });
    };
    return encoded;
}

Codebar.prototype.rightEncode = function () {
    var struc = "RRRRRR";
    var n_str = this.data.substr(7, 6);
    var n_arr = n_str.split("");
    var encoded = [];
    
    // arr item to numbers
    for (var i = 0; i < n_arr.length; i++) {
        var numericItem = +n_arr[i];
        var encodingType = struc[i];
        var encNumber = this.ENCODING[encodingType][numericItem];
        encoded.push( {
            number: numericItem,
            encodingType: encodingType,
            encoded: encNumber,
        });
    };
    return encoded;
}

Codebar.prototype.encode = function () {
    var sideGuard   = { number: "", encodingType: "" , encoded: this.SIDE_GUARD};
    var middleGuard = { number: "", encodingType: "" , encoded: this.MIDDLE_GUARD};

    return [].concat(sideGuard, this.leftEncode(),middleGuard, this.rightEncode(), sideGuard );;
}

Codebar.prototype.colors = function (){
    var white = new CMYKColor();
        white.cyan = 0;
        white.magenta = 0;
        white.yellow = 0;
        white.black = 0;

    var black = new CMYKColor();
        black.cyan = 0;
        black.magenta = 0;
        black.yellow = 0;
        black.black = 100;

    return {
        white: white,
        black: black
    }
}
Codebar.prototype.setDocument = function (){
    return app.documents.length > 0 ? app.activeDocument : app.documents.add();
}
Codebar.prototype.getGroup = function (){
    var lyr;
    try{
        lyr = this.document.layers.getByName("barcode");
    }catch(e){
        lyr = this.document.layers.add();
        lyr.name = "barcode";
    }

    var bc = lyr.groupItems.add();
        bc.name = this.data;

    var bc_bg = bc.pathItems.rectangle( 0, 0, this.width, this.height);
        bc_bg.fillColor = this.colors().white;
        bc_bg.strokeColor = new NoColor();

    return bc;
}
Codebar.prototype.render = function (){

    var bc      = this.getGroup(),  // container group
        digits  = this.encode(),    // each digit and guard
        bar_w   = this.width / 101, // width each bar
        padding,    // distance from background to bars
        shortBar,   // size of bar when digit shows number
        largeBar,   // size of bar
        bars = [];  // collection of all bars objects

    padding = bar_w * 3;
    shortBar = this.height - ( padding * 4 );
    largeBar = this.height - ( padding * 2 );

    ////
    // digits
    ////
    for( var j = 0; j < digits.length; j++ ){
        var digit = digits[j];
            digit.x = (bar_w * bars.length) + padding;
            digit.y = 0;
            digit.isNumber = digit.number.length === undefined;

        // text
        if( j === 0 || digit.isNumber ){
            var anchorX     = (j === 0) ? digit.x - bar_w : digit.x + ( bar_w * 3.5 ),
                txtContents = (j === 0) ? this.data[0] : digit.number,
                justify     = (j === 0) ? Justification.RIGHT: Justification.CENTER;

            digit.txt = bc.textFrames.pointText([ anchorX,  padding - this.height ]);
            digit.txt.contents = txtContents;
            digit.txt.textRange.characterAttributes.size = bar_w * 6;
            digit.txt.textRange.paragraphAttributes.justification = justify;
        }
        

        ////
        // bars
        ////
        for(var i = 0; i < digit.encoded.length; i++){
            var bar = {}
                bar.isShort = digit.isNumber;
                bar.isBlack = digit.encoded[i] === "1";
                bar.x = (bar_w * i) + digit.x;
            
            var actualIndx = bars.push(bar) -1;

            // Revisar si esta es la primera vez que ejecutamos
            if( !bar.isBlack && (bars.length > 1) && bars[ actualIndx - 1 ].isBlack && bars[ actualIndx - 1 ].isShort ){
                // revisar si la anterior era negra
                var steps = 0;
                var indx  = actualIndx - 1;
                while(  indx >= 0 && (bars[indx].isBlack && bars[indx].isShort) ){
                    steps++;
                    indx--;
                }
                var b = bc.pathItems.rectangle( -padding, bars[ actualIndx - steps ].x, bar_w * steps, shortBar );
                    b.fillColor = this.colors().black;
                    b.strokeColor = new NoColor();

            }else if (bar.isBlack && !bar.isShort){
                var b = bc.pathItems.rectangle( -padding, bar.x, bar_w, largeBar );
                    b.fillColor = this.colors().black;
                    b.strokeColor = new NoColor();
            }
        }
        
    }
}



var dlg = (function () {
    // DLG
    // ===
    var dlg = new Window("dialog");
        dlg.text = "Generador de Codigo de Barras";
        dlg.orientation = "column";
        dlg.alignChildren = ["center", "top"];
        dlg.spacing = 10;
        dlg.margins = 16;

    // PNL_NUMBER
    // ==========
    var pnl_number = dlg.add("panel", undefined, undefined, { name: "pnl_number" });
        pnl_number.text = "Numero";
        pnl_number.preferredSize.width = 300;
        pnl_number.orientation = "row";
        pnl_number.alignChildren = ["center", "top"];
        pnl_number.spacing = 10;
        pnl_number.margins = 10;

    var codeNumber = pnl_number.add('edittext {properties: {name: "codeNumber"}}');
        codeNumber.helpTip = "Hasta 12 digitos";
        codeNumber.preferredSize.width = 200;
        codeNumber.text = "";

    var checksum = pnl_number.add('edittext {properties: {name: "checksum", readonly: true}}');
        checksum.preferredSize.width = 50;

    // PNL_OUTPUT
    // ==========
    var pnl_output = dlg.add("panel", undefined, undefined, { name: "pnl_output" });
        pnl_output.text = "Salida";
        pnl_output.preferredSize.width = 300;
        pnl_output.orientation = "row";
        pnl_output.alignChildren = ["center", "top"];
        pnl_output.spacing = 30;
        pnl_output.margins = 10;

    // G_WIDTH
    // =======
    var g_width = pnl_output.add("group", undefined, { name: "g_width" });
        g_width.orientation = "row";
        g_width.alignChildren = ["left", "center"];
        g_width.spacing = 10;
        g_width.margins = 0;

    var st1 = g_width.add("statictext", undefined, undefined, { name: "st1" });
        st1.text = "Ancho";

    var cb_Width = g_width.add('edittext {properties: {name: "cb_Width"}}');
        cb_Width.preferredSize.width = 70;
        cb_Width.text = "1 in";

    // G_HEIGHT
    // ========
    var g_height = pnl_output.add("group", undefined, { name: "g_height" });
        g_height.orientation = "row";
        g_height.alignChildren = ["left", "center"];
        g_height.spacing = 10;
        g_height.margins = 0;

    var st2 = g_height.add("statictext", undefined, undefined, { name: "st2" });
        st2.text = "Alto";

    var cb_Height = g_height.add('edittext {properties: {name: "cb_Height"}}');
        cb_Height.preferredSize.width = 70;
        cb_Height.text = "0.5 in";

    // G_BTNS
    // ======
    var g_btns = dlg.add("group", undefined, { name: "g_btns" });
        g_btns.orientation = "row";
        g_btns.alignChildren = ["left", "center"];
        g_btns.spacing = 10;
        g_btns.margins = 0;

    var ok = g_btns.add("button", undefined, undefined, { name: "ok" });
        ok.text = "OK";
        ok.enabled = false;

    var cancel = g_btns.add("button", undefined, undefined, { name: "cancel" });
        cancel.text = "Cancel";

    // ITEM REFERENCE LIST
    dlg.items = {
        codeNumber: dlg.pnl_number.codeNumber, // edittext
        checksum: dlg.pnl_number.checksum, // edittext
        cb_Width: dlg.pnl_output.g_width.cb_Width, // edittext
        cb_Height: dlg.pnl_output.g_height.cb_Height, // edittext
        ok: dlg.g_btns.ok, // button
        cancel: dlg.g_btns.cancel // button
    };

    dlg.check = function (){
        var passes = [false, false,false]
        var okPasses = 0;

        // --> codenumber
        if(codeNumber.text.length === 12){
            checksum.text = Codebar.prototype.checksum(codeNumber.text);
            passes[0] = true;
        }else{
            checksum.text = "";
            passes[0] = false;
            codeNumber.text = codeNumber.text.substr(0,12);
        }


        // --> measures
        var valueY = new UnitValue(cb_Height.text).as("pt");
        var valueX = new UnitValue(cb_Width.text).as("pt");

        if(valueY == 0){ cb_Height.text = "0.5 inch"; }
        if(valueX == 0){ cb_Width.text = "1 inch"; }

        passes[1] = true;
        passes[2] = true;

        ////
        // is every passes true?
        ////
        for(var i = 0; i < passes.length; i++){  okPasses += passes[i]; }
        
        ////
        // conclusion
        ////
        ok.enabled = ( passes.length === okPasses );
    }

    return dlg;

}());

dlg.items.codeNumber.onChange = dlg.check;
dlg.items.cb_Width.onChange   = dlg.check;
dlg.items.cb_Height.onChange  = dlg.check;
dlg.items.ok.onClick = function (){
    try{
        var codeNumber = dlg.items.codeNumber.text;
        var width = dlg.items.cb_Width.text;
        var height = dlg.items.cb_Height.text;

        cbar = new Codebar( codeNumber, width, height);
        cbar.render();
    }catch(e){
        alert("Line: " + e.line + "\n" + e)
    }

    dlg.close();
}

dlg.show();

var cbar;



