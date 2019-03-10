from django.urls import path

from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('lms/<int:course_id>', views.lms, name='lms'),
]
