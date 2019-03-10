from django.db import models

# Create your models here.
class Course(models.Model):
	# assignments
	# classes
	id = models.AutoField(primary_key = True)
	name = models.CharField(max_length = 50)
	main_language = models.CharField(max_length = 50)

class Class(models.Model):
	id = models.AutoField(primary_key = True)
	course = models.ForeignKey(Course, on_delete = models.CASCADE, related_name = "classes")
	students = models.ManyToManyField("Student", related_name = "classes", blank = True)

	name = models.CharField(max_length = 50)

class Student(models.Model):
	# classes
	# submissions
	name = models.CharField(max_length = 50)
	id = models.AutoField(primary_key = True)

class Assignment(models.Model):
	# submissions
	course = models.ForeignKey(Course, on_delete = models.CASCADE, related_name = "assignments", blank = True)

	id = models.AutoField(primary_key = True)
	name = models.CharField(max_length = 50)
	color = models.CharField(max_length = 50)

	update_time = models.DateTimeField()
	start_time = models.DateTimeField()

	due_time = models.DateTimeField()
	deduction_point = models.IntegerField()
	deduction_time = models.CharField(max_length = 50) # for example: '1d', '20h', '1m', '5s', ...

	src_file = models.CharField(max_length = 50)
	test_src_file = models.CharField(max_length = 50)

	language = models.CharField(max_length = 50)

class Submission(models.Model):
	assignment = models.ForeignKey(Assignment, on_delete = models.CASCADE, related_name = "submissions")
	student = models.ForeignKey(Student, on_delete = models.CASCADE, related_name = "submissions")

	date = models.DateTimeField()
	file_name = models.CharField(max_length = 50)
	score = models.IntegerField() # -1 for submissions being graded.
	deduction = models.IntegerField() # -1 for submissions being graded.

class DueException(models.Model):
	id = models.AutoField(primary_key = True)
	assignment = models.ForeignKey(Assignment, on_delete = models.CASCADE, related_name = "due_exceptions")
	student = models.ForeignKey(Student, on_delete = models.CASCADE, related_name = "due_exceptions")
