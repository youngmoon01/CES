from django.http import HttpResponse
import json

import datetime
from . import models

import os

from django.utils import timezone
import pytz
from django_project import settings

# returns json containing course name list and id list
def get_course_list_student(request):
	response = {}
	result = ''
	
	student = models.Student.objects.get(name = request.session['student_id'])
	course_list = []

	id_list = []
	for the_class in student.classes.order_by('id'):
		course_list.append(the_class.course.name)
		id_list.append(the_class.course.id)

	response['message'] = 'good'
	response['name_list'] = course_list
	response['id_list'] = id_list
	return HttpResponse(json.dumps(response), content_type = 'application/json')

# returns json containing course name list and id list
def get_course_list_admin(request):
	response = {}
	result = ''
	
	course_list = []
	id_list = []
	for course in models.Course.objects.order_by('id'):
		course_list.append(course.name)
		id_list.append(course.id)

	response['message'] = 'good'
	response['name_list'] = course_list
	response['id_list'] = id_list
	return HttpResponse(json.dumps(response), content_type = 'application/json')

def get_assign_information_student(request):
	response = {}

	# time zone
	timezone.activate(settings.TIME_ZONE)

	student = models.Student.objects.get(name=request.session['student_id'])

	course_number = request.POST['course_number']
	course_number = int(course_number)
	course = models.Course.objects.get(id = course_number)

	assignments = course.assignments.order_by('-id')
	student = models.Student.objects.get(name = request.session['student_id'])

	assign_list = []
	score_list = []
	deduct_list = []
	file_list = []
	due_date_list = []
	due_time_list = []
	id_list = []

	for assign in assignments:
		submissions = student.submissions.filter(assignment = assign).order_by('-id')

		if len(submissions) > 0:
			submission = submissions[0]
			score_list.append(submission.score)
			deduct_list.append(submission.deduction)

			file_list.append(submission.file_name)
		else:
			score_list.append(-1)
			deduct_list.append(0)
			file_list.append("")

		assign_list.append(assign.name)
		id_list.append(assign.id)
		due_date_list.append(datetime.datetime.strftime(timezone.localtime(assign.due_time), "%Y.%m.%d"))
		due_time_list.append(datetime.datetime.strftime(timezone.localtime(assign.due_time), "%H:%M:%S"))

	response['message'] = 'good'
	response['assign_list'] = assign_list
	response['score_list'] = score_list
	response['deduct_list'] = deduct_list
	response['file_list'] = file_list
	response['due_date_list'] = due_date_list
	response['due_time_list'] = due_time_list
	response['id_list'] = id_list

	return HttpResponse(json.dumps(response), content_type = 'application/json')

def get_assign_information_admin(request):
	response = {}

	# time zone
	timezone.activate(settings.TIME_ZONE)

	course_id = request.POST['course_id']
	course_id = int(course_id)
	course = models.Course.objects.get(id = course_id)

	# attach main language information
	response['main_language'] = course.main_language

	response['message'] = 'good'

	return HttpResponse(json.dumps(response), content_type = 'application/json')

def register_new_course(request):
	response = {}

	input_name = request.POST['course_name']
	input_language = request.POST['main_language']

	new_course = models.Course(
		name = input_name,
		main_language = input_language
	)

	new_course.save()

	response['message'] = 'good'
	return HttpResponse(json.dumps(response), content_type = 'application/json')

def change_course_name(request):
	response = {}

	new_name = request.POST['course_name']
	course_id = request.POST['course_id']

	try:
		the_course = models.Course.objects.get(id = course_id)

	except Exception as e: # if there is no course with given course id
		response['message'] = 'error'
		response['error_message'] = str(e)
		return HttpResponse(json.dumps(response), content_type = 'application/json')

	the_course.name = new_name
	the_course.save()

	response['message'] = 'good'
	return HttpResponse(json.dumps(response), content_type = 'application/json')

def apply_new_language(request):
	response = {}

	new_language = request.POST['new_language']
	course_id = request.POST['course_id']

	try:
		the_course = models.Course.objects.get(id = course_id)

	except Exception as e: # if there is no course with given course id
		response['message'] = 'error'
		response['error_message'] = str(e)
		return HttpResponse(json.dumps(response), content_type = 'application/json')

	the_course.main_language = new_language
	the_course.save()

	response['message'] = 'good'
	return HttpResponse(json.dumps(response), content_type = 'application/json')

def new_class(request):
	response = {}

	class_name = request.POST['class_name']
	course_id = request.POST['course_id']

	try:
		the_course = models.Course.objects.get(id = course_id)

	except Exception as e: # if there is no course with given course id
		response['message'] = 'error'
		response['error_message'] = str(e)
		return HttpResponse(json.dumps(response), content_type = 'application/json')

	new_class = models.Class(
		course = the_course,
		name = class_name
	)

	new_class.save()

	response['message'] = 'good'
	response['class_id'] = new_class.id

	return HttpResponse(json.dumps(response), content_type = 'application/json')

def register_student(student_name, the_class):
	response = {}

	# check if the student is already registered in a different course
	try:
		the_student = models.Students.objects.get(name = student_name)

		# get the course with the_class
		the_course = the_class.course

		# check if the student is already in the course but in a different class
		for each_class in the_student.classes.all():
			if each_class.course.id == the_course.id: # already in the course
				response['message'] = 'another_class'
				response['another_class'] = each_class.name
				response['another_class_id'] = each_class.id
				return response

		# register normally
		the_student.classes.add(the_class)

		response['message'] = 'good'
		return response

	except Exception as e: # it is new student name
		# create new student
		the_student = models.Student(name = student_name)
		the_student.save()

		# configure file system
		path = '/data/CES/students/'
		path = path + student_name
		os.makedirs(path, mode=0o775)

		# register the student to the class normally
		the_student.classes.add(the_class)

		response['message'] = 'good'
		return response

def new_student(request):
	response = {}

	student_name = request.POST['student_name']
	class_id = request.POST['class_id']

	# get the class with class id
	try:
		the_class = models.Class.objects.get(id = class_id)

	except Exception as e: # if there is no course with given course id
		response['message'] = 'error'
		response['error_message'] = str(e)
		return HttpResponse(json.dumps(response), content_type = 'application/json')

	response = register_student(student_name, the_class)

	return HttpResponse(json.dumps(response), content_type = 'application/json')

def remove_student(the_student, the_class):
	response = {}

	the_class.students.remove(the_student)

	response['message'] = 'good'
	return response

def request_classes_information(request):
	response = {}

	course_id = request.POST['course_id']

	try:
		the_course = models.Course.objects.get(id = course_id)

	except Exception as e: # if there is no course with given course id
		response['message'] = 'error'
		response['error_message'] = str(e)
		return HttpResponse(json.dumps(response), content_type = 'application/json')

	classes = []
	for Class in the_course.classes.order_by('name'):
		the_class = {}
		the_class['name'] = Class.name
		the_class['num_students'] = len(Class.students.all())
		the_class['id'] = Class.id
		classes.append(the_class)
	
	response['classes'] = classes

	response['message'] = 'good'
	return HttpResponse(json.dumps(response), content_type = 'application/json')

def request_students_information(request):
	response = {}

	class_id = request.POST['class_id']

	try:
		the_class = models.Class.objects.get(id = class_id)

	except Exception as e: # if there is no class with given class id
		response['message'] = 'error'
		response['error_message'] = str(e)
		return HttpResponse(json.dumps(response), content_type = 'application/json')

	students = []
	for student in the_class.students.order_by('name'):
		students.append(student.name)
	
	response['students'] = students

	response['message'] = 'good'
	return HttpResponse(json.dumps(response), content_type = 'application/json')

def remove_class(request):
	response = {}

	class_id = request.POST['class_id']

	try:
		the_class = models.Class.objects.get(id = class_id)

	except Exception as e: # if there is no class with given class id
		response['message'] = 'error'
		response['error_message'] = str(e)
		return HttpResponse(json.dumps(response), content_type = 'application/json')

	the_class.delete()
	
	response['message'] = 'good'
	return HttpResponse(json.dumps(response), content_type = 'application/json')

def remove_course(request):
	response = {}

	course_id = request.POST['course_id']

	try:
		the_course = models.Course.objects.get(id = course_id)

	except Exception as e: # if there is no class with given class id
		response['message'] = 'error'
		response['error_message'] = str(e)
		return HttpResponse(json.dumps(response), content_type = 'application/json')

	the_course.delete()
	
	response['message'] = 'good'
	return HttpResponse(json.dumps(response), content_type = 'application/json')

# requires args.course
# requires args.name
# requires args.color
# requires args.update_time
# requires args.start_time
# requires args.due_time
# requires args.deduction_point
# requires args.deduction_time
# requires args.src_file
# requires args.test_src_file
# requires args.language
def new_assign(args, the_course):
	new_assign = models.Assignment(
		course = the_course,
		name = args['name'],
		color = args['color'],
		update_time = args['update_time'],
		start_time = args['start_time'],
		due_time = args['due_time'],
		deduction_point = args['deduction_point'],
		deduction_time = args['deduction_time'],
		src_file = args['src_file'],
		test_src_file = args['test_src_file'],
		language = args['language']
	)

	new_assign.save()
	id = new_assign.id

	base_path = '/data/CES/assignments/assign_' + str(id) + '/'
	os.makedirs(base_path, mode=0o775)
	os.makedirs(base_path + 'inputs', mode=0o775)
	os.makedirs(base_path + 'outputs', mode=0o775)











# fonr one-time use
def init_filesystem():
	os.makedirs('/data/CES/assignments', mode=0o775)
	return
