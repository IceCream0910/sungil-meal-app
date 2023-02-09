var storedTheme = localStorage.getItem("darkTheme") || "system";

var mql = window.matchMedia("(prefers-color-scheme: dark)");

function updateTheme() {
    storedTheme = localStorage.getItem("darkTheme") || "system";
    if (storedTheme !== null) {
        if (storedTheme === "true") {
            onDark();
        } else if (storedTheme === "false") {
            offDark();
        } else if (storedTheme === "system") {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                onDark();
            } else {
                offDark();
            }
        }
    }

}

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
    $('.bottom-nav').addClass("dark");
    $('.main-nav').addClass("dark");
    $('.card').addClass("dark");
    $('.card__primary__title').addClass("dark");
    $('.card__supporting__text').addClass("dark");
    $('.mdc-button').addClass("dark");
    $('.mdc-fab--mini').addClass("dark");
    $('#datepicker').addClass("dark");
    $('.pwaBanner').addClass("dark");
    $('.menuBanner').addClass("dark");
    $('.inp').addClass("dark");
    $('.loading-overlay').addClass("dark");
    $('#close-path').css({ fill: '#eee' });
    $('#close-path-2').css({ fill: '#eee' });
    $('.sheet-modal').addClass("dark");
    $('.swipe-handler').addClass("dark");
    $('th').each(function () {
        $(this).addClass("dark");
    });
    $('.ourclassAssign-btn').addClass("dark");
    $('.skeleton').addClass("dark");
    $('.mealItem').each(function () {
        $(this).addClass("dark");
    });
    $('input').each(function () {
        $(this).addClass("dark");
    });
    $('#title').addClass("dark");
    $('.task-box').addClass("dark");
    $('#community .header').addClass("dark");
    $('#community .commnity-notice').addClass("dark");
    $('.custom-btn').addClass("dark");
    $('.ui-widget-content').addClass("dark");
    $('.ui-widget-header').addClass("dark");
    $('.ui-state-default').addClass("dark");
    $('#main-confirm').addClass("dark");
    $('.mdc-button__label').addClass("dark");
    $('.home-header').addClass("dark");
    $('.semester-tab').addClass("dark");
    $('.community-tab').addClass("dark");
    $('#vote-choice-list').addClass("dark");
    $('.reaction-wrap').addClass("dark");
    $('#tools').addClass("dark");
    $('#tools textarea').addClass("dark");
    $('.badge').addClass("dark");
    $('.bottom-nav').addClass("dark");
    $('.main-nav').addClass("dark");
    //설정 화면 요소
    $(':root').addClass("dark");
    $('.mdc-radio__outer-circle').addClass("dark");
    $('.checkbox').addClass("dark");
    var styles = `.mdc-radio .mdc-radio__native-control:enabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle {
        border-color: rgba(255,255,255, 0.54);
    }`
    var styleSheet = document.createElement("style")
    styleSheet.type = "text/css"
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet);
    // 로딩 이후 만들어지는 요소들 변경
    $('th').addClass("dark");
    $('.header').addClass("dark");
    $('.community-tab').addClass("dark");
    $('.post-item').addClass("dark");
}

function offDark() {
    $('html').removeClass("dark");
    $('body').removeClass("dark");
    $('.bottom-nav').removeClass("dark");
    $('.main-nav').removeClass("dark");
    $('.card').removeClass("dark");
    $('.card__primary__title').removeClass("dark");
    $('.card__supporting__text').removeClass("dark");
    $('.mdc-button').removeClass("dark");
    $('.mdc-fab--mini').removeClass("dark");
    $('#datepicker').removeClass("dark");
    $('.pwaBanner').removeClass("dark");
    $('.menuBanner').removeClass("dark");
    $('.inp').removeClass("dark");
    $('.loading-overlay').removeClass("dark");
    $('#close-path').css({ fill: '#000' });
    $('#close-path-2').css({ fill: '#000' });
    $('.sheet-modal').removeClass("dark");
    $('.swipe-handler').removeClass("dark");
    $('th').each(function () {
        $(this).removeClass("dark");
    });
    $('.ourclassAssign-btn').removeClass("dark");
    $('.skeleton').removeClass("dark");
    $('.mealItem').each(function () {
        $(this).removeClass("dark");
    });
    $('input').each(function () {
        $(this).removeClass("dark");
    });
    $('#title').removeClass("dark");
    $('.task-box').removeClass("dark");
    $('#community .header').removeClass("dark");
    $('#community .commnity-notice').removeClass("dark");
    $('.custom-btn').removeClass("dark");
    $('.ui-widget-content').removeClass("dark");
    $('.ui-widget-header').removeClass("dark");
    $('.ui-state-default').removeClass("dark");
    $('#main-confirm').removeClass("dark");
    $('.mdc-button__label').removeClass("dark");
    $('.home-header').removeClass("dark");
    $('.semester-tab').removeClass("dark");
    $('.community-tab').removeClass("dark");
    $('#vote-choice-list').removeClass("dark");
    $('.reaction-wrap').removeClass("dark");
    $('#tools').removeClass("dark");
    $('#tools textarea').removeClass("dark");
    $('.badge').removeClass("dark");
    $('.bottom-nav').removeClass("dark");
    $('.main-nav').removeClass("dark");
    //설정 화면 요소
    $(':root').removeClass("dark");
    $('.mdc-radio__outer-circle').removeClass("dark");
    $('.checkbox').removeClass("dark");
    var styles = `.mdc-radio .mdc-radio__native-control:enabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle {
        border-color: rgba(0,0,0, 0.54);
    }`
    var styleSheet = document.createElement("style")
    styleSheet.type = "text/css"
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet);
    // 로딩 이후 만들어지는 요소들 변경
    $('th').removeClass("dark");
    $('.header').removeClass("dark");
    $('.community-tab').removeClass("dark");
    $('.post-item').removeClass("dark");
}