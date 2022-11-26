
//로그인
const auth = firebase.auth();
var db = firebase.firestore();

var currentCategory = 'all';
//로그인 여부 확인
firebase.auth().onAuthStateChanged(function (user) {
    loadPostList('all');
    if (user) {
        $('#community .header .header-signed-in').css("display", "flex");
        $('#community .header .header-unsigned').hide();
        $('.writePost-btn').show();
        $('.writeVote-btn').show();
        db.collection('users').doc(firebase.auth().currentUser.uid).get().then((doc_user) => {
            var user = doc_user.data();
            $('#header-username').text(user.nickname);
            if (user.profileImg) {
                $('#header-profile-img').attr('src', `assets/icons/profileImg/letter${user.profileImg + 1}.png`);
            } else {
                $('#header-profile-img').attr('src', `assets/icons/profileImg/letter1.png`);
            }
        });
        if (isApp()) {
            Android.sendUserIdForFCM(firebase.auth().currentUser.uid)
        }
    } else {
        $('#community .header .header-signed-in').hide();
        $('#community .header .header-unsigned').show();
        $('.writePost-btn').hide();
        $('.writeVote-btn').hide();
    }
});

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
    var is_iPad = navigator.userAgent.match(/iPad/i) != null;
    if (is_iPad) { //아이패드인 경우 리다이렉트 방식
        return firebase.auth().signInWithRedirect(provider)
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

                    openModal('시작하기', 'loginForm')
                    $('.sheet-backdrop-nocancel').addClass('backdrop-in');
                    $('.sheet-backdrop').removeClass('backdrop-in');
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
    } else { //기본은 팝업 로그인
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

                    openModal('시작하기', 'loginForm')
                    $('.sheet-backdrop-nocancel').addClass('backdrop-in');
                    $('.sheet-backdrop').removeClass('backdrop-in');
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
    }

};

function finishGoogleLogin(res) {
    if (res.uid) {
        $('#community .community-member-header').show();
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
            openModal('시작하기', 'loginForm')
            $('.sheet-backdrop-nocancel').addClass('backdrop-in');
            $('.sheet-backdrop').removeClass('backdrop-in');
        }
    }).catch((error) => {
        console.log(error);
        const errorCode = error.code;
        const errorMessage = error.message;
        logError(`Error logging in: ${errorCode} ${errorMessage} token: ${idTokenFromApp}`, error);
    });
}



$('#community .header-signed-in img, h3').on('click', function () {
    if (firebase.auth().currentUser) {
        window.open('/profile.html?uid=' + firebase.auth().currentUser.uid);
    }
});




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
});

//글 작성
$('.writePost-btn').on('click', function () {
    $('html').css('overflow', 'hidden');
    if (currentCategory == 'all' || currentCategory == '공지') {
        $('#write-post-popup').show(200);
        $('#post-btn').text('게시');
        $('#post-btn').attr('disabled', false);
        // 첨부 파일 초기화
        currentAttachedImages = [];
        $('.img-thumbs').children('.wrapper-thumb').remove();
        $('#category-select').val("자유");
        uploadedFile = null;
        $('#editor').empty();
    } else {
        $('#write-post-popup').show();
        $('#post-btn').text('게시');
        $('#post-btn').attr('disabled', false);
        // 첨부 파일 초기화
        currentAttachedImages = [];
        $('.img-thumbs').children('.wrapper-thumb').remove();
        //
        $('#category-select').val(currentCategory);
        uploadedFile = null;
        $('#editor').empty();
    }

    //다크모드 에디터 적용
    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
        editor = new toastui.Editor.factory({
            el: document.querySelector('#editor'),
            toolbarItems: [
                ['bold', 'italic', 'strike'],
                ['hr', 'quote', 'ul', 'task'],
            ],
            initialEditType: 'wysiwyg',
            height: 'auto',
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
            height: 'auto',
            language: 'ko_KR',
            autofocus: false,
        });
    }
});

//투표 만들기 버튼
$('.writeVote-btn').on('click', function () {
    openModal('투표 만들기', 'vote')
    $('#vote-title').val('');
    $('#vote-choice-list').html(`
    <input id="vote-choice" type="text" placeholder="항목 내용을 입력해주세요" style="font-size:16px;" required>
    <input id="vote-choice" type="text" placeholder="항목 내용을 입력해주세요" style="font-size:16px;" required>
    `);
});

function closeWritePopup() {
    $('html').css('overflow', '');
    $('#write-post-popup').hide(100);
}
var imagesArray = [];

function post(target) {
    var title = $('#post-title').val();
    var category = $('#category-select').val();
    var content = editor.getMarkdown();
    var uid = firebase.auth().currentUser.uid;
    if (content && category) {
        $(target).text('업로드 중...');
        $(target).attr('disabled', true);
        if (currentAttachedImages.length != 0) { // 사진 있음
            for (var i = 0; i < currentAttachedImages.length; i++) { //파일 업로드
                var storageRef = firebase.storage().ref();
                var fileRef = storageRef.child(`images/${currentAttachedImages[i].name}`);
                fileRef.put(currentAttachedImages[i]).then(function (snapshot) {
                    fileRef.getDownloadURL().then(function (url) {
                        imagesArray.push(url);
                        if (imagesArray.length == currentAttachedImages.length) { //정상 업로드 확인
                            var timestamp = firebase.firestore.Timestamp.fromDate(new Date());
                            var data = {
                                title: title,
                                userId: uid,
                                content: content,
                                category: category || '자유',
                                createdAt: timestamp,
                                image: imagesArray,
                            }
                            console.log(data)
                            db.collection('board').add(data).then((result) => {
                                closeWritePopup();
                                $(target).text('게시');
                                $(target).attr('disabled', false);
                                openPost('board.html?id=' + result._key.path.segments[1]);
                            }).catch((err) => {
                                console.log(err);
                            });
                            $('.snackbar').hide();
                            loadPostList(currentCategory);
                        } else {
                            toast('업로드 중 오류가 발생했어요. 다시 시도해주세요.')
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
                }).catch(function (error) {
                    console.log(error);
                });
            }


        } else {
            var timestamp = firebase.firestore.Timestamp.fromDate(new Date());
            var data = {
                title: title,
                userId: uid,
                content: content,
                category: category || '자유',
                createdAt: timestamp,
            }
            db.collection('board').add(data).then((result) => {
                closeWritePopup();
                $(target).text('게시');
                $(target).attr('disabled', false);
                openPost('board.html?id=' + result._key.path.segments[1]);
            }).catch((err) => {
                console.log(err);
            });
            $('.snackbar').hide();
            loadPostList(currentCategory);
        }


    } else {
        toast('글 내용과 카테고리를 모두 입력해주세요');
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
//



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


//모바일 키보드 높이 대응
var originalSize = jQuery(window).width() + jQuery(window).height();

// resize #sheet-modal on resize window
$(window).resize(function () {
    if ($('#write-post-popup').is(':visible')) {
        if (jQuery(window).width() + jQuery(window).height() != originalSize) { //모바일에서 키보드 열렸을 때
            $('.write-popup-footer').hide();
        } else {
            $('.write-popup-footer').show();
        }
    }

});

$(document).on('focusout', 'input', function () { //키보드 닫힐 때
    $('.write-popup-footer').show()
});


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


//커뮤니티 카테고리 탭
function changeCommunityCategory(category, btn) {
    currentCategory = category;
    $('.community-tab').removeClass('active');
    $(btn).addClass('active');
    loadPostList(category);
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

function postVote(target) {
    var options = [];
    var cnt = 0;
    if ($('#vote-title').val().length >= 2) {
        $(target).text('게시중...');
        $(target).attr('disabled', true);
        $('#vote-choice-list').find('input').each(function () {
            if ($(this).val().length >= 1) {
                options[cnt] = {
                    title: $(this).val(),
                    count: 0
                }
                cnt++;
            }
        });

        var uid = firebase.auth().currentUser.uid;
        var timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        var data = {
            title: $('#vote-title').val(),
            options: options,
            userId: uid,
            category: '투표',
            createdAt: timestamp,
            participants: '',
            content: '?vote?',
        }

        db.collection('board').add(data).then((result) => {
            closeModal();
            $(target).text('게시');
            $(target).attr('disabled', false);
            openPost('board.html?id=' + result._key.path.segments[1]);
        }).catch((err) => {
            toast(err);
            closeModal();
        });
    } else {
        toast('투표 제목을 입력해주세요.')
    }
}

//파일 첨부
var imgUpload = document.getElementById('upload-img')
    , imgPreview = document.getElementById('img-preview')
    , imgUploadForm = document.getElementById('form-upload')
    , totalFiles
    , previewTitle
    , previewTitleText
    , img;

var currentAttachedImages = [];
imgUpload.addEventListener('change', previewImgs, true);

function previewImgs(event) {
    totalFiles = imgUpload.files.length;

    if (!!totalFiles) {
        imgPreview.classList.remove('img-thumbs-hidden');
    }

    if (totalFiles > 3) {
        toast('사진은 최대 3개까지만 추가할 수 있어요.')
    } else {
        for (var i = 0; i < totalFiles; i++) {
            wrapper = document.createElement('div');
            wrapper.classList.add('wrapper-thumb');
            removeBtn = document.createElement("span");
            nodeRemove = document.createTextNode('x');
            removeBtn.classList.add('remove-btn');
            removeBtn.appendChild(nodeRemove);
            img = document.createElement('img');
            img.src = URL.createObjectURL(event.target.files[i]);
            img.classList.add('img-preview-thumb');
            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            $(wrapper).data('file', event.target.files[i]);
            imgPreview.appendChild(wrapper);

            var compressedFile = event.target.files[i];
            new Compressor(event.target.files[i], {
                quality: 0.5,
                convertSize: 5000,
                success(result) {
                    currentAttachedImages.push(result);
                },
                error(err) {
                    console.log(err.message);
                },
            });
        }
    }
}

$('.img-thumbs').on('click', '.remove-btn', function () {
    var index = currentAttachedImages.indexOf($(this).parent().data('file'));
    currentAttachedImages.splice(index, 1);
    console.log($(this).parent().data('file'), index, currentAttachedImages);
    $(this).parent().remove();
});


$('#logout-btn').on('click', function () {
    confirmLogout();
});

async function confirmLogout() {
    const confirm = await ui.confirm('정말 로그아웃 하시겠습니까?');
    if (confirm) {
        firebase.auth().signOut().then(function () {
            closeModal();
            toast('로그아웃 되었습니다.');
            if (isApp()) {
                Android.logoutAndroidApp();
            }
        });
    }
}
