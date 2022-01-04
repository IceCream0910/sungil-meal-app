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
    $('.card').addClass("dark");
    $('.card__primary__title').addClass("dark");
    $('.card__supporting__text').addClass("dark");
    $('.mdc-button').addClass("dark");
    $('.mdc-fab--mini').addClass("dark");
    $('.pwaBanner').addClass("dark");
    $('.menuBanner').addClass("dark");
    $('.inp').addClass("dark");
    $('.ui-datepicker').addClass("dark");
    $('.loading-overlay').addClass("dark");
    $('.ui-widget-header').addClass("dark");
    $('.ui-state-default').addClass("dark");
    $('.ui-state-highlight').addClass("dark");
    $('#close-path').css({ fill: '#eee' });
    $('#close-path-2').css({ fill: '#eee' });
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
    $('.ui-datepicker').removeClass("dark");
    $('.loading-overlay').removeClass("dark");
    $('.ui-widget-header').removeClass("dark");
    $('.ui-state-default').removeClass("dark");
    $('.ui-state-highlight').removeClass("dark");
    $('#close-path').css({ fill: '#000' });
    $('#close-path-2').css({ fill: '#000' });
}