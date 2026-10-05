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

// Preview a selected upload or a URL as soon as the user changes the image.
(() => {
    document.querySelectorAll('[data-image-file-input]').forEach((input) => {
        const preview = document.querySelector(input.dataset.previewTarget);
        const container = document.getElementById('listing-image-preview-container');
        if (!preview || !container) return;

        let objectUrl;
        input.addEventListener('change', () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);

            const file = input.files?.[0];
            if (!file) {
                container.classList.add('d-none');
                preview.removeAttribute('src');
                return;
            }

            objectUrl = URL.createObjectURL(file);
            preview.src = objectUrl;
            container.classList.remove('d-none');
        });
    });

    document.querySelectorAll('[data-image-url-input]').forEach((input) => {
        const preview = document.querySelector(input.dataset.previewTarget);
        if (!preview) return;

        const fallback = preview.dataset.fallbackSrc || '';
        input.addEventListener('input', () => {
            preview.hidden = false;
            preview.src = input.value.trim() || fallback;
        });
        preview.addEventListener('error', () => {
            if (fallback && preview.getAttribute('src') !== fallback) {
                preview.src = fallback;
            } else {
                preview.hidden = true;
            }
        });
    });
})();
