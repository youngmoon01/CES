from django.http import HttpResponse
import json
from . import login
from . import db
from . import files
from . import lms

def process_request(request):
	if request.POST.get('type') == 'admin_login':
		return login.admin_login(request)

	elif request.POST.get('type') == 'student_login':
		return login.student_login(request)

	elif request.POST.get('type') == 'file_submission':
		return files.process_submission(request)

	elif request.POST.get('type') == 'check_admin_login':
		return login.check_admin_login(request)

	elif request.POST.get('type') == 'check_student_login':
		return login.check_student_login(request)

	elif request.POST.get('type') == 'admin_logout':
		return login.admin_logout(request)

	elif request.POST.get('type') == 'student_logout':
		return login.student_logout(request)

	elif request.POST.get('type') == 'course_list_student':
		return db.get_course_list_student(request)

	elif request.POST.get('type') == 'course_list_admin':
		return db.get_course_list_admin(request)

	elif request.POST.get('type') == 'assign_information_student':
		return db.get_assign_information_student(request)

	elif request.POST.get('type') == 'assign_information_admin':
		return db.get_assign_information_admin(request)

	elif request.POST.get('type') == 'new_course':
		return db.register_new_course(request)

	elif request.POST.get('type') == 'change_course_name':
		return db.change_course_name(request)

	elif request.POST.get('type') == 'new_main_language':
		return db.apply_new_language(request)
	
	elif request.POST.get('type') == 'new_class':
		return db.new_class(request)

	elif request.POST.get('type') == 'new_student':
		return db.new_student(request)

	elif request.POST.get('type') == 'request_classes_information':
		return db.request_classes_information(request)

	elif request.POST.get('type') == 'request_students_information':
		return db.request_students_information(request)

	elif request.POST.get('type') == 'remove_class':
		return db.remove_class(request)

	elif request.POST.get('type') == 'remove_course':
		return db.remove_course(request)

	elif request.POST.get('type') == 'lms_course_info':
		return lms.lms_course_info(request)






	elif request.POST.get('type') == 'just_for_now':
		response = {}
		response['message'] = 'good'

		the_course = models.Course.objects.get(id=1)
		assign = models.Assignment.objects.all()[0]

		for a_student in models.Student.objects.all():
			path = '/data/CES/students/' + a_student.name
			os.makedirs(path, mode=0o775)

		os.makedirs('/data/CES/assignments/assign_2', mode=0o775)
		os.makedirs('/data/CES/assignments/assign_2/inputs', mode=0o775)
		os.makedirs('/data/CES/assignments/assign_2/outputs', mode=0o775)

		return HttpResponse(json.dumps(response), content_type='application/json')










	else: # undefined message type
		# send 'something wrong' message
		response = {}
		response['message'] = 'something wrong'
		return HttpResponse(json.dumps(response), content_type='application/json');
