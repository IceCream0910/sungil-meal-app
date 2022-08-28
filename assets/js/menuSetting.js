
$(function () {
    if (localStorage.getItem("ssoak-home-order-for-setting")) {
        savedOrder = (localStorage.getItem("ssoak-home-order-for-setting")).split(',')
    } else { savedOrder = [0, 1, 2, 3, 4] }
    // order '.list-item' in '.container' by syncing data-index with savedOrder
    sortables = savedOrder.map((index, i) => Sortable(document.querySelector(`[data-num="${index}"]`), i));
    // layout sortables
    sortables.forEach(sortable => sortable.layout());
    // set up event listeners
    document.addEventListener("mousedown", e => {
        if (e.target.classList.contains("list-item")) {
            sortables.forEach(sortable => sortable.start(e));
        }
    }
    );
});


var rowSize = 80; // => container height / number of items
var container = document.querySelector(".container");
var listItems = Array.from(document.querySelectorAll(".list-item")); // Array of elements
var sortables = listItems.map(Sortable); // Array of sortables
var total = sortables.length;

TweenLite.to(container, 0.5, { autoAlpha: 1 });

function changeIndex(item, to) {
    // Change position in array
    arrayMove(sortables, item.index, to);

    // Change element's position in DOM. Not always necessary. Just showing how.
    if (to === total - 1) {
        container.appendChild(item.element);
    } else {
        var i = item.index > to ? to : to + 1;
        container.insertBefore(item.element, container.children[i]);
    }

    // Set index for each sortable
    sortables.forEach((sortable, index) => sortable.setIndex(index));
}

function Sortable(element, index) {
    var content = element.querySelector(".item-content");
    var order = element.querySelector(".order");

    var animation = TweenLite.to(content, 0.3, {
        boxShadow: "rgba(0,0,0,0.2) 0px 16px 32px 0px",
        force3D: true,
        scale: 1.1,
        paused: true
    });

    var dragger = new Draggable(element, {
        onDragStart: downAction,
        onRelease: upAction,
        onDrag: dragAction,
        cursor: "inherit",
        type: "y"
    });

    // Public properties and methods
    var sortable = {
        dragger: dragger,
        element: element,
        index: index,
        setIndex: setIndex
    };

    TweenLite.set(element, { y: index * rowSize });

    function setIndex(index) {
        sortable.index = index;
        order.textContent = index + 1;

        // Don't layout if you're dragging
        if (!dragger.isDragging) layout();
    }

    function downAction() {
        animation.play();
        this.update();
    }

    function dragAction() {
        // Calculate the current index based on element's position
        var index = clamp(Math.round(this.y / rowSize), 0, total - 1);

        if (index !== sortable.index) {
            changeIndex(sortable, index);
        }
    }

    function upAction() {
        animation.reverse();
        layout();
    }

    function layout() {
        TweenLite.to(element, 0.3, { y: sortable.index * rowSize });
    }

    return sortable;
}

// Changes an elements's position in array
function arrayMove(array, from, to) {
    array.splice(to, 0, array.splice(from, 1)[0]);
}

// Clamps a value to a min/max
function clamp(value, a, b) {
    return value < a ? a : value > b ? b : value;
}


function complete() {
    var resultData = {};
    var listItems = Array.from(document.querySelectorAll(".list-item"));
    var cnt = 0;
    listItems.map(function (item) {
        var index = item.getAttribute("data-index");
        var indexInArray = listItems.indexOf(item);
        var json = {};
        json[index] = indexInArray;
        resultData[cnt] = json;
        cnt++;
    });
    var resultForSetting = listItems.map(function (item) {
        return item.getAttribute("data-num");
    });

    localStorage.setItem("ssoak-home-order-for-setting", resultForSetting);
    localStorage.setItem("ssoak-home-order", JSON.stringify(resultData) || `{ "0": { "meal": 0 }, "1": { "selfcheck": 1 }, "2": { "timetable": 2 }, "3": { "schedule": 3 }, "4": { "notice": 4 }}`);
    toast('순서를 변경했어요.');
    setTimeout(function () {
        location.href = 'index.html'
    }, 1000);
}


function resetOrder() {
    localStorage.setItem("ssoak-home-order-for-setting", [0, 1, 2, 3, 4]);
    localStorage.setItem("ssoak-home-order", `{ "0": { "meal": 0 }, "1": { "selfcheck": 1 }, "2": { "timetable": 2 }, "3": { "schedule": 3 }, "4": { "notice": 4 }}`);
    toast('처음 설정으로 되돌릴게요.');
    setTimeout(function () {
        location.reload();
    }, 1000);
}

//toast
function toast(msg) {
    Toastify({
        text: msg,
        duration: 2200,
        newWindow: true,
        close: false,
        gravity: "bottom", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            boxShadow: "none"
        }
    }).showToast();
}


//다크모드
const storedTheme = localStorage.getItem("darkTheme") || "system";
if (storedTheme != null) {
    if (storedTheme === "true") {
        onDark();

    } else if (storedTheme === "system") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            onDark();
        }
    }
}

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
    $('.card').addClass("dark");
    $('.card__primary__title').addClass("dark");
    $('.card__supporting__text').addClass("dark");
    $('.mdc-form-field').addClass("dark");
    $('input').addClass("dark");
    $('.mdc-button__label').addClass("dark");
    $('.mdc-fab--mini').addClass("dark");
    $(':root').addClass("dark");
    $('.init_header').addClass("dark");
    $('.button-wrap').addClass("dark");
    $('.custom-btn').addClass("dark");
    $('.item-content').addClass("dark");
}

function offDark() {
    $('html').removeClass("dark");
    $('html').removeClass("dark");
    $('body').removeClass("dark");
    $('.card').removeClass("dark");
    $('.card__primary__title').removeClass("dark");
    $('.card__supporting__text').removeClass("dark");
    $('.mdc-form-field').removeClass("dark");
    $('input').removeClass("dark");
    $('.mdc-button__label').removeClass("dark");
    $('.mdc-fab--mini').removeClass("dark");
    $(':root').removeClass("dark");
    $('.init_header').removeClass("dark");
    $('.button-wrap').removeClass("dark");
    $('.custom-btn').removeClass("dark");
    $('.item-content').removeClass("dark");

}
//다크모드 끝


