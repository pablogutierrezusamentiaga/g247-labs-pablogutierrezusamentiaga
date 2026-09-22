// Participante: Pablo Gutiérrez Usamentiaga
// Laboratorio 3 — Parte 2: lógica y funciones aplicadas al sitio

// FizzBuzz — print 1..n. Multiples of 3 become "Fizz",
// multiples of 5 become "Buzz", multiples of both become "FizzBuzz".
function fizzBuzz(n) {
    for (let i = 1; i <= n; i++) {
      if (i % 3 === 0 && i % 5 === 0) {
        console.log("FizzBuzz");
      } else if (i % 3 === 0) {
        console.log("Fizz");
      } else if (i % 5 === 0) {
        console.log("Buzz");
      } else {
        console.log(i);
      }
    }
  }
// findMax — return the largest value in the array. No Math.max.
// Return undefined for an empty array.
function findMax(numbers) {
    if (numbers.length === 0) {
      return undefined;
    }
  
    let max = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] > max) {
        max = numbers[i];
      }
    }
    return max;
  }
// isPalindrome — ignore case, spaces, and punctuation.
const isPalindrome = (str) => {
    const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  
    let reversed = "";
    for (let i = clean.length - 1; i >= 0; i--) {
      reversed = reversed + clean[i];
    }
  
    return clean === reversed;
  };
// Basic email shape validation. Return true or false.
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  // At least 8 characters, one letter, and one digit.
  function validatePassword(password) {
    if (password.length < 8) {
      return false;
    }
  
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
  
    return hasLetter && hasDigit;
  }
  
  // Return { valid: true, errors: [] } or
  // { valid: false, errors: ["...", "..."] }.
  function validateLoginForm(email, password) {
    const errors = [];
  
    if (!validateEmail(email)) {
      errors.push("El correo electrónico no tiene un formato válido.");
    }
  
    if (!validatePassword(password)) {
      errors.push("La contraseña debe tener al menos 8 caracteres, una letra y un dígito.");
    }
  
    return { valid: errors.length === 0, errors: errors };
  }
fizzBuzz(15);
console.assert(findMax([3, 7, 2, 9, 1]) === 9, "findMax basic");
console.assert(findMax([-5, -2, -9]) === -2, "findMax negatives");
console.assert(findMax([]) === undefined, "findMax empty");

console.assert(isPalindrome("racecar") === true, "isPalindrome basic");
console.assert(isPalindrome("A man, a plan, a canal: Panama") === true, "isPalindrome punctuation");
console.assert(isPalindrome("hello") === false, "isPalindrome false case");


console.assert(validateEmail("fan@riverside.fc") === true, "email valid");
console.assert(validateEmail("fan@riversidefc") === false, "email needs a dot");
console.assert(validateEmail("fanriverside.fc") === false, "email needs an @");

console.assert(validatePassword("Season2026") === true, "password ok");
console.assert(validatePassword("short1") === false, "password too short");
console.assert(validatePassword("allletters") === false, "password needs a digit");

console.assert(validateLoginForm("fan@riverside.fc", "Season2026").valid === true, "form valid");
console.assert(validateLoginForm("nope", "x").errors.length === 2, "form reports both errors");


// Datos reales del sitio: goles del Racing en las últimas jornadas.
const golesRacing = [2, 0, 1, 3, 1, 0, 2];

console.log("Máximo de goles en un partido:", findMax(golesRacing));
console.log("¿'Racing' es palíndromo?", isPalindrome("Racing"));