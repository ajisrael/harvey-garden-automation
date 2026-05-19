import serverConfig from '../config/serverConfig.js';
import { throwErrorWithMessagesOrCallNext } from './errorMiddleware.js';

function validateEmail(email, messages) {
  const emailIsValid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!email) {
    messages.push('email is empty');
  } else if (typeof email !== 'string') {
    messages.push('email must be a string');
  } else if (!emailIsValid.test(email)) {
    messages.push('email format is not valid');
  }
}

function validateName(name, messages) {
  if (!name) {
    messages.push('name is empty');
  } else if (typeof name !== 'string') {
    messages.push('name must be a string');
  }
}

function validatePassword(password, messages) {
  if (!password) {
    messages.push('password is empty');
  } else if (typeof password !== 'string') {
    messages.push('password must be a string');
  } else if (password.length < serverConfig.passwordMinLength) {
    messages.push(
      `password must be at least ${serverConfig.passwordMinLength} characters long`
    );
  } else if (password.length > serverConfig.passwordMaxLength) {
    messages.push(
      `password cannot be more than ${serverConfig.passwordMaxLength} characters long`
    );
  }
}

function validateLoginData(req, res, next) {
  let messages = [];

  if (Object.keys(req.body).length === 0) {
    messages.push('body required for request');
  } else {
    validateEmail(req.body.email, messages);
    validatePassword(req.body.password, messages);
  }

  throwErrorWithMessagesOrCallNext(messages, res, next);
}

function validateRegistrationData(req, res, next) {
  let messages = [];

  if (Object.keys(req.body).length === 0 || !req.body) {
    messages.push('body required for request');
  } else {
    validateEmail(req.body.email, messages);
    validateName(req.body.name, messages);
    validatePassword(req.body.password, messages);
  }

  throwErrorWithMessagesOrCallNext(messages, res, next);
}

export { validateLoginData, validateRegistrationData };
