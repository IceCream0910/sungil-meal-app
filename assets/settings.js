var grade = localStorage.getItem("sungil_grade");
var classNum = localStorage.getItem("sungil_classNum");

$('#grade').val(grade);
$('#classNum').val(classNum);

$("#grade").on("propertychange change keyup paste input", function(){
    localStorage.setItem("sungil_grade", $(this).val())
});

$("#classNum").on("propertychange change keyup paste input", function(){
    localStorage.setItem("sungil_classNum", $(this).val())

});

const storedTheme = localStorage.getItem("darkTheme");
if (storedTheme !== null) {
    if (storedTheme === "true") {
        onDark();
        $("input[id='radio-1']:radio").prop('checked', false);
        $("input[id='radio-2']:radio").prop('checked', false); 
        $("input[id='radio-3']:radio").prop('checked', true); 

     } else if(storedTheme === "system") {
        $("input[id='radio-1']:radio").prop('checked', true);
        $("input[id='radio-2']:radio").prop('checked', false); 
        $("input[id='radio-3']:radio").prop('checked', false);
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            onDark();
        }
    } else {
        $("input[id='radio-1']:radio").prop('checked', false);
        $("input[id='radio-2']:radio").prop('checked', true); 
        $("input[id='radio-3']:radio").prop('checked', false);
    }
}


$("input[id='radio-1']:radio").change(function () {
    localStorage.setItem("darkTheme", "system");
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        onDark();
    }
    console.log('system');
});

$("input[id='radio-2']:radio").change(function () {
    localStorage.setItem("darkTheme", "false");
    console.log('light');   
    offDark();
});


$("input[id='radio-3']:radio").change(function () {
    localStorage.setItem("darkTheme", "true");
    console.log('dark');   
    onDark();
});


const mql = window.matchMedia("(prefers-color-scheme: dark)");
mql.addEventListener("change", () => {
    var darkTheme = localStorage.getItem("darkTheme");
    if(darkTheme == 'system' || !darkTheme) {
        if(mql.matches) {
            onDark();
        } else {
            offDark();
        }
    }
});

function onDark() {
    $('html').addClass("dark");
    $('body').addClass("dark");
    $('.mdc-form-field').addClass("dark");
    $('input').addClass("dark");
    $('.mdc-button__label').addClass("dark");
    $('.mdc-fab--mini').addClass("dark");
    $(':root').addClass("dark");
    var styles = `.mdc-radio .mdc-radio__native-control:enabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle {
        border-color: rgba(255, 255, 255, 0.54);
    }`
	var styleSheet = document.createElement("style")
	styleSheet.type = "text/css"
	styleSheet.innerText = styles
	document.head.appendChild(styleSheet)
}

function offDark() {
    $('html').removeClass("dark");
    $('body').removeClass("dark");
    $('.mdc-form-field').removeClass("dark");
    $('input').removeClass("dark");
    $('.mdc-button__label').removeClass("dark");
    $('.mdc-fab--mini').removeClass("dark");
    $(':root').removeClass("dark");
    $('.mdc-radio__outer-circle').removeClass("dark");
    var styles = `.mdc-radio .mdc-radio__native-control:enabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle {
        border-color: rgba(0,0,0, 0.54);
    }`
	var styleSheet = document.createElement("style")
	styleSheet.type = "text/css"
	styleSheet.innerText = styles
	document.head.appendChild(styleSheet)
}
