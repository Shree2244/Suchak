document.addEventListener('DOMContentLoaded', function() {
    const pdfUpload = document.getElementById('pdfUpload');
    const pdfViewer = document.getElementById('pdfViewer');
    const loadingMessage = document.getElementById('loadingMessage');

    const clearFields = () => {
        document.getElementById('courtName').value = '';
        document.getElementById('act').value = '';
        document.getElementById('personName').value = '';
        document.getElementById('orderNo').value = '';
        document.getElementById('orderDate').value = '';

        document.getElementById('courtNameDropdown').innerHTML = '';
        document.getElementById('actDropdown').innerHTML = '';
        document.getElementById('personNameDropdown').innerHTML = '';
        document.getElementById('orderNoDropdown').innerHTML = '';
        document.getElementById('orderDateDropdown').innerHTML = '';
    };

    const loadPDF = (file) => {
        if (file && file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = function() {
                const pdfData = new Uint8Array(this.result);
                const loadingTask = pdfjsLib.getDocument({ data: pdfData });
                loadingTask.promise.then(pdf => {
                    pdf.getPage(1).then(page => {
                        const viewport = page.getViewport({ scale: 1.2 });
                        const canvas = pdfViewer;
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };
                        page.render(renderContext);
                    });
                });
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('Please upload a valid PDF file.');
        }
    };

    pdfUpload.addEventListener('change', () => {
        clearFields();
        const file = pdfUpload.files[0];
        loadPDF(file);
        uploadPDF(file);
    });

    const removeDuplicates = (items) => {
        return [...new Set(items)];
    };

    const uploadPDF = (file) => {
        const formData = new FormData();
        formData.append('pdf_file', file);

        loadingMessage.style.display = 'block';

        fetch('/api/process_pdf/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            loadingMessage.style.display = 'none';
            if (data.error) {
                alert(data.error);
            } else {
                const populateDropdown = (dropdownId, inputId, items) => {
                    const dropdown = document.getElementById(dropdownId);
                    const input = document.getElementById(inputId);
                    dropdown.innerHTML = ''; // Clear existing options
                    const uniqueItems = removeDuplicates(items);
                    uniqueItems.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item;
                        option.textContent = item;
                        dropdown.appendChild(option);
                    });
                    if (uniqueItems.length > 0) {
                        input.value = uniqueItems[0]; // Set the first item as default
                    }
                };

                populateDropdown('courtNameDropdown', 'courtName', data['COURT NAME'] || []);
                populateDropdown('actDropdown', 'act', data['ACT'] || []);
                populateDropdown('personNameDropdown', 'personName', data['PERSON NAME'] || []);
                populateDropdown('orderNoDropdown', 'orderNo', data['ORDER NO'] || []);
                populateDropdown('orderDateDropdown', 'orderDate', data['ORDER DATE'] || []);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loadingMessage.style.display = 'none';
        });
    };
});

function updateInput(dropdownId, inputId) {
    const dropdown = document.getElementById(dropdownId);
    const input = document.getElementById(inputId);
    input.value = dropdown.value;
}




// document.addEventListener('DOMContentLoaded', function() {
//     const pdfUpload = document.getElementById('pdfUpload');
//     const pdfViewer = document.getElementById('pdfViewer');
//     const loadingMessage = document.getElementById('loadingMessage');

//     const clearFields = () => {
//         document.getElementById('courtName').value = '';
//         document.getElementById('act').value = '';
//         document.getElementById('personName').value = '';
//         document.getElementById('orderNo').value = '';
//         document.getElementById('orderDate').value = '';

//         document.getElementById('courtNameDropdown').innerHTML = '';
//         document.getElementById('actDropdown').innerHTML = '';
//         document.getElementById('personNameDropdown').innerHTML = '';
//         document.getElementById('orderNoDropdown').innerHTML = '';
//         document.getElementById('orderDateDropdown').innerHTML = '';
//     };

//     const loadPDF = (file) => {
//         if (file && file.type === 'application/pdf') {
//             const reader = new FileReader();
//             reader.onload = function() {
//                 const pdfData = new Uint8Array(this.result);
//                 const loadingTask = pdfjsLib.getDocument({ data: pdfData });
//                 loadingTask.promise.then(pdf => {
//                     pdf.getPage(1).then(page => {
//                         const viewport = page.getViewport({ scale: 1.2 });
//                         const canvas = pdfViewer;
//                         const context = canvas.getContext('2d');
//                         canvas.height = viewport.height;
//                         canvas.width = viewport.width;

//                         const renderContext = {
//                             canvasContext: context,
//                             viewport: viewport
//                         };
//                         page.render(renderContext);
//                     });
//                 });
//             };
//             reader.readAsArrayBuffer(file);
//         } else {
//             alert('Please upload a valid PDF file.');
//         }
//     };

//     pdfUpload.addEventListener('change', () => {
//         clearFields();
//         const file = pdfUpload.files[0];
//         loadPDF(file);
//         uploadPDF(file);
//     });

//     const uploadPDF = (file) => {
//         const formData = new FormData();
//         formData.append('pdf_file', file);

//         loadingMessage.style.display = 'block';

//         fetch('/api/process_pdf/', {
//             method: 'POST',
//             body: formData
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log(data);
//             loadingMessage.style.display = 'none';
//             if (data.error) {
//                 alert(data.error);
//             } else {
//                 const populateDropdown = (dropdownId, inputId, items) => {
//                     const dropdown = document.getElementById(dropdownId);
//                     const input = document.getElementById(inputId);
//                     dropdown.innerHTML = ''; // Clear existing options
//                     items.forEach(item => {
//                         const option = document.createElement('option');
//                         option.value = item;
//                         option.textContent = item;
//                         dropdown.appendChild(option);
//                     });
//                     if (items.length > 0) {
//                         input.value = items[0]; // Set the first item as default
//                     }
//                 };

//                 populateDropdown('courtNameDropdown', 'courtName', data['COURT NAME'] || []);
//                 populateDropdown('actDropdown', 'act', data['ACT'] || []);
//                 populateDropdown('personNameDropdown', 'personName', data['PERSON NAME'] || []);
//                 populateDropdown('orderNoDropdown', 'orderNo', data['ORDER NO'] || []);
//                 populateDropdown('orderDateDropdown', 'orderDate', data['ORDER DATE'] || []);
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             loadingMessage.style.display = 'none';
//         });
//     };
// });

// function updateInput(dropdownId, inputId) {
//     const dropdown = document.getElementById(dropdownId);
//     const input = document.getElementById(inputId);
//     input.value = dropdown.value;
// }

//--------------------------------------------------------------------------------------

// document.addEventListener('DOMContentLoaded', function() {
//     const pdfUpload = document.getElementById('pdfUpload');
//     const pdfViewer = document.getElementById('pdfViewer');
//     const loadingMessage = document.getElementById('loadingMessage');

//     const loadPDF = (file) => {
//         if (file && file.type === 'application/pdf') {
//             const reader = new FileReader();
//             reader.onload = function() {
//                 const pdfData = new Uint8Array(this.result);
//                 const loadingTask = pdfjsLib.getDocument({ data: pdfData });
//                 loadingTask.promise.then(pdf => {
//                     pdf.getPage(1).then(page => {
//                         const viewport = page.getViewport({ scale: 1.2 });
//                         const canvas = pdfViewer;
//                         const context = canvas.getContext('2d');
//                         canvas.height = viewport.height;
//                         canvas.width = viewport.width;

//                         const renderContext = {
//                             canvasContext: context,
//                             viewport: viewport
//                         };
//                         page.render(renderContext);
//                     });
//                 });
//             };
//             reader.readAsArrayBuffer(file);
//         } else {
//             alert('Please upload a valid PDF file.');
//         }
//     };

//     pdfUpload.addEventListener('change', () => {
//         const file = pdfUpload.files[0];
//         loadPDF(file);
//         clearFields();  // Clear fields before uploading the new file
//         uploadPDF(file);
//     });

//     const clearFields = () => {
//         document.getElementById('courtName').value = '';
//         document.getElementById('act').value = '';
//         document.getElementById('personName').value = '';
//         document.getElementById('orderNo').value = '';
//         document.getElementById('orderDate').value = '';
//     };

//     const uploadPDF = (file) => {
//         loadingMessage.style.display = 'flex';

//         const formData = new FormData();
//         formData.append('pdf_file', file);

//         fetch('/api/process_pdf/', {
//             method: 'POST',
//             body: formData
//         })
//         .then(response => response.json())
//         .then(data => {
//             loadingMessage.style.display = 'none';
//             if (data.error) {
//                 alert(data.error);
//             } else {
//                 populateOptions('courtNameOptions', data['COURT NAME']);
//                 populateOptions('actOptions', data['ACT']);
//                 populateOptions('personNameOptions', data['PERSON NAME']);
//                 populateOptions('orderNoOptions', data['ORDER NO']);
//                 populateOptions('orderDateOptions', data['ORDER DATE']);
//             }
//         })
//         .catch(error => {
//             loadingMessage.style.display = 'none';
//             console.error('Error:', error);
//         });
//     };

//     const populateOptions = (datalistId, values) => {
//         const datalist = document.getElementById(datalistId);
//         datalist.innerHTML = '';  // Clear previous options
//         if (values) {
//             values.forEach(value => {
//                 const option = document.createElement('option');
//                 option.value = value;
//                 datalist.appendChild(option);
//             });
//         }
//     };
// });
