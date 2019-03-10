from django.shortcuts import render

# Create your views here.
def index(request):
	context = {}
	return render(request, 'index/index.html', context)

def lms(request, course_id):
	context = {'course_id':course_id}
	return render(request, 'index/lms.html', context)
