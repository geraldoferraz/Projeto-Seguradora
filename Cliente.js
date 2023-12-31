document.addEventListener('DOMContentLoaded', function() {
    var updateButton = document.getElementById('update');
    var deleteButton = document.getElementById('delete');
    var saveButton = document.getElementById('save');
    var inputs = document.querySelectorAll('input[readonly], select[disabled]');

    updateButton.addEventListener('click', function() {
        inputs.forEach(function(input) {
            if(input.tagName === 'INPUT') {
                input.removeAttribute('readonly');
            } else if(input.tagName === 'SELECT') {
                input.removeAttribute('disabled');
            }
            input.classList.add('editable');
        });
        updateButton.style.display = 'none';
        deleteButton.style.display = 'none';
        saveButton.style.display = 'inline-block';
    });

    saveButton.addEventListener('click', function(event){
        event.preventDefault();
        console.log('Dados salvos');
    });

});
