document.addEventListener('DOMContentLoaded', () => {
  // Handle log in.
  const form = document.querySelector('#start-form');
  const submitButton = document.querySelector('#start-form .submit-button');
  const firstName = document.querySelector('#first-name');
  const surname = document.querySelector('#surname');
  const email = document.querySelector('#email');
  const phone = document.querySelector('#phone');
  const password = document.querySelector('#password');
  const confirmPassword = document.querySelector('#confirm-password');
  const student_id = document.querySelector('#student_id');
  const loginError = document.querySelector('.error-list');
  const pwToggle = document.querySelector('#pw-toggle');
  const changePw = document.querySelector('.change-password');

  // Autofocus first field.
  firstName.focus();

  // Password toggle
  let changePwState = false;
  pwToggle.addEventListener('click', event => {
    changePwState = !changePwState;
    if (changePwState) {
      changePw.style.display = 'block';
      pwToggle.textContent = 'Close'
    } else {
      changePw.style.display = 'none';
      pwToggle.textContent = 'Change password';
    }
  });

  // Attach event handlers to each input control.
  for (const element of document.querySelectorAll('#start-form input')) {
    element.addEventListener('input', event => {
      if (!element.checkValidity()) {
        element.classList.add('invalid');
      } else {
        element.classList.remove('invalid');
      }
    });
  }

  // Validate form on submit, and show error messages.
  form.addEventListener('submit', event => {
    let invalid = false;
    clearError();

    if (!firstName.checkValidity()) {
      showError(firstName, getErrorMsg('first name', firstName.validity));
      invalid = true;
    }

    if (!surname.checkValidity()) {
      showError(surname, getErrorMsg('surname', surname.validity));
      invalid = true;
    }

    if (!email.checkValidity()) {
      showError(email, getErrorMsg('email', email.validity));
      invalid = true;
    }

    if (!student_id.checkValidity()) {
      showError(student_id, getErrorMsg('student id', student_id.validity));
      invalid = true;
    }

    if (!phone.checkValidity()) {
      showError(phone, getErrorMsg('phone', phone.validity));
      invalid = true;
    }

    if (password.value !== confirmPassword.value) {
      showError(password, 'Passwords must match.');
      confirmPassword.classList.add('invalid');
      invalid = true;
    }

    if (invalid) {
      event.preventDefault();
    }
  });

  // These functions are in the event handler because they use elements from the DOM.
  function showError(element, text) {
    const item = document.createElement('li');
    item.textContent = text;
    loginError.appendChild(item);

    element.classList.add('invalid');
  }

  function clearError() {
    while (loginError.firstChild) {
      loginError.removeChild(loginError.firstChild);
    }
  }

  function getErrorMsg(name, validity) {
    let message;
    switch (true) {
      case validity.valueMissing:
        message = `${name} cannot be empty.`;
        break;
      case validity.tooLong:
        message = `${name} too long.`;
        break;
      case validity.rangeOverflow:
        message = `${name} too big.`;
        break;
      case validity.rangeUnderflow:
        message = `${name} too small.`;
        break;
      default:
        message = `Invalid ${name}.`;

      return message;
    }

    return sentenceCase(message);
  }

  function sentenceCase(text) {
    return text[0].toUpperCase() + (text.slice(1)).toLowerCase();
  }
});
