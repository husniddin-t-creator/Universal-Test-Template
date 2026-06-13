const SAVE_URL =
"https://script.google.com/macros/s/AKfycbwdf-qj9JNe_u6nm22GLPq9qDKNYxjXPpwemyX_IeyAdSh5kjmT40dsOAnREESzHuveww/exec";

const CSV_URL =
"https://docs.google.com/spreadsheets/d/1ny8Q9YqCXcHrz8SnSsC6LZTYTF64BVlWhx7VmJhGplk/export?format=csv&gid=0";

let questions = [];
let currentQuestion = 0;
let score = 0;

let timeLeft = 30 * 60;
let timerInterval;

async function loadQuestions() {

  const response = await fetch(CSV_URL);
  const csvText = await response.text();

  const rows = csvText.trim().split("\n");

  questions = [];

  for(let i = 1; i < rows.length; i++) {

    const cols = rows[i].split(",");

    if(cols.length >= 6){

      let answers = [
        cols[2],
        cols[3],
        cols[4],
        cols[5]
      ];

      let correctAnswer = cols[2];

      answers.sort(() => Math.random() - 0.5);

      questions.push({
        question: cols[1],
        answers: answers,
        correct: answers.indexOf(correctAnswer)
      });

    }

  }

  questions.sort(() => Math.random() - 0.5);

  questions = questions.slice(0, 50);

  console.log("Savollar soni:", questions.length);
}

loadQuestions();

function startTest(){

  if(questions.length === 0){
    alert("Savollar hali yuklanmagan. Bir necha soniya kuting.");
    return;
  }

  let fullname =
  document.getElementById("fullname").value;

  let group =
  document.getElementById("group").value;

  if(fullname === "" || group === ""){
    alert("Ism familiya va guruhni kiriting!");
    return;
  }

  window.studentName = fullname;
  window.studentGroup = group;

  currentQuestion = 0;
  score = 0;

  timeLeft = 30 * 60;

  clearInterval(timerInterval);

  timerInterval =
  setInterval(updateTimer,1000);

  showQuestion();
}

function showQuestion(){

  const q = questions[currentQuestion];

  document.querySelector(".container").innerHTML = `
  <p id="timer"></p>

  <h2>${currentQuestion+1}-savol / 50</h2>

  <p><b>${q.question}</b></p>

  <label>
  <input type="radio" name="ans" value="0">
  A) ${q.answers[0]}
  </label><br><br>

  <label>
  <input type="radio" name="ans" value="1">
  B) ${q.answers[1]}
  </label><br><br>

  <label>
  <input type="radio" name="ans" value="2">
  C) ${q.answers[2]}
  </label><br><br>

  <label>
  <input type="radio" name="ans" value="3">
  D) ${q.answers[3]}
  </label><br><br>

  <button onclick="nextQuestion()">
  Keyingi
  </button>
  `;

  updateTimer();
}

function nextQuestion(){

  const selected =
  document.querySelector('input[name="ans"]:checked');

  if(!selected){
    alert("Javobni tanlang!");
    return;
  }

  if(Number(selected.value) === questions[currentQuestion].correct){
    score++;
  }

  currentQuestion++;

  if(currentQuestion < questions.length){

    showQuestion();

  }else{

    finishTest();

  }

}

function finishTest(){

clearInterval(timerInterval);

let percent =
Math.round(score / questions.length * 100);

let html = `

if(percent >= 90){

html += `
<br><br>
<button onclick="downloadCertificate()">
🎓 Sertifikatni olish
</button>
`;

}

document.querySelector(".container").innerHTML =
html;

saveResult(score, percent);

}
function updateTimer(){

  let min =
  Math.floor(timeLeft / 60);

  let sec =
  timeLeft % 60;

  const timer =
  document.getElementById("timer");

  if(timer){

    timer.innerHTML =
    "⏰ Qolgan vaqt: " +
    min + ":" +
    String(sec).padStart(2,"0");

  }

  timeLeft--;

  if(timeLeft < 0){

    finishTest();

  }

}

async function saveResult(ball, foiz){

  try{

    await fetch(SAVE_URL,{
      method:"POST",
      body:JSON.stringify({
        ism: window.studentName,
        guruh: window.studentGroup,
        ball: ball,
        foiz: foiz
      })
    });

  }catch(error){

    console.log(error);

  }

}
function downloadCertificate(){

localStorage.setItem(
"studentName",
window.studentName
);

localStorage.setItem(
"studentPercent",
Math.round(score / questions.length * 100)
);

window.open(
"certificate.html",
"_blank"
);

}
