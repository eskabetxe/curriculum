#xml-to-json
curl -k https://europass.cedefop.europa.eu/rest/v1/document/to/json -H "Content-Type: application/xml" -d @"data_files/europass-cv.xml" -o "data_files/europass-cv.json"
#xml-to-pdf
curl -k https://europass.cedefop.europa.eu/rest/v1/document/to/pdf -H "Content-Type: application/xml" -d @"data_files/europass-cv.xml" -o "data_files/europass-cv.pdf"
#json-to-pdf
npm install async
npm install fs
npm install hogan.js
npm install popper.js
npm install jquery

nodejs template.js
