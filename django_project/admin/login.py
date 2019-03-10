from django.http import HttpResponse
from django.contrib.auth.models import User

from .models import *
import json

from django.contrib.auth import authenticate

def student_login(request):
	response = {}

	user_name = request.POST.get('id')
	password = request.POST.get('password')

	# test if the password is correct
	# user = authenticate(username=request.POST.get('id'), password=request.POST.get('password')) # this is real

	# fix this to support real password
	if Student.objects.filter(name=user_name).exists():
		if user_name == password:
			response['message'] = 'good'

			request.session['student_logged'] = 1
			request.session['student_id'] = request.POST['id']
			request.session.set_expiry(0) # session will expire until browser close
		else:
			response['message'] = 'bad'
	else:
		response['message'] = 'bad'
			
	return HttpResponse(json.dumps(response), content_type='application/json')

#	if user != None:
#		# acquire session
#		request.session['student_logged'] = 1
#		request.session['student_id'] = request.POST['id']
#		request.session['student_password'] = request.POST['password']
#		request.session.set_expiry(0) # session will expire until browser close
#
#		response['message'] = 'good'
#	else:
#		response['message'] = 'bad'

#	return HttpResponse(json.dumps(response), content_type='application/json')













def admin_login(request):
	response = {}

	# test if the password is correct
	if request.POST.get('password') == 'zjavbxjrhkgkrrhk':

		# acquire session
		request.session['admin_logged'] = 1
		request.session.set_expiry(0) # session will expire until browser close

		response['message'] = 'good'
	else:
		response['message'] = 'bad'

	return HttpResponse(json.dumps(response), content_type='application/json')

def check_admin_login(request):
	response = {}

	# check the session if user logged in
	if 'admin_logged' in request.session: # session exists
		if request.session['admin_logged'] == 1: # session is set, and logged in
			response['message'] = 'yes'
			return HttpResponse(json.dumps(response), content_type='application/json')
	
	# send 'no' message otherwise
	response['message'] = 'no'
	return HttpResponse(json.dumps(response), content_type='application/json')

def check_student_login(request):
	response = {}

	# check the session if user logged in
	if 'student_logged' in request.session: # session exists
		if request.session['student_logged'] == 1: # session is set, and logged in
			response['message'] = 'yes'
			return HttpResponse(json.dumps(response), content_type='application/json')
	
	# send 'no' message otherwise
	response['message'] = 'no'
	return HttpResponse(json.dumps(response), content_type='application/json')

def admin_logout(request):
	response = {}

	# unset the session key 'admin_logged'
	if 'admin_logged' in request.session: # session exists
		request.session['admin_logged'] = 0

	response['message'] = 'good'
	return HttpResponse(json.dumps(response), content_type='application/json')

def student_logout(request):
	response = {}

	# unset the session key 'admin_logged'
	if 'student_logged' in request.session: # session exists
		request.session['student_logged'] = 0
		request.session['student_id'] = ''
		request.session['student_password'] = ''

	response['message'] = 'good'
	return HttpResponse(json.dumps(response), content_type='application/json')
