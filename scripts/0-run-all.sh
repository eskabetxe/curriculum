#xml-to-json
curl -k https://europass.cedefop.europa.eu/rest/v1/document/to/json -H "Content-Type: application/xml" -d @"data_files/Europass-cv.xml" -o "data_files/Europass-cv.json"
#json-to-pdf
npm install async
npm install hogan.js
nodejs render-template.js
#html-to-pdf
wkhtmltopdf --margin-top 5mm --margin-bottom 5mm --margin-left 5mm --margin-right 5mm ../cv.html data_files/cv.pdf



