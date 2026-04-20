# TestCultura - Estado del Proyecto

## Estado Actual (19/04/2026)

### Completado
- **Frontend**: Interfaz móvil con HTML/CSS/JS separado
- **Firebase Realtime Database**: Configurado y operativo
- **GitHub Pages**: Desplegado en https://qVistaHost.github.io/testCultura/
- **Sistema de salas**: Crear/unirse con código de 4 dígitos
- **Lobby**: Lista de jugadores en tiempo real
- **Host**: Puede iniciar partida
- **Banco de preguntas**: 30 preguntas con año correcto en app.js
- **10 preguntas aleatorias** por partida
- **Flujo pregunta → esperar → resultados → siguiente**
- **Scoring**: Por distancia (menos = mejor)
- **Estado 'countdown'**: Synchronized countdown after all answered

### Estructura de archivos
```
/JocAnys/
  index.html  - Estructura HTML
  style.css   - Estilos CSS
  app.js      - Lógica JS + Firebase
```

### Firebase
- Proyecto: testcultura-6c89c
- URL: https://testcultura-6c89c-default-rtdb.europe-west1.firebasedatabase.app

### GitHub
- Repo: https://github.com/qVistaHost/testCultura
- Pages: https://qVistaHost.github.io/testCultura/

---

## Pendiente

### Bugs
1. **Cuenta atrás tras pregunta 2**: Se queda parada tras la segunda pregunta (estado 'countdown' no avanza)

### Alta prioridad
2. **Sincronizar puntuación**: playerScore no se guarda en Firebase

### Media prioridad
3. **Temporizador con tiempo limitado** (opcional)
4. **Marcador compartido**: Ver clasificación durante partida

### Baja prioridad
5. **Firestore** (opcional)
6. **Autenticación** (opcional)
7. **Mejoras UI**: Animaciones, errores