const client = algoliasearch('7QOUYE7F4M', '19dcd49d3ac569cae0bacc9a23c0e458');
const index = client.initIndex('board');
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
const auth = firebase.auth();
var db = firebase.firestore();


//search-input enter event
$('#search-input').on('keyup', function (e) {
    if (e.which == 13) {
        e.preventDefault();
        search($('#search-input').val());
    }
});

/*
var typingTimer;
$('#search-input').on('keyup', function (e) {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
        search($('#search-input').val());
    }, 3000);
});
*/

function search(q) {
    index.search(q).then(({ hits }) => {
        $('.post-listview').html(`<div class="card-body"><h2 class="card-intro skeleton"></h2> <p class="card-title skeleton"></p> </div><div class="card-body"><h2 class="card-intro skeleton"></h2> <p class="card-title skeleton"></p> </div><div class="card-body"><h2 class="card-intro skeleton"></h2> <p class="card-title skeleton"></p> </div><div class="card-body"><h2 class="card-intro skeleton"> </h2><p class="card-title skeleton"> </p></div>`)
        hits.forEach(hit => {
            var database = db.collection('board').doc(hit.objectID);
            database.get().then(function (doc) {
                if (doc.exists) {
                    var data = doc.data();
                    $('.post-listview').empty();
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
                }
            });
        });
    });
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