var login = false;

// view control
var top_view = new Object();
top_view.name = "main";
top_view.depth = 0;
top_view.margin = 3;
top_view.prev = null;
top_view.bg = null;
top_view.elem = null;

// textbox control
var textbox_focused = null;

// button toggle/selection controls

var NEW_COURSE = new Object();
NEW_COURSE.name_textbox = null;
NEW_COURSE.name_info = null;
NEW_COURSE.buttons = new Array();
NEW_COURSE.language = "";

var COURSE_MENU = new Object();
COURSE_MENU.buttons = new Array();
COURSE_MENU.objs = new Array();

// password textbox for login
var login_textbox = new Object();
login_textbox.name = "login_textbox";
login_textbox.prev = null;
login_textbox.next = null;

var PANELS = new Object();
PANELS.course_id = -1;
PANELS.course_name = "none";
PANELS.menu = "assign";
PANELS.language = "none";
PANELS.classes = new Array();
PANELS.class_lines = new Array();

var CHANGE_COURSE_NAME = new Object();
CHANGE_COURSE_NAME.name_textbox = null;
CHANGE_COURSE_NAME.name_info = null;

var NEW_CLASS = new Object();
NEW_CLASS.name_textbox = null;
NEW_CLASS.name_info = null;

var NEW_STUDENT = new Object();
NEW_STUDENT.name_textbox = null;
NEW_STUDENT.name_info = null;

var CLASS_SELECTED = new Object();
CLASS_SELECTED.index = -1;
CLASS_SELECTED.student_list = null;
CLASS_SELECTED.students = new Array();
CLASS_SELECTED.student_lines = new Array();

var NEW_LANGUAGE = new Object();
NEW_LANGUAGE.buttons = new Array();
NEW_LANGUAGE.language = "";

function key_down()
{
	if(top_view.name == "main")
	{
		main_key_down(event);
	}
	else if(top_view.name == "new_course_view")
	{
		new_course_key_down(event);
	}
}

function main_key_down(event)
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
		if(!login)
		{
			document.getElementById("login_textbox").select();
		}
	}
	else if(key == 'Escape')
	{
		event.preventDefault();
		if(login)
		{
			logout_clicked();
		}
	}
}

function new_course_key_down(event)
{
	var key = event.key;

	if(key == 'Enter') // 'enter' key
	{
		event.preventDefault();
		new_course_register_clicked();
	}
	else if(key == 'Tab') // 'tab' key
	{
		event.preventDefault();
	}
	else if(key == 'Escape')
	{
		event.preventDefault();
		close_top_view(null);
	}
}

function key_up()
{
	// do nothing currently
}

function login_focused()
{
	textbox_focused = login_textbox;
}

function login_clicked()
{
	// check if the password is correct with ajax
	var password = $('#login_textbox').val();
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'admin_login',
			'password': password,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'bad') // wrong password
			{
				$('#information').text("Wrong password. Try again.");
				$('#information').css({'color': 'red'});
			}
			else if(data.message == 'good') // correct password
			{
				// close login menu
				close_login_menu();

				// open main menu
				open_main_menu();

				login = true;
			}
			else // unexpected message
			{
				alert("Unexpected message");
			}
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			alert(jqXHR.responseText);
		}
	});
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
			'type': 'check_admin_login',
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'no') // not logged in
			{
				// let password field show
				$('#password').css({
					'visibility': 'visible'
				});
				var new_string = "Welcome to KMA CES(Code Evaluation System). Enter the password to login as an administrator.";
				$('#information').text(new_string);
			}
			else if(data.message == 'yes') // logged in
			{
				// close login menu
				close_login_menu();

				// open main menu
				open_main_menu();

				login = true;
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

function open_login_menu()
{
	// initialize the welcome board
	var new_string = "Welcome to KMA CES(Code Evaluation System). Enter the password to login as an administrator.";
	$('#information').text(new_string);
	$('#information').css({'color': 'white'});
	$('#password').css({'visibility': 'visible'});
	$('#login_textbox').val('');

	// calculate top
	var top = $('body').outerHeight()/2 - $('#welcome_board').outerHeight()/2;
	var top_string = top.toString() + "px";
	$('#welcome_board').animate({
		'top': top_string 
	}, 200);
}

function close_login_menu()
{
	$('#welcome_board').animate({
		'top': '-100%'
	}, 200);
}

function open_main_menu()
{
	// load the list of courses
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'course_list_admin',
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // load successful
			{
				// change the string 'Loading...' to 'Register a new course'
				$('#course_field').children(":first").children(".course_button_text").text("Register a new course");

				// delete existing course objects
				var course_obj = COURSE_MENU.objs;
				for(var i = 0; i < course_obj.length; i++)
				{
					course_obj[i].remove();
				}

				COURSE_MENU.objs = new Array();
				course_obj = COURSE_MENU.objs;

				// initialize the welcome board
				var name_list = data.name_list;
				var id_list = data.id_list;

				for(var i = name_list.length - 1; i >= 0; i--)
				{
					// course_button_bg
					var bg_div = document.createElement('div');
					$(bg_div).addClass("course_button_bg")
						.appendTo("#course_field");

					// button
					var button_div = document.createElement('div');
					$(button_div).addClass("button")
						.attr('index', id_list[i])
						.attr('course_name', name_list[i])
						.click(function()
						{
							course_selected(this);
						})
						.appendTo(bg_div);

					// button text
					var text_div = document.createElement('div');
					$(text_div).addClass("course_button_text")
						.text(name_list[i])
						.appendTo(bg_div);

					// register the course objects
					course_obj.push(bg_div);
				}
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

	$('#main_menu').css({
		'top': '100%',
		'visibility': 'visible'
	});

	$('#main_menu').animate({
		'top': '5%'
	}, 200);
}

function close_main_menu()
{
	$('#main_menu').animate({
		'top': '100%'
	}, 200);
}

function course_selected(this_button)
{
	// set course variable
	PANELS.course_id = $(this_button).attr('index');
	PANELS.course_name = $(this_button).attr('course_name');

	// open panel
	$('#main_menu').animate(
	{
		'top': '-100%'
	},
	200,
	function()
	{
		open_panel();
	});
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
			'type': 'admin_logout',
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // logout successful
			{
				open_login_menu();

				close_main_menu();

				login = false;
			}
			else // unexpected message
			{
				alert("Unexpected message: " + data.message);
			}
		},
		error:function(jqXHR, textStatus, errorThrown)
		{
			alert(jqXHR.responseText);
		}
	});
}

function open_panel()
{
	// course name
	$('#course').text(PANELS.course_name);

	// open the assignment menu as default
	open_assign_body(null);

	// animate open panel
	$('#panel').animate(
	{
		'top': '0%'
	},
	200);

	// ajax to get assignments information
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'assign_information_admin',
			'course_id': PANELS.course_id,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // ajax respond
			{
				// get the main language information
				PANELS.language = data.main_language;
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

function close_panel(callback)
{
	if(PANELS.menu== "assign")
	{
		close_assign_body(null);
	}
	else if(PANELS.menu== "grade")
	{
		close_grade_body(null);
	}
	else // manage is opened
	{
		close_manage_body(null);
	}

	$('#panel').animate(
	{
		'top': '-100%'
	},
	200,
	function()
	{
		if(callback != null)
		{
			callback();
		}
	});
}

function open_assign_body(callback)
{
	// change position to 'relative'
	$('#assign_body').css({'position': 'relative'});

	// animate body
	$('#assign_body').animate(
	{
		'top': '0%'
	},
	200,
	function()
	{
		if(callback != null)
		{
			callback();
		}
	});

	PANELS.menu = 'assign';
	button_on(COURSE_MENU.buttons[0]);
}

function close_assign_body(callback)
{
	// turn off the assign button
	button_off(COURSE_MENU.buttons[0]);

	// animate body
	$('#assign_body').animate(
	{
		'top': '100%'
	},
	200,
	function()
	{
		// change position to 'relative'
		$('#assign_body').css({'position': 'absolute'});

		if(callback != null)
		{
			callback();
		}
	});
}

function open_grade_body(callback)
{
	// change position to 'relative'
	$('#grade_body').css({'position': 'relative'});

	// animate body
	$('#grade_body').animate(
	{
		'top': '0%'
	},
	200,
	function()
	{
		if(callback != null)
		{
			callback();
		}
	});

	PANELS.menu = 'grade';
	button_on(COURSE_MENU.buttons[1]);
}

function close_grade_body(callback)
{
	// turn off the grade button
	button_off(COURSE_MENU.buttons[1]);

	// animate body
	$('#grade_body').animate(
	{
		'top': '100%'
	},
	200,
	function()
	{
		// change position to 'relative'
		$('#grade_body').css({'position': 'absolute'});

		if(callback != null)
		{
			callback();
		}
	});
}

function open_manage_body(callback)
{
	// change position to 'relative'
	$('#manage_body').css({'position': 'relative'});

	// load classes/students information
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'request_classes_information',
			'course_id': PANELS.course_id,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // ajax respond
			{
				// get the classes information and update it
				PANELS.classes = data.classes;
				PANELS.class_lines = new Array();
				$('#class_list').empty();

				for(var i = 0; i < PANELS.classes.length; i++)
				{
					// view line
					var view_line = document.createElement('div');
					$(view_line).addClass("view_line");
					$(view_line).appendTo($('#class_list').get(0));
					PANELS.class_lines.push(view_line);

					// view button
					var view_button = document.createElement('div');
					$(view_button).addClass("view_button");
					$(view_button).text(PANELS.classes[i].name);
					$(view_button).appendTo(view_line);
					$(view_button).attr('index', i);
					$(view_button).click(function()
					{
						class_selected(this);
					});

					// number of students
					var num_students = document.createElement('div');
					$(num_students).addClass("view_text");

					if(PANELS.classes[i].num_students == 1)
					{
						$(num_students).text("1 student");
					}
					else
					{
						$(num_students).text(PANELS.classes[i].num_students.toString() + " students");
					}
					$(num_students).appendTo(view_line);
				}

				if(PANELS.classes.length == 0)
				{
					// view line
					var view_line = document.createElement('div');
					$(view_line).addClass("view_line");
					$(view_line).appendTo($('#class_list').get(0));

					// number of students
					var text = document.createElement('div');
					$(text).addClass("view_text");
					$(text).text("There are no classes registered");
					$(text).appendTo(view_line);
				}
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

	// animate body
	$('#manage_body').animate(
	{
		'top': '0%'
	},
	200,
	function()
	{
		if(callback != null)
		{
			callback();
		}
	});

	PANELS.menu = 'manage';
	button_on(COURSE_MENU.buttons[2]);

	// main language
	$('#main_language_clickable').text(PANELS.language);
}

function close_manage_body(callback)
{
	// turn off the grade button
	button_off(COURSE_MENU.buttons[2]);

	// animate body
	$('#manage_body').animate(
	{
		'top': '100%'
	},
	200,
	function()
	{
		// change position to 'relative'
		$('#manage_body').css({'position': 'absolute'});

		if(callback != null)
		{
			callback();
		}
	});
}

function class_remove_clicked()
{
	var index = CLASS_SELECTED.index;

	var class_name = PANELS.classes[index].name;
	var class_id = PANELS.classes[index].id;

	// configure z-index
	var base_depth = top_view.depth + 2;
	var bg_depth = base_depth - 1;

	// calculate margins
	var cur_margin = top_view.margin + 3;
	var margin_string = cur_margin.toString() + "%";
	var size_string = (100 - 2*cur_margin).toString() + "%";

	// configure background
	var view_bg = new Object();
	view_bg.depth = bg_depth;
	view_bg.elem = document.createElement('div');
	$(view_bg.elem).addClass("view_bg");

	$(view_bg.elem).css({'z-index': view_bg.depth.toString()});
	$(view_bg.elem).css({'opacity': '0.0'});

	// configure a flexible view
	var register_view = new Object();
	register_view.name = "class_remove_view";
	register_view.depth = base_depth;
	register_view.margin = top_view.margin + 3;
	register_view.prev = top_view;
	register_view.bg = view_bg;
	register_view.elem = document.createElement('div');

	$(register_view.elem).addClass("flexible_view");
	$(register_view.elem).css({'left': '100%'}); // locate to left of the screen
	$(register_view.elem).css({'width': size_string});
	$(register_view.elem).css({'z-index': base_depth.toString()});

	var view = register_view.elem;

	// title
	var view_title = document.createElement('div');
	$(view_title).addClass("view_title");
	$(view_title).text("Are you sure to remove the class?");
	$(view_title).appendTo(view);

	// tail of the view
	var view_tail = document.createElement("div");
	$(view_tail).addClass("view_tail");
	$(view_tail).appendTo(view);

	// Remove button for the tail
	var register_button = document.createElement('div');
	$(register_button).addClass("view_button");
	$(register_button).addClass("red_button");
	$(register_button).text("Remove");
	$(register_button).css({'flex-grow': '1'});
	$(register_button).css({'font-size': '25px'});
	$(register_button).css({'margin-right': '5px'});
	$(register_button).appendTo(view_tail);
	$(register_button).click(function()
	{
		class_remove_apply_clicked();
	});

	// Close button for the tail
	var cancel_button = document.createElement('div');
	$(cancel_button).addClass("view_button");
	$(cancel_button).text("Close");
	$(cancel_button).css({'flex-grow': '1'});
	$(cancel_button).css({'font-size': '25px'});
	$(cancel_button).css({'margin-left': '5px'});
	$(cancel_button).appendTo(view_tail);
	$(cancel_button).click(function()
	{
		close_top_view(null);
	});

	// append view to the body
	$(view).appendTo('body');

	// append view background to the body
	$(view_bg.elem).appendTo('body');

	// calculate top of the view
	var top = $('body').outerHeight()/2 - $(view).outerHeight()/2;
	var top_string = top.toString() + "px";
	$(view).css({'top': top_string});

	// animate background
	$(view_bg.elem).animate({
		'opacity': '0.2'
	}, 200);

	// animate view
	$(register_view.elem).animate({
		'left': margin_string
	}, 200);

	top_view = register_view;
}

function course_remove_clicked()
{
	// load the course information
	var course_id = PANELS.course_id;

	// configure z-index
	var base_depth = top_view.depth + 2;
	var bg_depth = base_depth - 1;

	// calculate margins
	var cur_margin = top_view.margin + 3;
	var margin_string = cur_margin.toString() + "%";
	var size_string = (100 - 2*cur_margin).toString() + "%";

	// configure background
	var view_bg = new Object();
	view_bg.depth = bg_depth;
	view_bg.elem = document.createElement('div');
	$(view_bg.elem).addClass("view_bg");

	$(view_bg.elem).css({'z-index': view_bg.depth.toString()});
	$(view_bg.elem).css({'opacity': '0.0'});

	// configure a flexible view
	var register_view = new Object();
	register_view.name = "course_remove_view";
	register_view.depth = base_depth;
	register_view.margin = top_view.margin + 3;
	register_view.prev = top_view;
	register_view.bg = view_bg;
	register_view.elem = document.createElement('div');

	$(register_view.elem).addClass("flexible_view");
	$(register_view.elem).css({'left': '100%'}); // locate to left of the screen
	$(register_view.elem).css({'width': size_string});
	$(register_view.elem).css({'z-index': base_depth.toString()});

	var view = register_view.elem;

	// title
	var view_title = document.createElement('div');
	$(view_title).addClass("view_title");
	$(view_title).text("Are you sure to remove the course?");
	$(view_title).appendTo(view);

	// tail of the view
	var view_tail = document.createElement("div");
	$(view_tail).addClass("view_tail");
	$(view_tail).appendTo(view);

	// Remove button for the tail
	var register_button = document.createElement('div');
	$(register_button).addClass("view_button");
	$(register_button).addClass("red_button");
	$(register_button).text("Remove");
	$(register_button).css({'flex-grow': '1'});
	$(register_button).css({'font-size': '25px'});
	$(register_button).css({'margin-right': '5px'});
	$(register_button).appendTo(view_tail);
	$(register_button).click(function()
	{
		course_remove_apply_clicked();
	});

	// Close button for the tail
	var cancel_button = document.createElement('div');
	$(cancel_button).addClass("view_button");
	$(cancel_button).text("Close");
	$(cancel_button).css({'flex-grow': '1'});
	$(cancel_button).css({'font-size': '25px'});
	$(cancel_button).css({'margin-left': '5px'});
	$(cancel_button).appendTo(view_tail);
	$(cancel_button).click(function()
	{
		close_top_view(null);
	});

	// append view to the body
	$(view).appendTo('body');

	// append view background to the body
	$(view_bg.elem).appendTo('body');

	// calculate top of the view
	var top = $('body').outerHeight()/2 - $(view).outerHeight()/2;
	var top_string = top.toString() + "px";
	$(view).css({'top': top_string});

	// animate background
	$(view_bg.elem).animate({
		'opacity': '0.2'
	}, 200);

	// animate view
	$(register_view.elem).animate({
		'left': margin_string
	}, 200);

	top_view = register_view;
}

function class_remove_apply_clicked()
{
	var class_index = CLASS_SELECTED.index;
	var class_id = PANELS.classes[class_index].id;

	// ajax to remove the class
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'remove_class',
			'class_id': class_id,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			// check the ajax response
			if(data.message != "good")
			{
				alert("Unexpected message: " + data.message);
				return;
			}

			// close the class view and remove view
			close_top_view(close_top_view);

			// delete target class line
			var class_line = PANELS.class_lines[class_index];

			$(class_line).animate(
			{
				'height': '0px'
			},
			200,
			function()
			{
				PANELS.classes.splice(class_index, 1);
				PANELS.class_lines.splice(class_index, 1);
				$(class_line).remove();

				// update 'index' attribute of buttons
				for(var i = class_index; i < PANELS.classes.length; i++)
				{
					$(PANELS.class_lines[i]).children(":first").attr('index', i);
				}
			});
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			alert(jqXHR.responseText);
		}
	});

}

function course_remove_apply_clicked()
{
	var course_id = PANELS.course_id;

	// ajax to remove the class
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'remove_course',
			'course_id': course_id,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			// check the ajax response
			if(data.message != "good")
			{
				alert("Unexpected message: " + data.message);
				return;
			}

			// close the class view and remove view
			close_top_view(null);

			// close the panel
			exit_clicked();
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			alert(jqXHR.responseText);
		}
	});

}

function new_course_language_selected(button)
{
	var index = $(button).attr('index');

	for(var i = 0; i < NEW_COURSE.buttons.length; i++)
	{
		if(i != index)
		{
			view_button_off(NEW_COURSE.buttons[i]);
		}
	}

	// turn on the button
	view_button_on(NEW_COURSE.buttons[index]);

	NEW_COURSE.language = $(NEW_COURSE.buttons[index]).text();
}

function new_main_language_selected(button)
{
	var index = $(button).attr('index');

	for(var i = 0; i < NEW_LANGUAGE.buttons.length; i++)
	{
		if(i != index)
		{
			view_button_off(NEW_LANGUAGE.buttons[i]);
		}
	}

	// turn on the button
	view_button_on(NEW_LANGUAGE.buttons[index]);

	NEW_LANGUAGE.language = $(NEW_LANGUAGE.buttons[index]).text();
}

function new_class_clicked()
{
	// configure z-index
	var base_depth = top_view.depth + 2;
	var bg_depth = base_depth - 1;

	// calculate margins
	var cur_margin = top_view.margin + 3;
	var margin_string = cur_margin.toString() + "%";
	var size_string = (100 - 2*cur_margin).toString() + "%";

	// configure background
	var view_bg = new Object();
	view_bg.depth = bg_depth;
	view_bg.elem = document.createElement('div');
	$(view_bg.elem).addClass("view_bg");

	$(view_bg.elem).css({'z-index': view_bg.depth.toString()});
	$(view_bg.elem).css({'opacity': '0.0'});

	// configure a flexible view
	var register_view = new Object();
	register_view.name = "new_class_view";
	register_view.depth = base_depth;
	register_view.margin = top_view.margin + 3;
	register_view.prev = top_view;
	register_view.bg = view_bg;
	register_view.elem = document.createElement('div');

	$(register_view.elem).addClass("flexible_view");
	$(register_view.elem).css({'left': '100%'}); // locate to left of the screen
	$(register_view.elem).css({'width': size_string});
	$(register_view.elem).css({'z-index': base_depth.toString()});

	var view = register_view.elem;

	// body of the view
	var view_body = document.createElement('div');
	$(view_body).addClass("flexible_view_body");
	$(view_body).appendTo(view);

	// view info
	var name_info = document.createElement('div');
	$(name_info).addClass("view_info");
	$(name_info).text("Enter the name of new class.");
	$(name_info).appendTo(view_body);
	NEW_CLASS.name_info = name_info;

	// textbox for course name
	var name_textbox = document.createElement('input');
	$(name_textbox).addClass('textbox');
	$(name_textbox).attr("placeholder", "Name of the new class");
	$(name_textbox).appendTo(view_body);
	NEW_CLASS.name_textbox = name_textbox;

	// tail of the view
	var view_tail = document.createElement("div");
	$(view_tail).addClass("view_tail");
	$(view_tail).appendTo(view);

	// Register button for the tail
	var register_button = document.createElement('div');
	$(register_button).addClass("view_button");
	$(register_button).text("Register");
	$(register_button).css({'flex-grow': '1'});
	$(register_button).css({'font-size': '25px'});
	$(register_button).css({'margin-right': '5px'});
	$(register_button).appendTo(view_tail);
	$(register_button).click(function()
	{
		new_class_register_clicked();
	});

	// Close button for the tail
	var cancel_button = document.createElement('div');
	$(cancel_button).addClass("view_button");
	$(cancel_button).text("Close");
	$(cancel_button).css({'flex-grow': '1'});
	$(cancel_button).css({'font-size': '25px'});
	$(cancel_button).css({'margin-left': '5px'});
	$(cancel_button).appendTo(view_tail);
	$(cancel_button).click(function()
	{
		close_top_view(null);
	});

	// append view to the body
	$(view).appendTo('body');

	// append view background to the body
	$(view_bg.elem).appendTo('body');

	// calculate top of the view
	var top = $('body').outerHeight()/2 - $(view).outerHeight()/2;
	var top_string = top.toString() + "px";
	$(view).css({'top': top_string});

	// animate background
	$(view_bg.elem).animate({
		'opacity': '0.2'
	}, 200);

	// animate view
	$(register_view.elem).animate({
		'left': margin_string
	}, 200);

	top_view = register_view;
}

function new_student_clicked()
{
	// configure z-index
	var base_depth = top_view.depth + 2;
	var bg_depth = base_depth - 1;

	// calculate margins
	var cur_margin = top_view.margin + 3;
	var margin_string = cur_margin.toString() + "%";
	var size_string = (100 - 2*cur_margin).toString() + "%";

	// configure background
	var view_bg = new Object();
	view_bg.depth = bg_depth;
	view_bg.elem = document.createElement('div');
	$(view_bg.elem).addClass("view_bg");

	$(view_bg.elem).css({'z-index': view_bg.depth.toString()});
	$(view_bg.elem).css({'opacity': '0.0'});

	// configure a flexible view
	var register_view = new Object();
	register_view.name = "new_student_view";
	register_view.depth = base_depth;
	register_view.margin = top_view.margin + 3;
	register_view.prev = top_view;
	register_view.bg = view_bg;
	register_view.elem = document.createElement('div');

	$(register_view.elem).addClass("flexible_view");
	$(register_view.elem).css({'left': '100%'}); // locate to left of the screen
	$(register_view.elem).css({'width': size_string});
	$(register_view.elem).css({'z-index': base_depth.toString()});

	var view = register_view.elem;

	// body of the view
	var view_body = document.createElement('div');
	$(view_body).addClass("flexible_view_body");
	$(view_body).appendTo(view);

	// view info
	var name_info = document.createElement('div');
	$(name_info).addClass("view_info");
	$(name_info).text("Enter the student name.");
	$(name_info).appendTo(view_body);
	NEW_STUDENT.name_info = name_info;

	// textbox for course name
	var name_textbox = document.createElement('input');
	$(name_textbox).addClass('textbox');
	$(name_textbox).attr("placeholder", "Name of the new class");
	$(name_textbox).appendTo(view_body);
	NEW_STUDENT.name_textbox = name_textbox;

	// tail of the view
	var view_tail = document.createElement("div");
	$(view_tail).addClass("view_tail");
	$(view_tail).appendTo(view);

	// Register button for the tail
	var register_button = document.createElement('div');
	$(register_button).addClass("view_button");
	$(register_button).text("Register");
	$(register_button).css({'flex-grow': '1'});
	$(register_button).css({'font-size': '25px'});
	$(register_button).css({'margin-right': '5px'});
	$(register_button).appendTo(view_tail);
	$(register_button).click(function()
	{
		new_student_register_clicked();
	});

	// Close button for the tail
	var cancel_button = document.createElement('div');
	$(cancel_button).addClass("view_button");
	$(cancel_button).text("Close");
	$(cancel_button).css({'flex-grow': '1'});
	$(cancel_button).css({'font-size': '25px'});
	$(cancel_button).css({'margin-left': '5px'});
	$(cancel_button).appendTo(view_tail);
	$(cancel_button).click(function()
	{
		close_top_view(null);
	});

	// append view to the body
	$(view).appendTo('body');

	// append view background to the body
	$(view_bg.elem).appendTo('body');

	// calculate top of the view
	var top = $('body').outerHeight()/2 - $(view).outerHeight()/2;
	var top_string = top.toString() + "px";
	$(view).css({'top': top_string});

	// animate background
	$(view_bg.elem).animate({
		'opacity': '0.2'
	}, 200);

	// animate view
	$(register_view.elem).animate({
		'left': margin_string
	}, 200);

	top_view = register_view;
}

function new_class_register_clicked()
{
	var class_name = $(NEW_CLASS.name_textbox).val();

	// check the length of classes
	if(class_name.length == 0)
	{
		// alarm the zero-length name of the class and return
		$(NEW_CLASS.name_info).text("The class name should contain at least one character");
		$(NEW_CLASS.name_info).css({'color': 'red'});

		setTimeout(
		function()
		{
			// restore the name_info
			$(NEW_CLASS.name_info).text("Enter the name of new class.");
			$(NEW_CLASS.name_info).css({'color': 'white'});
		},
		2000);

		return;
	}
	else if(class_name.length > 50)
	{
		// alarm the zero-length name of the class and return
		$(NEW_CLASS.name_info).text("The maximum length of class name is 50.");
		$(NEW_CLASS.name_info).css({'color': 'red'});

		setTimeout(
		function()
		{
			// restore the name_info
			$(NEW_CLASS.name_info).text("Enter the name of new class.");
			$(NEW_CLASS.name_info).css({'color': 'white'});
		},
		2000);

		return;
	}

	var re = new RegExp("^([{}[\\](),\.a-zA-Z0-9 _-]+)$");

	if(!re.test(class_name)) // invalid input
	{
		$(NEW_CLASS.name_info).text("Class name can contain alphanumerics, space, dot(.), comma(,), underbar(_), dash(-) and parentheses");

		$(NEW_CLASS.name_info).css({'color': 'red'});
		setTimeout(
		function()
		{
			// restore the view_info
			$(NEW_CLASS.name_info).text("Enter the name of new class.");
			$(NEW_CLASS.name_info).css({'color': 'white'});
		},
		2000);

		return;
	}

	// check if it conflicts with existing class
	for(var i = 0; i < PANELS.classes.length; i++)
	{
		if(PANELS.classes[i].name == class_name)
		{
			// alarm the name conflict and return the function
			$(NEW_CLASS.name_info).text("The name you entered already exist.");
			$(NEW_CLASS.name_info).css({'color': 'red'});

			setTimeout(
			function()
			{
				// restore the name_info
				$(NEW_CLASS.name_info).text("Enter the name of new class.");
				$(NEW_CLASS.name_info).css({'color': 'white'});
			},
			2000);
			return;
		}
	}

	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'new_class',
			'class_name': class_name,
			'course_id': PANELS.course_id,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // update successful
			{
				// refresh the classes
				close_top_view(null);

				// find the appropricate index of new class name
				var new_index = 0;
				for(var i = 0; i < PANELS.classes.length; i++)
				{
					if(class_name < PANELS.classes[i].name)
					{
						break;
					}
					else
					{
						new_index++;
					}
				}

				// update the panel class information
				var new_class = new Object();
				new_class.name = class_name;
				new_class.num_students = 0;
				new_class.id= data.class_id;

				PANELS.classes.splice(new_index, 0, new_class);

				// create the class line
				var view_line = document.createElement('div');
				$(view_line).addClass("view_line");
				$(view_line).appendTo($('#field_outside').get(0));

				// view button
				var view_button = document.createElement('div');
				$(view_button).addClass("view_button");
				$(view_button).text(new_class.name);
				$(view_button).appendTo(view_line);
				$(view_button).attr('index', new_index);
				$(view_button).click(function()
				{
					class_selected(this);
				});

				// number of students
				var num_students = document.createElement('div');
				$(num_students).addClass("view_text");
				$(num_students).text("0 students");
				$(num_students).appendTo(view_line);

				// check the height of the class line and detach from the #field_outside
				var height = $(view_line).height();
				var height_string = height.toString() + "px";
				$(view_line).detach();

				// insert it into #class_list and animate
				$(view_line).css({'height': '0px'});
				if(new_index == PANELS.class_lines.length)
				{
					$(view_line).appendTo('#class_list');
				}
				else
				{
					$(PANELS.class_lines[new_index]).before(view_line);
				}

				PANELS.class_lines.splice(new_index, 0, view_line);

				$(view_line).animate({
					'height': height_string
				}, 200);

				// update 'index' attribute of buttons
				for(var i = new_index + 1; i < PANELS.classes.length; i++)
				{
					$(PANELS.class_lines[i]).children(":first").attr('index', i);
				}
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

function new_student_register_clicked()
{
	var student_name = $(NEW_STUDENT.name_textbox).val();
	var class_id = PANELS.classes[CLASS_SELECTED.index].id;

	// check the length of student name
	if(student_name.length == 0)
	{
		// alarm the zero-length name of the student and return
		$(NEW_STUDENT.name_info).text("The class name should contain at least one character");
		$(NEW_STUDENT.name_info).css({'color': 'red'});

		setTimeout(
		function()
		{
			// restore the name_info
			$(NEW_STUDENT.name_info).text("Enter the student name.");
			$(NEW_STUDENT.name_info).css({'color': 'white'});
		},
		2000);

		return;
	}
	else if(student_name.length > 50)
	{
		// alarm the zero-length name of the student and return
		$(NEW_STUDENT.name_info).text("The maximum length of class name is 50.");
		$(NEW_STUDENT.name_info).css({'color': 'red'});

		setTimeout(
		function()
		{
			// restore the name_info
			$(NEW_STUDENT.name_info).text("Enter the student name.");
			$(NEW_STUDENT.name_info).css({'color': 'white'});
		},
		2000);

		return;
	}

	var re = new RegExp("^([a-zA-Z0-9]+)$");

	if(!re.test(student_name)) // invalid input
	{
		$(NEW_STUDENT.name_info).text("Student name can contain only alphanumerics.");

		$(NEW_STUDENT.name_info).css({'color': 'red'});
		setTimeout(
		function()
		{
			// restore the view_info
			$(NEW_STUDENT.name_info).text("Enter the student name.");
			$(NEW_STUDENT.name_info).css({'color': 'white'});
		},
		2000);

		return;
	}

	// check if it conflicts with existing students
	for(var i = 0; i < CLASS_SELECTED.students.length; i++)
	{
		if(CLASS_SELECTED.students[i] == student_name)
		{
			// alarm the name conflict and return the function
			$(NEW_STUDENT.name_info).text("The name you entered already exist.");
			$(NEW_STUDENT.name_info).css({'color': 'red'});

			setTimeout(
			function()
			{
				// restore the name_info
				$(NEW_STUDENT.name_info).text("Enter the name of new class.");
				$(NEW_STUDENT.name_info).css({'color': 'white'});
			},
			2000);
			return;
		}
	}

	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'new_student',
			'student_name': student_name,
			'class_id': PANELS.classes[CLASS_SELECTED.index].id,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // update successful
			{
				// update the student_lines
				close_top_view(null);

				// find the appropricate index of new student name
				var new_index = 0;
				for(var i = 0; i < CLASS_SELECTED.students.length; i++)
				{
					if(student_name < CLASS_SELECTED.students[i])
					{
						break;
					}
					else
					{
						new_index++;
					}
				}

				// update the panel class information
				CLASS_SELECTED.students.splice(new_index, 0, student_name);

				// create the class line
				var view_line = document.createElement('div');
				$(view_line).addClass("view_line");
				$(view_line).appendTo($('#field_outside').get(0));

				// view text for student name
				var view_text = document.createElement('div');
				$(view_text).addClass("view_text")
				$(view_text).text(student_name)
				$(view_text).appendTo(view_line);

				// view button for Delete
				var view_button = document.createElement('div');
				$(view_button).addClass("view_button");
				$(view_button).addClass("red_button");
				$(view_button).text("Delete");
				$(view_button).appendTo(view_line);
				$(view_button).attr('index', new_index);
				$(view_button).click(function()
				{
					student_remove_clicked(this);
				});

				// check the height of the class line and detach from the #field_outside
				var height = $(view_line).height();
				var height_string = height.toString() + "px";
				$(view_line).detach();

				// insert it into student_list and animate
				$(view_line).css({'height': '0px'});
				if(new_index == CLASS_SELECTED.student_lines.length)
				{
					$(view_line).appendTo(CLASS_SELECTED.student_list);
				}
				else
				{
					$(CLASS_SELECTED.student_lines[new_index]).before(view_line);
				}

				CLASS_SELECTED.student_lines.splice(new_index, 0, view_line);

				$(view_line).animate({
					'height': height_string
				}, 200);

				// update 'index' attribute of buttons
				for(var i = new_index + 1; i < CLASS_SELECTED.students.length; i++)
				{
					$(CLASS_SELECTED.student_lines[i]).children(":first").attr('index', i);
				}

				// update num_student value of the class in the manage body
				var new_num= PANELS.classes[CLASS_SELECTED.index].num_students + 1;
				PANELS.classes[CLASS_SELECTED.index].num_students = new_num;

				var new_text = "";
				if(new_num == 1)
				{
					new_text = "1 student";
				}
				else
				{
					new_text = new_num.toString() + " students";
				}
				$(PANELS.class_lines[CLASS_SELECTED.index]).children(":nth-child(2)").text(new_text);
			}
			else if(data.message == 'another_class') // the student is already in a different class in the same course
			{
				// asks if you want to move the student to this class
				abc;
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

function class_selected(the_button)
{
	// load index and course data
	var index = $(the_button).attr('index');
	CLASS_SELECTED.index = index;

	var class_name = PANELS.classes[index].name;
	var class_id = PANELS.classes[index].id;

	// configure z-index
	var base_depth = top_view.depth + 2;
	var bg_depth = base_depth - 1;

	// calculate margins
	var cur_margin = top_view.margin + 3;
	var margin_string = cur_margin.toString() + "%";
	var size_string = (100 - 2*cur_margin).toString() + "%";

	// configure background
	var view_bg = new Object();
	view_bg.depth = bg_depth;
	view_bg.elem = document.createElement('div');
	$(view_bg.elem).addClass("view_bg");

	$(view_bg.elem).css({'z-index': view_bg.depth.toString()});
	$(view_bg.elem).css({'opacity': '0.0'});

	// configure a fixed view
	var register_view = new Object();
	register_view.name = "class_view";
	register_view.depth = base_depth;
	register_view.margin = top_view.margin + 3;
	register_view.prev = top_view;
	register_view.bg = view_bg;
	register_view.elem = document.createElement('div');

	$(register_view.elem).addClass("fixed_view");
	$(register_view.elem).css({'left': '100%'}); // locate to left of the screen
	$(register_view.elem).css({'width': size_string});
	$(register_view.elem).css({'height': 'auto'});
	$(register_view.elem).css({'z-index': base_depth.toString()});

	var view = register_view.elem;

	// title
	var view_title = document.createElement('div');
	$(view_title).addClass("view_title");
	$(view_title).text(class_name);
	$(view_title).appendTo(view);

	// view line for 'register a student'
	var register_line = document.createElement('div');
	$(register_line).addClass("view_line");
	$(register_line).appendTo(view);

	var new_student_button = document.createElement('div');
	$(new_student_button).addClass("view_button");
	$(new_student_button).addClass("green_button");
	$(new_student_button).text("Register a student");
	$(new_student_button).click(function()
	{
		new_student_clicked();
	});
	$(new_student_button).appendTo(register_line);

	// body of the view
	var view_body = document.createElement('div');
	$(view_body).addClass("fixed_view_body");
	$(view_body).appendTo(view);

	// view line class for remove button
	var remove_line = document.createElement('div');
	$(remove_line).addClass("view_line");
	$(remove_line).appendTo(view);

	// remove button
	var remove_button = document.createElement('div');
	$(remove_button).addClass("view_button");
	$(remove_button).addClass("red_button");
	$(remove_button).text("Remove this class");
	$(remove_button).click(function()
	{
		class_remove_clicked();
	});
	$(remove_button).appendTo(remove_line);

	// view line for 'Close'
	var close_line = document.createElement('div');
	$(close_line).addClass("view_line");
	$(close_line).appendTo(view);

	// close button
	var close_button = document.createElement('div');
	$(close_button).addClass("view_button");
	$(close_button).text("Close");
	$(close_button).click(function()
	{
		close_top_view(null);
	});
	$(close_button).appendTo(close_line);

	// append view to the body
	$(view).appendTo('body');

	// append view background to the body
	$(view_bg.elem).appendTo('body');

	top_view = register_view;

	// get student data through ajax
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'request_students_information',
			'class_id': class_id,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // ajax respond
			{
				// get the classes information and update it
				CLASS_SELECTED.students = data.students;

				// div 'student_list'
				var student_list = document.createElement('div');
				$(student_list).appendTo(view_body);
				CLASS_SELECTED.student_list = student_list;

				CLASS_SELECTED.student_lines = new Array();

				for(var i = 0; i < CLASS_SELECTED.students.length; i++)
				{
					// view line
					var view_line = document.createElement('div');
					$(view_line).addClass("view_line");
					$(view_line).appendTo(student_list);
					CLASS_SELECTED.student_lines.push(view_line);

					// view text for student name
					var view_text = document.createElement('div');
					$(view_text).addClass("view_text")
					$(view_text).text(CLASS_SELECTED.students[i])
					$(view_text).appendTo(view_line);

					// view button for Delete
					var view_button = document.createElement('div');
					$(view_button).addClass("view_button");
					$(view_button).addClass("red_button");
					$(view_button).text("Delete");
					$(view_button).appendTo(view_line);
					$(view_button).attr('index', i);
					$(view_button).click(function()
					{
						student_remove_clicked(this);
					});
				}

				if(CLASS_SELECTED.students.length == 0)
				{
					// view line
					var view_line = document.createElement('div');
					$(view_line).addClass("view_line");
					$(view_line).appendTo(student_list);

					// message
					var text = document.createElement('div');
					$(text).addClass("view_text");
					$(text).text("There are no students registered");
					$(text).appendTo(view_line);
				}

				// calculate the height of the view
				var height = $(view).outerHeight();
				var body_height = $('body').outerHeight();

				if(body_height*0.9 < height)
				{
					height = body_height*0.9;
				}

				var height_string = height.toString() + 'px';
				$(view).css({'height': height_string});

				// calculate top of the view
				var top = $('body').outerHeight()/2 - $(view).outerHeight()/2;
				var top_string = top.toString() + "px";
				$(view).css({'top': top_string});

				// animate background
				$(view_bg.elem).animate({
					'opacity': '0.2'
				}, 200);

				// animate view
				$(register_view.elem).animate({
					'left': margin_string
				}, 200);
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

function view_button_on(button)
{
	$(button).removeClass("view_button");
	$(button).addClass("view_button_on");
}

function view_button_off(button)
{
	$(button).removeClass("view_button_on");
	$(button).addClass("view_button");
}

function button_on(button)
{
	$(button).removeClass("button");
	$(button).addClass("button_on");
}

function button_off(button)
{
	$(button).removeClass("button_on");
	$(button).addClass("button");
}

function new_assign_clicked()
{
	abc;
}

function language_change_clicked()
{
	// configure z-index
	var base_depth = top_view.depth + 2;
	var bg_depth = base_depth - 1;

	// calculate margins
	var cur_margin = top_view.margin + 3;
	var margin_string = cur_margin.toString() + "%";
	var size_string = (100 - 2*cur_margin).toString() + "%";

	// configure background
	var view_bg = new Object();
	view_bg.depth = bg_depth;
	view_bg.elem = document.createElement('div');
	$(view_bg.elem).addClass("view_bg");

	$(view_bg.elem).css({'z-index': view_bg.depth.toString()});
	$(view_bg.elem).css({'opacity': '0.0'});

	// configure a flexible view
	var register_view = new Object();
	register_view.name = "language_change_view";
	register_view.depth = base_depth;
	register_view.margin = top_view.margin + 3;
	register_view.prev = top_view;
	register_view.bg = view_bg;
	register_view.elem = document.createElement('div');

	$(register_view.elem).addClass("flexible_view");
	$(register_view.elem).css({'left': '100%'}); // locate to left of the screen
	$(register_view.elem).css({'width': size_string});
	$(register_view.elem).css({'z-index': base_depth.toString()});

	var view = register_view.elem;

	// body of the view
	var view_body = document.createElement('div');
	$(view_body).addClass("flexible_view_body");
	$(view_body).appendTo(view);

	// information of main language
	var language_info = document.createElement('div');
	$(language_info).addClass("view_info");
	$(language_info).text("Select new main language of the course.");
	$(language_info).appendTo(view_body);

	// buttons of the languages
	var java_button = document.createElement('div');
	$(java_button).addClass("view_button");
	$(java_button).text("Java");
	$(java_button).appendTo(view_body);
	$(java_button).attr('index', 0);
	$(java_button).click(function()
	{
		new_main_language_selected(this);
	});

	var python3_button = document.createElement('div');
	$(python3_button).addClass("view_button");
	$(python3_button).text("Python 3");
	$(python3_button).appendTo(view_body);
	$(python3_button).attr('index', 1);
	$(python3_button).click(function()
	{
		new_main_language_selected(this);
	});

	// register buttons
	NEW_LANGUAGE.buttons = new Array();
	NEW_LANGUAGE.buttons.push(java_button);
	NEW_LANGUAGE.buttons.push(python3_button);

	// previous language as default language
	NEW_LANGUAGE.language = PANELS.language;
	for(var i = 0; i < NEW_LANGUAGE.buttons.length; i++)
	{
		if($(NEW_LANGUAGE.buttons[i]).text() == NEW_LANGUAGE.language)
		{
			view_button_on(NEW_LANGUAGE.buttons[i]);
			break;
		}
	}

	// tail of the view
	var view_tail = document.createElement("div");
	$(view_tail).addClass("view_tail");
	$(view_tail).appendTo(view);

	// Apply button for the tail
	var register_button = document.createElement('div');
	$(register_button).addClass("view_button");
	$(register_button).text("Apply");
	$(register_button).css({'flex-grow': '1'});
	$(register_button).css({'font-size': '25px'});
	$(register_button).css({'margin-right': '5px'});
	$(register_button).appendTo(view_tail);
	$(register_button).click(function()
	{
		language_change_apply_clicked();
	});

	// Close button for the tail
	var cancel_button = document.createElement('div');
	$(cancel_button).addClass("view_button");
	$(cancel_button).text("Close");
	$(cancel_button).css({'flex-grow': '1'});
	$(cancel_button).css({'font-size': '25px'});
	$(cancel_button).css({'margin-left': '5px'});
	$(cancel_button).appendTo(view_tail);
	$(cancel_button).click(function()
	{
		close_top_view(null);
	});

	// append background to the body
	$(view).appendTo('body');

	// append view to the body
	$(view_bg.elem).appendTo('body');

	// calculate top of the view
	var top = $('body').outerHeight()/2 - $(view).outerHeight()/2;
	var top_string = top.toString() + "px";
	$(view).css({'top': top_string});

	// animate background
	$(view_bg.elem).animate({
		'opacity': '0.2'
	}, 200);

	// animate view
	$(register_view.elem).animate({
		'left': margin_string
	}, 200);

	top_view = register_view;
}

function language_change_apply_clicked()
{
	var language = NEW_LANGUAGE.language;

	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'new_main_language',
			'new_language': language,
			'course_id': PANELS.course_id,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // update successful
			{
				// apply new main language to the panel
				PANELS.language = language;

				close_top_view(null);

				// refresh the main language
				rewrite_text('#main_language_clickable', language, 25);
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

function assign_clicked()
{
	if(PANELS.menu == "grade")
	{
		// close current menu and open assign menu
		close_grade_body(open_assign_body);
		button_off(COURSE_MENU.buttons[1]);
	}
	else if(PANELS.menu == "manage")
	{
		// close current menu and open assign menu
		close_manage_body(open_assign_body);
		button_off(COURSE_MENU.buttons[2]);
	}

	PANELS.menu = "assign";
	button_on(COURSE_MENU.buttons[0]);
}

function manage_clicked()
{
	if(PANELS.menu == "grade")
	{
		// close current menu and open manage menu
		close_grade_body(open_manage_body);
		button_off(COURSE_MENU.buttons[1]);
	}
	else if(PANELS.menu == "assign")
	{
		// close current menu and open manage menu
		close_assign_body(open_manage_body);
		button_off(COURSE_MENU.buttons[0]);
	}

	PANELS.menu = "manage";
	button_on(COURSE_MENU.buttons[2]);
}

function exit_clicked()
{
	// close panel and open main menu
	$('#panel').animate(
	{
		'top': '-100%'
	},
	200,
	function()
	{
		open_main_menu();
	});

	$('#assign_body').animate(
	{
		'top': '100%'
	},
	200);
	$('#grade_body').animate(
	{
		'top': '100%'
	},
	200);
	$('#manage_body').animate(
	{
		'top': '100%'
	},
	200);

	PANELS.course_name = 'Loading...';
	button_off(COURSE_MENU.buttons[1]);
	button_off(COURSE_MENU.buttons[2]);
}

function new_course_clicked()
{
	// configure z-index
	var base_depth = top_view.depth + 2;
	var bg_depth = base_depth - 1;

	// calculate margins
	var cur_margin = top_view.margin + 3;
	var margin_string = cur_margin.toString() + "%";
	var size_string = (100 - 2*cur_margin).toString() + "%";

	// configure background
	var view_bg = new Object();
	view_bg.depth = bg_depth;
	view_bg.elem = document.createElement('div');
	$(view_bg.elem).addClass("view_bg");

	$(view_bg.elem).css({'z-index': view_bg.depth.toString()});
	$(view_bg.elem).css({'opacity': '0.0'});

	// configure a flexible view
	var register_view = new Object();
	register_view.name = "new_course_view";
	register_view.depth = base_depth;
	register_view.margin = top_view.margin + 3;
	register_view.prev = top_view;
	register_view.bg = view_bg;
	register_view.elem = document.createElement('div');

	$(register_view.elem).addClass("flexible_view");
	$(register_view.elem).css({'left': '100%'}); // locate to left of the screen
	$(register_view.elem).css({'width': size_string});
	$(register_view.elem).css({'z-index': base_depth.toString()});

	var view = register_view.elem;

	// title
	var view_title = document.createElement('div');
	$(view_title).addClass("view_title");
	$(view_title).text("Register a new course");
	$(view_title).appendTo(view);

	// body of the view
	var view_body = document.createElement('div');
	$(view_body).addClass("flexible_view_body");
	$(view_body).appendTo(view);

	// information of course name
	var name_info = document.createElement('div');
	$(name_info).addClass("view_info");
	$(name_info).text("Enter the name of new course.");
	$(name_info).appendTo(view_body);
	NEW_COURSE.name_info = name_info;

	// textbox for course name
	var name_textbox = document.createElement('input');
	$(name_textbox).addClass('textbox');
	$(name_textbox).attr("placeholder", "Name of the course");
	$(name_textbox).appendTo(view_body);
	NEW_COURSE.name_textbox = name_textbox;

	// information of main language
	var language_info = document.createElement('div');
	$(language_info).addClass("view_info");
	$(language_info).text("Select a main language of the course.");
	$(language_info).appendTo(view_body);

	// buttons of the languages
	var java_button = document.createElement('div');
	$(java_button).addClass("view_button");
	$(java_button).text("Java");
	$(java_button).appendTo(view_body);
	$(java_button).attr('index', 0);
	$(java_button).click(function()
	{
		new_course_language_selected(this);
	});

	var python3_button = document.createElement('div');
	$(python3_button).addClass("view_button");
	$(python3_button).text("Python 3");
	$(python3_button).appendTo(view_body);
	$(python3_button).attr('index', 1);
	$(python3_button).click(function()
	{
		new_course_language_selected(this);
	});

	// register buttons
	NEW_COURSE.buttons = new Array();
	NEW_COURSE.buttons.push(java_button);
	NEW_COURSE.buttons.push(python3_button);

	// first language as default language
	NEW_COURSE.language = $(NEW_COURSE.buttons[0]).text();
	view_button_on(NEW_COURSE.buttons[0]);

	// tail of the view
	var view_tail = document.createElement("div");
	$(view_tail).addClass("view_tail");
	$(view_tail).appendTo(view);

	// Register button for the tail
	var register_button = document.createElement('div');
	$(register_button).addClass("view_button");
	$(register_button).text("Register");
	$(register_button).css({'flex-grow': '1'});
	$(register_button).css({'font-size': '25px'});
	$(register_button).css({'margin-right': '5px'});
	$(register_button).appendTo(view_tail);
	$(register_button).click(function()
	{
		new_course_register_clicked();
	});

	// Close button for the tail
	var cancel_button = document.createElement('div');
	$(cancel_button).addClass("view_button");
	$(cancel_button).text("Close");
	$(cancel_button).css({'flex-grow': '1'});
	$(cancel_button).css({'font-size': '25px'});
	$(cancel_button).css({'margin-left': '5px'});
	$(cancel_button).appendTo(view_tail);
	$(cancel_button).click(function()
	{
		close_top_view(null);
	});

	// append background to the body
	$(view).appendTo('body');

	// append view to the body
	$(view_bg.elem).appendTo('body');

	// calculate top of the view
	var top = $('body').outerHeight()/2 - $(view).outerHeight()/2;
	var top_string = top.toString() + "px";
	$(view).css({'top': top_string});

	// animate background
	$(view_bg.elem).animate({
		'opacity': '0.2'
	}, 200);

	// animate view
	$(register_view.elem).animate({
		'left': margin_string
	}, 200);

	top_view = register_view;
}

function close_top_view(callback)
{
	var view = top_view.elem;
	var view_bg = top_view.bg.elem;

	// animate view
	$(view).animate({
		'left': '100%'
	}, 200);

	// animate bg
	$(view_bg).animate({
		'opacity': '0.0'
	},
	200,
	function()
	{
		// detach view and view_bg from the body
		$(view).remove();
		$(view_bg).remove();

		// update the top_view to the prev of current view
		top_view = top_view.prev;

		if(callback != null)
		{
			callback();
		}
	});
}

function new_course_register_clicked()
{
	var text = $(NEW_COURSE.name_textbox).val();

	// check validity of the course name
	if(!text_length_check(text, 50))
	{
		if(text.length == 0)
		{
			$(NEW_COURSE.name_info).text("The course name should contain at least one character");
		}
		else if(text.length > 50)
		{
			$(NEW_COURSE.name_info).text("The maximum length of course name is 50.");
		}

		$(NEW_COURSE.name_info).css({'color': 'red'});
		setTimeout(
		function()
		{
			// restore the name_info
			$(NEW_COURSE.name_info).text("Enter the name of new course.");
			$(NEW_COURSE.name_info).css({'color': 'white'});
		},
		2000);

		return;
	}

	// check if it only contains alphanumerics and spaces and '_', '-'
	var re = new RegExp("^([{}[\\](),\.a-zA-Z0-9 _-]+)$");

	if(!re.test(text)) // invalid input
	{
		$(NEW_COURSE.name_info).text("Course name can contain alphanumerics, space, dot(.), comma(,), underbar(_), dash(-) and parentheses");

		$(NEW_COURSE.name_info).css({'color': 'red'});
		setTimeout(
		function()
		{
			// restore the name_info
			$(NEW_COURSE.name_info).text("Enter the name of new course.");
			$(NEW_COURSE.name_info).css({'color': 'white'});
		},
		2000);
	}
	else
	{
		// register the course and refreseh the main page
		var input_name = $(NEW_COURSE.name_textbox).val();
		var input_language = NEW_COURSE.language;
		new_course_register(input_name, input_language);
	}

}

function course_name_clicked()
{
	// configure z-index
	var base_depth = top_view.depth + 2;
	var bg_depth = base_depth - 1;

	// calculate margins
	var cur_margin = top_view.margin + 3;
	var margin_string = cur_margin.toString() + "%";
	var size_string = (100 - 2*cur_margin).toString() + "%";

	// configure background
	var view_bg = new Object();
	view_bg.depth = bg_depth;
	view_bg.elem = document.createElement('div');
	$(view_bg.elem).addClass("view_bg");

	$(view_bg.elem).css({'z-index': view_bg.depth.toString()});
	$(view_bg.elem).css({'opacity': '0.0'});

	// configure a flexible view
	var register_view = new Object();
	register_view.name = "course_name_change_view";
	register_view.depth = base_depth;
	register_view.margin = top_view.margin + 3;
	register_view.prev = top_view;
	register_view.bg = view_bg;
	register_view.elem = document.createElement('div');

	$(register_view.elem).addClass("flexible_view");
	$(register_view.elem).css({'left': '100%'}); // locate to left of the screen
	$(register_view.elem).css({'width': size_string});
	$(register_view.elem).css({'z-index': base_depth.toString()});

	var view = register_view.elem;

	// body of the view
	var view_body = document.createElement('div');
	$(view_body).addClass("flexible_view_body");
	$(view_body).appendTo(view);

	// view info
	var name_info = document.createElement('div');
	$(name_info).addClass("view_info");
	$(name_info).text("Enter new course name.");
	$(name_info).appendTo(view_body);
	CHANGE_COURSE_NAME.name_info = name_info;

	// textbox for course name
	var name_textbox = document.createElement('input');
	$(name_textbox).addClass('textbox');
	$(name_textbox).attr("placeholder", "New name of the course");
	$(name_textbox).appendTo(view_body);
	CHANGE_COURSE_NAME.name_textbox = name_textbox;

	// tail of the view
	var view_tail = document.createElement("div");
	$(view_tail).addClass("view_tail");
	$(view_tail).appendTo(view);

	// Apply button for the tail
	var register_button = document.createElement('div');
	$(register_button).addClass("view_button");
	$(register_button).text("Apply");
	$(register_button).css({'flex-grow': '1'});
	$(register_button).css({'font-size': '25px'});
	$(register_button).css({'margin-right': '5px'});
	$(register_button).appendTo(view_tail);
	$(register_button).click(function()
	{
		course_name_apply_clicked();
	});

	// Close button for the tail
	var cancel_button = document.createElement('div');
	$(cancel_button).addClass("view_button");
	$(cancel_button).text("Close");
	$(cancel_button).css({'flex-grow': '1'});
	$(cancel_button).css({'font-size': '25px'});
	$(cancel_button).css({'margin-left': '5px'});
	$(cancel_button).appendTo(view_tail);
	$(cancel_button).click(function()
	{
		close_top_view(null);
	});

	// append background to the body
	$(view).appendTo('body');

	// append view to the body
	$(view_bg.elem).appendTo('body');

	// calculate top of the view
	var top = $('body').outerHeight()/2 - $(view).outerHeight()/2;
	var top_string = top.toString() + "px";
	$(view).css({'top': top_string});

	// animate background
	$(view_bg.elem).animate({
		'opacity': '0.2'
	}, 200);

	// animate view
	$(register_view.elem).animate({
		'left': margin_string
	}, 200);

	top_view = register_view;
}

function course_name_apply_clicked()
{
	var text = $(CHANGE_COURSE_NAME.name_textbox).val();

	// check validity of the course name
	if(!text_length_check(text, 50))
	{
		if(text.length == 0)
		{
			$(CHANGE_COURSE_NAME.name_info).text("The course name should contain at least one character");
		}
		else if(text.length > 50)
		{
			$(CHANGE_COURSE_NAME.name_info).text("The maximum length of course name is 50.");
		}

		$(CHANGE_COURSE_NAME.name_info).css({'color': 'red'});
		setTimeout(
		function()
		{
			// restore the name_info
			$(CHANGE_COURSE_NAME.name_info).text("Enter the name of new course.");
			$(CHANGE_COURSE_NAME.name_info).css({'color': 'white'});
		},
		2000);

		return;
	}

	// check if it only contains alphanumerics and spaces and '_', '-'
	var re = new RegExp("^([{}[\\](),\.a-zA-Z0-9 _-]+)$");

	if(!re.test(text)) // invalid input
	{
		$(CHANGE_COURSE_NAME.name_info).text("Course name can contain alphanumerics, space, dot(.), comma(,), underbar(_), dash(-) and parentheses");

		$(CHANGE_COURSE_NAME.name_info).css({'color': 'red'});
		setTimeout(
		function()
		{
			// restore the view_info
			$(CHANGE_COURSE_NAME.name_info).text("Enter the name of new course.");
			$(CHANGE_COURSE_NAME.name_info).css({'color': 'white'});
		},
		2000);
	}
	else
	{
		// register the course and refreseh the main page
		var input_name = $(CHANGE_COURSE_NAME.name_textbox).val();
		change_course_name(input_name);
	}
}

function text_length_check(text, max)
{
	if(text.length > max || text.length == 0)
	{
		return false;
	}
	else
	{
		return true;
	}
}

function new_course_register(course_name, main_language)
{
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'new_course',
			'course_name': course_name,
			'main_language': main_language,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // update successful
			{
				close_top_view(null);

				$('#main_menu').animate({
					'top': '100%'
				},
				200,
				function()
				{
					open_main_menu();
				});
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

function change_course_name(new_name)
{
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'change_course_name',
			'course_name': new_name,
			'course_id': PANELS.course_id,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // update successful
			{
				// apply new name to the panel
				PANELS.course_name = new_name;

				close_top_view(null);

				// refresh the top
				rewrite_text('#course', new_name, 15);
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

function rewrite_text(target, input, duration)
{
	erase_down(target, input, duration);
}

function erase_down(target, input, duration) // duration as milliseconds
{
	var cur = $(target).text();
	var next = cur.substring(0, cur.length - 1);
	$(target).text(next);

	if(next.length == 0)
	{
		setTimeout
		(
			function()
			{
				write_up(target, 1, input, duration);
			},
			duration
		);
	}
	else // positive length
	{
		setTimeout
		(
			function()
			{
				erase_down(target, input, duration);
			},
			duration
		);
	}
}

function write_up(target, index, input, duration) // duration as milliseconds
{
	var cur = input.substring(0, index);
	$(target).text(cur);

	if(cur.length < input.length)
	{
		setTimeout
		(
			function()
			{
				write_up(target, index + 1, input, duration);
			},
			duration
		);
	}
}

$(document).ready(function()
{
	// adjust the position of the welcome_board(login panel)
	var top = $('body').outerHeight()/2 - $('#welcome_board').outerHeight()/2;
	var top_string = top.toString() + "px";

	COURSE_MENU.buttons.push($('#assign_button').get(0));
	COURSE_MENU.buttons.push($('#grade_button').get(0));
	COURSE_MENU.buttons.push($('#manage_button').get(0));

	$('#welcome_board').css({'top': top_string});

	$(".drag_box").on('drag dragstart dragend dragover dragenter dragleave drop', function(e)
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
			var new_string = "";
			for(var i = 0; i < dropped_files.length; i++)
			{
				new_string += dropped_files[i].name;
				new_string += "<br>";
			}

			$(this).children(".file_lists").text(new_string);

			// extract assignment number
			var assign_number = parseInt($(this).parent().parent().attr('id').split("_")[1]);

			// check if the type is source file or list input files
			var upload_type = "";

			if($(this).attr('class').split(" ")[0] == "src_container") // it is source file
			{
				upload_type = "source_file";
			}
			else // it is input file
			{
				upload_type = "input_file";
			}

			// file upload with ajax
			var file_data = new FormData();
			file_data.append("type", 'file_upload');
			file_data.append("upload_type", upload_type);

			// append all file
			for(var i = 0; i < dropped_files.length; i++)
			{
				file_data.append(dropped_files[i].name, dropped_files[i]);
			}

			file_data.append("csrfmiddlewaretoken", csrf_token);

			$.ajax
			({
				type: 'post',
				url: '/admin/',
				dataType: 'json',
				cache: false,
				processData: false,
				contentType: false,
				enctype: "multipart/form-data",

				data: file_data,
				success:function(data)
				{
					alert("Succeeded file upload! Message: " + data.message);
				},
				error:function(jqXHR, textStatus, errorThrown)
				{
					alert(jqXHR.responseText);
				}
			});
		});
	check_login();
});
