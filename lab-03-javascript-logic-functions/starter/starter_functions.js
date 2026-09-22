/*
  Starter file for Session 9 Lab — Part 1 (Guided JS Practice)
  Web Application Programming (G247) · CUNEF Escuela Politécnica Superior

  Week 3 · Session 9 · Practice (AF2) · Pair work

  Do NOT rename the functions and do NOT change their signatures — the
  tests at the bottom of this file call them by name. You only write the
  bodies. This is a shared file: everyone completes the same skeletons.
*/

// =====================================================================
// 0. THE SIX IDEAS YOU NEED FIRST
//    (Session 8 recap + the GeeksforGeeks reference:
//     https://www.geeksforgeeks.org/javascript/functions-in-javascript/)
// =====================================================================
// 1. PARAMETER vs ARGUMENT
//    A parameter is the placeholder in the definition: greet(name).
//    An argument is the real value you pass at call time: greet("Ana").
//
// 2. FUNCTION DECLARATION
//    function square(n) { return n * n; }
//    Hoisted — callable anywhere in the file, even before its definition.
//
// 3. FUNCTION EXPRESSION
//    const square = function (n) { return n * n; };
//    A function stored in a variable — it exists only once that line runs.
//
// 4. ARROW FUNCTION (ES6)
//    const square = (n) => n * n;
//    Shorter syntax; no own `this`. Perfect for every exercise here.
//
// 5. DEFAULT PARAMETERS
//    function greet(name = "friend") { ... }
//    When no argument is passed, the default value is used instead.
//
// 6. THE RETURN STATEMENT
//    return sends a value back to the caller AND stops the function.
//    A function with no return statement returns undefined.
// =====================================================================

// ---------------------------------------------------------------------
// WARM-UP 1 — greet
//   Behavior (same for all three versions):
//     greet("Ana")  -> "Hello, Ana!"
//     greet()       -> "Hello, friend!"   (default parameter)
//   Write the same body three times, once per syntax. The suffix in the
//   name only exists so the three versions can live in one file.
// ---------------------------------------------------------------------

// 1a. Function declaration
function greetDeclaration(name = "friend") {
    return `Hello, ${name}!`;
  }
  
  // 1b. Function expression
  const greetExpression = function (name = "friend") {
    return `Hello, ${name}!`;
  };
  
  // 1c. Arrow function
  const greetArrow = (name = "friend") => {
    return `Hello, ${name}!`;
  };
  
  // ---------------------------------------------------------------------
  // WARM-UP 2 — square
  //   Behavior: square(5) -> 25, square(-3) -> 9, square(0) -> 0
  // ---------------------------------------------------------------------
  
  // 2a. Function declaration
  function squareDeclaration(n) {
    return n * n;
  }
  
  // 2b. Function expression
  const squareExpression = function (n) {
    return n * n;
  };
  
  // 2c. Arrow function
  const squareArrow = (n) => {
    return n * n;
  };
  
  // ---------------------------------------------------------------------
  // WARM-UP 3 — sumArray
  //   Behavior: sumArray([1, 2, 3, 4]) -> 10, sumArray([]) -> 0
  //   Needs a loop with a running total — Session 8 control flow again.
  // ---------------------------------------------------------------------
  
  // 3a. Function declaration
  function sumArrayDeclaration(numbers) {
    let total = 0;
    for (let i = 0; i < numbers.length; i++) {
        total = total + numbers[i];
    }
    return total;
  }
  
  // 3b. Function expression
  const sumArrayExpression = function (numbers) {
    let total = 0;
    for (let i = 0; i < numbers.length; i++) {
        total = total + numbers[i];
    }
    return total;
  };
  
  // 3c. Arrow function
  const sumArrayArrow = (numbers) => {
    let total = 0;
    for (let i = 0; i < numbers.length; i++) {
        total = total + numbers[i];
    }
    return total;
  };
  
  // ---------------------------------------------------------------------
  // WARM-UP 4 — celsiusToFahrenheit
  //   Behavior: celsiusToFahrenheit(0) -> 32,
  //             celsiusToFahrenheit(100) -> 212,
  //             celsiusToFahrenheit(-40) -> -40
  //   Formula: (celsius * 9 / 5) + 32
  // ---------------------------------------------------------------------
  
  // 4a. Function declaration
  function celsiusToFahrenheitDeclaration(celsius) {
    return (celsius * 9 / 5) + 32;
  }
  
  // 4b. Function expression
  const celsiusToFahrenheitExpression = function (celsius) {
    return (celsius * 9 / 5) + 32;
  };
  
  // 4c. Arrow function
  const celsiusToFahrenheitArrow = (celsius) => {
    return (celsius * 9 / 5) + 32;
  };
  
  // =====================================================================
  // TESTS — how to run:
  //   1. Browser (recommended): create a throwaway runner.html next to this
  //      file containing <script src="starter_functions.js"></script>, open
  //      it, and press F12 -> Console.
  //   2. Node (if you have it): node starter_functions.js
  //   A SILENT console means every assertion passed. Red "Assertion failed"
  //   messages point at the bodies that still need work.
  // =====================================================================
  
  // greet — every version, with and without the argument
  console.assert(greetDeclaration("Ana") === "Hello, Ana!", "greetDeclaration('Ana')");
  console.assert(greetDeclaration() === "Hello, friend!", "greetDeclaration() uses default");
  console.assert(greetExpression("Ana") === "Hello, Ana!", "greetExpression('Ana')");
  console.assert(greetExpression() === "Hello, friend!", "greetExpression() uses default");
  console.assert(greetArrow("Ana") === "Hello, Ana!", "greetArrow('Ana')");
  console.assert(greetArrow() === "Hello, friend!", "greetArrow() uses default");
  
  // square
  console.assert(squareDeclaration(5) === 25, "squareDeclaration(5)");
  console.assert(squareExpression(-3) === 9, "squareExpression(-3)");
  console.assert(squareArrow(0) === 0, "squareArrow(0)");
  
  // sumArray
  console.assert(sumArrayDeclaration([1, 2, 3, 4]) === 10, "sumArrayDeclaration");
  console.assert(sumArrayExpression([]) === 0, "sumArrayExpression([])");
  console.assert(sumArrayArrow([5, -2, 7]) === 10, "sumArrayArrow");
  
  // celsiusToFahrenheit
  console.assert(celsiusToFahrenheitDeclaration(0) === 32, "celsiusToFahrenheitDeclaration(0)");
  console.assert(celsiusToFahrenheitExpression(100) === 212, "celsiusToFahrenheitExpression(100)");
  console.assert(celsiusToFahrenheitArrow(-40) === -40, "celsiusToFahrenheitArrow(-40)");