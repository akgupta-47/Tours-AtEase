/* eslint-disable */

import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login } from './login';

// DOM ELEMNTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');

// VALUES
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', (el) => {
    el.preventDefault();
    login(email, password);
  });
