const storedTheme = localStorage.getItem("darkTheme") || "system";

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
    $('.bottom-nav').addClass("dark");
    $('.main-nav').addClass("dark");
    $('.card').addClass("dark");
    $('.card__primary__title').addClass("dark");
    $('.card__supporting__text').addClass("dark");
    $('.mdc-button').addClass("dark");
    $('.mdc-fab--mini').addClass("dark");
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
    $('.content-wrap input').each(function () {
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
    loadPostList()
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
    $('.content-wrap input').each(function () {
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
    loadPostList()
}