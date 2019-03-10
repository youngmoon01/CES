all: top

top: index.css index_js lms_js lms.css
	touch top
	yes yes | ../../../manage.py collectstatic

index.css: index_less.css
	lessc index_less.css > index.css

lms.css: lms_less.css
	lessc lms_less.css > lms.css

index_js: index.js
	touch index_js

lms_js: lms.js
	touch lms_js

clean:
	rm top
