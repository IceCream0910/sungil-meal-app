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
    $('.whatsnew-btn').addClass("dark");
    $('.skeleton').addClass("dark");
    $('.mealItem').each(function () {
        $(this).addClass("dark");
    });
}

function offDark() {
    $('html').removeClass("dark");
    $('body').removeClass("dark");
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
    $('.whatsnew-btn').removeClass("dark");
    $('.skeleton').removeClass("dark");
    $('.mealItem').each(function () {
        $(this).removeClass("dark");
    });
}