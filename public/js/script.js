// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict';

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');

    // Loop over them and prevent submission
    Array.from(forms).forEach((form) => {
        const requiredFields = form.querySelectorAll('[required]');

        const validateRequiredFields = () => {
            requiredFields.forEach((field) => {
                field.setCustomValidity(
                    field.value.trim() ? '' : 'Please fill out this field.'
                );
            });
        };

        requiredFields.forEach((field) => {
            field.addEventListener('input', validateRequiredFields);
            field.addEventListener('blur', validateRequiredFields);
        });

        form.addEventListener(
            'submit',
            (event) => {
                validateRequiredFields();

                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add('was-validated');
            },
            false
        );
    });
})();
