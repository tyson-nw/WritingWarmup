// Color switcher icon

var currCSS = 0;
var optionalCSS = [
    "color-basic.css",
    "color-sepia.css",
    "color-broadcast.css",
    "color-dark.css"
];

function cycleCSS() {
    currCSS = (currCSS+1) % optionalCSS.length;
    console.log("Update to:"+optionalCSS[currCSS]);
    document.getElementById('color-style').href='/assets/'+optionalCSS[currCSS]; 
}