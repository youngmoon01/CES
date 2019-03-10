import os
import sys

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_project.settings")

django.setup()

from django.conf import settings
from django.utils import timezone

from admin.db import *
from admin.models import *

from datetime import datetime

# register student
def register_one(class_name, student_name):
	the_class = Class.objects.get(name = class_name)
	register_student(student_name, the_class)
	return

# register course
def register_assign():
	hey = {}

	hey['name'] = 'Assignment 1. Test'
	hey['color'] = 'Black'

	hey['update_time'] = timezone.now()
	hey['start_time'] = timezone.now()

	due_time = datetime.strptime('2019.12.31 23:59:59', "%Y.%m.%d %H:%M:%S")
	due_time = timezone.make_aware(due_time)

	hey['due_time'] = due_time

	hey['deduction_point'] = 20
	hey['deduction_time'] = '1d'

	hey['src_file'] = 'Abc.py'
	hey['test_src_file'] = 'Abc.py'
	hey['language'] = 'Python 3' # 'Java', or 'Python 3'

	the_course = Course.objects.get(id = 27)

	new_assign(hey, the_course)
	return

register_assign()
#register_one('19-2 D1', '19-2 cs')
