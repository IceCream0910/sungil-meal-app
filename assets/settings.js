var grade = localStorage.getItem("sungil_grade");
var classNum = localStorage.getItem("sungil_classNum");

$('#grade').val(grade);
$('#classNum').val(classNum);

$("#grade").on("propertychange change keyup paste input", function(){
    localStorage.setItem("sungil_grade", $(this).val())
});

$("#classNum").on("propertychange change keyup paste input", function(){
    localStorage.setItem("sungil_classNum", $(this).val())

});