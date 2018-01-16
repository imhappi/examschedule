/*
 *  Starter code for University of Waterloo CS349 - Spring 2017 - A3.
 *	Refer to the JS examples shown in lecture for further reference.
 *  Note: this code uses ECMAScript 6.
 */
	
"use strict";

// Get your own API key from https://uwaterloo.ca/api/register
var apiKey = "117b45b7a5d20252350a0bf9d20ea1c9";

(function(exports) {

	class Exam {
		constructor(subject, catalog_number, section, day, date, location, start_time, end_time, term) {
			this.subject = subject;
			this.catalog_number = catalog_number;
			this.date = date;
			this.location = location;
			this.day = day;
			this.section = section;
			this.start_time = start_time;
			this.end_time = end_time;
			this.term = term;
		}
	}

	/* A Model class */
    class AppModel {

		constructor() {
			this._observers = [];
		}

		makeCallback(term) {
			var that = this;
		return function foo(d) {
			if (that.globalCallback === foo) {
			var obj = JSON.parse(JSON.stringify(d));
			$("#loadingSpinner")[0].style.display = "none";
			$("#exam-list")[0].style.display = "block";

			var exams = [];

			obj.data.forEach(function(arrayItem) {
				var subject = arrayItem.course.split(" ")[0];
				var catalog_number = arrayItem.course.split(" ")[1];

				arrayItem.sections.forEach(function(section) {
					var exam1 = new Exam(subject, catalog_number, section.section,
					 section.day, section.date, section.location, section.start_time, section.end_time, term);
					if (exam1.start_time == "") {
						exam1.start_time = "12:00 AM";
					}
					exams.push(exam1);
				});
			});
			var sortBy = $('#sortSelect')[0].options[$('#sortSelect')[0].selectedIndex].value;

			if (sortBy == "name") {
				exams.sort(function(a,b) {
					var str1 = a.subject+a.catalog_number;
					var str2 = b.subject+b.catalog_number;
					return str1.localeCompare(str2);
				});
			} else { // sort by time

				exams.sort(function(a,b) {
    				var Adt = new Date();
    				var Bdt = new Date();

    				var aDate = a.date.split('-');
    				Adt.setYear(aDate[0]);
    				Adt.setMonth(aDate[1]);
    				Adt.setDate(aDate[2]);

    				var bDate = b.date.split('-');
    				Bdt.setYear(bDate[0]);
    				Bdt.setMonth(bDate[1]);
    				Bdt.setDate(bDate[2]);

					var time = a.start_time;

    				var hours = Number(time.match(/^(\d+)/)[1]);
    				var minutes = Number(time.match(/:(\d+)/)[1]);
    				var AMPM = time.match(/\s(.*)$/)[1];
    				if (AMPM == "PM" && hours < 12) hours = hours + 12;
    				if (AMPM == "AM" && hours == 12) hours = hours - 12;
    				var aHours = hours.toString();
    				var aMinutes = minutes.toString();
    				var aNewTime = aHours+aMinutes;
					

					var time = b.start_time;
    				var hours = Number(time.match(/^(\d+)/)[1]);
    				var minutes = Number(time.match(/:(\d+)/)[1]);
    				var AMPM = time.match(/\s(.*)$/)[1];
    				if (AMPM == "PM" && hours < 12) hours = hours + 12;
    				if (AMPM == "AM" && hours == 12) hours = hours - 12;
    				var bHours = hours.toString();
    				var bMinutes = minutes.toString();
    				var bNewTime = bHours+bMinutes;
    
    				Adt.setHours(aHours, aMinutes, 0, 0);

    				Bdt.setHours(bHours, bMinutes, 0, 0);

    				if (Adt.getTime() > Bdt.getTime()) {
        				return 1;
    				} else if (Adt.getTime() < Bdt.getTime()) {
        				return -1;
    				} else {
      					return  0;
    				}
				});
			}

			that.notify(exams);

		}

		};
		}

        // You can add attributes / functions here to store the data

		// Call this function to retrieve data from a UW API endpoint
        loadExams() {
			let spinner = document.getElementById('loadingSpinner');
			spinner.style.display = "block";
			let examList = document.getElementById('exam-list');
			examList.style.display = "none";

			let callback = this.makeCallback(termSelect.options[termSelect.selectedIndex].value);
			this.globalCallback = callback;

			$.getJSON("https://api.uwaterloo.ca/v2/terms/"+termSelect.options[termSelect.selectedIndex].value+"/examschedule.json?key=" + apiKey,
			callback);
        }
		
		// Add observer functionality to AppModel objects:
		
		// Add an observer to the list
		addObserver(observer) {
            this._observers.push(observer);
            observer.updateView(this);
        }
		
		// Notify all the observers on the list
		notify(examlist) {
            _.forEach(this._observers, function(obs) {
                obs.updateView(this, examlist);
            });
        }

        populateTermSelect() {
        	var that = this;
    		let select = document.getElementById('termSelect');

			$.getJSON("https://api.uwaterloo.ca/v2/terms/list.json?key=" + apiKey,
			function (d) {
				var obj = JSON.parse(JSON.stringify(d));

				var opt = document.createElement('option');
    			opt.value = obj.data.previous_term;
    			opt.innerHTML = obj.data.previous_term;
    			select.appendChild(opt);

				var opt = document.createElement('option');
    			opt.value = obj.data.current_term;
    			opt.selected = true;
    			opt.innerHTML = obj.data.current_term;
    			select.appendChild(opt);

    			var opt = document.createElement('option');
    			opt.value = obj.data.next_term;
    			opt.innerHTML = obj.data.next_term;
    			select.appendChild(opt);

    			var button = document.getElementById('loadExamsButton');
				button.style.backgroundColor = '#4CAF50';
				button.disabled = false;

			});
		}
    }

    /*
     * A view class.
     * model:  the model we're observing
     * div:  the HTML div where the content goes
     */
    class AppView {
		constructor(model, div) {
			this.model = model;
			this.div = div;
			model.addObserver(this); // Add this View as an Observer
		}
		
        updateView(obs, exams) {
        	var that = this;
			var courseForm = document.getElementById('courseForm')
			var course = courseForm.course.value.toUpperCase();;
			course = course.replace(/ /g,''); // get rid of whitespace

			var numberForm = document.getElementById('numberForm')
			var number = numberForm.number.value;
			number = number.replace(/ /g, '');

			var daySelect = document.getElementById('daySelect')
			var day = daySelect.options[daySelect.selectedIndex].value;

			if (exams != null) {
        	$("#exam-list").empty();

			exams.forEach(function(exam) {

				if (((exam.date !== "" && 
					(new Date(exam.date) > new Date("1969-12-31")) &&
					(exam.subject == course || course === "") &&
					(exam.catalog_number == number || number === "") &&
					(exam.day == day || day === "all")))) {
						var tableRow = document.createElement('div');
						tableRow.setAttribute('class', 'table-row');

						$(tableRow).append("<div class='text'>"+exam.subject+exam.catalog_number+"</div>");
						$(tableRow).append("<div class='text'>"+"Section "+exam.section+"</div>");
						$(tableRow).append("<div class='text'>"+exam.day+"</div>");
						$(tableRow).append("<div class='text'>"+exam.date+"</div>");
						$(tableRow).append("<div class='text'>"+exam.start_time+"-"+exam.end_time+"</div>");
						$(tableRow).append("<div class='text'>"+exam.location+"</div>");

						$("#exam-list").append(tableRow);
				}
			});

			if ($('#exam-list').is(':empty')) {
				// add something to div
				var emptyText = document.createElement('p');
				emptyText.setAttribute('class', 'table-row-no-border');
				$(emptyText).append("Oops! Nothing was found. Make sure the exam schedule is out for the term you are looking at, or you typed in the course correctly.");
				$("#exam-list").append(emptyText);
			}
			}
			
        };        
    }

	/*
		Function that will be called to start the app.
		Complete it with any additional initialization.
	*/
    exports.startApp = function() {
        var model = new AppModel();

    	$('#loadExamsButton').click(function() {
			model.loadExams();
		});

        var view = new AppView(model, "div#exam-list");
		model.populateTermSelect();

    }

})(window);
