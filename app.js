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
    document.getElementById('roomCode').textContent = roomCode;
    showScreen('lobby');
  }).catch(e => {
    console.error(e);
    alert('Error al crear sala');
  });
}

function joinRoom(code){
  db.ref('rooms/' + code).once('value').then(snapshot => {
    if(snapshot.exists()){
      currentRoom = code;
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

function updateLobbyUI(players){
  if(!players) return;
  const lobbyCard = document.querySelector('#screen-lobby .card.grow.stack');
  if(!lobbyCard) return;
  
  const playerCount = Object.keys(players).length;
  let html = '<div class="row"><strong>Jugadores</strong><span class="small muted">' + playerCount + '/8</span></div>';
  
  for(const [key, p] of Object.entries(players)){
    const status = p.isHost ? 'Host' : (p.ready ? 'Listo' : 'Lista');
    html += '<div class="list-item"><span style="font-weight:600;">' + p.name + '</span><span class="pill' + (p.ready ? ' pill-dark' : '') + '">' + status + '</span></div>';
  }
  
  lobbyCard.innerHTML = html;
}

function submitAnswer(){
  const year = (document.getElementById('answerYear').value||'').trim()||'1989';
  document.getElementById('submittedYear').textContent = year;
  document.getElementById('selfAnswerResult').textContent = year;
  const diff = Math.abs(Number(year)-1989);
  document.getElementById('selfDiffResult').textContent = '+' + diff;
  document.getElementById('selfRoundScore').textContent = 'Última ronda +' + diff;
  document.getElementById('selfTotalScore').textContent = String(diff);
  showScreen('wait');
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