// course_id
assign_list = null;

assign_obj_list = null;

count_index_list = null;

$(document).ready(function()
{
	// course_id
	$.ajax
	({
		type: 'post',
		url: '/admin/',
		dataType: 'json',
		data:
		{
			'type': 'lms_course_info',
			'course_id': course_id,
			'csrfmiddlewaretoken': csrf_token
		},
		success:function(data)
		{
			if(data.message == 'good') // correct password
			{
				// set timeout first to minimize the time error
				setTimeout(
				function()
				{
					// clock
					clock();
				},
				1000);

				assign_list = data.assign_list;

				assign_obj_list = new Array();

				count_index_list = new Array();

				for(var i = 0; i < assign_list.length; i++)
				{
					var view_line = document.createElement('div');
					$(view_line).addClass("view_line");
					$('#link_button').before(view_line);
					var the_text = assign_list[i].name + " (Deadline: " + assign_list[i].due_date + " " + assign_list[i].due_time + ")";

					var remaining = assign_list[i].remaining;
					var zs_seconds = assign_list[i].zs_seconds;

					if(remaining <= -zs_seconds) // test if gray
					{
						$(view_line).css({'color':'gray'});
					}
					else if(remaining <= 0) // test if red
					{
						$(view_line).css({'color':'rgb(200, 100, 100)'});
						the_text = the_text.concat(" You can get only a partial score.");
						count_index_list.push(i);
					}
					else
					{
						if(remaining <= 3600) // yellow if there is less than 1 hour remaining
						{
							$(view_line).css({'color':'rgb(200, 200, 100)'});
						}

						var h = Math.floor(remaining/3600);
						var m = Math.floor((remaining%3600)/60);
						var s = remaining%60;

						h = h.toString();
						if(m < 10)
							m = "0" + m.toString();
						else
							m = m.toString();
							
						if(s < 10)
							s = "0" + s.toString();
						else
							s = s.toString();

						the_text = the_text.concat(" Time remaining: " + h + ":" + m + ":" + s);
						count_index_list.push(i);
					}

					$(view_line).text(the_text);

					assign_obj_list.push(view_line);
					assign_list[i].remaining--;
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
});

function clock()
{
	// set timeout first to minimize the time error
	setTimeout(
	function()
	{
		// clock
		clock();
	},
	1000);

	for(var j = 0; j < count_index_list.length; j++)
	{
		var i = count_index_list[j];

		var view_line = assign_obj_list[i];

		var the_text = assign_list[i].name + " (Deadline: " + assign_list[i].due_date + " " + assign_list[i].due_time + ")";

		var remaining = assign_list[i].remaining;
		var zs_seconds = assign_list[i].zs_seconds;

		if(remaining <= -zs_seconds) // test if gray
		{
			$(view_line).css({'color':'gray'});
			count_index_list.splice(j, 1);
		}
		else if(remaining <= 0) // test if red(due passed)
		{
			$(view_line).css({'color':'rgb(200, 100, 100)'});
			the_text = the_text.concat(" You can get only a partial score.");
		}
		else
		{
			if(remaining <= 3600) // yellow if there is less than 1 hour remaining
			{
				$(view_line).css({'color':'rgb(200, 200, 100)'});
			}

			var h = Math.floor(remaining/3600);
			var m = Math.floor((remaining%3600)/60);
			var s = remaining%60;

			h = h.toString();
			if(m < 10)
				m = "0" + m.toString();
			else
				m = m.toString();
				
			if(s < 10)
				s = "0" + s.toString();
			else
				s = s.toString();

			the_text = the_text.concat(" Time remaining: " + h + ":" + m + ":" + s);
		}

		$(view_line).text(the_text);

		// decrease by one
		assign_list[i].remaining--;
	}
}
