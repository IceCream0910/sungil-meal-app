var grade = localStorage.getItem("sungil_grade");
var classNum = localStorage.getItem("sungil_classNum");

if (grade !== null && classNum !== null) {
    $('#profile-text').html('성일고&nbsp;<span style="color:#5272ff">' + grade + '</span>학년&nbsp; <span style="color:#5272ff">' + classNum + '</span>반');
} else {
    $('#profile-text').html('학년과 반을 알려주세요.');
}



const storedVoice = localStorage.getItem("sungil_ttsVoice") || 'dinna';

const storedTheme = localStorage.getItem("darkTheme") || "system";
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
    document.head.appendChild(styleSheet);
    $('.sheet-modal').addClass("dark");
    $('.swipe-handler').addClass("dark");
    $('.checkbox').addClass("dark");
    $('.tagResetBtn').addClass("dark");
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
    document.head.appendChild(styleSheet);
    $('.sheet-modal').removeClass("dark");
    $('.swipe-handler').removeClass("dark");
    $('.checkbox').removeClass("dark");
    $('.tagResetBtn').removeClass("dark");
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

//알레르기
if (localStorage.getItem("sungil_alleList")) {
    checkedIndex = localStorage.getItem("sungil_alleList").split(',');
} else {
    checkedIndex = []
}



for (var i = 0; i < checkedIndex.length; i++) {
    var checkbox = document.getElementById('alleSetting').getElementsByTagName('div')[checkedIndex[i]];
    $(checkbox).addClass('checked')
}


$('#alleSetting .checkbox').click(function () {
    if ($(this).hasClass('checked')) {
        $(this).removeClass('checked');
    } else {
        $(this).addClass('checked');
    }
    getCheckedIndex();
});

function getCheckedIndex() {
    checkedIndex = [];
    $('#alleSetting .checkbox').each(function (index) {
        if ($(this).hasClass('checked')) {
            checkedIndex.push(index);
        }
    });
    if (checkedIndex.length == 0) {
        localStorage.setItem("sungil_alleList", '');
    } else {
        localStorage.setItem("sungil_alleList", checkedIndex.toString());
    }
}


/* bottom sheet */
$('#alleSettingBtn').on('click', function () {
    $('#modal-title').text('알레르기 정보 등록');
    $('#alleSetting').show();
    $('#favorSetting').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#alleSetting').height() + 130 + 'px');
    }, 100);
});

$('.sheet-backdrop').on('click', function () {
    modalClose();
});


///custom modal sheet///
$('.c-modal').each(function () {
    var mc = new Hammer(this);

    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });

    mc.on("swipedown", function (ev) {
        modalClose()
    });
});


//맛있는 메뉴
/* bottom sheet */
$('#favorSettingBtn').on('click', function () {
    var isDark = storedTheme == 'true' || (storedTheme == 'system' && mql.matches)

    $('#modal-title').html(`맛있는 메뉴 키워드 <button class=" mdc-button--icon-leading tagResetBtn ` + (isDark ? 'dark' : '') + `" onclick="resetTags();"
    aria-label="초기화">
    <span class="mdc-button__ripple"></span><i
        class="material-icons mdc-button__icon" aria-hidden="true">restart_alt</i> <span class="mdc-button__label">초기화</span>  </button>
`);
    initTags();
    $('#alleSetting').hide();
    $('#favorSetting').show();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    $('.sheet-modal').css('height', '60vh');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#favorSetting').height() + 160 + 'px');
    }, 100);
});

$('.sheet-backdrop').on('click', function () {
    modalClose();
});

function modalClose() {
    $('body').css('overflow', 'auto');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('display', 'none');
    }, 100);
    $('.sheet-backdrop').removeClass('backdrop-in');
}


var defaultfavTagsList = ["훈제", "참치마요", "미트볼", "우동", "망고", "샌드위치", "피자", "햄버거", "돈까스", "브라운소스", "핫바", "새우튀김", "스파게티", "감자튀김", "빵", "떡꼬치", "와플", "바나나", "스테이크", "탕수육", "스크렘블", "초코", "맛탕", "바베큐", "떡갈비", "비엔나", "브라우니", "치킨마요", "타코야끼", "도넛", "치즈", "핫도그", "치킨", "스프", "소세지", "메론", "떡볶이", "샐러드", "모닝빵", "불고기", "햄", "닭",]
var favTagsList = ["훈제", "참치마요", "미트볼", "우동", "망고", "샌드위치", "피자", "햄버거", "돈까스", "브라운소스", "핫바", "새우튀김", "스파게티", "감자튀김", "빵", "떡꼬치", "와플", "바나나", "스테이크", "탕수육", "스크렘블", "초코", "맛탕", "바베큐", "떡갈비", "비엔나", "브라우니", "치킨마요", "타코야끼", "도넛", "치즈", "핫도그", "치킨", "스프", "소세지", "메론", "떡볶이", "샐러드", "모닝빵", "불고기", "햄", "닭"]


function resetTags() {
    $(".fav-tag-area").empty();
    favTagsList = defaultfavTagsList;
    for (var i = 0; i < favTagsList.length; i++) {
        $(".fav-tag-area").append('<div class="tag">' + favTagsList[i] + '<span>×</span></div>');
    }
    $('.sheet-modal').css('height', $('#favorSetting').height() + 170 + 'px');
    localStorage.setItem("sungil_favTagsList", favTagsList.toString());
}

function initTags() {
    if (localStorage.getItem("sungil_favTagsList")) {
        favTagsList = localStorage.getItem("sungil_favTagsList").split(',');
    } else {
        favTagsList = defaultfavTagsList;
    }
    $(".fav-tag-area").empty();
    for (var i = 0; i < favTagsList.length; i++) {
        $(".fav-tag-area").append('<div class="tag">' + favTagsList[i] + '<span>×</span></div>');
    }
    $('.sheet-modal').css('height', $('#favorSetting').height() + 170 + 'px');
}

// Add Tags
function addFavItem(value) {
    if (favTagsList.indexOf(value) > -1) {
        alert("이미 추가된 키워드 입니다.");
    } else {
        favTagsList.push(value);
        $(".fav-tag-area").prepend('<div class="tag">' + value + '<span>×</span></div>');
        $('.fav-tag-area').scrollTop(0);
        $('.sheet-modal').css('height', $('#favorSetting').height() + 170 + 'px');
        localStorage.setItem("sungil_favTagsList", favTagsList.toString());
    }

}

// Remove Tags
$(".fav-tag-area").on("click", ".tag > span", function () {
    var deletedText = $(this).parent()[0].innerText.replace("×", "").replaceAll(" ", "").replaceAll(/\s*/g, "").toString();
    console.log(deletedText)
    $(this).parent().remove();
    favTagsList = favTagsList.filter((element) => element !== deletedText);
    $('.sheet-modal').css('height', $('#favorSetting').height() + 160 + 'px');
    localStorage.setItem("sungil_favTagsList", favTagsList.toString());
});

function submitKeyword() {
    var value = $("#fav-input").val();
    if (value != "" && value != " ") {
        addFavItem(value);
        $("#fav-input").val('');
    } else {
        alert("키워드를 입력해주세요.");
    }
}


//pwa 설치
var deferredPrompt;

window.addEventListener('beforeinstallprompt', function (e) {
    console.log('beforeinstallprompt Event fired');
    e.preventDefault();

    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    return false;
});

const installWebApp = document.getElementById('installWebApp');

installWebApp.addEventListener('click', function () {
    if (deferredPrompt !== undefined) {
        // The user has had a postive interaction with our app and Chrome
        // has tried to prompt previously, so let's show the prompt.
        deferredPrompt.prompt();

        // Follow what the user has done with the prompt.
        deferredPrompt.userChoice.then(function (choiceResult) {

            console.log(choiceResult.outcome);

            if (choiceResult.outcome == 'dismissed') {
                console.log('User cancelled home screen install');
            }
            else {
                console.log('User added to home screen');
            }

            // We no longer need the prompt.  Clear it up.
            deferredPrompt = null;
        });
    } else {
        alert('지원되지 않는 브라우저이거나 이미 설치되어 있습니다. 브라우저는 크롬 또는 사파리를 권장합니다.')
    }
});