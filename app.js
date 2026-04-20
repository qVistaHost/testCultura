const firebaseConfig = {
  apiKey: "AIzaSyD85vJvY18PirSaPnyvpKZuz4M2V09cvCU",
  authDomain: "testcultura-6c89c.firebaseapp.com",
  databaseURL: "https://testcultura-6c89c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "testcultura-6c89c",
  storageBucket: "testcultura-6c89c.firebasestorage.app",
  messagingSenderId: "606751479728",
  appId: "1:606751479728:web:4d7a8600a48f703429e875"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const labels = {home:'Inicio',join:'Unirse',lobby:'Lobby',question:'Pregunta',wait:'Esperando',result:'Resultado',score:'Marcador'};
let currentRoom = null;
let playerName = 'Carlos';
let isHost = false;
let currentQuestion = null;
let questionIndex = 0;
let gameQuestions = [];
let playerScore = 0;
let answeredCount = 0;

const preguntas = [
  {"pregunta": "Descubrimiento de América", "año": 1492},
  {"pregunta": "Caída del Imperio Romano de Occidente", "año": 476},
  {"pregunta": "Inicio de la Revolución Francesa", "año": 1789},
  {"pregunta": "Proclamación de la Independencia de los Estados Unidos", "año": 1776},
  {"pregunta": "Publicación de la teoría de la relatividad por Albert Einstein", "año": 1915},
  {"pregunta": "Fin de la Segunda Guerra Mundial", "año": 1945},
  {"pregunta": "Primera circunnavegación del globo completada por Juan Sebastián Elcano", "año": 1522},
  {"pregunta": "Revolución Rusa", "año": 1917},
  {"pregunta": "Inicio de la construcción de la Gran Muralla China", "año": -221},
  {"pregunta": "Nacimiento de Leonardo da Vinci", "año": 1452},
  {"pregunta": "Invención de la imprenta por Johannes Gutenberg", "año": 1440},
  {"pregunta": "Caída del Muro de Berlín", "año": 1989},
  {"pregunta": "Primera guerra mundial", "año": 1914},
  {"pregunta": "Llegada del hombre a la Luna", "año": 1969},
  {"pregunta": "Fundación de Roma", "año": -753},
  {"pregunta": "Inicio del Renacimiento", "año": 1300},
  {"pregunta": "Descubrimiento del fuego", "año": -400000},
  {"pregunta": "Creación de la World Wide Web", "año": 1989},
  {"pregunta": "Asesinato de Julio César", "año": -44},
  {"pregunta": "Independencia de México", "año": 1810},
  {"pregunta": "Primera publicación de la Enciclopedia Británica", "año": 1768},
  {"pregunta": "Fundación de la ONU", "año": 1945},
  {"pregunta": "Inicio de la era vikinga", "año": 793},
  {"pregunta": "Primera cruzada", "año": 1096},
  {"pregunta": "Nacimiento de Isaac Newton", "año": 1642},
  {"pregunta": "Invención del teléfono por Alexander Graham Bell", "año": 1876},
  {"pregunta": "Inicio de la construcción del Taj Mahal", "año": 1632},
  {"pregunta": "Abolición de la esclavitud en Estados Unidos", "año": 1865},
  {"pregunta": "Inicio del Imperio Otomano", "año": 1299},
  {"pregunta": "Primera publicación de 'El origen de las especies' por Charles Darwin", "año": 1859}
];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function syncName(){
  playerName = (document.getElementById('playerName').value||'').trim()||'Tú';
  ['selfNameLobby','selfNameWait','selfNameResult','selfNameScore'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.textContent = playerName;
  });
}

function showScreen(name){
  document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
  const screen = document.getElementById('screen-'+name);
  if(screen) screen.classList.add('active');
  document.getElementById('screenLabel').textContent = labels[name]||'';
  syncName();
  if(name === 'result'){
    updateRoundAnswers();
  } else if(name === 'score'){
    updateScoreboard();
  }
}

function generateRoomCode(){
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function createRoom(){
  const roomCode = generateRoomCode();
  const roomRef = db.ref('rooms/' + roomCode);
  roomRef.set({
    code: roomCode,
    host: playerName,
    status: 'waiting',
    currentQuestion: 0,
    totalQuestions: 10,
    players: {}
  }).then(() => {
    return db.ref('rooms/' + roomCode + '/players/' + playerName).set({
      name: playerName,
      ready: true,
      isHost: true,
      score: 0
    });
  }).then(() => {
    currentRoom = roomCode;
    isHost = true;
    allAnsweredReceived = false;
    document.getElementById('roomCode').textContent = roomCode;
    updateLobbyUI({[playerName]: {name: playerName, ready: true, isHost: true}});
    showScreen('lobby');
    listenToRoom(roomCode);
    listenToGame(roomCode);
  }).catch(e => {
    console.error(e);
    alert('Error al crear sala');
  });
}

function joinRoom(code){
  db.ref('rooms/' + code).once('value').then(snapshot => {
    if(snapshot.exists()){
      currentRoom = code;
      isHost = false;
      allAnsweredReceived = false;
      document.getElementById('roomCode').textContent = code;
      return db.ref('rooms/' + code + '/players/' + playerName).set({
        name: playerName,
        ready: false,
        isHost: false,
        score: 0
      });
    } else {
      alert('Sala no encontrada');
    }
  }).then(() => {
    if(currentRoom) {
      showScreen('lobby');
      listenToRoom(code);
      listenToGame(code);
    }
  }).catch(e => {
    console.error(e);
    alert('Error al unirse');
  });
}

function listenToRoom(code){
  db.ref('rooms/' + code).on('value', (snapshot) => {
    const room = snapshot.val();
    if(!room) return;
    updateLobbyUI(room.players);
  });
}

let lastCountdownIndex = -1;

function listenToGame(code){
  db.ref('rooms/' + code + '/game').on('value', (snapshot) => {
    const game = snapshot.val();
    if(!game) return;
    if(game.status === 'playing'){
      lastCountdownIndex = -1;
      gameQuestions = game.questions;
      questionIndex = game.currentIndex;
      showCurrentQuestion();
    }
    if(game.status === 'countdown'){
      if(lastCountdownIndex === game.currentIndex && countdownInterval){
        return;
      }
      lastCountdownIndex = game.currentIndex;

      if(countdownInterval){
        clearInterval(countdownInterval);
        countdownInterval = null;
      }

      gameQuestions = game.questions;
      questionIndex = game.currentIndex;

      db.ref('rooms/' + currentRoom + '/players/' + playerName).once('value').then(snap => {
        const selfData = snap.val();
        if(selfData && selfData.answered){
          showScreen('wait');
        }
      });

      const waitMsg = document.getElementById('waitMessage');
      const nextAt = game.nextAt || Date.now() + 10000;

      countdownInterval = setInterval(() => {
        const remaining = Math.ceil((nextAt - Date.now()) / 1000);
        if(waitMsg && remaining > 0){
          waitMsg.textContent = 'Siguiente pregunta en ' + remaining + 's...';
        }
        if(remaining <= 0){
          clearInterval(countdownInterval);
          countdownInterval = null;
          lastCountdownIndex = -1;
          if(isHost){
            db.ref('rooms/' + code + '/game').update({
              status: 'playing',
              nextAt: null
            });
          }
        }
      }, 1000);
    }
  });
}

function updateLobbyUI(players){
  if(!players) return;
  const lobbyCard = document.getElementById('lobbyPlayers');
  if(!lobbyCard) return;
  
  const playerCount = Object.keys(players).length;
  const countEl = document.getElementById('playerCount');
  if(countEl) countEl.textContent = playerCount + '/8';
  
  let html = '<div class="row"><strong>Jugadores</strong><span class="small muted">' + playerCount + '/8</span></div>';
  for(const [key, p] of Object.entries(players)){
    const status = p.isHost ? 'Host' : (p.ready ? 'Listo' : 'Lista');
    html += '<div class="list-item"><span style="font-weight:600;">' + p.name + '</span><span class="pill' + (p.ready ? ' pill-dark' : '') + '">' + status + '</span></div>';
  }
  
  lobbyCard.innerHTML = html;
}

function updateLobbyAfterCreate(){
  db.ref('rooms/' + currentRoom + '/players').once('value').then(snapshot => {
    updateLobbyUI(snapshot.val());
  });
}

function startGame(){
  if(!isHost){
    alert('Solo el host puede iniciar la partida');
    return;
  }
  const shuffled = shuffleArray([...preguntas]);
  gameQuestions = shuffled.slice(0, 10);
  questionIndex = 0;
  playerScore = 0;
  db.ref('rooms/' + currentRoom + '/game').set({
    questions: gameQuestions,
    currentIndex: 0,
    status: 'playing'
  }).then(() => {
    showCurrentQuestion();
  });
}

function showCurrentQuestion(){
  if(questionIndex >= gameQuestions.length){
    showFinalScore();
    return;
  }
  currentQuestion = gameQuestions[questionIndex];
  document.getElementById('questionText').textContent = currentQuestion.pregunta;
  const questionNumEl = document.getElementById('questionNum');
  if(questionNumEl) questionNumEl.textContent = 'Pregunta ' + (questionIndex + 1) + '/' + gameQuestions.length;
  document.getElementById('answerYear').value = '';
  showScreen('question');
}

function nextQuestion(){
  if(!isHost) return;
  
  if(countdownInterval){
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  allAnsweredReceived = false;
  
  db.ref('rooms/' + currentRoom + '/game').update({
    currentIndex: questionIndex + 1,
    status: 'countdown',
    nextAt: Date.now() + 3000
  });
  
  db.ref('rooms/' + currentRoom + '/players').once('value').then(snapshot => {
    const players = snapshot.val() || {};
    const updates = {};
    for(const key in players){
      updates[key + '/answered'] = false;
      updates[key + '/answer'] = null;
      updates[key + '/diff'] = 0;
    }
    db.ref('rooms/' + currentRoom + '/players').update(updates);
  });
  
  const answersContainer = document.getElementById('roundAnswers');
  if(answersContainer) answersContainer.innerHTML = '';
  
  showScreen('wait');
}

function showFinalScore(){
  alert('Fin de la partida! Puntuación total: ' + playerScore);
  showScreen('home');
}

function submitAnswer(){
  if(!currentQuestion){
    alert('No hay pregunta activa');
    return;
  }
  const yearInput = document.getElementById('answerYear').value;
  const year = yearInput ? yearInput.trim() : String(currentQuestion ? currentQuestion.año : 0);
  const diff = Math.abs(Number(year) - currentQuestion.año);
  playerScore += diff;
  
  const submittedEl = document.getElementById('submittedYear');
  const correctEl = document.getElementById('correctYear');
  
  if(submittedEl) submittedEl.textContent = year;
  if(correctEl) correctEl.textContent = currentQuestion.año;
  
  if(currentRoom){
    db.ref('rooms/' + currentRoom + '/players/' + playerName).update({
      answered: true,
      answer: year,
      diff: diff
    });
  }
  
  showScreen('wait');
  listenForAllAnswered();
}

let countdownInterval = null;
let allAnsweredReceived = false;
let playersListener = null;

function listenForAllAnswered(){
  if(!currentRoom) return;
  
  if(countdownInterval){
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  if(playersListener){
    db.ref('rooms/' + currentRoom + '/players').off('value', playersListener);
    playersListener = null;
  }
  
  playersListener = (snapshot) => {
    const players = snapshot.val() || {};
    const playerCount = Object.keys(players).length;
    let answeredCount = 0;
    let allAnswers = {};
    
    for(const [key, p] of Object.entries(players)){
      if(p.answered) answeredCount++;
      allAnswers[key] = p;
    }
    
    const container = document.getElementById('roundStatus');
    if(container){
      let html = '';
      for(const [key, p] of Object.entries(players)){
        html += '<div class="list-item"><span>' + p.name + '</span><span class="pill' + (p.answered ? ' pill-dark' : '') + '">' + (p.answered ? 'OK' : '...') + '</span></div>';
      }
      container.innerHTML = html;
    }
    
    const waitMsg = document.getElementById('waitMessage');
    
    if(answeredCount >= playerCount && playerCount > 0 && !countdownInterval){
      if(waitMsg) waitMsg.textContent = 'Todos han respondido!';
      
      const answersContainer = document.getElementById('roundAnswers');
      if(answersContainer){
        let html = '<strong>Resultados</strong>';
        const sorted = Object.values(allAnswers).sort((a,b) => a.diff - b.diff);
        for(const p of sorted){
          const isSelf = p.name === playerName;
          html += '<div class="list-item' + (isSelf ? ' dark' : '') + '"><div><div style="font-weight:700;">' + p.name + '</div><div class="sub">' + p.answer + '</div></div><div style="text-align:right;"><div style="font-weight:800;">+' + p.diff + '</div><div class="sub">pts</div></div></div>';
        }
        answersContainer.innerHTML = html;
      }
      
      if(isHost && !allAnsweredReceived){
        allAnsweredReceived = true;
        currentRoom && db.ref('rooms/' + currentRoom + '/game').update({
          currentIndex: questionIndex + 1,
          status: 'countdown',
          nextAt: Date.now() + 10000
        });
      }
    } else if(answeredCount < playerCount) {
      if(waitMsg) waitMsg.textContent = 'Esperando... (' + answeredCount + '/' + playerCount + ')';
    }
  };
  
  db.ref('rooms/' + currentRoom + '/players').on('value', playersListener);
}

function updateRoundStatus(){
  const container = document.getElementById('roundStatus');
  if(!container || !currentRoom) return;
  
  db.ref('rooms/' + currentRoom + '/players').once('value').then(snapshot => {
    const players = snapshot.val() || {};
    let html = '<div class="list-item"><span>' + playerName + '</span><span class="pill pill-dark">Respondido</span></div>';
    for(const [key, p] of Object.entries(players)){
      if(p.name !== playerName){
        html += '<div class="list-item"><span>' + p.name + '</span><span class="pill' + (p.answered ? ' pill-dark' : '') + '">' + (p.answered ? 'Respondido' : 'Pensando') + '</span></div>';
      }
    }
    container.innerHTML = html;
  });
}

function updateRoundAnswers(){
  const container = document.getElementById('roundAnswers');
  if(!container) return;
  container.innerHTML = '<div class="list-item dark"><div><div style="font-weight:700;">' + playerName + '</div><div class="sub" id="selfAnswerResult">-</div></div><div style="text-align:right;"><div style="font-weight:800;" id="selfDiffResult">+0</div><div class="sub">distancia</div></div></div>';
}

function updateScoreboard(){
  const container = document.getElementById('scoreboard');
  if(!container) return;
  container.innerHTML = '<div class="list-item dark"><div class="row" style="justify-content:flex-start;"><div class="rank">1</div><div><div style="font-weight:700;">' + playerName + '</div><div class="sub" id="selfRoundScore">Puntos</div></div></div><div style="font-size:30px;font-weight:800;" id="selfTotalScore">' + playerScore + '</div></div>';
}

function copyCode(){
  const code = document.getElementById('roomCode').textContent.trim();
  navigator.clipboard.writeText(code).then(() => {
    alert('Código copiado: '+code);
  }).catch(() => {
    alert('Código: '+code);
  });
}

function handleCreateRoom(){
  createRoom();
}

function handleJoinRoom(){
  const code = document.getElementById('joinCode').value.trim();
  if(code.length === 4) {
    joinRoom(code);
  } else {
    alert('Código inválido');
  }
}

document.getElementById('playerName').addEventListener('input', syncName);
syncName();