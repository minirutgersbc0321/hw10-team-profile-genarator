const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

const render = require("./lib/htmlRenderer");

// Variable to store team members
const team = [];

// Determines the current Employee type
let memberType = "Manager";

// Block of HTML with all employees
let htmlBlock = "";

/* LOGIC & FUNCTIONS
--------------------------------------------------------------*/

// Set manager specific questions and validation
let teamMemberId = "manager's";
let message = "What is your manager's office number?";
let validateSpecial = async (input) => {
  if (input === "" || isNaN(input)) {
    return "Please enter a valid number.";
  } else {
    return true;
  }
};

// Ask user manager specific questions
questions(teamMemberId, message, validateSpecial);

// Asks user questions to create appropriate Employee objects
// Function takes teamType (manager/engineer/intern) and special Message/Val for forth question
// First questions stay the same since they are the same for all employees

function questions(teamType, specialMessage, specialVal) {
  let nameMessage = "What is your " + teamType + " name?";
  let idMessage = "What is your " + teamType + " id?";
  let emailMessage = "What is your " + teamType + " email?";
  inquirer
    .prompt([
      // Ask for employee's name & check to make sure field isn't empty
      {
        type: "input",
        message: nameMessage,
        name: "name",
        validate: async (input) => {
          if (input === "") {
            return "Please provide a valid name.";
          } else {
            return true;
          }
        },
      },
      // Ask for employee's id & check to make sure input is a number or is not empty
      {
        type: "input",
        message: idMessage,
        name: "id",
        validate: async (input) => {
          if (input === "" || isNaN(input)) {
            return "Ids can only contain whole numbers.";
          } else {
            return true;
          }
        },
      },
      // Ask for employee's email & check to make sure input is a valid email or is not empty
      {
        type: "input",
        message: emailMessage,
        name: "email",
        validate: async (input) => {
          const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
            input
          );
          if (input === "" || !emailValidation) {
            return "Please enter a valid email address.";
          } else {
            return true;
          }
        },
      },
      // Ask special question for Manager (office phone number), Engineer (GitHub account), Intern (school)
      // Include special validation depending the type of input
      {
        type: "input",
        message: specialMessage,
        name: "special",
        validate: specialVal,
      },
      // Ask what type of team member needs to be created next
      {
        type: "list",
        message: "Which type of team member would you like to add?",
        name: "teamMember",
        choices: [
          "Engineer",
          "Intern",
          "I don't want to add any more team members",
        ],
      },
    ])
    .then((answers) => {
      // Call function to create employee to add to team array
      makeEmployee(
        answers.name,
        answers.id,
        answers.email,
        answers.special,
        answers.teamMember
      );
    })
    .catch((error) => {
      if (error.isTtyError) {
        console.log(error);
      }
    });
}

// Function takes in all the user answers as parameters
function makeEmployee(
  employeeName,
  employeeId,
  employeeEmail,
  employeeSpecial,
  nextMember
) {
  // Creates object depending on the current employee type and adds employee to team array.
  if (memberType == "Manager") {
    let manager = new Manager(
      employeeName,
      employeeId,
      employeeEmail,
      employeeSpecial
    );
    team.push(manager);
  } else if (memberType == "Engineer") {
    let engineer = new Engineer(
      employeeName,
      employeeId,
      employeeEmail,
      employeeSpecial
    );
    team.push(engineer);
  } else {
    let intern = new Intern(
      employeeName,
      employeeId,
      employeeEmail,
      employeeSpecial
    );
    team.push(intern);
  }

  // Determine the questions for the next employee to be added and set the memberType to next employee type
  if (nextMember == "Engineer") {
    // Set engineer specific questions and validation
    let textEngineer = "engineer's";
    let specialEngineerQ = "What is your engineer's GitHub username?";
    let specialEngineerV = async function (input) {
      if (input === "") {
        return "Please enter a valid username.";
      } else {
        return true;
      }
    };

    // Set current member type to next member requested
    memberType = nextMember;

    // Ask user the questions specific to enigneer employee
    questions(textEngineer, specialEngineerQ, specialEngineerV);
  } else if (nextMember == "Intern") {
    // Set intern specific questions and validation
    let textIntern = "intern's";
    let specialInternQ = "What school did your intern attend?";
    let specialInternV = async function (input) {
      if (input === "") {
        return "Please enter a valid username.";
      } else {
        return true;
      }
    };
    // Set current member type to next member requested
    memberType = nextMember;

    // Ask user the questions specific to intern employee
    questions(textIntern, specialInternQ, specialInternV);
  } else {
    // If no employee type was chosen, call renderer with team array
    htmlBlock = render(team);
    outputHTML();
  }
}

// Generates team.html with all the relevant team information
function outputHTML() {
  fs.writeFile(outputPath, htmlBlock, (err) => {
    if (err) throw err;
    console.log("The file has been saved! Check the output folder.");
  });
}
