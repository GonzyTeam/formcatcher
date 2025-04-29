 // Function to get the current script tag
function getCurrentScriptTag() {
        // Get all script tags in the document
        var scripts = document.getElementsByTagName('script');
        // Look for the script tag that has the src ending with your script's filename
        for (var i = scripts.length - 1; i >= 0; i--) {
            var script = scripts[i];
            if (script.src.includes('gonzyteam/formcatcher')) {
                return script;
            }
        }
        return null;
    }

    // Function to get the company attribute from the script tag
    function getCompanyParameter() {
        var scriptTag = getCurrentScriptTag();
        if (scriptTag) {
            return scriptTag.getAttribute('company');
        }
        return null;
    }

 function getTestingParameter() {
     var scriptTag = getCurrentScriptTag();
        if (scriptTag) {
            return scriptTag.getAttribute('testing');
        }
        return null;
 }



const testingParameter = getTestingParameter();
console.log("Testing parameter value: ",testingParameter)
const testing = testingParameter === "true";
console.log("Testing value: ", testing);

document.addEventListener("DOMContentLoaded", function() {

			// Use the company parameter in your code
		const company = getCompanyParameter();
		console.log("Company parameter value:", company);

            function generateUniqueID() {
                return 'uid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            }

        // Loop through all forms on the page
        document.querySelectorAll('form').forEach(function(form) {
            form.addEventListener('submit', function(e) {
                // Prevent the form from submitting normally
                e.preventDefault();

                // Generate a unique identifier for this submission
                var uniqueID = generateUniqueID();


                let fieldsArray = [];
                
                Array.from(form.elements).forEach((element) => {
                // Explicitly filter for user-interactive input types
                const inputTypes = ['text', 'email', 'tel', 'number', 'select-one', 'radio', 'checkbox', 'textarea'];
                if (inputTypes.includes(element.type) && !element.name.startsWith("label-")) {
                    if ((element.type === 'radio' || element.type === 'checkbox') && !element.checked) {
                        return; // Skip unchecked radios/checkboxes
                    }

                    // For select elements, use the selected option's value
                    let value = element.value;
                    if (element.type === 'select-one') {
                        value = element.options[element.selectedIndex].value;
                    }

                    let fieldLabel = element.name;
                    // Attempt to find a human-readable label if a corresponding hidden label input exists
                    const hiddenLabel = form.querySelector(`input[type='hidden'][name='label-${element.name}']`);
                    if (hiddenLabel) {
                        fieldLabel = hiddenLabel.value;
                    } else {
                        // Fallback: Try to use the text content of an associated label; otherwise, use the name attribute
                        const associatedLabel = form.querySelector(`label[for="${element.id}"]`);
                        if (associatedLabel) {
                            fieldLabel = associatedLabel.textContent.trim();
                        }
                    }

                    fieldsArray.push({ "field": fieldLabel, "value": value });
                }
            });
                
                console.log('fieldsArray',fieldsArray);
                
                /*
                formData.forEach((value, key) => {
                    fieldsArray.push({ "field": key, "value": value.toString() });
                });
                */

                // Check for a custom form title element, otherwise use the form's name attribute
                const formTitleElement = document.querySelector('.dmform-title');
                const formName = formTitleElement ? formTitleElement.textContent : form.getAttribute('name');
                //console.log('formName ',formName);
                
                let formId = form.getAttribute('id');
                if (!formId || formId.trim() === '') {
                   // Function to create a unique form ID based on URL and number/type of inputs
                   function createCustomFormId(form) {
                          const pageUrl = window.location.href;
                          const inputCount = form.querySelectorAll('input, select, textarea').length;
                          const inputTypes = Array.from(form.elements)
                                 .map(element => element.tagName.toLowerCase() + '-' + element.type)
                                 .join(',');
                          return `form-${pageUrl.replace(/[^a-z0-9]/gi, '_')}-${inputCount}-${inputTypes}`;
                   }
                   formId = createCustomFormId(form);
                   console.log('Generated custom formId:', formId);
                }
             
                const version = testing ? 'version-test/' : '';
                var webhookUrl = `https://4fvojww3cjqgmnc5mc3en4bkki0zsztg.lambda-url.us-east-1.on.aws/${company}`;

                // Create the request to send the form data
                fetch(webhookUrl, {
                    method: 'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({
                        fields:fieldsArray,
                        submissionId:uniqueID.toString(),
                        formName:formName,
                        company:company,
                        formId:formId
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            });
        });
    });