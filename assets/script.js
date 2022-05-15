moment.lang("ko", {
    weekdays: ["일", "월", "화", "수", "목", "금", "토"],
    weekdaysShort: ["일", "월", "화", "수", "목", "금", "토"]
}), moment.lang("en", {
    weekdays: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
    weekdaysShort: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
});
var ttsAudio = new Audio("https://playentry.org/api/expansionBlock/tts/read.mp3?text=잘못된 요청입니다.");
const voiceType = localStorage.getItem("sungil_ttsVoice") || "dinna";

function mealTts() {
    if (ttsAudio.pause(), currentMenuRaw) {
        for (var e = currentMenuRaw.replaceAll("'", "").replaceAll("[중식]", "").split("\n"), a = "", t = 0; t < e.length; t++) {
            if (e[t].match(/\d+/)) {
                var s = e[t].match(/\d+/).index;
                e[t].substring(s, e[t].length)
            } else;
            a += e[t].substring(0, s) + ", "
        }
        var l = moment(selectedDate).lang("ko").format("M월 D일 dddd요일") + " 급식 메뉴는 " + a + "입니다."
    } else l = moment(selectedDate).lang("ko").format("M월 D일 dddd요일") + "은 급식 정보가 없네요.";
    ttsAudio = new Audio("https://playentry.org/api/expansionBlock/tts/read.mp3?text=" + l + "&speed=0&pitch=0&speaker=" + voiceType + "&volume=1"), console.log(l), ttsAudio.play()
}

function timetableTts() {
    ttsAudio.pause();
    var e = moment(selectedDate).lang("en").format("dddd");
    if ("sat" == e || "sun" == e) var a = moment(selectedDate).lang("ko").format("M월 D일 dddd요일") + "에는 수업이 없어요.";
    else {
        for (var t = timetableRaw[e], s = "", l = 0; l < t.length; l++) s += l + 1 + "교시 " + t[l].ITRT_CNTNT + ", ";
        a = moment(selectedDate).lang("ko").format("M월 D일 dddd요일") + " 시간표를 알려드릴게요. " + s + "입니다"
    }
    console.log(a), (ttsAudio = new Audio("https://playentry.org/api/expansionBlock/tts/read.mp3?text=" + a + "&speed=0&pitch=0&speaker=" + voiceType + "&volume=1")).play()
}

function playPause() {
    track.paused ? (track.play(), controlBtn.className = "pause") : (track.pause(), controlBtn.className = "play")
}
var today = moment(new Date).format("YYYYMMDD"),
    selectedDate = today;
$("#date").html(moment(selectedDate).lang("ko").format("M월 D일 (dddd)")), $("#date").addClass("today");
var data, newData, grade = localStorage.getItem("sungil_grade"),
    classNum = localStorage.getItem("sungil_classNum"),
    currentMenuRaw = "",
    timetableRaw = "",
    isTest = !1;

function backDate() {
    let e = moment(selectedDate).add(-1, "days");
    selectedDate = moment(e).format("YYYYMMDD"), $("#date").html(moment(selectedDate).lang("ko").format("M월 D일 (dddd)")), today == selectedDate ? $("#date").addClass("today") : $("#date").removeClass("today"), updateInfo()
}

function forwardDate() {
    let e = moment(selectedDate).add(1, "days");
    selectedDate = moment(e).format("YYYYMMDD"), $("#date").html(moment(selectedDate).lang("ko").format("M월 D일 (dddd)")), today == selectedDate ? $("#date").addClass("today") : $("#date").removeClass("today"), updateInfo()
}

function updateInfo() {
    var e = JSON.parse(localStorage.getItem("sungil_api_cache")) || null,
        a = localStorage.getItem("sungil_api_cache_date") || null,
        t = selectedDate.substring(0, 4) + "-" + selectedDate.substring(4, 6).replace(/(^0+)/, "");
    if (!isTest) {
        var s = ["시간표 물어보는 중", "달력 체크중", "급식실 훔쳐보는 중"],
            l = 0,
            n = $("#loading-text");
        setInterval(function () {
            n.fadeOut(function () {
                n.html(s[l]), ++l >= s.length && (l = 0), n.fadeIn()
            })
        }, 1e3), document.getElementsByClassName("loading-overlay")[0].classList.add("is-active"), $("#schedule-content").html(""), e && a == t ? (displayMeal(e), displaySchedule(e), document.getElementsByClassName("loading-overlay")[0].classList.remove("is-active")) : $.ajax({
            type: "GET",
            url: "https://sungil-school-api.vercel.app/api/" + selectedDate,
            success: function (e) {
                data = JSON.parse(e), localStorage.setItem("sungil_api_cache", JSON.stringify(data)), localStorage.setItem("sungil_api_cache_date", selectedDate.substring(0, 4) + "-" + selectedDate.substring(4, 6).replace(/(^0+)/, "")), displayMeal(data), document.getElementsByClassName("loading-overlay")[0].classList.remove("is-active"), data.schedule && displaySchedule(data)
            }
        })
    }
    if (grade && classNum) {
        $(".timetable-wrap").show(), $("#nosetting-timetable").hide();
        var o = JSON.parse(localStorage.getItem("sungil_timeapi_cache")) || null,
            d = localStorage.getItem("sungil_timeapi_cache_date") || null,
            i = selectedDate.substring(0, 4) + "-" + selectedDate.substring(4, 6).replace(/(^0+)/, "") + "--" + getWeekNo(moment(selectedDate).format("YYYY-MM-DD"));
        o && d == i ? (displayTimetable(o), $.ajax({
            type: "GET",
            url: "https://sungil-school-api.vercel.app/timetable?date=" + selectedDate + "&grade=" + grade + "&classNum=" + classNum,
            success: function (e) {
                var a = JSON.parse(e);
                JSON.stringify(o) != JSON.stringify(a) ? (console.log("시간표 변동 사항 발견!", o, a), localStorage.setItem("sungil_timeapi_cache", JSON.stringify(a)), localStorage.setItem("sungil_timeapi_cache_date", selectedDate.substring(0, 4) + "-" + selectedDate.substring(4, 6).replace(/(^0+)/, "") + "--" + getWeekNo(moment(selectedDate).format("YYYY-MM-DD"))), displayTimetable(a)) : console.log("시간표 변경 사항 없음, 기존 데이터 그대로 사용 유지")
            }
        })) : ($(".loading-overlay").hasClass("is-active") || document.getElementsByClassName("loading-overlay")[0].classList.add("is-active"), $.ajax({
            type: "GET",
            url: "https://sungil-school-api.vercel.app/timetable?date=" + selectedDate + "&grade=" + grade + "&classNum=" + classNum,
            success: function (e) {
                var a = JSON.parse(e);
                localStorage.setItem("sungil_timeapi_cache", JSON.stringify(a)), localStorage.setItem("sungil_timeapi_cache_date", selectedDate.substring(0, 4) + "-" + selectedDate.substring(4, 6).replace(/(^0+)/, "") + "--" + getWeekNo(moment(selectedDate).format("YYYY-MM-DD"))), displayTimetable(a), $(".loading-overlay").hasClass("is-active") && document.getElementsByClassName("loading-overlay")[0].classList.remove("is-active")
            }
        }))
    } else $("#timetable").html("학년/반 설정을 먼저 진행해주세요."), $(".timetable-wrap").hide(), $("#nosetting-timetable").show()
}

function refreshNewData() {
    console.log(newData), displayTimetable(newData), $(".snackbar").fadeOut(250)
}

function displayMeal(e) {
    var a = selectedDate.substring(6, 8).replace(/(^0+)/, "");
    if (e.meal[a]) {
        $("#no-meal").hide(), $("#exist-meal").fadeIn();
        for (var t = (currentMenuRaw = e.meal[a].toString()).replaceAll("'", "").replaceAll("[중식]", "").split("\n"), s = "", l = 0; l < t.length; l++) {
            if (t[l].match(/\d+/)) var n = t[l].match(/\d+/).index,
                o = t[l].substring(n, t[l].length);
            else o = "none";
            var d = t[l].substring(0, n);
            s += "<a href=\"javascript:openMenuBanner('" + d + "', '" + o + "')\">" + d + "</a><br>"
        }
        $("#meal-menus").html(s)
    } else currentMenuRaw = "", $("#no-meal").fadeIn(), $("#exist-meal").hide(), $("#kcal").html(""), $("#meal-menus").html("")
}

function displaySchedule(e) {
    for (var a = e.schedule, t = Object.keys(a).length - 2, s = 1; s <= t; s++) "" != a[s] && $("#schedule-content").append('<div class="schedule-item"><span class="day-text">' + s + '</span><h3 class="schedule-name">' + a[s] + "</h3></div>")
}

function displayTimetable(e) {
    for (var a = moment(selectedDate).day(), t = document.querySelectorAll("th"), s = 0; s < t.length; s++) {
        var l = t.item(s);
        $(l).removeClass("active")
    }
    switch (a) {
        case 1:
            $("#m1").addClass("active"), $("#m2").addClass("active"), $("#m3").addClass("active"), $("#m4").addClass("active"), $("#m5").addClass("active"), $("#m6").addClass("active"), $("#m7").addClass("active");
            break;
        case 2:
            $("#tu1").addClass("active"), $("#tu2").addClass("active"), $("#tu3").addClass("active"), $("#tu4").addClass("active"), $("#tu5").addClass("active"), $("#tu6").addClass("active"), $("#tu7").addClass("active");
            break;
        case 3:
            $("#w1").addClass("active"), $("#w2").addClass("active"), $("#w3").addClass("active"), $("#w4").addClass("active"), $("#w5").addClass("active"), $("#w6").addClass("active"), $("#w7").addClass("active");
            break;
        case 4:
            $("#th1").addClass("active"), $("#th2").addClass("active"), $("#th3").addClass("active"), $("#th4").addClass("active"), $("#th5").addClass("active"), $("#th6").addClass("active"), $("#th7").addClass("active");
            break;
        case 5:
            $("#f1").addClass("active"), $("#f2").addClass("active"), $("#f3").addClass("active"), $("#f4").addClass("active"), $("#f5").addClass("active"), $("#f6").addClass("active"), $("#f7").addClass("active")
    }
    timetableRaw = e;
    for (s = 0; s < e.mon.length; s++) $("#m" + (s + 1).toString()).html(e.mon[s].ITRT_CNTNT);
    for (s = 0; s < e.tue.length; s++) $("#tu" + (s + 1).toString()).html(e.tue[s].ITRT_CNTNT);
    for (s = 0; s < e.wed.length; s++) $("#w" + (s + 1).toString()).html(e.wed[s].ITRT_CNTNT);
    for (s = 0; s < e.thu.length; s++) $("#th" + (s + 1).toString()).html(e.thu[s].ITRT_CNTNT);
    for (s = 0; s < e.fri.length; s++) $("#f" + (s + 1).toString()).html(e.fri[s].ITRT_CNTNT)
}

function shareMeal() {
    if (currentMenuRaw) {
        for (var e = currentMenuRaw.replaceAll("'", "").replaceAll("[중식]", "").split("\n"), a = "", t = 0; t < e.length; t++) {
            if (e[t].match(/\d+/)) {
                var s = e[t].match(/\d+/).index;
                e[t].substring(s, e[t].length)
            } else;
            a += e[t].substring(0, s) + "\n"
        }
        var l = "<" + moment(selectedDate).lang("ko").format("M월 D일(dddd)") + " 성일고 급식>\n" + a;
        Kakao.Link.sendDefault({
            objectType: "text",
            text: l,
            link: {
                mobileWebUrl: "https://sungil.vercel.app",
                webUrl: "https://sungil.vercel.app"
            }
        })
    } else $("#copied").text("내용 없음"), setTimeout(function () {
        $("#copied").text("")
    }, 1e3)
}
grade && classNum && $("#gradeClassLabel").html(grade + "학년 " + classNum + "반"), $.datepicker.setDefaults({
    dateFormat: "yy-mm-dd",
    prevText: "이전 달",
    nextText: "다음 달",
    monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    dayNames: ["일", "월", "화", "수", "목", "금", "토"],
    dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
    dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
    showMonthAfterYear: !0,
    yearSuffix: "년"
}), $("#datepicker").datepicker({
    onSelect: function (e) {
        selectedDate = moment(e).format("YYYYMMDD"), $("#date").html(moment(selectedDate).lang("ko").format("M월 D일 (dddd)")), $("body").css("overflow", "auto"), $(".modal-in").css("bottom", "-1850px"), setTimeout(function () {
            $(".modal-in").css("display", "none")
        }, 100), $(".sheet-backdrop").removeClass("backdrop-in"), updateInfo()
    }
}), $(document).ready(function () {
    updateInfo(), $.ajax({
        type: "GET",
        url: "https://sungil-school-api.vercel.app/notices",
        success: function (e) {
            for (var a = JSON.parse(e), t = 0; t < 5; t++) {
                var s = a.items[t].title,
                    l = moment(new Date(a.items[t].published)).format("YYYY-MM-DD"),
                    n = "https://sungil-h.goesn.kr/" + a.items[t].link;
                $("#notices-content").append('<div class="card notice-card" onclick="window.open(\'' + n + "', '_blank')\">\n            <h4>" + s + "</h4>\n            <p>" + l + "</p>\n        </div>")
            }
            if ("true" == storedTheme || "system" == storedTheme && mql.matches) {
                var o = document.getElementsByClassName("notice-card");
                for (t = 0; t < o.length; t++) o[t].classList.add("dark")
            }
        }
    })
}), String.prototype.insertAt = function (e, a) {
    return this.slice(0, e) + a + this.slice(e)
}, Kakao.init("c2c4f841a560ad18bfed29d190dfac19");
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIos = () => {
        const e = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(e)
    },
    isInStandaloneMode = () => "standalone" in window.navigator && window.navigator.standalone;

function getWeekNo(e) {
    var a = new Date;
    return e && (a = new Date(e)), Math.ceil(a.getDate() / 7)
}

function search(e) {
    $.ajax({
        type: "GET",
        url: "https://dapi.kakao.com/v2/search/image?query=" + e,
        headers: {
            Authorization: "KakaoAK a1cb5ad868a6adb4d8d59d2454d4b2bc"
        },
        success: function (e) {
            var a = e;
            i = 0;
            var t = '<img class="menu-image" src="' + a.documents[i].thumbnail_url + '" class="img-thumbnail" onclick="selectImage(\'' + a.documents[i].image_url + "')\">";
            $("#image_result").html(t)
        }
    })
}

function openMenuBanner(e, a) {
    if ("none" == a) $("#allergy-info").html("알레르기 정보 없음");
    else {
        var t = a.replace("10", "돼지고기").replace("11", "복숭아").replace("12", "토마토").replace("13", "아황산염").replace("14", "호두").replace("15", "닭고기").replace("16", "쇠고기").replace("17", "오징어").replace("18", "조개류(굴, 전복, 홍합 포함)").replace("19", "잣").replace("1", "난류").replace("2", "우유").replace("3", "메밀").replace("4", "땅콩").replace("5", "대두").replace("6", "밀").replace("7", "고등어").replace("8", "게").replace("9", "새우").replaceAll(".", ", ");
        $("#allergy-info").html(t.substring(0, t.length - 2))
    }
    search(e), $("#menu-name").html(e), $(".menuBanner").show("slide", {
        direction: "down"
    }, 100)
}
isIos() && !isInStandaloneMode() && ($(".pwaBanner").show(), isMobile() ? isIos() ? $("#ios").show() : $("#android").show() : $("#desktop").show()), window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault(), deferredPrompt = e, $(".pwaBanner").show(), isMobile() ? isIos() ? $("#ios").show() : $("#android").show() : $("#desktop").show()
}), document.addEventListener("click", function (e) {
    $(".menuBanner").is(":visible") && ($(e.target).hasClass("menuBanner") || $(".menuBanner").hide("slide", {
        direction: "down"
    }, 100))
}), document.addEventListener("click", function (e) {
    $(".pwaBanner").is(":visible") && ($(e.target).hasClass("pwaBanner") || $(".pwaBanner").hide("slide", {
        direction: "down"
    }, 100))
}), $(".pop").on("click", function () {
    $("#modal-title").text("날짜 선택"), $("#datepicker").show(), $("#whatsnew").hide(), $("body").css("overflow", "hidden"), $(".modal-in").css("display", "block"), $(".modal-in").css("bottom", "-1850px"), setTimeout(function () {
        $(".modal-in").css("bottom", "0px")
    }, 100), $(".sheet-backdrop").addClass("backdrop-in"), setTimeout(function () {
        $(".sheet-modal").css("height", $("#datepicker").height() + 130 + "px")
    }, 100)
}), $(".sheet-backdrop").on("click", function () {
    $("body").css("overflow", "auto"), $(".modal-in").css("bottom", "-1850px"), setTimeout(function () {
        $(".modal-in").css("display", "none")
    }, 100), $(".sheet-backdrop").removeClass("backdrop-in")
}), $(".whatsnew-btn").on("click", function () {
    $(".sheet-modal").css("height", "30%"), $("#modal-title").text("새로운 기능✨"), $("#datepicker").hide(), $("#whatsnew").show(), $("body").css("overflow", "hidden"), $(".modal-in").css("display", "block"), $(".modal-in").css("bottom", "-1850px"), setTimeout(function () {
        $(".modal-in").css("bottom", "0px")
    }, 100), $(".sheet-backdrop").addClass("backdrop-in"), setTimeout(function () {
        $(".sheet-modal").css("height", $("#whatsnew").height() + 130 + "px")
    }, 100)
}), $(".c-modal").each(function () {
    var e = new Hammer(this);
    e.get("swipe").set({
        direction: Hammer.DIRECTION_ALL
    }), e.on("swipedown", function (e) {
        $("body").css("overflow", "auto"), $(".modal-in").css("bottom", "-1850px"), setTimeout(function () {
            $(".modal-in").css("display", "none")
        }, 100), $(".sheet-backdrop").removeClass("backdrop-in")
    })
});