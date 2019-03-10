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
	// check if the password is correct with ajax
	var id = $('#login_id_textbox').val();
	var password = $('#login_password_textbox').val();
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'student_login',
			'id': id,
			'password': password,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'bad') // wrong password
			{
				$('#information').text("Wrong ID or password. Try again.");
				$('#information').css({'color': 'red'});
			}
			else if(data.message == 'good') // correct password
			{
				// close login menu
				close_login_menu();

				// mark as loggged
				login = true;

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
	// load the list of courses
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'course_list_student',
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // load successful
			{
				// delete existing course objects
				for(var i = 0; i < course_obj.length; i++)
				{
					course_obj[i].remove();
				}
				course_obj = [];

				// initialize the welcome board
				var name_list = data.name_list;
				var id_list = data.id_list;
				for(var i = 0; i < name_list.length; i++)
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
						.html(name_list[i])
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

function course_selected(this_button)
{
	// set course variable
	course_number = $(this_button).attr('index');
	course_name = $(this_button).attr('course_name');

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

	// ajax to get assignments information
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'assign_information_student',
			'course_number': course_number,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // logout successful
			{
				// delete existing assignment objects
				for(var i = 0; i < assignment_obj.length; i++)
				{
					assignment_obj[i].remove();
				}
				assignment_obj = [];

				var due_date_list = data.due_date_list;
				var due_time_list = data.due_time_list;
				var name_list = data.assign_list;
				var score_list = data.score_list;
				var id_list = data.id_list;
				var file_list = data.file_list;

				for(var i = 0; i < name_list.length; i++)
				{
					var id_str = "assign_" + id_list[i];

					// create div and span elements and connect those
					var assign_bg = document.createElement('div');
					$(assign_bg).attr('id', id_str)
						.attr('index', id_list[i])
						.addClass("assign_bg")
						.appendTo("#assign_body");

					var assign_name = document.createElement('div');
					$(assign_name).addClass("assign_name")
						.html(name_list[i])
						.appendTo(assign_bg);

					var assign_due = document.createElement('div');
					$(assign_due).addClass("assign_due")
						.html("Due: ")
						.appendTo(assign_bg);

					var due_date = document.createElement("span");
					$(due_date).addClass("due_date")
						.html(due_date_list[i] + " ")
						.appendTo(assign_due);

					var due_time = document.createElement("span");
					$(due_time).addClass("due_time")
						.html(due_time_list[i])
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

								// extract assignment id
								var assign_id = parseInt($(this).parent().parent().attr('index'));

								// check if the type is source file or list input files
								var upload_type = "";

								// file upload with ajax
								var file_data = new FormData();
								file_data.append("type", 'file_submission');
								file_data.append("assign_id", assign_id);
								file_data.append("course_number", course_number);

								// append only the first file
								file_data.append(dropped_files[0].name, dropped_files[0]);

								file_data.append("csrfmiddlewaretoken", csrf_token);

								$(this).parent().parent().children(".score_board").html('Submission is being graded. Wait for a second...')

								var the_this = $(this);

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
										$(the_this).parent().parent().children(".score_board").html(data.score);
									},
									error:function(jqXHR, textStatus, errorThrown)
									{
										alert(jqXHR.responseText);
									}
								});

							});

					var file_label = document.createElement("div");
					$(file_label).addClass("file_label")
						.html("Submit file")
						.appendTo(src_container);

					var file_lists = document.createElement("div");
					$(file_lists).addClass("file_lists")
						.html(file_list[i])
						.appendTo(src_container);

					var score_board = document.createElement("div");
					$(score_board).addClass("score_board")
						.html(score_list[i])
						.appendTo(assign_bg);

					// register the assignment objects
					assignment_obj.push(assign_bg);
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
