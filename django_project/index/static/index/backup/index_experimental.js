var submit_count = 0;
var login = false;
var username = false;

var course_number = -1;
var course_name = "";
var course_obj = [];
var assignment_obj = [];

function key_down()
{
	var key = event.key;

	if(key == 'Enter') // 'enter' key
	{
		event.preventDefault();

		if(!login)
		{
			login_clicked();
		}
	}
	else if(key == 'Tab') // 'tab' key
	{
		event.preventDefault();

		// should be modified
		if(!login)
		{
			document.getElementById("login_password_textbox").focus();
		}
	}
}

function login_clicked()
{
	close_login_menu();

	open_main_menu();
}

function key_up()
{
	// do nothing currently
}

function check_login()
{
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'check_student_login',
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'no') // not logged in
			{
				// let password field show
				$('#login').css({
					'visibility': 'visible'
				});
				var new_string = "Welcome to KMA CES(Code Evaluation System). Enter your ID and password to login.";
				$('#information').html(new_string);
			}
			else if(data.message == 'yes') // logged in
			{
				// close login menu
				close_login_menu();

				// open main menu
				open_main_menu();
			}
			else // unexpected message
			{
				alert("Unexpected message: " + data.message);
			}
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			alert(jqXHR.responseText);
		}
	});
}

function close_login_menu()
{
	$('#welcome_board').animate({
		'top': '-100%'
	}, 200);
}

function open_main_menu()
{
	// course_button_bg
	var bg_div = document.createElement('div');
	$(bg_div).addClass("course_button_bg")
		.appendTo("#course_field");

	// button
	var button_div = document.createElement('div');
	$(button_div).addClass("button")
		.attr('index', 1)
		.attr('course_name', 'Python Programming')
		.click(function()
		{
			course_selected(this);
		})
		.appendTo(bg_div);

	// button text
	var text_div = document.createElement('div');
	$(text_div).addClass("course_button_text")
		.html('Python Programming')
		.appendTo(bg_div);

	// register the course objects
	course_obj.push(bg_div);

	$('#main_menu').css({
		'top': '100%',
		'visibility': 'visible'
	});
	$('#main_menu').animate({
		'top': '10%'
	}, 200);
}

function logout_clicked()
{
	// send an ajax message containing logout signal 
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'student_logout',
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // logout successful
			{
				// initialize the welcome board
				var new_string = "Welcome to KMA CES(Code Evaluation System). Enter your ID and password to login.";
				$('#information').text(new_string);
				$('#information').css({'color': 'white'});
				$('#login').css({'visibility': 'visible'});
				$('#login_id_textbox').val('');
				$('#login_password_textbox').val('');

				$('#welcome_board').animate({
					'top': '10%'
				}, 200);

				$('#main_menu').animate({
					'top': '100%'
				}, 200);

				// mark as not logged
				login = false;
			}
			else // unexpected message
			{
				alert("Unexpected message: " + data.message);
			}
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			alert(jqXHR.responseText);
		}
	});
}

function show_score(obj, cur, target)
{
	// set text
	var text = cur.toString() + "/100";
	$(obj).text(text);

	// set color
	var r = 200 - cur;
	var g = 100 + cur;
	var b = 100;
	var color_text = "rgb(" + r.toString() + ", " + g.toString() + ", " + b.toString() + ")";
	$(obj).css("color", color_text);

	// register new thing
	if(cur < target)
	{
		setTimeout(
		function()
		{
			show_score(obj, cur + 1, target);
		},
		15);
	}
}

function course_selected(this_button)
{
	// set course variable
	course_number = 1;
	course_name = 'Python Programming';

	// open panel
	$('#main_menu').animate(
	{
		'top': '-100%'
	},
	{
		complete: function()
		{
			open_panel();
		}
	},
	200); // duration
}

function open_panel()
{
	// course name
	$('#course').html(course_name);

	// animate open panel
	$('#panel').animate(
	{
		'top': '0%'
	},
	200);

	// open assign menu
	$('#assign_body').css({
		"position": 'relative'
	});

	$('#assign_body').animate(
	{
		'top': '0%'
	},
	200);

	// delete existing assignment objects
	for(var i = 0; i < assignment_obj.length; i++)
	{
		assignment_obj[i].remove();
	}
	assignment_obj = [];

	// create div and span elements and connect those
	var assign_bg = document.createElement('div');
	$(assign_bg).attr('id', 1)
		.attr('index', 1)
		.addClass("assign_bg")
		.appendTo("#assign_body");

	var assign_name = document.createElement('div');
	$(assign_name).addClass("assign_name")
		.html("Assignment 1. Addition of absolute values")
		.appendTo(assign_bg);

	var assign_due = document.createElement('div');
	$(assign_due).addClass("assign_due")
		.html("Due: ")
		.appendTo(assign_bg);

	var due_date = document.createElement("span");
	$(due_date).addClass("due_date")
		.html("18.3.13 ")
		.appendTo(assign_due);

	var due_time = document.createElement("span");
	$(due_time).addClass("due_time")
		.html("23:59")
		.appendTo(assign_due);

	var file_container = document.createElement("div");
	$(file_container).addClass("file_container")
		.appendTo(assign_bg);

	var src_container = document.createElement("div");
	$(src_container).addClass("src_container")
		.addClass("drop_box")
		.appendTo(file_container)
		.on('drag dragstart dragend dragover dragenter dragleave drop', function(e)
			{
				e.preventDefault();
				e.stopPropagation();
			})
		.on('dragover dragenter', function(e)
			{
				$(this).addClass('file_dragged');
			})
		.on('dragleave dragend drop', function(e)
			{
				$(this).removeClass('file_dragged');
			})
		.on('drop', function(e)
			{
				// deal with the attaching file
				var dropped_files = e.originalEvent.dataTransfer.files;
				var new_string = dropped_files[0].name;

				$(this).children(".file_lists").html(new_string);

				$(this).parent().parent().children(".score_board").html('Submission is being graded. Wait for a second...')
				var obj = $(this).parent().parent().children(".score_board").get(0);

				var the_this = $(this);

				// wait for a second
				setTimeout(
				function()
				{
					if(submit_count == 0)
					{
						show_score(obj, 0, 20);
						submit_count++;
					}
					else if(submit_count == 1)
					{
						show_score(obj, 0, 50);
						submit_count++;
					}
					else
					{
						show_score(obj, 0, 100);
					}
				},
				1000);
			});

	var file_label = document.createElement("div");
	$(file_label).addClass("file_label")
		.html("Submit file")
		.appendTo(src_container);

	var file_lists = document.createElement("div");
	$(file_lists).addClass("file_lists")
		.appendTo(src_container);

	var score_board = document.createElement("div");
	$(score_board).addClass("score_board")
		.html("Not submitted")
		.appendTo(assign_bg);

	// register the assignment objects
	assignment_obj.push(assign_bg);
}

function main_clicked()
{
	// close panel and open main menu
	$('#panel').animate(
	{
		'top': '-100%'
	},
	{
		complete: function()
		{
			open_main_menu();
		}
	},
	200);

	$('#assign_body').animate(
	{
		'top': '100%'
	},
	200);

	course_name = "";
	course_number = -1;
}

$(document).ready(function()
{
	check_login();
});
