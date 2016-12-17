// var person = {
//   name: 'Megan',
//   age: 26
// };
//
// function updatePerson(obj) {
//   // obj = {
//   //   name: 'Megan',
//   //   age: 22
//   // };
//   obj.age = 22;
// }
//
// updatePerson(person);
// console.log(person);

// Array Example

var grades = [22, 34];
// function updateGrades(gra) {
//   gra.push(23);
// }
function updateGradesToo(gra) {
  gra = [12, 33, 99];
  return gra;
  debugger;
}

// updateGrades(grades);
// console.log('grades:' + grades);

grades = updateGradesToo(grades);
console.log('grades too: ' + grades);
