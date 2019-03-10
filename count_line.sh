rm tmp/total.txt

cat django_project/make >> tmp/total.txt
cat django_project/scripts.py >> tmp/total.txt
cat django_project/admin/admin.py >> tmp/total.txt
cat django_project/admin/ajax.py >> tmp/total.txt
cat django_project/admin/db.py >> tmp/total.txt
cat django_project/admin/files.py >> tmp/total.txt
cat django_project/admin/lms.py >> tmp/total.txt
cat django_project/admin/login.py >> tmp/total.txt
cat django_project/admin/models.py >> tmp/total.txt
cat django_project/admin/urls.py >> tmp/total.txt
cat django_project/admin/views.py >> tmp/total.txt
cat django_project/admin/templates/admin/main.html >> tmp/total.txt
cat django_project/admin/static/admin/keep_update.sh >> tmp/total.txt
cat django_project/admin/static/admin/main.js >> tmp/total.txt
cat django_project/admin/static/admin/main_less.css >> tmp/total.txt
cat django_project/admin/static/admin/Makefile >> tmp/total.txt

cat django_project/index/urls.py >> tmp/total.txt
cat django_project/index/views.py >> tmp/total.txt
cat django_project/index/static/index/index.js >> tmp/total.txt
cat django_project/index/static/index/index_less.css >> tmp/total.txt
cat django_project/index/static/index/keep_update.sh >> tmp/total.txt
cat django_project/index/static/index/lms_less.css >> tmp/total.txt
cat django_project/index/static/index/lms.js >> tmp/total.txt
cat django_project/index/static/index/Makefile >> tmp/total.txt
cat django_project/index/templates/index/index.html >> tmp/total.txt
cat django_project/index/templates/index/lms.html >> tmp/total.txt


# ces command
cat /home/CES/bin/ces >> tmp/total.txt

wc -l tmp/total.txt
