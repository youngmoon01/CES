from django.http import HttpResponse
import json
import os

import datetime
import subprocess
import time

from django.utils import timezone
import pytz
from django_project import settings
from . import models

def process_submission(request):
	# deal with the uploaded file(submission)
	response = {}
	response['message'] = ''

	# extract course information
	course_number = request.POST['course_number']
	course_number = int(course_number)
	course = models.Course.objects.get(id = course_number)

	# get student info
	student = models.Student.objects.get(name = request.session['student_id'])

	# get assign info
	assign_id = request.POST['assign_id']
	assign_id = int(assign_id)
	assign = models.Assignment.objects.get(id = assign_id)
	assign_language = assign.language
	deduction_point = assign.deduction_point
	deduction_time = assign.deduction_time
	src_file = assign.src_file
	test_src_file = assign.test_src_file

	file_name = list(request.FILES)[0]

	# submission time
	timedelta = timezone.localtime(timezone.now()) - assign.due_time
	delta_seconds = int(timedelta.total_seconds())

	# previous score
	previous_score = -1
	submissions = student.submissions.filter(assignment = assign).order_by('-id')

	if len(submissions) > 0:
		previous_score = submissions[0].score - submissions[0].deduction
		if previous_score < 0:
			previous_score = 0

	score = 0
	deduction = 0
	response['info'] = ''

	if assign_language == 'Java':
		if file_name.split('.')[-1].lower() != 'java': # not a java file
			if previous_score == -1:
				# zero score
				submission = models.Submission(
					assignment = assign,
					student = student,
					date = timezone.localtime(timezone.now()),
					file_name = file_name,
					score = score,
					deduction = deduction
				)
				submission.save()

				response['message'] = 'good'
				response['info'] = "Compile failed. Submitted file is not a java file. Check the file name."
				response['score'] = 0
				response['deduct'] = 0
				return HttpResponse(json.dumps(response), content_type = 'application/json')
			else:
				response['message'] = 'not'
				response['info'] = "Compile failed. Submitted file is not a java file. Check the file name.(score is not updated)"
				response['score'] = 0
				response['deduct'] = 0
				return HttpResponse(json.dumps(response), content_type = 'application/json')

		the_file = request.FILES[file_name]
		dir_path = '/data/CES/students/' + request.session['student_id'] + '/assign_' + str(assign_id)
		tmp_dst_path = dir_path + '/raw_file'
		dst_path = dir_path + '/' + file_name

		if os.path.isdir(dir_path) == False:
			os.makedirs(dir_path, mode=0o755)

		# write raw input file
		destination_1 = open(tmp_dst_path, 'w')

		for chunk in the_file.chunks():
			destination_1.write(chunk.decode('utf-8'))

		destination_1.close()

		# remove package line and rewrite the source file
		destination_1 = open(tmp_dst_path, 'r')
		destination_2 = open(dst_path, 'w')

		for line in destination_1:
			package_found = False

			for word in line.split():
				if word == 'package':
					package_found = True
					break
			
			if package_found == False:
				destination_2.write(line)

		destination_1.close()
		destination_2.close()

		# compile java
		command = 'javac ' + dst_path
		debug_command = command
		debug_command = os.system(command)

		obj_path = dir_path + '/' + file_name[:-5] + '.class' # -5 -> get rid of '.java'

		if os.path.isfile(obj_path) == True: # compile success
			input_dir = '/data/CES/assignments/assign_' + str(assign_id) + '/inputs/'
			input_list = []
			
			# run for each input
			for f in os.listdir(input_dir):
				# make output directory
				if os.path.isdir(dir_path + '/outputs') == False:
					os.makedirs(dir_path + '/outputs', mode=0o775)

				# run the code
				command = "java -classpath "  + dir_path + " " + file_name[:-5]

				input_command = " < " + input_dir + f + " "
				output_command = " > " + dir_path + '/outputs/' + "out_" + f + " "
				command = command + input_command + output_command
				debug_command = command

				proc = subprocess.Popen('exec ' + command, shell=True)
				completed = False
				wait_time = 0.0
				while not completed:
					if proc.poll() is not None:
						completed = True
					else:
						time.sleep(0.01)
						wait_time = wait_time + 0.01
						if wait_time >= 1:
							proc.kill()
							break

				# for future use?
				input_list.append(f)

			# check output
			per_input_score = 100//len(input_list)

			for f in os.listdir(input_dir):
				out_file_name = "out_" + f

				#open both output file
				out1 = open('/data/CES/assignments/assign_' + str(assign_id) + '/outputs/' + out_file_name, 'r')
				out2 = open(dir_path + '/outputs/' + out_file_name, 'r')

				out1_content = out1.readlines()
				out2_content = out2.readlines()

				# check if line number is same
				if len(out1_content) == len(out2_content):
					# check if content is same
					flaw = False
					for i in range(len(out1_content)):
						try:
							float1 = float(out1_content[i])
							float2 = float(out2_content[i])

							if float(out1_content[i]) - float(out2_content[i]) > 0.00001:
								flaw = True
								break

						except ValueError: # cannot be converted to floating point
							# delete the new line character before comparison
							if out1_content[i][-1] == '\n':
								out1_content[i] = out1_content[i][:-1]
							if out2_content[i][-1] == '\n':
								out2_content[i] = out2_content[i][:-1]

							# compare the two string
							if out1_content[i] != out2_content[i]:
								flaw = True
								break

					if flaw == False:
						score = score + per_input_score
		else: # compile failed
			# zero score due to the compile error
			if previous_score == -1:
				submission = models.Submission(
					assignment = assign,
					student = student,
					date = timezone.localtime(timezone.now()),
					file_name = file_name,
					score = 0,
					deduction = 0
				)
				submission.save()

				response['message'] = 'good'
				response['info'] = "Compile failed. Check your source code."
				response['score'] = 0
				response['deduct'] = 0
				return HttpResponse(json.dumps(response), content_type = 'application/json')

			else: # not updated
				response['message'] = 'not'
				response['info'] = "Compile failed. Check your source code.(score is not updated)"
				response['score'] = 0
				response['deduct'] = 0
				return HttpResponse(json.dumps(response), content_type = 'application/json')

	elif assign_language == 'Python 3': # the assignment language is python

		the_file = request.FILES[file_name]
		dir_path = '/data/CES/students/' + request.session['student_id'] + '/assign_' + str(assign_id)
		dst_path = dir_path + '/' + file_name

		if os.path.isdir(dir_path) == False:
			os.makedirs(dir_path, mode=0o775)

		# write input file
		destination = open(dst_path, 'w')

		for chunk in the_file.chunks():
			destination.write(chunk.decode('utf-8'))

		destination.close()

		# determine score
		score = 0

		input_dir = '/data/CES/assignments/assign_' + str(assign_id) + '/inputs/'
		input_list = []
		
		# run for each input
		for f in os.listdir(input_dir):
			# make output directory
			if os.path.isdir(dir_path + '/outputs') == False:
				os.makedirs(dir_path + '/outputs', mode=0o775)

			# run the code
			command = "python3 " + dst_path
			input_command = " < " + input_dir + f + " "
			output_command = " > " + dir_path + '/outputs/' + "out_" + f + " "
			command = command + input_command + output_command

			proc = subprocess.Popen('exec ' + command, shell=True)
			completed = False
			wait_time = 0.0

			while not completed:
				if proc.poll() is not None:
					completed = True
				else:
					time.sleep(0.01)
					wait_time = wait_time + 0.01
					if wait_time >= 1:
						proc.kill()
						break

			# for future use?
			input_list.append(f)

		# check output
		per_input_score = 100//len(input_list)

		for f in os.listdir(input_dir):
			out_file_name = "out_" + f

			# open both output file
			out1 = open('/data/CES/assignments/assign_' + str(assign_id) + '/outputs/' + out_file_name, 'r')
			out2 = open(dir_path + '/outputs/' + out_file_name, 'r')

			out1_content = out1.readlines()
			out2_content = out2.readlines()

			# check if line number is same
			if len(out1_content) == len(out2_content):
				# check if content is same
				flaw = False
				for i in range(len(out1_content)):
					if out1_content[i] != out2_content[i]:
						flaw = True
						break

				if flaw == False:
					score = score + per_input_score

	# calculate deduction due to late submission
	deduction_seconds = int(deduction_time[:-1])
	if deduction_time[-1] == 'd':
		deduction_seconds = deduction_seconds*24*60*60
	elif deduction_time[-1] == 'h':
		deduction_seconds = deduction_seconds*60*60
	elif deduction_time[-1] == 'm':
		deduction_seconds = deduction_seconds*60

	if delta_seconds >= 0:
		if student.name != 'cs': # exception
			deduction = deduction_point*(delta_seconds//deduction_seconds + 1)

	total = score - deduction
	if total < 0:
		deduction = deduction + total
		total = 0

	if total > previous_score:
		submission = models.Submission(
			assignment = assign,
			student = student,
			date = timezone.localtime(timezone.now()),
			file_name = file_name,
			score = score,
			deduction = deduction
		)
		submission.save()

		response['message'] = 'good'
		response['score'] = score
		response['deduct'] = deduction
		return HttpResponse(json.dumps(response), content_type='application/json')
	else:
		response['message'] = 'not'
		response['score'] = score
		response['deduct'] = deduction
		return HttpResponse(json.dumps(response), content_type='application/json')

def process_new_assign(request): # adding assignments
	return 'something'
