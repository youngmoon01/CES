from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader

from django.utils import timezone
from django.contrib.auth.models import User # just for now
from .models import Class # just for now
from .models import Student # just for now
from .models import Assignment # just for now

from . import login
from . import db
from . import models
from . import ajax

import datetime
import os
import signal
import subprocess
import time
import json
import getpass

# Create your views here.
def admin(request):
	if request.method == 'POST': # got an ajax request
		return ajax.process_request(request)

	else: # no POST request
		# render the main page
		context = {}
		return render(request, 'admin/main.html', context)

def check_session(request):
	if 'admin_logged' in request.session: # session exists
		if request.session['admin_logged'] == 1: # session is set, and logged  in
			return True

	# return false otherwise
	return False
