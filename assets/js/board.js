
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

//confirm
const ui = {
    confirm: async (message) => createConfirm(message)
}

const createConfirm = (message) => {
    return new Promise((complete, failed) => {
        $('#confirmMessage').text(message)

        $('#confirmYes').off('click');
        $('#confirmNo').off('click');

        $('#confirmYes').on('click', () => { $('.confirm').hide(); complete(true); });
        $('#confirmNo').on('click', () => { $('.confirm').hide(); complete(false); });

        $('.confirm').show();
    });
}
//


// url 에서 parameter 추출
function getParam(sname) {
    var params = location.search.substr(location.search.indexOf("?") + 1);
    var sval = "";
    params = params.split("&");
    for (var i = 0; i < params.length; i++) {
        temp = params[i].split("=");
        if ([temp[0]] == sname) { sval = temp[1]; }
    }
    return sval;
}

//로그인 여부 확인
firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
        $('#comment-input').prop('disabled', true);
        $('#comment-edit-input').prop('disabled', true);
    }
});

//글 가져오기
var articleRef = db.collection('board').doc(getParam('id')).get();
var content;
var viewer;
var authorId;
var category;
var imagesArray = [];

articleRef.then(function (doc) {
    if (doc.data()) {
        if (firebase.auth().currentUser.uid == doc.data().userId) {
            $('#author-toolbar').show();
        }
        authorId = doc.data().userId;
        db.collection('users').doc(doc.data().userId).get().then((doc_user) => {
            var user = doc_user.data();
            if (user.profileImg) {
                $('#header-profile-img').attr('src', `assets/icons/profileImg/letter${user.profileImg + 1}.png`);
            } else {
                $('#header-profile-img').attr('src', `assets/icons/profileImg/letter1.png`);
            }
            $('#uname').html(((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname || '(어디론가 사라진 사용자)')));
            $('#createdAt').html(timeForToday(doc.data().createdAt.toDate()));
            $('#post-title').html(doc.data().title);
            document.title = doc.data().title + ' - 쏙';
            content = doc.data().content;
            category = doc.data().category;
            if (category == '투표') {
                updateVote();
            } else {
                $('.post-vote').hide();
                viewer = new toastui.Editor.factory({
                    el: document.querySelector('#viewer'),
                    viewer: true,
                    initialValue: doc.data().content,
                });
                if (doc.data().image) {
                    for (var i = 0; i < doc.data().image.length; i++) { // ${doc.data().image[i]}
                        $('#post-image-wrap').append(`
                        <figure class="post-image" itemprop="associatedMedia" itemscope itemtype="http://schema.org/ImageObject">
                        <a href="${doc.data().image[i]}" itemprop="contentUrl"
                            data-size="1024x1024">
                            <img src="${doc.data().image[i]}" itemprop="thumbnail"
                                alt="Image description" style="width: 100%;
                                border-radius: 20px;
                                object-fit: cover;
                                margin-left: 40px;"/>
                        </a>
                        <figcaption itemprop="caption description"></figcaption>
        
                    </figure>
                        `)
                    }
                }
            }


            //게시글 삭제 이벤트 등록
            $('#delete-btn').click(function () {
                confirmDeletePost(doc.data());
            });
            //

        });


    } else {
        toast('존재하지 않는 글입니다.');
        setTimeout(() => {
            window.close();
        }, 1500);
    }
});



function updateVote() {
    db.collection('board').doc(getParam('id')).get().then((doc) => {
        $('#viewer').hide();
        $('.post-vote').show();
        $('#author-toolbar #edit-btn').hide();
        $('#choices-list').html('');

        $('#participants-count').text(`${doc.data().participants}명 참여`);
        var cnt = 0;
        doc.data().options.forEach((option) => {
            console.log(option)
            $('#choices-list').append(`<div class="vote-choice-item" data-index="${cnt}">
                    <div class="inner">
                    <h3>${option.title}</h3>
                    <span>${(option.count != 0) ? Math.round((option.count / doc.data().participants) * 100) : 0}%</span>
                    </div>
                    <div class="vote-progress" style="width:${(option.count != 0) ? Math.round((option.count / doc.data().participants) * 100).toString() + '%' : '0%'}"></div>
                </div>`);
            cnt++;
        });
        if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
            $('.vote-choice-item').each(function () {
                $(this).addClass("dark");
            });
        }
        //참여한 투표인지 확인
        db.collection('users').doc(firebase.auth().currentUser.uid).get().then((currentUser) => {
            if (currentUser.data().doneVotes) {
                if (currentUser.data().doneVotes[getParam('id')]) {
                    $('#choices-list .vote-choice-item').removeClass('active');
                    $('#choices-list .vote-choice-item').eq(currentUser.data().doneVotes[getParam('id')]).addClass('active');
                    $('#cancel-vote-btn').show();
                    $('#vote-btn').hide();
                }
            }
        });
    });
}

$('#choices-list').on('click', '.vote-choice-item', function () {
    if ($('#vote-btn').is(':visible')) {
        $('.vote-choice-item').removeClass('active');
        $(this).addClass('active');
    }
});

function vote() {
    var index = $('.vote-choice-item.active')[0].dataset.index;
    if (index) {
        var modifiedOptions = [];
        db.collection('board').doc(getParam('id')).get().then((doc) => {
            modifiedOptions = doc.data().options;
            modifiedOptions[index].count++;

            var data = {
                participants: firebase.firestore.FieldValue.increment(1),
                options: modifiedOptions,
            };

            console.log(data);
            $('#cancel-vote-btn').show();
            $('#vote-btn').hide();

            db.collection('board').doc(getParam('id')).update(data).then((result) => {
                addUserDoneVotes(index); //유저의 참여한 투표 목록 업데이트
            }).catch((err) => {
                console.log(err);
            })
        });


    } else {
        toast('투표할 항목을 선택해주세요')
    }
}

function cancelVote() {
    var index = $('.vote-choice-item.active')[0].dataset.index;
    db.collection('board').doc(getParam('id')).get().then((doc) => {
        modifiedOptions = doc.data().options;
        modifiedOptions[index].count--;

        var data = {
            participants: firebase.firestore.FieldValue.increment(-1),
            options: modifiedOptions,
        };

        console.log(data);
        $('#cancel-vote-btn').hide();
        $('#vote-btn').show();

        db.collection('board').doc(getParam('id')).update(data).then((result) => {
            deleteUserDoneVotes(); //유저의 참여한 투표 목록 업데이트
        }).catch((err) => {
            console.log(err);
        })
    });
}

function addUserDoneVotes(index) { //user 정보에 투표한 게시글 추가
    var data = {};
    db.collection('users').doc(firebase.auth().currentUser.uid).get().then((doc) => {
        var oldData = doc.data().doneVotes || {};
        oldData[getParam('id')] = index;
        data = {
            doneVotes: oldData,
        }
        db.collection('users').doc(firebase.auth().currentUser.uid).update(data).then((result) => {
            updateVote();
        }).catch((err) => {
            console.log(err);
        })
    });
}

function deleteUserDoneVotes() { //user 정보에 투표한 게시글 추가
    var data = {};
    db.collection('users').doc(firebase.auth().currentUser.uid).get().then((doc) => {
        var oldData = doc.data().doneVotes || {};
        delete oldData[getParam('id')];
        data = {
            doneVotes: oldData,
        }
        db.collection('users').doc(firebase.auth().currentUser.uid).update(data).then((result) => {
            updateVote();
        }).catch((err) => {
            console.log(err);
        })
    });

}

async function confirmDeletePost(data) {
    const confirm = await ui.confirm('게시물을 정말 삭제하시겠습니까?');
    if (confirm) {
        if (firebase.auth().currentUser.uid == data.userId) {
            toast('삭제되었습니다.')
            db.collection("board").doc(getParam('id')).delete().then(() => {
                window.close();
            }).catch((error) => {
                console.error("Error removing file: ", error);
            });
        } else {
            toast('권한이 없습니다');
        }
    }
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


//댓글
var regURL = new RegExp("(http|https|ftp|telnet|news|irc)://([-/.a-zA-Z0-9_~#%$?&=:200-377()]+)", "gi");
var regEmail = new RegExp("([xA1-xFEa-z0-9_-]+@[xA1-xFEa-z0-9-]+\.[a-z0-9-]+)", "gi");
db.collection("board").doc(getParam('id')).collection('comments').orderBy("createdAt")
    .onSnapshot((querySnapshot) => {
        var commentCount = querySnapshot.size;
        if (commentCount != 0) {
            $('#comment-list').html('');
            $('#comment-cnt').html('댓글 ' + commentCount + '개');
            querySnapshot.forEach((doc) => {
                var data = doc.data();
                db.collection('users').doc(data.userId).get().then((doc_user) => {
                    var user = doc_user.data();
                    var regURL = new RegExp('(^|[^"])(http|https|ftp|telnet|news|irc)://([-/.a-zA-Z0-9_~#%$?&=:200-377()]+)', 'gi');
                    var regURL2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
                    var contentHTML = data.content.replace(regURL, '$1<a href="$2://$3" target="_blank">$2://$3</a>').replace(regURL2, '$1<a href="http://$2" target="_blank">$2</a>');

                    if (firebase.auth().currentUser.uid == data.userId) { //댓글 작성자이면
                        $('#comment-list').append(`
                        <div class="comment-item"  data-createdt="`+ data.createdAt.toDate().getTime() + `">
                         <div class="comment-item-card">
                        <span class="comment-item-name">`+ ((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname)) + `</span>
                        <p class="comment-item-text">`+ contentHTML + `</p>
                        </div>
                        <div class="comment-item-footer">
                        <p class="comment-item-time">`+ timeForToday(data.createdAt.toDate()) + `</p>
                        <a href="javascript:reportComment('`+ data.content + `', '` + data.userId + `', '` + moment(data.createdAt.toDate()).format("YYYY-MM-DD HH:mm:ss") + `');">
                            <ion-icon name="alert-circle-outline"></ion-icon>
                        </a>
                        <a href="javascript:openEditComment('`+ doc.id + `', '` + data.content + `', '` + data.userId + `');">
                            <ion-icon name="create-outline"></ion-icon>
                        </a>
                        <a href="javascript:deleteComment('`+ doc.id + `', '` + data.userId + `');">
                            <ion-icon name="trash-outline"></ion-icon>
                        </a>
                       </div>
                        </div>
                      `);
                    } else {
                        $('#comment-list').append(`
                        <div class="comment-item" data-createdt="`+ data.createdAt.toDate().getTime() + `">
                         <div class="comment-item-card">
                        <span class="comment-item-name">`+ ((user.admin) ? (user.nickname + ' <ion-icon class="admin-badge" name="checkmark-circle"></ion-icon>') : (user.nickname)) + `</span>
                        <p class="comment-item-text">`+ contentHTML + `</p>
                        </div>
                        <div class="comment-item-footer">
                        <p class="comment-item-time">`+ timeForToday(data.createdAt.toDate()) + `</p>
                        <a href="javascript:reportComment('`+ data.content + `', '` + data.userId + `', '` + moment(data.createdAt.toDate()).format("YYYY-MM-DD HH:mm:ss") + `');">
                            <ion-icon name="alert-circle-outline"></ion-icon>
                        </a>
                       </div>
                        </div>
                      `);
                    }
                    //다크테마 적용
                    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                        $('.comment-item').addClass("dark");
                        $('.comment-item-card').addClass("dark");
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                    // 탈퇴한 게정에서 작성한 댓글
                    var regURL = new RegExp('(^|[^"])(http|https|ftp|telnet|news|irc)://([-/.a-zA-Z0-9_~#%$?&=:200-377()]+)', 'gi');
                    var regURL2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
                    var contentHTML = data.content.replace(regURL, '$1<a href="$2://$3" target="_blank">$2://$3</a>').replace(regURL2, '$1<a href="http://$2" target="_blank">$2</a>');

                    $('#comment-list').append(`
                        <div class="comment-item" data-createdt="`+ data.createdAt.toDate().getTime() + `">
                         <div class="comment-item-card">
                        <span class="comment-item-name">`+ '(탈퇴한 계정)' + `</span>
                        <p class="comment-item-text">`+ contentHTML + `</p>
                        </div>
                        <div class="comment-item-footer">
                        <p class="comment-item-time">`+ timeForToday(data.createdAt.toDate()) + `</p>
                        <a href="javascript:reportComment('`+ data.content + `', '` + '탈퇴한 계정' + `', '` + moment(data.createdAt.toDate()).format("YYYY-MM-DD HH:mm:ss") + `');">
                            <ion-icon name="alert-circle-outline"></ion-icon>
                        </a>
                       </div>
                        </div>
                      `);
                    //다크테마 적용
                    if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
                        $('.comment-item').addClass("dark");
                        $('.comment-item-card').addClass("dark");
                    }
                });
            });

        } else { //댓글 0개
            $('#comment-list').html(`<div id="no-comment">
            <ion-icon name="chatbubble-ellipses-outline" style="font-size:50px;"></ion-icon>
            <p>아직 댓글이 없어요.<br>첫 댓글을 남겨볼까요?</p>
        </div>`)

        }
        $('.comment-item').sort(function (a, b) {
            return $(a).data('createdat') - $(b).data('createdat');
        }
        ).prependTo('.comment-list');
    });



function submit_comment() {
    var content = $('#comment-input').val();

    if (!content) {
        toast('댓글을 입력해주세요.');
    } else {
        $('#comment-input').val('');

        var timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        db.collection('board').doc(getParam('id')).collection('comments').add({
            userId: firebase.auth().currentUser.uid,
            content: content,
            createdAt: timestamp,
        })

        $('html, body').animate({
            scrollTop: $("#comment-cnt").offset().top
        }, 500);

        //푸시 알림 전송
        db.collection('users').doc(authorId).get().then((doc_user) => {
            var user = doc_user.data();
            if (user.fcmToken) { //token 존재
                $.ajax({
                    type: "GET",
                    url: `https://sungil-school-api.vercel.app/fcm?key=9pcd01YwxIIO3ZVZWFLN&title=내가 쓴 글에 새로운 댓글이 달렸습니다.&desc=${($('#post-title').text()) ? $('#post-title').text() + '에 달린 댓글' : '어떤 댓글이 달렸는지 확인해보세요.'}&token=${user.fcmToken}`,
                    success: function (result) {
                        console.log(result);
                    }
                });
            }
        });

        

    }


}


//댓글 삭제
function deleteComment(comment_id, userId) {
    confirmDeleteComment(comment_id, userId);
}

async function confirmDeleteComment(comment_id, userId) {
    const confirm = await ui.confirm('댓글을 정말 삭제하시겠습니까?');
    if (confirm) {
        if (firebase.auth().currentUser.uid == userId) {
            toast('댓글이 삭제되었습니다.')
            db.collection("board").doc(getParam('id')).collection('comments').doc(comment_id).delete().then(() => {

            }).catch((error) => {
                console.error("Error removing file: ", error);
            });
        } else {
            toast('권한이 없습니다')
        }
    }
}

//댓글 수정
var selectedCommentId;
var selectedCommentUserId;
function openEditComment(comment_id, comment_content, userId) {
    selectedCommentId = comment_id;
    selectedCommentUserId = userId;
    $('#comment-edit-input').val(comment_content);
    $('#comment-editor').show();
}

function editComment() {
    var content = $('#comment-edit-input').val();

    if (!content) {
        toast('댓글을 입력해주세요.');
    } else {
        if (firebase.auth().currentUser.uid == selectedCommentUserId) {
            db.collection('board').doc(getParam('id')).collection('comments').doc(selectedCommentId).update({
                content: content,
            })
            $('#comment-editor').hide();
        } else {
            toast('권한이 없습니다.')
        }

    }
}

var editor;
function openEditPost() {
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').text('게시물 수정');
    $('.content-wrap').hide();
    $('#writePost').show();
    $('#report').hide();
    $('#reportComment').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    $('#post-title-edit').val($('#post-title').text());
    $('#category-select').val(category);
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
        $('.sheet-backdrop').addClass('backdrop-in');
        $('.sheet-modal').css('height', '100vh');
        if (storedTheme == 'true' || (storedTheme == 'system' && mql.matches)) {
            editor = new toastui.Editor.factory({
                el: document.querySelector('#editor'),
                initialEditType: 'wysiwyg',
                height: $(window).height() - $('#post-form-wrap').height() - 350 + 'px',
                initialValue: content,
                language: 'ko_KR',
                theme: 'dark',
                autofocus: false,
            });
        } else {
            editor = new toastui.Editor.factory({
                el: document.querySelector('#editor'),
                initialEditType: 'wysiwyg',
                initialValue: content,
                height: $(window).height() - $('#post-form-wrap').height() - 350 + 'px',
                language: 'ko_KR',
                autofocus: false,
            });
        }
    }, 100);
}


function closeModal() {
    $('body').css('overflow', 'auto');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('display', 'none');
    }, 100);
    $('.sheet-backdrop').removeClass('backdrop-in');
    $('.sheet-backdrop-nocancel').removeClass('backdrop-in');

}

//수정
function post(target) {
    var title = $('#post-title-edit').val();
    var content = editor.getMarkdown();
    var category = $('#category-select').val();
    if (content) {
        $('#edit-post-btn').text('업로드 중...');
        var data = {
            title: title,
            content: content,
            category: category,
        }
        db.collection('board').doc(getParam('id')).update(data).then((result) => {
            location.reload();
        }).catch((err) => {
            console.log(err);
        });
    } else {
        toast('게시글 내용을 작성해주세요.')
    }
}


//신고
function openReportModal() {
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').text('게시물 신고');
    $('.content-wrap').hide();
    $('#writePost').hide();
    $('#report').show();
    $('#reportComment').hide();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#report').height() + 150 + 'px');
    }, 100);
}

function reportViolation() {
    //get all of checked values in 'report-checklist' id
    var checkedValues = $('#report #report-checklist input:checked').map(function () {
        return this.value;
    }).get();
    if (checkedValues.length == 0) {
        toast('신고 사유를 한 개 이상 선택해주세요')
    } else {
        var payload = JSON.stringify({
            "fallback": "새로운 신고가 접수되었습니다.",

            "text": "커뮤니티 글에 대한 새로운 신고가 접수되었습니다.",
            "color": "danger",
            "fields": [
                {
                    "title": "신고한 사용자 :",
                    "value": firebase.auth().currentUser.uid,
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                },
                {
                    "title": "신고 사유 :",
                    "value": checkedValues.toString(),
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                },
                {
                    "title": "신고 내용 :",
                    "value": $('#report-content').val() || '별도 내용 없음',
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                },
                {
                    "title": "게시글 작성자 :",
                    "value": authorId,
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                },
                {
                    "title": "게시글 내용 :",
                    "value": content,
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                },
                {
                    "title": "게시글 링크:",
                    "value": window.location.href,
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                }
            ]
        });
        var url = 'https://hooks.slack.com/services/' + 'T03QS4GLKMH/B03QUK87L2G/' + 'IHooRkeix2CRC' + 'aXmiswVgDBz';

        $.post(url, payload).done(function (data) {
            console.log("신고 등록됨");
            toast('신고가 등록되었습니다.')
            $('#report-content').val("");
            $('body').css('overflow', 'auto');
            $('.modal-in').css('bottom', '-1850px');
            setTimeout(function () {
                $('.modal-in').css('display', 'none');
            }, 100);

            $('.sheet-backdrop').removeClass('backdrop-in');
        })
    }

}

//댓글 신고
function reportComment(content, userId, createdAt) {
    $('.sheet-modal').css('height', '30%');
    $('#modal-title').text('댓글 신고');
    $('.content-wrap').hide();
    $('#writePost').hide();
    $('#report').hide();
    $('#reportComment').show();
    $('body').css('overflow', 'hidden');
    $('.modal-in').css('display', 'block');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('bottom', '0px');
    }, 100);
    $('.sheet-backdrop').addClass('backdrop-in');
    setTimeout(function () {
        $('.sheet-modal').css('height', $('#reportComment').height() + 150 + 'px');
    }, 100);

    $('#report-comment-btn').click(function () {
        reportViolationComment(content, userId, createdAt);
    });
}

function reportViolationComment(content, userId, createdAt) {
    //get all of checked values in 'report-checklist' id
    var checkedValues = $('#reportComment #report-checklist input:checked').map(function () {
        return this.value;
    }).get();
    if (checkedValues.length == 0) {
        toast('신고 사유를 한 개 이상 선택해주세요')
    } else {
        var payload = JSON.stringify({
            "fallback": "새로운 신고가 접수되었습니다.",

            "text": "커뮤니티 댓글에 대한 새로운 신고가 접수되었습니다.",
            "color": "danger",
            "fields": [
                {
                    "title": "신고한 사용자 :",
                    "value": firebase.auth().currentUser.uid,
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                },
                {
                    "title": "신고 사유 :",
                    "value": checkedValues.toString(),
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                },
                {
                    "title": "신고 내용 :",
                    "value": $('#report-comment-content').val() || '별도 내용 없음',
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                },
                {
                    "title": "댓글 작성자 :",
                    "value": userId,
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                },
                {
                    "title": "댓글 내용 :",
                    "value": content,
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                },
                {
                    "title": "댓글 작성일자 :",
                    "value": createdAt,
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                },
                {
                    "title": "댓글이 달린 게시글 링크:",
                    "value": window.location.href,
                    "short": false // `value`가 다른 값과 나란히 표시될 정도로 짧은지를 나타내는 옵션 플래그
                }
            ]
        });
        var url = 'https://hooks.slack.com/services/' + 'T03QS4GLKMH/B03QUK87L2G/' + 'IHooRkeix2CRC' + 'aXmiswVgDBz';

        $.post(url, payload).done(function (data) {
            console.log("신고 등록됨");
            toast('신고가 등록되었습니다.')
            $('#report-content').val("");
            $('body').css('overflow', 'auto');
            $('.modal-in').css('bottom', '-1850px');
            setTimeout(function () {
                $('.modal-in').css('display', 'none');
            }, 100);

            $('.sheet-backdrop').removeClass('backdrop-in');
        })
    }

}


//bottom sheet

///custom modal sheet///
$('.c-modal').each(function () {

    var mc = new Hammer(this);

    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL
    });

    mc.on("swipedown", function (ev) {
        if (!$('#loginForm').is(':visible')) {
            console.log(ev)
            $('body').css('overflow', 'auto');
            $('.modal-in').css('bottom', '-1850px');
            setTimeout(function () {
                $('.modal-in').css('display', 'none');
            }, 100);

            $('.sheet-backdrop').removeClass('backdrop-in');
        }
    });

});

$('.page-content').each(function () {
    if (!$('#loginForm').is(':visible')) {
        var mc = new Hammer(this);

        mc.get('swipe').set({
            direction: Hammer.DIRECTION_ALL
        });

        mc.on("swipedown", function (ev) {
            if (!$('#loginForm').is(':visible')) {
                console.log(ev)
                $('body').css('overflow', 'auto');
                $('.modal-in').css('bottom', '-1850px');
                setTimeout(function () {
                    $('.modal-in').css('display', 'none');
                }, 100);

                $('.sheet-backdrop').removeClass('backdrop-in');
            }
        });
    }
});


$('.sheet-backdrop').on('click', function () {
    $('body').css('overflow', 'auto');
    $('.modal-in').css('bottom', '-1850px');
    setTimeout(function () {
        $('.modal-in').css('display', 'none');
    }, 100);
    $('.sheet-backdrop').removeClass('backdrop-in');
});



//theme
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
    $('.sheet-modal').addClass("dark");
    $('.swipe-handler').addClass("dark");
    $('.skeleton').addClass("dark");
    $('.comment-input-wrap input').each(function () {
        $(this).addClass("dark");
    });
    $('.custom-btn').addClass("dark");
    viewer = new toastui.Editor.factory({
        el: document.querySelector('#viewer'),
        viewer: true,
        theme: 'dark',
    });

    $('.postpage-header').addClass("dark");
    $('.comment-input-wrap').addClass("dark");
    $('#main-confirm').addClass("dark");
    $('.content-wrap input').each(function () {
        $(this).addClass("dark");
    });
    $('.vote-choice-item').addClass("dark");
}

function offDark() {
    $('html').removeClass("dark");
    $('body').removeClass("dark");
    $('.sheet-modal').removeClass("dark");
    $('.swipe-handler').removeClass("dark");
    $('.skeleton').removeClass("dark");
    $('.comment-input-wrap input').each(function () {
        $(this).removeClass("dark");
    });
    $('.custom-btn').removeClass("dark");
    viewer = new toastui.Editor.factory({
        el: document.querySelector('#viewer'),
        viewer: true,
        theme: 'default',
    });

    $('.postpage-header').removeClass("dark");
    $('.comment-input-wrap').removeClass("dark");
    $('#main-confirm').removeClass("dark");
    $('.content-wrap input').each(function () {
        $(this).removeClass("dark");
    });
    $('.vote-choice-item').removeClass("dark");
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


setTimeout(function () {
    var cssRule = "font-size:25px;color:#ff4043;";
    var cssRule2 = "font-size:15px;";
    console.clear();
    console.log("%c경고!", cssRule);
    console.log("%c이 기능은 개발자용으로 브라우저에서 제공되는 내용입니다.\n누군가 기능을 악의적으로 사용하거나 다른 사람의 계정을 '해킹'하기 위해 여기에 특정 콘텐츠를 복사하여 붙여넣으라고 했다면 사기 행위로 간주하세요.\n해당 경고문을 보고 있는 본인 역시, 개발자도구를 이용해 악의적인 공격을 시도한다면 법적 처벌을 받을 수 있습니다.", cssRule2);
}, 5000);

//prevent f12
document.onkeydown = function (e) {
    if (e.keyCode == 123) {
        toast('보안 상의 이유로 금지된 동작입니다.')
        return false;
    }
}

//모바일 키보드 높이 대응
var originalSize = jQuery(window).width() + jQuery(window).height();

// resize #sheet-modal on resize window
$(window).resize(function () {
    if ($(window).width() + $(window).height() != originalSize && $('#writePost').is(':visible')) { //모바일에서 키보드 열렸을 때
        $('.sheet-modal').addClass('full-modal')
        $('.sheet-modal').css('height', '100vh')
    } else {
        $('.sheet-modal').removeClass('full-modal');
        setTimeout(function () {
            $('.sheet-modal').css('height', $('#writePost').height() + 150 + 'px');
            $('.sheet-modal').removeClass('full-modal');
        }, 100);
    }
});

$(document).on('focusout', 'input, #editor', function () { //키보드 닫힐 때
    if ($('#writePost').is(':visible')) {
        $('.sheet-modal').removeClass('full-modal');
        setTimeout(function () {
            $('.sheet-modal').css('height', $('#writePost').height() + 150 + 'px');
            $('.sheet-modal').removeClass('full-modal');
        }, 100);
    }

});