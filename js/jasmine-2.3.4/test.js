jasmine.getFixtures().fixturesPath = 'fixtures';

function setUpHTMLFixture() {
    jasmine.getFixtures().load('index.html');
}

var slice = Array.prototype.slice;
var passes = function passes(a, b) {
  return !a ^ !b;
};
var partial = function partial(func) {
  var boundArgs = slice.call(arguments, 1);

  return function () {
    var args = boundArgs.concat(slice.call(arguments));
    return func.apply(this, args);
  };
};
var compares = function compares(func) {
  return {
    compare: partial(func, false),
    negativeCompare: partial(func, true)
  };
};

describe("Tests", function () {

    describe("-------------- Tests for page validation --------------", function () {

        beforeEach(function () {
			setUpHTMLFixture();
        });
		
        it("Each IMG tag should contain attribute 'title'.", function () {
            expect($("img")).toHaveAttr("title");
        });

        it("Each IMG tag should contain attribute 'alt'.", function () {
            expect($("img")).toHaveAttr("alt");
        });

        it("Each A tag should contain attribute 'href'.", function () {
            expect($("a")).toHaveAttr("href");
        });

        it("Each UL tag should contain only LI tags.", function () {
            $.each($("ul").children(), function() {
                expect($(this).prop("tagName")).toEqual("LI");
            });
        });

        it("Each INPUT tag should have associated LABEL.", function () {
            $.each($("input[type=text]"), function() {
                var id = $(this).attr("id");
                expect($("label[for=" + id + "]")).toBeDefined();
            });
        });

        it("Page should contain only one tag HEADER.", function () {
            expect($("header").size()).toEqual(1);
        });


    });

	describe("-------------- Tests for content --------------", function () {

		beforeEach(function () {
			setUpHTMLFixture();
        });

        it("SPAN with class name-highlight should contain my name.", function() {
            expect($(".name-highlight")).toHaveText("Roman Rastiehaiev");
        });

        it("SPAN with class years-old-highlight should contain my age.", function() {
            expect($(".years-old-highlight")).toHaveText("21yo");
        });

        it("Each article header must have a tip for dragging content by this header.", function() {
            expect($(".article-header").prop("title")).toEqual("Drag item wherever you want");
        });

        it("Page should contain 7 information articles.", function() {
            expect($(".info-article").size()).toEqual(67);
        });

	});

	describe("-------------- Tests with custom matchers --------------", function () {

        beforeEach(function () {
			setUpHTMLFixture();
			jasmine.addMatchers(
			{
				toHaveAttributeValueLessThan: function() {

					return compares(function (not, el, attributeName, value) {
						var passed = true;
						for (var i = 0; i < el.size(); i++) {
							var li = el.eq(i);
							var dataPercentage = li.attr(attributeName);
							if (dataPercentage > value) {
								passed = false;
							}
						}
                        return {
                            pass: passes(passed, not),
                            message: 'custom message'
                        };
                    });
				}
			}
        )});
		
		it("Each #skills-list LI element should contain data-percentage attribute with value less than 100.", function () {
            expect($("#skills-list li")).toHaveAttributeValueLessThan("data-percentage", 100);
        });

		it("Each #skills-list LI element should contain data-percentage attribute with value greater than 0.", function () {
            expect($("#skills-list li")).not.toHaveAttributeValueLessThan("data-percentage", 0);
        });

	});

});