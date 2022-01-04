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

const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test( userAgent );
  }

function complete() {
    if($('#grade').val()!='' && $('#classNum').val()!='') {
        if(isIos()) {
            location.href='index.html'
        } else {
            history.back();
        }
    } else {
        $('#error').fadeIn();
        setTimeout(function() {
            $('#error').fadeOut();
          }, 3000);
    }
}

//darkmode
const storedTheme = localStorage.getItem("darkTheme");

const mql = window.matchMedia("(prefers-color-scheme: dark)");

mql.addEventListener("change", () => {
    if(storedTheme == "system" || !storedTheme) {
        if(mql.matches) {
            onDark();
        } else {
            offDark();
        }
    }
});


if (storedTheme !== null) {
    if (storedTheme === "true") {
        onDark();
     } else if(storedTheme === "system") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            onDark();
        }
    }
}

function onDark() {
    $('html').addClass("dark");
    $('body').addClass("dark");
    $('.mdc-button').addClass("dark");
    $('.mdc-form-field').addClass("dark");
    $('input').addClass("dark");
    $('.mdc-button__label').addClass("dark");
}

function offDark() {
    $('html').removeClass("dark");
    $('body').removeClass("dark");
    $('.mdc-button').removeClass("dark");
    $('.mdc-form-field').removeClass("dark");
    $('input').removeClass("dark");
    $('.mdc-button__label').removeClass("dark");
}