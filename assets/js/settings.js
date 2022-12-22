
if (grade !== null && classNum !== null) {
    $('#profile-text').html('성일고&nbsp;<span style="color:#5272ff">' + grade + '</span>학년&nbsp; <span style="color:#5272ff">' + classNum + '</span>반');
} else {
    $('#profile-text').html('학년과 반을 알려주세요.');
}

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

const isAppMealPush = localStorage.getItem("android-noti") || "true";
if (isAppMealPush === "true") {
    $("#noti-switch").prop('checked', true);
} else {
    $("#noti-switch").prop('checked', false);
}


$("input[id='radio-1']:radio").change(function () {
    localStorage.setItem("darkTheme", "system");
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        onDark();
    }
    console.log('system');
    updateTheme();
});

$("input[id='radio-2']:radio").change(function () {
    localStorage.setItem("darkTheme", "false");
    console.log('light');
    offDark();
    updateTheme();
});


$("input[id='radio-3']:radio").change(function () {
    localStorage.setItem("darkTheme", "true");
    console.log('dark');
    onDark();
    updateTheme();
});


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


if (isApp()) {
    $('#hybridAppSettingsBtn').show();
}

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
    openModal('알레르기 정보 등록', 'alleSetting')
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
    if (localStorage.getItem("sungil_alleList")) {
        alleList = localStorage.getItem("sungil_alleList").split(',');
        alleList = alleList.map(function (val) { return ++val; });
        alleList = alleList.join(',').toString();
    } else {
        alleList = '';
    }
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

function onChangeSwitch() {
    console.log($('#noti-switch').is(":checked"))
    localStorage.setItem("android-noti", $('#noti-switch').is(":checked"));
    Android.setNotiEnable($('#noti-switch').is(":checked"));
}

function saveGradeClass() {
    grade = $("#grade-select").val();
    classNum = $("#class-select").val();
    localStorage.setItem("sungil_grade", grade);
    localStorage.setItem("sungil_classNum", classNum);
    if (grade !== null && classNum !== null) {
        $('#profile-text').html('성일고&nbsp;<span style="color:#5272ff">' + grade + '</span>학년&nbsp; <span style="color:#5272ff">' + classNum + '</span>반');
    } else {
        $('#profile-text').html('학년과 반을 알려주세요.');
    }
    $('#assignments-listview').show();
    $('#before-setting-assign').hide();
    $('.addAssignment-btn').show();
    updateAssignList();
    closeModal();
    $('#gradeClassLabel').html(grade + '학년 ' + classNum + '반');
    updateInfo();
}