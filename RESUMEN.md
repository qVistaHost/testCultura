# TestCultura - Estado del Proyecto

## Estado Actual (19/04/2026)

### Completado
- **Frontend**: Interfaz móvil con HTML/CSS/JS分离ado
- **Firebase Realtime Database**: Configurado y operativo
- **GitHub Pages**: Desplegado en https://qVistaHost.github.io/testCultura/
- **Sistema de salas**: Crear/unirse con código de 4 dígitos
- **Lobby**: Lista de jugadores en tiempo real

### Estructura de archivos
```
/JocAnys/
  index.html  - Estructura HTML
  style.css  - Estilos CSS
  app.js     - Lógica JS + Firebase
```

### Firebase
- Proyecto: testcultura-6c89c
- URL: https://testcultura-6c89c-default-rtdb.europe-west1.firebasedatabase.app

### GitHub
- Repo: https://github.com/qVistaHost/testCultura
- Pages: https://qVistaHost.github.io/testCultura/

---

## Pendiente

### Alta prioridad
1. **Flujo de partida completo** - Crear pregunta, enviar respuesta, calcular puntuación
2. **Banco de preguntas** - Añadir preguntas con año correcto
3. **Preguntas** - Necesita banco de preguntas
4. **Gestión de rondas** - Enviar respuesta, calcular puntuación, resultados

### Media prioridad
5. **Marcador compartido** - Actualizar puntuación tras cada ronda
6. **Temporizador** - Ronda con tiempo
7. **Pantalla de espera** - Ver quién ha respondido
8. **Pantalla de resultado** - Mostrar respuestas de todos

### Baja prioridad
9. **Firestore** (opcional) - Migrar a Firestore si hace falta
10. **Autenticación** (opcional) - Login real con Google/Correo
11. **Mejoras UI** - Animaciones, estados de carga, errores

---

## Próximo paso recomendado
Conectar la pantalla de "Unirse con código" a Firebase (handleJoinRoom ya está implementado en app.js).

Después, implementar el flujo de pregunta → respuesta → resultado.