all: top

top: main.css main_js lms_js
	touch top
	yes yes | ../../../manage.py collectstatic

main.css: main_less.css
	lessc main_less.css > main.css

main_js: main.js
	touch main_js

lms_js: lms.js
	touch lms_js

clean:
	rm top
