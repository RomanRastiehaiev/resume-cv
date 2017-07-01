$(function () {

    /* --------------- Skills rendering functionality on window resize and skills article mouse up -------------- */

    setSkillsListElementsWidth();

    $(window).on('resize', function (e) {
        repaintSkillsPercentage();
    });

    function repaintSkillsPercentage() {
        var loop = setInterval(setSkillsListElementsWidth(), 30);
        clearInterval(loop);
    }

    function setSkillsListElementsWidth() {

        var skillsList = $("#skills-list");
        var skillsListElements = skillsList.find("li");
        var baseWidth = skillsList.width();

        skillsListElements.width(baseWidth);

        skillsListElements.each(function () {
            var percentage = this.getAttribute("data-percentage");
            if (percentage > 100) {
                percentage = 100;
            }
            if (percentage < 0) {
                percentage = 0;
            }
            var currentLiWidth = baseWidth * percentage / 100;
            $(this).animate({
                    width: currentLiWidth
                },
                {duration: 1200, queue: false}
            );
        });
    }

    /* ----------------------------------- Add new skill functionality ------------------------------------ */

    $("#skills-article").hover(
        function () {
            $(".open-edit-skills-article-button").show();
        },
        function () {
            $(".open-edit-skills-article-button").hide();
        }
    );

    $(".open-edit-skills-article-button").toggleClick(
        function () {
            $("#add-skills-form").show("blind");
            return false;
        },
        function () {
            $("#add-skills-form").hide("blind");
            return false;
        }
    );

    var allSkills = ["Java", "HTML", "CSS", "JQuery", "PHP"];

    // add custom rule for JQuery validator to validate skill existence
    $.validator.addMethod("checkExistence", function (value) {
            for (var i = 0; i < allSkills.length; i++) {
                if (allSkills[i].toUpperCase() === value.toUpperCase()) {
                    return false;
                }
            }
            return true;
        }
    );

    $("#add-skills-form").validate({
        errorClass: "error-message",
        rules: {
            "skill-name": {
                required: true,
                checkExistence: true
            },
            "skill-percentage": {
                required: true,
                range: [10, 100]
            }
        },
        messages: {
            "skill-name": {
                required: "You must specify skill name.",
                checkExistence: "Specified skill already exists."
            },
            "skill-percentage": {
                required: "You must specify skill percentage.",
                range: "The value of percentage must be [10, 100]."
            }
        },
        submitHandler: function () {

            var $skillNameInput = $("#skill-name-input");
            var $skillPercentageInput = $("#skill-percentage-input");

            var skillName = $skillNameInput.val();
            var skillPercentage = $skillPercentageInput.val();

            $("#skills-list").append("<li data-percentage='" + skillPercentage + "' title='" + skillPercentage + "%'>" + skillName + "</li>");

            $skillNameInput.val("");
            $skillPercentageInput.val("");

            allSkills.push(skillName);
            for (var i = 0; i < allSkills.length; i++) {
                console.log(allSkills[i]);
            }

            setSkillsListElementsWidth();
        },
        highlight: function (element) {
            $(element).css("border", "1px solid #f20000");
        },
        unhighlight: function (element) {
            $(element).css("border", "1px solid #bebebe");
        }
    });

    /* ----------------------------------- Sortable functionality for articles ------------------------------------ */

    var oldArticle, newArticle, item;
    var $aside = $(".content-block");
    $aside.sortable({
        // Allows to move articles between ASIDE blocks with class content-block
        connectWith: $aside,
        // Allows to drag only by header of article
        handle: ".article-header",
        // Allows to drag only items with class info-article
        items: ".info-article",
        // Replaces regular white box with DIV that displays "DROP HERE" text
        placeholder: "drop-here",
        start: function (event, ui) {
            ui.item.css({
                "-webkit-box-shadow": "0px 0px 29px 0px rgba(0,0,0,0.75)",
                "-moz-box-shadow": "0px 0px 29px 0px rgba(0,0,0,0.75)",
                "box-shadow": "0px 0px 29px 0px rgba(0,0,0,0.75)",
                // Makes Education box to be displayed in a normal way
                // By default, opacity does not equal to 1, so target DIV displayed incorrectly
                "background-color": "#fff",
                "opacity": "1"
            });

            $(".drop-here").text("Drop box here");
            $(".article-header").css("cursor", "move");

            item = ui.item;
            newArticle = oldArticle = ui.item.parent();
        },
        stop: function (event, ui) {
            ui.item.css({
                "-webkit-box-shadow": "none",
                "-moz-box-shadow": "none",
                "box-shadow": "none",
                "background-color": "none"
            });

            if (ui.item.prop("id") === "skills-article") {
                setSkillsListElementsWidth();
            }

            $(".article-header").css("cursor", "pointer")
        },
        change: function (event, ui) {
            if (ui.sender) {
                newArticle = ui.placeholder.parent();
            }
        }
    });

    /* ----------------------------------- Firebase for History box ------------------------------------ */

    var reference = new Firebase("https://fiery-fire-2533.firebaseio.com/");
    var educationItems = reference.child('education');

    var retrieved = false;
    var uploaded = false;

    var educationObject = {
        "date": 2015,
        "title": "Uploaded record by myself",
        "someText": "Some text about me"
    };

    educationItems.orderByKey().startAt("0").limitToFirst(4).once("value", function (snapshot) {
        addListElements(snapshot);
        $("#education-timeline").show('explode');
        $(".spinner").hide('blind');
    });

    $("#education-timeline").mCustomScrollbar({
        theme: "minimal-dark",
        setHeight: 300,
        advanced: {updateOnSelectorChange: "#education-list li"},
        scrollInertia: 500,
        callbacks: {
            // event handler that activates when reaching scroll bottom
            onTotalScroll: function () {
                if (!retrieved) {
                    educationItems.orderByKey().startAt("4").limitToFirst(5).once("value", function (snapshot) {
                        addListElements(snapshot);
                    }, function (errorObject) {
                        console.log("The read failed: " + errorObject.code);
                    });
                    retrieved = true;
                    return;
                }
                if (!uploaded) {
                    // if using push(array) which would be more efficient,
                    // it will be array element side by side to education objects
                    var liSet = "";
                    var educationObjectLi = getLiElement(educationObject);
                    for (var i = 0; i < 5; i++) {
                        educationItems.push(educationObject);
                        liSet += educationObjectLi;
                    }
                    $("#education-list").append(liSet);
                    uploaded = true;
                }
            }
        }
    });

    function addListElements(snapshot) {
        if (snapshot !== 'undefined') {
            var resultLiSet = "";
            snapshot.forEach(function (childSnapshot) {
                var child = childSnapshot.val();
                resultLiSet += getLiElement(child);
            });
            $("#education-list").append(resultLiSet);
        }
    }

    function getLiElement(object) {
        var resultLiString = "<li>";
        resultLiString += "<time class='timeline-period'>";
        resultLiString += object.date;
        resultLiString += "</time>";
        resultLiString += "<div class='period-description'>";
        resultLiString += "<div class='period-description-wrapper'>";
        resultLiString += "<p class='description-header sub-paragraph'>";
        resultLiString += object.title;
        resultLiString += "</p>";
        resultLiString += "<h4 class='plain-text'>";
        resultLiString += object.someText;
        resultLiString += "</h4>";
        resultLiString += "</div>";
        resultLiString += "</div>";
        resultLiString += "</li>";
        return resultLiString;
    }

});

/* ----------------------------------- Common ------------------------------------ */

(function ($) {
    $.fn.toggleClick = function (func1, func2) {
        var functions = [func1, func2];
        this.data('toggleclicked', 0);
        this.click(function () {
            var data = $(this).data();
            var toggleClicked = data.toggleclicked;
            $.proxy(functions[toggleClicked], this)();
            data.toggleclicked = (toggleClicked + 1) % 2;
            return false;
        });
        return this;
    };
}(jQuery));
