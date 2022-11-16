//accordian
$(function () {
    var Accordion = function (el, multiple) {
        this.el = el || {};
        this.multiple = multiple || false;

        // Variables privadas
        var links = this.el.find(".link");
        // Evento
        links.on("click", { el: this.el, multiple: this.multiple }, this.dropdown);
    };

    Accordion.prototype.dropdown = function (e) {
        var $el = e.data.el;
        ($this = $(this)), ($next = $this.next());

        $next.slideToggle();
        $this.parent().toggleClass("open");

        if (!e.data.multiple) {
            $el
                .find(".submenu")
                .not($next)
                .slideUp()
                .parent()
                .removeClass("open");
        }
    };

    var accordion = new Accordion($("#accordion"), false);
});


//등급 계산기
$('#grade-rank').val('');
$('#grade-total').val(localStorage.getItem('ssoak-grade-total') || '');

function calculateGrade() {
    const rank_input = $('#grade-rank').val();
    const total_input = $('#grade-total').val();

    var rank = parseInt(rank_input);
    var total = parseInt(total_input);
    var grade = 0;

    if (rank_input == '' || total_input == '' || rank_input == 0 || total_input == 0) {
        toast('모든 항목을 입력해주세요.');
    } else if (total_input <= 1) {
        toast('이수자 수에는 1보다 큰 수를 입력해주세요.');
    } else {
        if (rank <= Math.floor(total * 4 / 100)) {
            grade = 1;
        } else if (rank <= Math.floor(total * 11 / 100)) {
            grade = 2;
        } else if (rank <= Math.floor(total * 23 / 100)) {
            grade = 3;
        } else if (rank <= Math.floor(total * 40 / 100)) {
            grade = 4;
        } else if (rank <= Math.floor(total * 60 / 100)) {
            grade = 5;
        } else if (rank <= Math.floor(total * 77 / 100)) {
            grade = 6;
        } else if (rank <= Math.floor(total * 89 / 100)) {
            grade = 7;
        } else if (rank <= Math.floor(total * 96 / 100)) {
            grade = 8;
        } else {
            grade = 9
        }
        $('#resultGrade').text(grade);
        $('#calculator-result').show();
        $('.sheet-modal').css('height', $('#calculator').height() + 130 + 'px');
        localStorage.setItem('ssoak-grade-total', total);
    }
}

//글자수세기
const textarea = document.getElementById("counter");
const spellCheckButton = document.getElementById("spellcheck_button")

let content = localStorage.getItem("save_letterCounter");

if (content) {
    counter(content);
    $(textarea).val(content);
}

$("#letter-counter .counter").keyup(function (e) {
    resize(e.target);
    counter(e.target.value);
    $('#spell-check').hide();
    $('#spell-check-result').html('');
});

function counter(content) {
    localStorage.setItem("save_letterCounter", content);
    var english = content.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/gi, "").replace(/[0-9]/gi, "").replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "").replace(/\s/gi, "").replace(/\s/gi, "").replace(/(\r\n\t|\n|\r\t)/gm, "");;
    var korean = content.replace(/[a-zA-Z]/gi, "").replace(/[0-9]/gi, "").replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "").replace(/\s/gi, "").replace(/(\r\n\t|\n|\r\t)/gm, "");
    var number = content.replace(/[a-zA-Z]/gi, "").replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/gi, "").replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "").replace(/\s/gi, "").replace(/(\r\n\t|\n|\r\t)/gm, "");
    var special = content.replace(/[a-zA-Z]/gi, "").replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/gi, "").replace(/[0-9]/gi, "").replace(/\s/gi, "").replace(/(\r\n\t|\n|\r\t)/gm, "");
    var space = content.replace(/[a-zA-Z]/gi, "").replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/gi, "").replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "").replace(/[0-9]/gi, "").replace(/(\r\n\t|\n|\r\t)/gm, "");
    var line = content.replace(/[a-zA-Z]/gi, "").replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/gi, "").replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi, "").replace(/[0-9]/gi, "").replace(/ /gi, "");
    var result = english.length + (korean.length * 3) + number.length + special.length + space.length + (line.length * 2);

    $('#result').html(`공백 제외 <span>${content.replace(/(\r\n\t|\n|\r\t)/gm, "").replace(/ /gi, "").length}</span>자, 공백 포함 <span>${content.length}</span>자, 총 <span>${result}</span>바이트`);
}

function resize(obj) {
    obj.style.height = "1px";
    obj.style.height = (12 + obj.scrollHeight) + "px";
}

function resetCounter() {
    $(textarea).val("");
    $('#spell-check-result').html('');
    $('#spell-check').hide();
    localStorage.removeItem("save_letterCounter");
    counter('')
    resize(textarea);
}

var spellCheckResult = {};
function spellCheck() {
    if (textarea.value.length < 1300) {
        $('#spell-check-btn').html('맞춤법 검사<img src="assets/icons/circle_loading.gif" width="25px">')
        $.ajax({
            url: "https://spell.rycont.workers.dev/" + textarea.value,
            type: "GET",
            success: function (data) {
                $('#spell-check-btn').html('맞춤법 검사')
                if (data) {
                    spellCheckResult = data;
                    if (data.length > 0) {
                        $('#spell-check').show();
                        $('#spell-check-result').html('');
                        for (var i = 0; i < data.length; i++) {
                            $('#spell-check-result').append(`<div class="card notice-card">
                            <div class="spell-check-result-item">
                                <div class="replace">
                                    <h5>${data[i].token}</h5>
                                    <ion-icon name="arrow-forward-outline"></ion-icon>
                                    <h5>${data[i].suggestions[0]}</h5>
                                    <button class="custom-btn sub-btn" onclick="replaceText(${i}, ${data[i].from}, ${data[i].to}, '${data[i].token}', '${data[i].suggestions[0].toString()}');">바꾸기</button>
                                </div>
                                <p>${data[i].info}</p>
                            </div>
                        </div>`);
                        } if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                            var notice_items = document.getElementsByClassName('notice-card');
                            for (var i = 0; i < notice_items.length; i++) {
                                notice_items[i].classList.add("dark");
                            }
                        }
                    } else {
                        //오류 없음
                        toast('맞춤법 오류를 발견하지 못했어요');
                    }
                } else {
                    toast('알 수 없는 오류가 발생했어요');
                }
            }
        });
    } else {
        toast('맞춤법 검사는 최대 1300자까지 가능해요.');
    }
}


function replaceText(index, from, to, origin, suggestion) {
    var text = textarea.value;
    console.log(origin, suggestion)
    var newText = text.replace(origin, suggestion);
    textarea.value = newText;
    counter(newText);
    resize(textarea);
    //해당 제안 카드 삭제
    var div = document.getElementById('spell-check-result');
    $(div.childNodes[index]).addClass('complete')
}

function replaceAllText() {
    for (var i = 0; i < spellCheckResult.length; i++) {
        replaceText(i, spellCheckResult[i].from, spellCheckResult[i].to, spellCheckResult[i].token.toString(), spellCheckResult[i].suggestions[0].toString());
    }
    $('#spell-check-result .card').addClass('complete');
    toast('발견된 맞춤법 오류를 모두 수정했어요');
}

function copyText() {
    var copyText = document.getElementById("counter");
    copyText.select();
    copyText.setSelectionRange(0, textarea.value.length);
    document.execCommand("copy");
    toast('클립보드에 복사했어요');
}
