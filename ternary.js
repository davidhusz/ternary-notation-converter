(function(){
"use strict";

/*
hierarchy: text < decimal < ternary < notes
TODO:
think about how many of the converters actually make sense
actually think of some good examples
*/

var inputElement, outputElement, fromElement, toElement;

window.onload = function() {
    // create DOM variables and event handlers
    inputElement  = document.querySelector("#inputElement");
    outputElement = document.querySelector("#outputElement");
    fromElement   = document.querySelector("#from");
    toElement     = document.querySelector("#to");
    
    document.querySelector("button").onclick = process;
    
    let exampleButtons = document.querySelectorAll("#examples a");
    
    let examples = [
        ["text", "ternary", "I am the walrus."],
        ["text", "ternary", "I am the second walrus."],
        ["text", "ternary", "I am the third walrus."],
    ];
    
    for (let i in examples) {
        exampleButtons[i].onclick = function() {
            runExample(...examples[i]);
        }
    }
}

var noteMap = new Map([
    ["ab", 2], ["a",  0], ["a#", 1], ["bb", 1], ["b",  2], ["b#", 0], ["cb", 2],
    ["c",  0], ["c#", 1], ["db", 1], ["d",  2], ["d#", 0], ["eb", 0], ["e",  1],
    ["e#", 2], ["fb", 1], ["f",  2], ["f#", 0], ["gb", 0], ["g",  1], ["g#", 2]
]);

var decimalToTernary = {
    extract: text => text.split(/[^0-9A-Za-z]/),
    translate: int => parseInt(int).toString(3)
}

var ternaryToDecimal = {
    extract: decimalToTernary.extract,
    translate: int => parseInt(int, 3)
}

var textToDecimal = {
    extract:  text => text.match(/[A-Za-z]/g),
    translate: char => (char.toUpperCase().charCodeAt(0) - 64)
}

var decimalToText = {
    extract: decimalToTernary.extract,
    translate: int => String.fromCharCode(parseInt(int) + 64)
}

var textToTernary = {
    extract: textToDecimal.extract,
    translate: char => decimalToTernary.translate(textToDecimal.translate(char)).padStart(3, "0")
}

var ternaryToText = {
    extract: text => text.match(/[0-2]{3}/g),
    translate: int => decimalToText.translate(ternaryToDecimal.translate(int))
}

var notesToTernary = {
    extract: function(text) {
        let notes = text.match(/[A-Ga-g][b#]?/g);
        let noteGroups = [];
        while (notes.length > 0) {
            // divide the array into chunks of 3
            noteGroups.push(notes
                           .splice(0, 3)
                           .join(" "));
        }
        return noteGroups;
    },
    translate: noteGroup => noteGroup
                            .split(" ")
                            .map(note => noteMap.get(note.toLowerCase()))
                            .join("")
}

var notesToDecimal = {
    extract: notesToTernary.extract,
    translate: noteGroup => ternaryToDecimal.translate(notesToTernary.translate(noteGroup))
}

var notesToText = {
    extract: notesToTernary.extract,
    translate: noteGroup => decimalToText.translate(notesToDecimal.translate(noteGroup))
}

var handleSelfConversion = {
    extract: text => text.split(""),
    translate: x => x
}


function process() {
    let input     = inputElement.value;
    let converter = getConverter();
    
    let output = converter.extract(input)
                          .map(x => x.toString()
                                    + " &rarr; "
                                    + converter.translate(x))
                          .join("<br />");
    
    outputElement.innerHTML = output;
    console.log("Successfully converted.");
}

function runExample(from, to, input) {
    fromElement.value  = from;
    toElement.value    = to;
    inputElement.value = input;
    process();
}

// let hello = "Hello!";
// let hello2 = hello.replace(/[A-Za-z]/g, char => "  " + char + "  ")
// + hello.replace(/[A-Za-z]/g, "  &darr;  ")
// + hello.replace(/[A-Za-z]/g, char => " " + textToTernary.translate(char) + " ");
// alert(hello2);

function getConverter() {
    switch (fromElement.value) {
        case "text":
            switch (toElement.value) {
                case "text":
                    return handleSelfConversion;
                case "decimal":
                    return textToDecimal;
                case "ternary":
                    return textToTernary;
            }
        case "notes":
            switch (toElement.value) {
                case "text":
                    return notesToText;
                case "decimal":
                    return notesToDecimal;
                case "ternary":
                    return notesToTernary;
            }
        case "decimal":
            switch (toElement.value) {
                case "text":
                    return decimalToText;
                case "decimal":
                    return handleSelfConversion;
                case "ternary":
                    return decimalToTernary;
            }
        case "ternary":
            switch (toElement.value) {
                case "text":
                    return ternaryToText;
                case "decimal":
                    return ternaryToDecimal;
                case "ternary":
                    return handleSelfConversion;
            }
    }
}

})();
