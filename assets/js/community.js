//로그인
const auth = firebase.auth();
var db = firebase.firestore();

var currentCategory = 'all';

//로그인 여부 확인
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        loadPostList('all');
        $('#community .no-login').hide();
        $('#community .main-community').show();
        $('#community #account-btn').show();
        $('#community .header').show();
        db.collection('users').doc(firebase.auth().currentUser.uid).get().then((doc_user) => {
            var user = doc_user.data();
            $('#header-username').text(user.nickname);
            if (user.profileImg) {
                $('#header-profile-img').attr('src', `assets/icons/profileImg/letter${user.profileImg + 1}.png`);
            } else {
                $('#header-profile-img').attr('src', `assets/icons/profileImg/letter1.png`);
            }
        });
        Android.sendUserIdForFCM(firebase.auth().currentUser.uid)
    } else {
        $('#community .no-login').show();
        $('#community .main-community').hide();
        $('#community #account-btn').hide();
        $('#community .header').hide();
    }
});

var isDismissCommunityCallout = localStorage.getItem("dismiss_community_callout") || false
if (isDismissCommunityCallout == true) {
    $('.callout').hide();
}

function openLogin() {
    if (isApp()) {
        location.href = 'https://ssoak-72f93.firebaseapp.com/';
        $('.sheet-backdrop-nocancel2').addClass('backdrop-in');
        $('#login-loader').show();
    } else {
        $('.sheet-backdrop-nocancel2').addClass('backdrop-in');
        $('#login-loader').show();
        loginGoogle().then(function (result) {
            console.log('구글 로그인 완료', result);
            $('.sheet-backdrop-nocancel2').removeClass('backdrop-in');
            $('#login-loader').hide();
        })
    }
}

//Google 로그인
var tempData = [];
const provider = new firebase.auth.GoogleAuthProvider();
const loginGoogle = () => {
    return firebase.auth().signInWithPopup(provider)
        .then((result) => {
            $('.sheet-backdrop-nocancel2').removeClass('backdrop-in');
            $('#login-loader').hide();

            if (result.additionalUserInfo.isNewUser) {
                /** @type {firebase.auth.OAuthCredential} */
                //회원가입 성공 => DB에 사용자 정보 저장
                tempData = [];
                tempData[0] = result.user.uid;
                tempData[1] = result.user.email;
                tempData[2] = result.user.displayName;
                var data = {
                    uid: tempData[0],
                    email: tempData[1],
                    nickname: result.user.displayName,
                    profileImg: Math.floor(Math.random() * 5),
                    admin: false,
                }

                db.collection('users').doc(tempData[0]).set(data).then((result) => {
                    console.log('계정정보 1차 저장 완료')
                }).catch((err) => {
                    console.log(err);
                })


                $('#login-username').val(result.user.displayName);

                //open bottom sheet
                $('.sheet-modal').css('height', '30%');
                $('#modal-title').html('시작하기');
                $('.content-wrap').hide();
                $('#loginForm').show();
                $('#exam').hide();
                $('#calculator').hide();
                $('#selfcheck').hide();
                $('#assign-add-save-btn').hide();
                $('#assign-edit-save-btn').hide();
                $('body').css('overflow', 'hidden');
                $('.modal-in').css('display', 'block');
                $('.modal-in').css('bottom', '-1850px');
                setTimeout(function () {
                    $('.modal-in').css('bottom', '0px');
                }, 100);
                $('.sheet-backdrop-nocancel').addClass('backdrop-in');
                $('.sheet-backdrop').removeClass('backdrop-in');
                setTimeout(function () {
                    $('.sheet-modal').css('height', $('#loginForm').height() + 130 + 'px');
                }, 100);
            }
        }).catch((error) => {
            $('.sheet-backdrop-nocancel2').removeClass('backdrop-in');
            $('#login-loader').hide();
            console.log(error.message);
            if (error.message == "The popup has been closed by the user before finalizing the operation.") {
                toast('로그인이 취소되었습니다.');
            } else if (error.message == "The user has cancelled authentication.") {
                toast('로그인이 취소되었습니다.');
            } else {
                toast('로그인 에러 : ' + error.message);
            }
        });
};

function finishGoogleLogin(res) {
    if (res.uid) {
        $('#community #account-btn').show();
    } else {
        Swal.fire({
            icon: 'error',
            title: '오류',
            text: '계정이 정상적으로 생성되지 않았습니다. 다시 시도해주세요.',
        })
    }
}


//android webview google login
function pushWebviewGoogleLoginToken(idTokenFromApp) {
    const credential = firebase.auth.GoogleAuthProvider.credential(idTokenFromApp);
    // Sign in with credential from the Google user.
    firebase.auth().signInWithCredential(credential).then((result) => {
        $('.sheet-backdrop-nocancel2').removeClass('backdrop-in');
        $('#login-loader').hide();
        if (result.additionalUserInfo.isNewUser) {
            /** @type {firebase.auth.OAuthCredential} */
            //회원가입 성공 => DB에 사용자 정보 저장
            tempData = [];
            tempData[0] = result.user.uid;
            tempData[1] = result.user.email;
            tempData[2] = result.user.displayName;
            var data = {
                uid: tempData[0],
                email: tempData[1],
                nickname: result.user.displayName,
                admin: false,
            }

            db.collection('users').doc(tempData[0]).set(data).then((result) => {
                console.log('계정정보 1차 저장 완료')
            }).catch((err) => {
                console.log(err);
            })

            $('#login-username').val(result.user.displayName);

            //open bottom sheet
            $('.sheet-modal').css('height', '30%');
            $('#modal-title').html('시작하기');
            $('.content-wrap').hide();
            $('#loginForm').show();
            $('#exam').hide();
            $('#calculator').hide();
            $('#selfcheck').hide();
            $('#assign-add-save-btn').hide();
            $('#assign-edit-save-btn').hide();
            $('body').css('overflow', 'hidden');
            $('.modal-in').css('display', 'block');
            $('.modal-in').css('bottom', '-1850px');
            setTimeout(function () {
                $('.modal-in').css('bottom', '0px');
            }, 100);
            $('.sheet-backdrop-nocancel').addClass('backdrop-in');
            $('.sheet-backdrop').removeClass('backdrop-in');
            setTimeout(function () {
                $('.sheet-modal').css('height', $('#loginForm').height() + 130 + 'px');
            }, 100);
        }
    }).catch((error) => {
        console.log(error);
        const errorCode = error.code;
        const errorMessage = error.message;
        logError(`Error logging in: ${errorCode} ${errorMessage} token: ${idTokenFromApp}`, error);
    });
}



$('#community #account-btn').on('click', function () {
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').html('내 프로필');
    $('.content-wrap').hide();
    $('#account').show();
    $('#exam').hide();
    $('#calculator').hide();
    $('#selfcheck').hide();
    $('#assign-add-save-btn').hide();
    $('#assign-edit-save-btn').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    db.collection('users').doc(firebase.auth().currentUser.uid).get().then((doc_user) => {
        var user = doc_user.data();
        $('#account-username').val(user.nickname);
        $('#header-username').text(user.nickname);
        var profileImg = user.profileImg;
        $('.profile-image-btn').removeClass('active');
        $(document.getElementsByClassName('profile-image-btn')[profileImg]).addClass('active');
    });
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#account').height() + 130 + 'px');
    }, 100);
});


$('#account #logout-btn').on('click', function () {
    confirmLogout();
});

async function confirmLogout() {
    const confirm = await ui.confirm('정말 로그아웃 하시겠습니까?');
    if (confirm) {
        firebase.auth().signOut().then(function () {
            $('#community #account-btn').hide();
            $('#community .no-login').show();
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

function saveAccountDb() {
    var nickname = $('#login-username').val();
    var checkedValues = $('#signup-checklist input:checked').map(function () {
        return this.value;
    }).get();
    //nickname is empty or blank or space
    if (nickname == '' || nickname == ' ' || nickname == null || nickname == undefined || nickname == '  ') {
        toast('닉네임을 입력해주세요.')
    } else if (checkedValues.length != 3) {
        toast('모든 항목에 동의해주세요.')
    } else {
        checkNicknameDuplicate($('#login-username').val());
    }
}


var editor = new toastui.Editor.factory({
    el: document.querySelector('#editor'),
    initialEditType: 'wysiwyg',
    height: '40vh',
    initialValue: '',
    language: 'ko_KR',
    theme: 'default',
    autofocus: false,
});;
//글 작성
$('.writePost-btn').on('click', function () {
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').html('게시글 작성');
    $('.content-wrap').hide();
    $('#writePost').show();
    $('#exam').hide();
    $('#calculator').hide();
    $('#selfcheck').hide();
    $('#assign-add-save-btn').hide();
    $('#assign-edit-save-btn').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');

    $('#editor').empty();
    //다크모드 에디터 적용
    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
        editor = new toastui.Editor.factory({
            el: document.querySelector('#editor'),
            toolbarItems: [
                ['bold', 'italic', 'strike'],
                ['hr', 'quote', 'ul', 'task'],
            ],
            initialEditType: 'wysiwyg',
            height: '40vh',
            initialValue: '',
            language: 'ko_KR',
            theme: 'dark',
            autofocus: false,
        });
    } else {
        editor = new toastui.Editor.factory({
            el: document.querySelector('#editor'),
            toolbarItems: [
                ['bold', 'italic', 'strike'],
                ['hr', 'quote', 'ul', 'task'],
            ],
            initialEditType: 'wysiwyg',
            initialValue: '',
            height: '40vh',
            language: 'ko_KR',
            autofocus: false,
        });
    }

    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#writePost').height() + 200 + 'px');
    }, 100);

});


function post(target) {
    var title = $('#post-title').val();
    var category = $('#category-select').val();
    var content = editor.getMarkdown();
    var uid = firebase.auth().currentUser.uid;
    if (content) {
        var timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        $(target).text('업로드 중...');
        var data = {
            title: title,
            userId: uid,
            content: content,
            category: category || '자유',
            createdAt: timestamp,
        }
        db.collection('board').add(data).then((result) => {
            closeModal();
            $(target).text('등록');
            openPost('board.html?id=' + result._key.path.segments[1]);
        }).catch((err) => {
            console.log(err);
        });
        $('.snackbar').hide();
        loadPostList('all');
    } else {
        toast('글 내용을 작성해주세요.')
    }
}

var lastVisible;
var isFirstLoad = true;
//게시물 로딩
function loadPostList(category) {
    if (category == 'all') {
        var database = db.collection('board').orderBy("createdAt").limitToLast(4);
    } else {
        var database = db.collection('board').where('category', '==', category).orderBy("createdAt").limitToLast(4);
    }
    database.get()
        .then((querySnapshot) => {
            $('.post-listview').html('');
            querySnapshot.forEach((doc) => {
                var data = doc.data();
                lastVisible = querySnapshot.docs[3 - (querySnapshot.docs.length - 1)];
                db.collection('users').doc(data.userId).get().then((doc_user) => {
                    var user = doc_user.data();
                    $('.post-listview').prepend(
                        `
                        <div class="post-item" onclick="openPost('`+ 'board.html?id=' + doc.id + `', this);" data-createdAt="` + data.createdAt.toDate().getTime() + `">
                        <div class="post-header">
                        <img src="assets/icons/profileImg/letter`+ ((user.profileImg) ? user.profileImg + 1 : 1) + `.png" class="profile-img" />
                            <span id="uname">`+ ((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname)) + `<br>
                                <span style="opacity:0.7">`+ timeForToday(data.createdAt.toDate()) + `</span>
                            </span>
        
                        </div>
        
                        <h3 id="post-title">`+ data.title + `</h3>
        
                        <div class="post-preview" id="viewer-`+ doc.id + `">
                        </div>
    
                        <span style="color:#5272ff;font-size:15px;margin-top:10px;">더보기</span>
                        <br>
        
                        </div>
                        `
                    );

                    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                        const viewer = new toastui.Editor.factory({
                            el: document.querySelector('#viewer-' + doc.id),
                            viewer: true,
                            initialValue: data.content.replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, '$1'),
                            theme: 'dark'
                        });
                        $('.post-item').addClass("dark");
                    } else {
                        const viewer = new toastui.Editor.factory({
                            el: document.querySelector('#viewer-' + doc.id),
                            viewer: true,
                            initialValue: data.content.replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, '$1'),
                            theme: 'default'
                        });
                    }
                    $('.post-item').sort(function (a, b) {
                        return $(b).data('createdat') - $(a).data('createdat');
                    }
                    ).appendTo('.post-listview');

                });
                isFirstLoad = false;
            });
        });
}

//firebase infinite scroll
function loadMore(category) {
    if (lastVisible) {
        if (category == 'all') {
            var nextVisible = db.collection('board').orderBy("createdAt").limitToLast(4).endBefore(lastVisible);
        } else {
            var nextVisible = db.collection('board').where('category', '==', category).orderBy("createdAt").limitToLast(4).endBefore(lastVisible);
        }
        nextVisible.get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    var data = doc.data();
                    lastVisible = querySnapshot.docs[3 - (querySnapshot.docs.length - 1)];
                    console.log(lastVisible, querySnapshot.docs.length);
                    db.collection('users').doc(data.userId).get().then((doc_user) => {
                        var user = doc_user.data();
                        $('.post-listview').prepend(
                            `
                            <div class="post-item" onclick="openPost('`+ 'board.html?id=' + doc.id + `', this);" data-createdAt="` + data.createdAt.toDate().getTime() + `">
                            <div class="post-header">
                            <img src="assets/icons/profileImg/letter`+ ((user.profileImg) ? user.profileImg + 1 : 1) + `.png" class="profile-img" />
                                <span id="uname">`+ ((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname)) + `<br>
                                    <span style="opacity:0.7">`+ timeForToday(data.createdAt.toDate()) + `</span>
                                </span>
            
                            </div>
            
                            <h3 id="post-title">`+ data.title + `</h3>
            
                            <div class="post-preview" id="viewer-`+ doc.id + `">
                            </div>
        
                            <span style="color:#5272ff;font-size:15px;margin-top:10px;">더보기</span>
                            <br>
            
                            </div>
                            `
                        );

                        if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                            const viewer = new toastui.Editor.factory({
                                el: document.querySelector('#viewer-' + doc.id),
                                viewer: true,
                                initialValue: data.content.replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, '$1'),
                                theme: 'dark'
                            });
                            $('.post-item').addClass("dark");
                        } else {
                            const viewer = new toastui.Editor.factory({
                                el: document.querySelector('#viewer-' + doc.id),
                                viewer: true,
                                initialValue: data.content.replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, '$1'),
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

        $('.bottom_postList').html('')
    } else { //마지막 페이지
        $('.bottom_postList').html('마지막 글입니다.')
    }

}


// 무한 스크로 : 최하단 스크롤 감지
const Element = document.querySelector('.bottom_postList')
const options = {}
// observer: IntersectionObserver instance
const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && $('.post-listview').html().length > 5) {
            loadMore(currentCategory || 'all');
        }
    })
}, options)

io.observe(Element)

function openPost(url, target) {
    if (isApp()) {
        location.href = url;
    } else {
        window.open(url, '_blank');
    }
}
//

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
            return `${Math.floor(betweenTimeDay / 30)}개월 전`;
        } else {
            return `${betweenTimeDay}일 전`;
        }

    }

    return `${Math.floor(betweenTimeDay / 365)}년 전`;
}


//모바일 키보드 높이 대응
var originalSize = jQuery(window).width() + jQuery(window).height();

// resize #sheet-modal on resize window
$(window).resize(function () {
    if (jQuery(window).width() + jQuery(window).height() != originalSize && $('#writePost').is(':visible')) { //모바일에서 키보드 열렸을 때
        $('.sheet-modal').addClass('full-modal')
    } else {
        $('.sheet-modal').removeClass('full-modal')
    }
});

$(document).on('focusout', 'input', function () { //키보드 닫힐 때
    $('.sheet-modal').removeClass('full-modal')
});


// 닉네임 중복 체크 후 등록
function checkNicknameDuplicate(nickname) {
    db.collection('users').where('nickname', '==', nickname).get()
        .then(snapshot => {
            if (snapshot.size == 0) {
                $('body').css('overflow', 'auto');
                $('.modal-in').css('bottom', '-1850px');
                setTimeout(function () {
                    $('.modal-in').css('display', 'none');
                }, 100);

                $('.sheet-backdrop-nocancel').removeClass('backdrop-in');
                $('.sheet-backdrop').removeClass('backdrop-in');

                var data = {
                    nickname: nickname,
                }

                db.collection('users').doc(firebase.auth().currentUser.uid).update(data).then((result2) => {
                    $('#community #account-btn').show();
                    $('#header-username').text(nickname);
                }).catch((err) => {
                    toast(err)
                    console.log(err);
                })
            } else if ($('#header-username').text() == nickname) { //변경 사항 없으면 닫기
                $('body').css('overflow', 'auto');
                $('.modal-in').css('bottom', '-1850px');
                setTimeout(function () {
                    $('.modal-in').css('display', 'none');
                }, 100);

                $('.sheet-backdrop-nocancel').removeClass('backdrop-in');
                $('.sheet-backdrop').removeClass('backdrop-in');
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

//커뮤니티 카테고리 탭
function changeCommunityCategory(category, btn) {
    currentCategory = category;;
    $('.community-tab').removeClass('active');
    $(btn).addClass('active');
    loadPostList(category);
}
