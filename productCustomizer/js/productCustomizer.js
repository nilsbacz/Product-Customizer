WebFont.load({
    google: {
        families: ['Pacifico:400', 'Amatic+SC:400', 'Abril+Fatface', 'Righteous:400']
    }
});

//initializing basic elements
let svg = document.getElementById("customizersvg");

//text
let currenttext = document.getElementById("currenttext0");
let textgroup = document.getElementById("textgroup");
let newtextsize = "";
let textid = 0;
let currentfont = "";
let currenttextsize = "100%";

//arange these by the center of the svg and the center of the first element which is always 91.85, as long as the content of the first element remains "Text Einfügen"
let xcoord = getSvgCenter(1) - 92;
let ycoord = currenttext.getAttribute("y");

//rectangle
let currentrectangle = document.getElementById("collisionbox0");
let rectanglegroup = document.getElementById("rectanglegroup");

//snapping lines
let linegroup = document.getElementById("linegroup");
let snapcoord = {x: 0, y: 0};
let stopvertsnap = false;
let stophorsnap = false;

let verticalline = document.createElementNS("http://www.w3.org/2000/svg", "line");
verticalline.setAttribute("x1", getSvgCenter(1));
verticalline.setAttribute("x2", getSvgCenter(1));
verticalline.setAttribute("y1", 0);
verticalline.setAttribute("y2", svg.getAttribute("height").replace("px", ""));
verticalline.setAttribute("stroke", "");

let horizontalline = document.createElementNS("http://www.w3.org/2000/svg", "line");
horizontalline.setAttribute("x1", 0);
horizontalline.setAttribute("x2", svg.getAttribute("width").replace("px", ""));
horizontalline.setAttribute("y1", getSvgCenter(0));
horizontalline.setAttribute("y2", getSvgCenter(0));
horizontalline.setAttribute("stroke", "");

linegroup.appendChild(horizontalline);
linegroup.appendChild(verticalline);

//binding events for the first rectangle
bindRectangleEvents();

//event listeners
//input
let inputtext = document.getElementById("input");
inputtext.addEventListener("input", () => {
    modifyPreviewTextContent();
    resizeColisionBox();
});

//textsize set buttons
let smalltext = document.getElementById("smalltext");
let mediumtext = document.getElementById("mediumtext");
let bigtext = document.getElementById("bigtext");
smalltext.addEventListener("click", () => {
    modifyPreviewTextSize("50%");
});
mediumtext.addEventListener("click", () => {
    modifyPreviewTextSize("100%");
});
bigtext.addEventListener("click", () => {
    modifyPreviewTextSize("150%");
});

//textsize scaling buttons
let sizeplus = document.getElementById("textsizeplus");
let sizeminus = document.getElementById("textsizeminus");
sizeplus.addEventListener("click", () => {
    newtextsize = Number(currenttextsize.replace("%", ""));
    newtextsize += 10;
    newtextsize += "%";
    modifyPreviewTextSize(newtextsize)
});
sizeminus.addEventListener("click", () => {
    newtextsize = Number(currenttextsize.replace("%", ""));
    newtextsize -= 10;
    newtextsize += "%";
    modifyPreviewTextSize(newtextsize)
});

//text alignment
let alignleft = document.getElementById("alignleft");
let alignmiddle = document.getElementById("alignmiddle");
let alignright = document.getElementById("alignright");
alignleft.addEventListener("click", () => {
    modifyPreviewTextAlignment("left");
});
alignmiddle.addEventListener("click", () => {
    modifyPreviewTextAlignment("middle");
});
alignright.addEventListener("click", () => {
    modifyPreviewTextAlignment("end");
});

//hide text boxes
let hidebutton = document.getElementById("hideboxes");
let hidden = false;
hidebutton.addEventListener("click", () => {
    if (hidden) {
        rectanglegroup.setAttribute("visibility", "visible");
        showVerticalSnappingLine();
        showHorizontalSnappingLine();
        hidden = false;
    } else {
        hidden = true;
        rectanglegroup.setAttribute("visibility", "hidden");
        hideVerticalSnappingLine();
        hideHorizontalSnappingLine();
    }
});

//movement of the rectangles
let selectedElement = false;

function bindRectangleEvents() {
    currentrectangle.addEventListener('mousedown', setCurrentElements);
    currentrectangle.addEventListener('mousedown', startDrag);
    currentrectangle.addEventListener('mousemove', startSnapDrag);
    currentrectangle.addEventListener('mouseup', endDrag);
    currentrectangle.addEventListener('mouseleave', drag);
    // currentrectangle.addEventListener('click',()=>{
    // moveScaleElementToRectangle();
    // });
}

//move scale object
// let selectedScale = false;
// let startscalex = 0;
// scaleelement.addEventListener('mousedown',startScaleText);
// scaleelement.addEventListener('mousemove',scaleText);
// scaleelement.addEventListener('mouseleave',endScaleText);
// scaleelement.addEventListener('mouseup',endScaleText);

//text font
let fontselect = document.getElementById("fonts");
fontselect.addEventListener("change", () => {
    currentfont = fontselect.options[fontselect.selectedIndex].value;
    modifyPreviewTextContent();
    resizeColisionBox();
    moveTextToRect();
});

//add text button
let textbutton = document.getElementById("newtext");
textbutton.addEventListener("click", () => {
    addNewText();
    hideVerticalSnappingLine();
    hideHorizontalSnappingLine();
    clearInput();
    resizeColisionBox();
    modifyPreviewTextSize(currenttextsize);
    bindRectangleEvents();
});

//delete text
let removebutton = document.getElementById("removetext");
removebutton.addEventListener("click", () => {
    // hideScaleButton();
    deleteElement(getRectangleIdNumber(currentrectangle));
});


//initialize first Element
inputtext.value = "Text Einfügen";
addNewText();
modifyPreviewTextContent();
resizeColisionBox();
bindRectangleEvents();


//functions
//adds a new text and a currentrectangle with their fitting id
function addNewText() {
    textid += 1;
    currenttextsize = "100%";

    //adding new text
    let newtext = document.createElementNS("http://www.w3.org/2000/svg", "text");
    newtext.setAttribute("id", "currenttext" + textid);
    newtext.setAttribute("font-size", "200%");
    newtext.setAttribute("text-anchor", "left");

    textgroup.appendChild(newtext);
    currenttext = newtext;

    //adding new rectangle
    currentrectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    currentrectangle.setAttribute("id", "collisionbox" + textid);
    currentrectangle.setAttribute("x", 250);
    currentrectangle.setAttribute("y", 100);
    currentrectangle.setAttribute("width", 0);
    currentrectangle.setAttribute("height", 0);

    rectanglegroup.appendChild(currentrectangle);

}

function clearInput() {
    document.getElementById("input").value = "";
}


/*loads the Input text field up with the text in the svg element
* by reading the input and creating tspan childs into the current text element
* applies font, size and coordinates to all the tspans.
 */
function modifyPreviewTextContent() {
    //create a new tspan for each /\n|\r/g that is being created -> append more childs to xt element
    let textelements = inputtext.value.split(/[\n\r]/g) || [];
    currenttext.innerHTML = '';

    //for each break line, create a new tspan element and change the position according to the parent node "currenttext"
    for (let i = 0; i < textelements.length; i++) {
        //initialize new tspan node
        let newtspantext = textelements[i];
        let newTextNode = document.createTextNode(newtspantext);
        let nextTspanElement = document.createElementNS("http://www.w3.org/2000/svg", "tspan");

        //only initialize size if tspan isnt 0, empty tspan needs to be added so the inputtext can be rebuilt - see setCurrentElements()
        if (textelements[i] !== '') {
            //set the size of the according to the previewTextNode size
            nextTspanElement.style.fontSize = currenttextsize;

            //set the text font
            nextTspanElement.setAttribute("font-family", currentfont);


            //moving tspan further down relative to "currenttext"
            let ycoordfactor = i * (currenttextsize.replace("%", "")) / 3;

            nextTspanElement.setAttribute("x", xcoord);
            nextTspanElement.setAttribute("y", Number(ycoord) + ycoordfactor);

        }
        nextTspanElement.appendChild(newTextNode);

        //append new child to currenttext
        currenttext.appendChild(nextTspanElement);
    }
}

function modifyPreviewTextSize(sizevalue) {
    if (sizevalue.replace("%", "") > 25) {
        currenttextsize = sizevalue;
        //reload the tspan elements with the correct size
        modifyPreviewTextContent();
        resizeColisionBox();
    }
}

function modifyPreviewTextAlignment(alignmentString) {
    currenttext.setAttribute("text-anchor", alignmentString);
    moveTextToRect();
}

//if the border of the rectangle is out of bounds, colors the lines of the text red
function overlapWarning() {
    let svgelem = svg;
    let svgheight = svgelem.getAttribute("height").replace("px", "");
    let svgwidth = svgelem.getAttribute("width").replace("px", "");

    let rightborder = Number(currentrectangle.getAttribute("x")) + Number(currentrectangle.getAttribute("width"));
    let bottomborder = Number(currentrectangle.getAttribute("y")) + Number(currentrectangle.getAttribute("height"));

    if (rightborder > svgwidth || bottomborder > svgheight || currentrectangle.getAttribute("x") < 0 || currentrectangle.getAttribute("y") < 0) {
        currentrectangle.setAttribute("style", "stroke:red;");
    } else {
        currentrectangle.setAttribute("style", "stroke:black;");
    }

}

//aligns the rectangle with the bounding box of the text
function resizeColisionBox() {
    let boundingbox = currenttext.getBBox();

    currentrectangle.setAttribute("x", boundingbox.x);
    currentrectangle.setAttribute("y", boundingbox.y);
    currentrectangle.setAttribute("height", boundingbox.height);
    currentrectangle.setAttribute("width", boundingbox.width);

    //give warning if text overlaps with svg border
    overlapWarning();
    // moveScaleElementToRectangle();
}

//functions for dragging the rectangles
function startDrag(evt) {
    selectedElement = evt.target;
    snapcoord = getMousePosition(evt);
    offset = getMousePosition(evt);
    offset.x -= parseFloat(selectedElement.getAttribute("x"));
    offset.y -= parseFloat(selectedElement.getAttribute("y"));
}

//catches snapping
function startSnapDrag(evt) {
    if (stopvertsnap) {
        snapcoord.x = getMousePosition(evt).x;
    }
    if (stophorsnap) {
        snapcoord.y = getMousePosition(evt).y;
    }
    dragSnap(evt);
}

//dragging with snapping enabled
function dragSnap(evt) {
    if (selectedElement) {
        evt.preventDefault();

        //check if mouse has moved enough to escape snapping
        if (snapcoord.x !== 0) {
            stopvertsnap = Math.abs(getMousePosition(evt).x - snapcoord.x) > 15;
        }
        if (snapcoord.y !== 0) {
            stophorsnap = Math.abs(getMousePosition(evt).y - snapcoord.y) > 15;
        }


        let coord = getMousePosition(evt);

        let verticalx = Number(verticalline.getAttribute("x1"));
        let horizontaly = Number(horizontalline.getAttribute("y1"));

        //snapping vertically
        if (inVerticalSnapRange() === false || stopvertsnap) {
            selectedElement.setAttribute("x", coord.x - offset.x);
        } else if (inVerticalSnapRange() === 0) {
            selectedElement.setAttribute("x", verticalx)
        } else if (inVerticalSnapRange() === 1) {
            selectedElement.setAttribute("x", verticalx - Number(getRectCenter(1)))
        } else if (inVerticalSnapRange() === 2) {
            selectedElement.setAttribute("x", verticalx - Number(getRectCenter(1)) * 2)
        }

        //snapping horizontally
        if (inHorizontalSnapRange() === false || stophorsnap) {
            selectedElement.setAttribute("y", coord.y - offset.y);
        } else if (inHorizontalSnapRange() === 0) {
            selectedElement.setAttribute("y", horizontaly);
        } else if (inHorizontalSnapRange() === 1) {
            selectedElement.setAttribute("y", horizontaly - Number(getRectCenter()));
        } else if (inHorizontalSnapRange() === 2) {
            selectedElement.setAttribute("y", horizontaly - Number(getRectCenter()) * 2);
        }

        moveTextToRect();
        overlapWarning();
    }
}

//dragging with snapping disabled
function drag(evt) {
    if (selectedElement) {
        evt.preventDefault();
        let coord = getMousePosition(evt);

        selectedElement.setAttribute("x", coord.x - offset.x);
        selectedElement.setAttribute("y", coord.y - offset.y);

        moveTextToRect();
        overlapWarning();
    }
}

function endDrag() {
    selectedElement = null;
}

function getMousePosition(evt) {
    let CTM = svg.getScreenCTM();
    return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
    };
}

//TODO make movement more precise
function moveTextToRect() {
    let textofrect = getTextById(getRectangleIdNumber(currentrectangle));

    textofrect.setAttribute("x", currentrectangle.getAttribute("x"));
    textofrect.setAttribute("y", currentrectangle.getAttribute("y"));

    //coords need the size factor and the remaining pixels to fit in the box depending on alignment
    if (textofrect.getAttribute("text-anchor") === "left") {
        xcoord = textofrect.getAttribute("x");
        ycoord = Number(textofrect.getAttribute("y")) + ((currenttextsize.replace("%", "")) / 3) - 4.333333;

    } else if (textofrect.getAttribute("text-anchor") === "middle") {
        xcoord = Number(textofrect.getAttribute("x")) + ((Number(currentrectangle.getAttribute("width")) / 2));
        ycoord = Number(textofrect.getAttribute("y")) + ((currenttextsize.replace("%", "")) / 3) - 4.333333;
    } else {
        //-1 because its one pixel before the border (currentrectangle)
        xcoord = Number(textofrect.getAttribute("x")) + Number(currentrectangle.getAttribute("width") - 1);
        ycoord = Number(textofrect.getAttribute("y")) + ((currenttextsize.replace("%", "")) / 3) - 4.333333;
    }
    modifyPreviewTextContent();
    resizeColisionBox();
}

function getTextById(id) {
    return document.getElementById("currenttext" + id);
}

function getRectangleIdNumber(rect) {
    let fullid = rect.getAttribute("id");
    return fullid.match(/[0-9]/g)[0];
}

//changes all variables according to the element that is currently selected
function setCurrentElements(evt) {
    currentrectangle = evt.target;
    currenttext = getTextById(getRectangleIdNumber(currentrectangle));
    currenttextsize = currenttext.firstElementChild.style.fontSize;

    currentfont = currenttext.firstElementChild.getAttribute("font-family");

    //rebuild the inputtext for each tspan in the text
    inputtext.value = '';
    for (let i = 0; i < currenttext.children.length; i++) {
        if (currenttext.children[i].innerHTML !== '') {
            inputtext.value += currenttext.children[i].innerHTML;
            if (i + 1 < currenttext.children.length) {
                inputtext.value += '\n';
            }
        } else {
            inputtext.value += '\n';
        }
    }
}

//TODO when adding other elements, this needs a second argument for the id name
function deleteElement(id) {
    document.getElementById("currenttext" + id).remove();
    document.getElementById("collisionbox" + id).remove();
}

//returns center of the current rectangle
function getRectCenter(horizontal) {
    if (horizontal === 1) {
        return currentrectangle.getAttribute("width") / 2;
    } else {
        return currentrectangle.getAttribute("height") / 2;
    }
}

//retrieves horizontal or vertical middle point of svg
function getSvgCenter(horizontal) {
    if (horizontal === 1) {
        return (svg.getAttribute("width").replace("px", "")) / 2;
    } else {
        return (svg.getAttribute("height").replace("px", "")) / 2;
    }
}

function hideVerticalSnappingLine() {
    if (verticalline.getAttribute("stroke") !== "") {
        verticalline.setAttribute("stroke", "");
    }
}

function hideHorizontalSnappingLine() {
    if (horizontalline.getAttribute("stroke") !== "") {
        horizontalline.setAttribute("stroke", "");
    }
}

function showVerticalSnappingLine() {
    if (verticalline.getAttribute("stroke") !== "blue") {
        verticalline.setAttribute("stroke", "blue");
    }
}

function showHorizontalSnappingLine() {
    if (horizontalline.getAttribute("stroke") !== "blue") {
        horizontalline.setAttribute("stroke", "blue");
    }
}

//return :  0, if the top of the text reaches the range
//          1 if the middle of the text reaches the range
//          2 if the bottom of the text reaches the range
//          false if it's out of range
function inHorizontalSnapRange() {
    let recty = Number(currentrectangle.getAttribute("y"));
    let liney = Number(horizontalline.getAttribute("y1"));

    //check snapping for top, bottom and mid side of the rectangle
    for (let i = 0; i < 3; i++) {
        if (i === 1) {
            recty += getRectCenter(0);
        } else if (i === 2) {
            recty += getRectCenter(0);
        }
        if (recty <= Number(liney) + 5 && recty >= Number(liney) - 5) {
            showHorizontalSnappingLine();
            return i;
        }
    }
    hideHorizontalSnappingLine();
    return false;
}

//return :  0 if the left of the text reaches the range
//          1 if the middle of the text reaches the range
//          2 if the right of the text reaches teh range
//          false if it's out of range
function inVerticalSnapRange() {
    let rectx = currentrectangle.getAttribute("x");
    let linex = verticalline.getAttribute("x1");

    for (let i = 0; i < 3; i++) {
        if (i === 1) {
            rectx = Number(rectx) + getRectCenter(1);
        } else if (i === 2) {
            rectx = Number(rectx) + getRectCenter(1);
        }
        if (rectx <= Number(linex) + 5 && rectx >= Number(linex) - 5) {
            showVerticalSnappingLine();
            return i;
        }
    }
    hideVerticalSnappingLine();
    return false;
}
