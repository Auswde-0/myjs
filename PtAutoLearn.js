/************************************
专业技术人员继续教育培训平台自动挂课脚本
DATE：2023-06-02 09:11 AUTHOR:Auswde
************************************/

let path = window.location.pathname.split('/');
let userId = "";
let classId = path[3];
let studylist = Object;
let userData = Object;
let PlayParams = Object;
let PlayTokenData = Object;
let studySwitch = false;
let nowAutoStudyIndex = -1
let studTimer = Object;

(function() {
    $.ajaxSettings.async = false;
    $.get("https://gsjygzj.59iedu.com/web/login/login/getUserInfo", function(data) {
        if (data.code === 200) {
            userData = data.info;
        }
    })
    userId = userData.userId;
    getstudylist();
    if (!$("#study_btn").length && $("#study_btn").length === 0) {
        $(".sub-tab-tit").append('<button id="study_btn" style="width: 70px;height: 25px;margin:1px;border-radius: 25px;background-color: #3d8ff5;box-shadow: 0 1px 5px black;color: #FFFFFF;font-weight: 700;margin-left: 10px;">自动学习</button>')
    }
    $("#study_btn").off();
    $("#study_btn").click(function() {
        if (nowAutoStudyIndex === -1) {
            AusoStudyClass();
            $(this).css({
                "background-color": "#FF0000"
            });
            $(this).text("停止学习");

        } else {
            studySwitch = false;
            $(this).css({
                "background-color": "#3d8ff5"
            });
            $(this).text("自动学习");

        }
    });

}
)()

function getstudylist() {
    let t = (new Date()).valueOf();
    let getstudylist_path = `https://gsjygzj.59iedu.com/web/front/myClass/getMyCourseList?_q_=${t}&_q_=${t}&classId=${classId}&listType=1`;
    $.get(getstudylist_path, function(data) {
        if (data.code === 200) {
            let info = data.info
            for (let i in info) {
                // console.log(info[i].courseId, info[i].courseName);
                studylist[info[i].courseId] = {
                    "name": info[i].courseName
                }
            }
        }
    });
}

function getChapterList(lessonId) {
    let t = (new Date()).valueOf()
    let getchapterList_path = `https://gsjygzj.59iedu.com/web/portal/play/getCourseInfo?_q_=${t}&exts=%7B%22learnType%22:%22TRAINING_CLASS%22%7D&lessonId=${lessonId}&mode=3&trainClassId=${classId}`;
    $.ajaxSettings.async = false;
    $.get(getchapterList_path, function(data) {
        if (data.code === 200) {
            let courseWareList = data.info.lesson.chapterList[0].courseWareList;
            studylist[lessonId]["courseWareList"] = courseWareList;
        }
    });

}

function getPlayParams(lessonId, courseWareId, mediaId, mode) {
    let getPlayParams_path = `https://gsjygzj.59iedu.com/web/portal/play/getPlayParams?_q_=${(new Date()).valueOf()}&courseWareId=${courseWareId}&exts=%7B%22learnType%22:%22TRAINING_CLASS%22%7D&lessonId=${lessonId}&mediaId=${mediaId}&mode=${mode}&trainClassId=${classId}`;
    $.get(getPlayParams_path, function(data) {
        if (data.code === 200) {
            PlayParams = data.info;
        }
    });
}

function getPlayToken() {
    let context = {
        "markers": PlayParams.objectList,
        "guid": PlayParams.guid,
        "plmId": PlayParams.platformId,
        "pvmId": PlayParams.dataPlatformVersionId,
        "prmId": PlayParams.dataProjectId,
        "subPrmId": PlayParams.subProjectId,
        "unitId": PlayParams.unitId,
        "orgId": "-1",
        "dataProjectId": PlayParams.dataProjectId,
        "dataPlatformVersionId": PlayParams.dataPlatformVersionId,
        "originalAbilityId": PlayParams.originalAbilityId
    };

    let Initingdata = {
        "head": {
            "appVersion": "1.0.0",
            "osPlatform": "web",
            "requestTime": (new Date()).valueOf()
        },
        "data": {
            "courseId": PlayParams.lessonId,
            "courseWareId": PlayParams.courseWareId,
            "multimediaId": PlayParams.mediaId,
            "isWriteHistory": true,
            "usrId": userId,
            "type": "single",
            "token": "",
            "context": context,
            "originalAbilityId": PlayParams.originalAbilityId
        }
    };
    // console.log(Initingdata);
    $.ajax({
        type: 'POST',
        async: false,
        url: "https://hwstudyv1.59iedu.com/api/LearningMarker/Initing",
        data: JSON.stringify(Initingdata),
        headers: {
            "Content-Type": "text/plain"
        },
        success: function(data) {
            if (data.head.code === '200') {
                PlayTokenData = data.data;
                // console.log(PlayTokenData);
            }
        }
    });

}

function dostudy() {
    let TimingData = {
        "data": {
            "core": {
                "primaryKey": PlayTokenData.core.primaryKey,
                "courseRecordId": PlayTokenData.core.courseRecordId,
                "coursewareRecordId": PlayTokenData.core.coursewareRecordId,
                "lessonId": PlayTokenData.core.lessonId,
                "studyMode": 1,
                "studySchedule": 100,
                "timingMode": "schedule",
                "studyStatus": 1,
                "lessonStatus": "not attempted",
                "token": PlayTokenData.core.token
            },
            "extend": {
                "guid": PlayParams.guid,
                "plmId": PlayParams.platformId,
                "pvmId": PlayParams.dataPlatformVersionId,
                "prmId": PlayParams.dataProjectId,
                "subPrmId": PlayParams.subProjectId,
                "unitId": PlayParams.unitId,
                "orgId": "-1",
                "dataProjectId": PlayParams.dataProjectId,
                "dataPlatformVersionId": PlayParams.dataPlatformVersionId,
                "originalAbilityId": PlayParams.originalAbilityId
            }
        },
        "head": {
            "appVersion": "1.0.0",
            "osPlatform": "web",
            "requestTime": (new Date()).valueOf()
        }

    }

    $.ajax({
        type: 'POST',
        async: false,
        url: "https://hwstudyv1.59iedu.com//api/LearningMarker/Timing",
        data: JSON.stringify(TimingData),
        headers: {
            "Content-Type": "text/plain"
        },
        success: function(data) {
            if (data.head.code === '200') {
                // console.log(data.data.core.coursewareSchedule, data.data.core.courseSchedule);
                $(`tr:eq(${nowAutoStudyIndex})`).find('span.current').css({
                    "width": data.data.core.courseSchedule + "%",
                    "background-color": "#7fff00"
                });
                $(`tr:eq(${nowAutoStudyIndex})`).find('span.process-num').text(data.data.core.courseSchedule + "%");
                if (data.data.core.coursewareSchedule === 100) {
                    studySwitch = false;
                    AusoStudyClass();
                }
            }
        }
    });

}

function AusoStudyClass() {
    let index = 1;
    top: for (item in studylist) {
        getChapterList(item)
        // console.log(item, studylist[item]);
        for (cou in studylist[item].courseWareList) {
            if (studylist[item].courseWareList[cou].mediaList[0].schedule < 100) {
                let temp = studylist[item].courseWareList[cou];
                // console.log(temp);
                getPlayParams(item, temp.id, temp.mediaList[0].id, temp.mediaList[0].mode);
                getPlayToken();
                nowAutoStudyIndex = index;
                startAutoStudy();
                break top;
            }
        }
        index++;
    }
}

function startAutoStudy() {
    studySwitch = true;
    studTimer = setInterval(function() {
        dostudy()
        if (studySwitch === false) {
            $(`tr:eq(${nowAutoStudyIndex})`).find('span.current').css({
                "background-color": "#bbb"
            });
            clearInterval(studTimer);
            nowAutoStudyIndex = -1
        }
    }, 30000);

}
