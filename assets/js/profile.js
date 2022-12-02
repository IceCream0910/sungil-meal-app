const firebaseConfig = {
    apiKey: "AIzaSyDsE3S6NdSB_BO03pHBA3VVkCo6RWn-3Tw",
    authDomain: "ssoak-72f93.firebaseapp.com",
    projectId: "ssoak-72f93",
    storageBucket: "ssoak-72f93.appspot.com",
    messagingSenderId: "998236238275",
    appId: "1:998236238275:web:254b37e7a33448259ecd76",
    databaseURL: "https://ssoak-72f93-default-rtdb.firebaseio.com",
};

firebase.initializeApp(firebaseConfig);

//로그인
const auth = firebase.auth();
var db = firebase.firestore();

const uid = getUrlParameter('uid');
console.log(uid)

//유저 정보 가져오기
db.collection('users').doc(uid).get().then((doc_user) => {
    var user = doc_user.data();
    if (user.profileImg) {
        $('#header-profile-img').attr('src', `assets/icons/profileImg/letter${user.profileImg + 1}.png`);
    } else {
        $('#header-profile-img').attr('src', `assets/icons/profileImg/letter1.png`);
    }
    $('#uname').html(((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname || '(어디론가 사라진 사용자)')));
    document.title = user.nickname + '님의 프로필 - 쏙';
    if(firebase.auth().currentUser.uid == uid){
        document.title = '내 프로필 - 쏙';
        $('#edit-btn').show();
    } else {
        $('#edit-btn').remove();
    }
});

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
}

const database = db.collection('board').where('userId', '==', uid)
database.get()
    .then((querySnapshot) => {
        $('.post-listview').html('');
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            db.collection('users').doc(data.userId).get().then((doc_user) => {
                var user = doc_user.data();
                $('.post-listview').prepend(
                    `
                <div class="post-item" onclick="openPost('`+ 'board.html?id=' + doc.id + `', this);" data-createdAt="` + data.createdAt.toDate().getTime() + `">
                <div class="post-header">
                <img src="assets/icons/profileImg/letter`+ ((user.profileImg) ? user.profileImg + 1 : 1) + `.png" class="profile-img" />
                    <span id="uname">`+ ((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname || '(어디론가 사라진 사용자)')) + `<br>
                        <span style="opacity:0.7">`+ timeForToday(data.createdAt.toDate()) + `</span>
                    </span>

                </div>

                <h3 id="post-title">`+ data.title + `</h3>

                <div class="post-preview" id="viewer-`+ doc.id + `">
                </div>
                
                <div id="choices-list-`+ doc.id + `" style="width: 100%;"> </div>

                ${(data.image) ? `<img src="` + data.image[0] + `" class="post-image" />` : ''}
                <span style="color:#5272ff;font-size:15px;margin-top:10px;">더보기</span>
                <br>

                </div>
                `
                );

                if (data.category == "투표") {
                    var cnt = 0;
                    data.options.forEach((option) => {
                        $('#choices-list-' + doc.id).append(`<div class="post-vote" style="display:block;width: 100%;"><div class="vote-choice-item" style="padding-top: 15px;" data-index="${cnt}">
                            <div class="inner" style="margin-bottom: -5px;">
                            <h3>${option.title}</h3>
                            </div>
                        </div></div>`);
                        cnt++;
                    });
                    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                        $('.vote-choice-item').each(function () {
                            $(this).addClass("dark");
                        });
                    }
                }

                if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                    const viewer = new toastui.Editor.factory({
                        el: document.querySelector('#viewer-' + doc.id),
                        viewer: true,
                        initialValue: data.content.replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, '$1').replace('?vote?', '투표를 확인하려면 클릭하세요.').substring(0, 100),
                        theme: 'dark'
                    });
                    $('.post-item').addClass("dark");
                } else {
                    const viewer = new toastui.Editor.factory({
                        el: document.querySelector('#viewer-' + doc.id),
                        viewer: true,
                        initialValue: data.content.replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, '$1').replace('?vote?', '투표를 확인하려면 클릭하세요.').substring(0, 100),
                        theme: 'default'
                    });
                }
                $('.post-item').sort(function (a, b) {
                    return $(b).data('createdat') - $(a).data('createdat');
                }
                ).appendTo('.post-listview');

            });
        });
    });


$('#edit-btn').on('click', function () {
    $('.sheet-modal').css('height', '30%');
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#account').height() + 130 + 'px');
    }, 100);

    db.collection('users').doc(firebase.auth().currentUser.uid).get().then((doc_user) => {
        var user = doc_user.data();
        $('#account-username').val(user.nickname);
        $('#header-username').text(user.nickname);

        var profileImg = user.profileImg;
        $('.profile-image-btn').removeClass('active');
        $(document.getElementsByClassName('profile-image-btn')[profileImg]).addClass('active');
    });
});

$('#user-call-btn').on('click', function () {
    db.collection('users').doc(uid).get().then((doc_user) => {
        var user = doc_user.data();
        if (user.fcmToken) { //token 존재
            $.ajax({
                type: "GET",
                url: `https://sungil-school-api.vercel.app/fcm?key=9pcd01YwxIIO3ZVZWFLN&title=${$('#uname').text()}님이 나를 깨웠어요.&desc=아무 이유도 없을 가능성이 큽니다.&token=${user.fcmToken}`,
                success: function (result) {
                    toast('친구를 깨웠어요!');
                    console.log(result);
                }
            });
        } else {
            toast('안드로이드 앱을 사용중인 친구만 깨울 수 있어요.');
        }
    });
});

function closeModal() {
    $('body').css('overflow', 'auto');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('display', 'none');
    }, 100);
    $('.sheet-backdrop').removeClass('backdrop-in');
    $('.sheet-backdrop-nocancel').removeClass('backdrop-in');

}


//modal
$('.sheet-backdrop').on('click', function () {
    closeModal();
});

$('.c-modal').each(function () {

    var mc = new Hammer(this);

    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });

    mc.on("swipedown", function (ev) {
        if (!$('#loginForm').is(':visible') && !$('#writePost').is(':visible')) {
            closeModal();
        }
    });


});



async function confirmLogout() {
    const confirm = await ui.confirm('정말 로그아웃 하시겠습니까?');
    if (confirm) {
        firebase.auth().signOut().then(function () {
            closeModal();
            toast('로그아웃 되었습니다.');
            Android.logoutAndroidApp();
        });
    }
}

function edit_saveAccountDb() {
    var nickname = $('#account-username').val();
    if (nickname == '' || nickname == ' ' || nickname == null || nickname == undefined || nickname == '  ') {
        toast('닉네임을 입력해주세요.')
    } else {
        checkNicknameDuplicate(nickname);
    }
}

// 닉네임 중복 체크 후 등록
function checkNicknameDuplicate(nickname) {
    db.collection('users').where('nickname', '==', nickname).get()
        .then(snapshot => {
            if (snapshot.size == 0) {
                closeModal();

                var data = {
                    nickname: nickname,
                }

                db.collection('users').doc(firebase.auth().currentUser.uid).update(data).then((result2) => {
                    $('#community .community-member-header').show();
                    $('#header-username').text(nickname);
                }).catch((err) => {
                    toast(err)
                    console.log(err);
                })
            } else if ($('#header-username').text() == nickname) { //변경 사항 없으면 닫기
                closeModal();
            } else {
                toast('이미 사용중인 닉네임입니다.')
            }
        })
        .catch(err => {
            console.log('Error getting documents', err);
            toast(err)
        });
}


//프로필 사진 변경
function changeProfileImg(imgNum) {
    var data = {
        profileImg: imgNum,
    }

    db.collection('users').doc(firebase.auth().currentUser.uid).update(data).then((result2) => {
        $('.profile-image-btn').removeClass('active');
        $(document.getElementsByClassName('profile-image-btn')[imgNum]).addClass('active');
        $('#header-profile-img').attr('src', `assets/icons/profileImg/letter${imgNum + 1}.png`);
    }).catch((err) => {
        toast(err)
        console.log(err);
    })
}


function addChoice() {
    $('#vote-choice-list').append(`
    <input id="vote-choice" type="text" placeholder="항목 내용을 입력해주세요" style="font-size:16px;" required>
    `);
    $('.sheet-modal').css('height', $('#vote').height() + 130 + 'px');
    $('#vote-choice-list').animate({
        scrollTop: $('#vote-choice-list')[0].scrollHeight
    }, 0);
}



//toast
function toast(msg) {
    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
        Toastify({
            text: msg,
            duration: 2200,
            newWindow: true,
            close: false,
            gravity: "bottom", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: false, // Prevents dismissing of toast on hover
            style: {
                background: "rgba(82, 114, 255, 0.3)",
                color: "inherit",
                border: "none",
                borderRadius: "10px",
                boxShadow: "none",
                borderTop: "1px solid rgba(70, 70, 70, 0.4)",
            },
            onClick: function () { $('.toastify').fadeOut(); }
        }).showToast();
    } else {
        Toastify({
            text: msg,
            duration: 2200,
            newWindow: true,
            close: false,
            gravity: "bottom", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: false, // Prevents dismissing of toast on hover
            style: {
                background: "rgba(82, 114, 255, 0.4)",
                color: "inherit",
                border: "none",
                borderRadius: "10px",
                boxShadow: "none",
                borderTop: "1px solid rgba(58, 58, 58, 0.2)",
            },
            onClick: function () { $('.toastify').hide(); }
        }).showToast();
    }
}



function openPost(url, target) {
    //login check
    if (firebase.auth().currentUser) {
        if (isApp()) {
            location.href = url;
        } else {
            window.open(url, '_blank');
        }
    } else { //로그인 안됨
        toast('게시물을 보려면 먼저 로그인 해주세요');
    }

}

function getRandomNickname() {
    const words = {
        "adjective": [
            "귀여운",
            "익명의",
            "용감한",
            "튼튼한",
            "상냥한",
            "마당발",
            "멋쟁이",
            "씩씩한",
            "키다리",
            "웃는",
            "세심한",
            "대범한",
            "똑똑한"
        ],
        "noun": [
            "체리",
            "자두",
            "딸기",
            "오렌지",
            "사과",
            "키위",
            "메론",
            "포도",
            "버찌",
            "야자수",
            "복숭아",
            "레몬",
            "수박",
            "망고",
            "홍시",
            "머루",
            "자몽",
            "살구",
            "리치",
            "참다래",
            "모과",
            "청포도",
            "유자",
            "산딸기",
            "매실",
            "코코넛",
            "바나나",
            "석류",
            "대추",
            "단감",
            "망고스틴",
            "산딸기",
            "아보카도",
            "구아바",
            "무화과",
            "파파야",
            "블루베리",
            "파인애플",
            "한라봉",
            "블림빙",
            "용과",
            "오미자",
            "꿀수박",
            "왕체리",
            "감자",
            "고구마",
            "깻잎",
            "당근",
            "도라지",
            "대파",
            "마늘",
            "토마토",
            "미나리",
            "버섯",
            "배추",
            "부추",
            "케일",
            "브로콜리",
            "생강",
            "시금치",
            "연근",
            "우엉",
            "양파",
            "양배추",
            "호박",
            "깻잎",
            "옥수수",
            "청경채",
            "배추",
            "시금치",
            "부추",
            "가지",
            "실파",
            "대파",
            "미나리",
            "애호박",
            "단호박",
            "오이",
            "당근",
            "감자",
            "고구마",
            "버섯",
            "양송이",
            "단무지",
            "피클",
            "무청",
            "상추",
            "양배추",
            "양상추",
            "바질",
            "마늘",
            "생강",
            "순무",
            "브로콜리",
            "인삼",
            "쑥갓",
            "피망",
            "피자",
            "햄버거",
            "떡볶이",
            "토스트",
            "개발자",
            "고니",
            "공작",
            "거위",
            "기러기",
            "까치",
            "까마귀",
            "두루미",
            "독수리",
            "백조",
            "비둘기",
            "부엉이",
            "오리",
            "앵무새",
            "제비",
            "참새",
            "칠면조",
            "타조",
            "펭귄",
            "개구리",
            "재규어",
            "족제비",
            "치타",
            "청설모",
            "친칠라",
            "침팬지",
            "캥거루",
            "코알라",
            "코요테",
            "코뿔소",
            "카피바라",
            "토끼",
            "판다",
            "표범",
            "퓨마",
            "하마",
            "호랑이",
            "하이에나",
            "박쥐",
            "북극곰",
            "북극여우",
            "바다사자",
            "바다표범",
            "사슴",
            "사자",
            "수달",
            "순록",
            "스컹크",
            "스라소니",
            "양",
            "여우",
            "염소",
            "영양",
            "야크",
            "원숭이",
            "알파카",
            "오소리",
            "얼룩말",
            "바둑이",
            "낙타",
            "노루",
            "노새",
            "늑대",
            "너구리",
            "나무늘보",
            "담비",
            "밤비",
            "듀공",
            "돌고래",
            "다람쥐",
            "두더지",
            "당나귀",
            "라마",
            "래서판다",
            "물개",
            "물범",
            "밍크",
            "도라에몽",
            "미어캣",
            "강아지",
            "곰돌이",
            "가젤",
            "고래",
            "기린",
            "고릴라",
            "고라니",
            "고양이",
            "고슴도치",
            "기니피그",
            "개미핥기",
            "크롱",
            "퉁퉁이",
            "피카츄",
            "파이리",
            "꼬부기",
            "피죤투",
            "또가스",
            "디지몬",
            "마리오",
            "비욘세",
            "참치",
            "연어",
            "초밥",
            "매운탕",
            "쭈꾸미",
            "돌고래",
            "백구",
            "누렁이",
            "흰둥이",
            "된장찌개",
            "김치찌개",
            "루피",
            "파스타",
            "비타민",
            "코카콜라",
            "자일리톨",
            "치즈피자",
            "참치김밥",
            "새우깡",
            "고래밥",
            "치킨버거",
            "닭다리",
            "닭날개",
            "숯불갈비",
            "레몬사탕",
            "뽀로로",
            "치즈",
            "닭갈비",
            "마카롱",
            "도너츠",
            "누룽지",
            "모짜렐라",
            "커피",
            "야옹이",
            "팝스타",
            "파랑새",
            "마그네슘",
            "서포터",
            "만수르",
            "재벌",
            "갑부",
            "후원자"
        ]
    };
    var adjective = words.adjective[Math.floor(Math.random() * words.adjective.length)];
    var noun = words.noun[Math.floor(Math.random() * words.noun.length)];
    var result = adjective + noun;
    $('#account-username').val(result);
    $('#login-username').val(result);
}


// 날짜 -> {n일/분/시간 전}  형식으로 변환
function timeForToday(value) {
    const today = new Date();
    const timeValue = new Date(value);

    const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);
    if (betweenTime < 1) return '방금 전';
    if (betweenTime < 60) {
        return `${betweenTime}분 전`;
    }

    const betweenTimeHour = Math.floor(betweenTime / 60);
    if (betweenTimeHour < 24) {
        return `${betweenTimeHour}시간 전`;
    }


    const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
    if (betweenTimeDay < 365) {
        if (betweenTimeDay > 30) {
            return `${Math.floor(betweenTimeDay / 30)}달 전`;
        } else {
            return `${betweenTimeDay}일 전`;
        }

    }

    return `${Math.floor(betweenTimeDay / 365)}년 전`;
}

function isApp() {
    var ua = navigator.userAgent;
    if (ua.indexOf('hybridApp') > -1) {
        return true;
    } else {
        return false;
    }
}

