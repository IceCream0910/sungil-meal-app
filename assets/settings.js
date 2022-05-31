var grade = localStorage.getItem("sungil_grade");
var classNum = localStorage.getItem("sungil_classNum");

if (grade !== null && classNum !== null) {
    $('#profile-text').html('성일고&nbsp;<span style="color:#7768ff">' + grade + '</span>학년&nbsp; <span style="color:#7768ff">' + classNum + '</span>반');
} else {
    $('#profile-text').html('학년과 반을 알려주세요.');
}


const storedVoice = localStorage.getItem("sungil_ttsVoice") || 'dinna';

const storedTheme = localStorage.getItem("darkTheme");
if (storedTheme != null) {
    if (storedTheme === "true") {
        onDark();
        $("input[id='radio-1']:radio").prop('checked', false);
        $("input[id='radio-2']:radio").prop('checked', false);
        $("input[id='radio-3']:radio").prop('checked', true);

    } else if (storedTheme === "system") {
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
    if (darkTheme == 'system' || !darkTheme) {
        if (mql.matches) {
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




/* tts voice */
if (storedVoice != null) {
    if (storedVoice === "dinna") {
        $("input[id='tts_radio-1']:radio").prop('checked', true);
        $("input[id='tts_radio-2']:radio").prop('checked', false);
        $("input[id='tts_radio-3']:radio").prop('checked', false);
    } else if (storedVoice === "hana") {
        $("input[id='tts_radio-1']:radio").prop('checked', false);
        $("input[id='tts_radio-2']:radio").prop('checked', true);
        $("input[id='tts_radio-3']:radio").prop('checked', false);
    } else {
        $("input[id='tts_radio-1']:radio").prop('checked', false);
        $("input[id='tts_radio-2']:radio").prop('checked', false);
        $("input[id='tts_radio-3']:radio").prop('checked', true);
    }
}

var ttsAudio = new Audio('https://playentry.org/api/expansionBlock/tts/read.mp3?text=잘못된 요청입니다.')

$("input[id='tts_radio-1']:radio").change(function () {
    console.log('dinna');
    localStorage.setItem("sungil_ttsVoice", "dinna");
    ttsAudio.pause();
    ttsAudio = new Audio('https://playentry.org/api/expansionBlock/tts/read.mp3?text=' + '목소리를 변경했어요.' + '&speed=0&pitch=0&speaker=dinna&volume=1');
    ttsAudio.play();
});

$("input[id='tts_radio-2']:radio").change(function () {
    localStorage.setItem("sungil_ttsVoice", "hana");
    ttsAudio.pause();
    ttsAudio = new Audio('https://playentry.org/api/expansionBlock/tts/read.mp3?text=' + '목소리를 변경했어요!' + '&speed=0&pitch=0&speaker=hana&volume=1');
    ttsAudio.play();
});


$("input[id='tts_radio-3']:radio").change(function () {
    localStorage.setItem("sungil_ttsVoice", "jinho");
    ttsAudio.pause();
    ttsAudio = new Audio('https://playentry.org/api/expansionBlock/tts/read.mp3?text=' + '목소리를 변경했어요!' + '&speed=0&pitch=0&speaker=jinho&volume=1');
    ttsAudio.play();
});