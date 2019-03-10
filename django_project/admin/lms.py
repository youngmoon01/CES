from django.http import HttpResponse
import json

import datetime
from . import models

import os

from django.utils import timezone
import pytz
from django_project import settings

def lms_course_info(request):
	response = {}
	response['message'] = 'good'

	course_id = request.POST['course_id']
	out_list = []

	the_course = models.Course.objects.get(id = course_id)
	assignments = the_course.assignments.order_by('-id')

	for assign in assignments:
		the_dict = {}
		the_dict['name'] = assign.name
		the_dict['due_date'] = datetime.datetime.strftime(timezone.localtime(assign.due_time), "%Y.%m.%d")
		the_dict['due_time'] = datetime.datetime.strftime(timezone.localtime(assign.due_time), "%H:%M:%S")

		# calculate total seconds
		timedelta = assign.due_time - timezone.localtime(timezone.now() )
		delta_seconds = int(timedelta.total_seconds())
		the_dict['remaining'] = delta_seconds

		# calculate zero-score seconds
		deduction_point = assign.deduction_point
		deduction_time = assign.deduction_time

		deduction_seconds = int(deduction_time[:-1])
		if deduction_time[-1] == 'd':
			deduction_seconds = deduction_seconds*24*60*60
		elif deduction_time[-1] == 'h':
			deduction_seconds = deduction_seconds*60*60
		elif deduction_time[-1] == 'm':
			deduction_seconds = deduction_seconds*60

		zs_seconds = (100//deduction_point)*deduction_seconds

		the_dict['zs_seconds'] = zs_seconds
		out_list.append(the_dict)

	response['assign_list'] = out_list
	return HttpResponse(json.dumps(response), content_type='application/json')
