from django.shortcuts import render

# Create your views here.
def admin(request):
	context = {}
	return render(request, 'admin/admin.html', context)
