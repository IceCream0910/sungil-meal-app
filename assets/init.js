var grade = localStorage.getItem("sungil_grade");
var classNum = localStorage.getItem("sungil_classNum");
var isComplete = false;

$("#grade-list li").on("click", function () {
    grade = $(this).data('grade');
    $("#button-text").text('저는 ' + grade + '학년이고요');
    $('#grade-list').hide();
    $('#class-list').fadeIn();
});

$("#class-list li").on("click", function () {
    classNum = $(this).data('class');
    $("#button-text").text('저는 ' + grade + '학년 ' + classNum + '반이에요');
    $('#save-btn').css('background-color', '#634acf');
    isComplete = true;
});

const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
}

function complete() {
    if (isComplete) {
        localStorage.setItem("sungil_grade", grade);
        localStorage.setItem("sungil_classNum", classNum);

        if (isIos()) {
            location.href = 'index.html'
        } else {
            history.back();
        }
    }
}

//darkmode
const storedTheme = localStorage.getItem("darkTheme");

const mql = window.matchMedia("(prefers-color-scheme: dark)");

mql.addEventListener("change", () => {
    if (storedTheme == "system" || !storedTheme) {
        if (mql.matches) {
            onDark();
        } else {
            offDark();
        }
    }
});


if (storedTheme !== null) {
    if (storedTheme === "true") {
        onDark();
    } else if (storedTheme === "system") {
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
    $('.init_header').addClass("dark");
}

function offDark() {
    $('html').removeClass("dark");
    $('body').removeClass("dark");
    $('.mdc-button').removeClass("dark");
    $('.mdc-form-field').removeClass("dark");
    $('input').removeClass("dark");
    $('.mdc-button__label').removeClass("dark");
    $('.init_header').removeClass("dark");
}