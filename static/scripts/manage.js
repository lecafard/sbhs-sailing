document.addEventListener('DOMContentLoaded', () => {
  // Handle log in.
  const form = document.querySelector('#new-user-form');
  const newUserButton = document.querySelector('#new-user-button');
  const submitButton = document.querySelector('#new-user-form .submit-button');
  const firstName = document.querySelector('#first-name');
  const surname = document.querySelector('#surname');
  const email = document.querySelector('#email');
  const phone = document.querySelector('#phone');
  const password = document.querySelector('#password');
  const studentId = document.querySelector('#student-id');
  const userLevel = document.querySelector('#user-level');
  const accountDisabled = document.querySelector('#account-disabled');
  const loginError = document.querySelector('.error-list');

  let enteringNewUser = false;
  newUserButton.addEventListener('click', event => {
    enteringNewUser = !enteringNewUser;
    form.style.display = enteringNewUser ? 'block' : 'none';
    // newUserButton.style.display = enteringNewUser ? 'none' : 'block';
    if (enteringNewUser) {
      newUserButton.textContent = 'Close';
    } else {
      newUserButton.textContent = '';
      form.reset();
      const plus = document.createElement('i');
      plus.classList.add('fa');
      plus.classList.add('fa-plus');
      const text = document.createTextNode('New User');
      newUserButton.appendChild(plus);
      newUserButton.appendChild(text);
    }
  });

  // Attach event handlers to each input control.
  for (const element of document.querySelectorAll('#new-user-form input')) {
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

    if (!phone.checkValidity()) {
      showError(phone, getErrorMsg('phone', phone.validity));
      invalid = true;
    }

    if (!studentId.checkValidity()) {
      showError(studentId, getErrorMsg('student id', studentId.validity));
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
