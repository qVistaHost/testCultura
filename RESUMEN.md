# TestCultura - Estado del Proyecto

## Estado Actual (21/04/2026)

### Completado (local)
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

### Bugs corregidos (local)
- ✅ **Fix countdown**: Corregido - ahora currentIndex se actualiza al avanzar
- ✅ **Sincronizar puntuación**: score se guarda en Firebase y se muestra

### Estructura de archivos (local)
```
/JocAnys/
  index.html  - Estructura HTML (114 líneas)
  style.css   - Estilos CSS
  app.js      - Lógica JS + Firebase (487 líneas)
  RESUMEN.md  - Estado del proyecto
```

### Firebase
- Proyecto: testcultura-6c89c
- URL: https://testcultura-6c89c-default-rtdb.europe-west1.firebasedatabase.app

### GitHub
- Repo: https://github.com/qVistaHost/testCultura
- Pages: https://qVistaHost.github.io/testCultura/
- Rama master: desorganizada (subcarpeta JocAnys/ + archivos antiguos en root)
- Rama main: tiene los cambios locales
- Rama gh-pages: creada para nuevo deploy

---

## Estado Remoto vs Local

### Problema detectedo
GitHub Pages sirve archivos antiguos (147 líneas) del root del repo, mientras que los archivos actualizados (487 líneas) están en subcarpeta JocAnys/.

### Diferencias
| Archivo | Local | Remoto (servido) | Remoto (API) |
|---------|-------|-----------------|--------------|
| app.js | 487 líneas | 147 líneas | N/A (404) |
| index.html | 114 líneas | ? | N/A |

### Solucio pendiente
- Necesita nuevo repositorio o nuevo branch para serve desde root
- O configurar GitHub Pages per llegir de /JocAnys/

---

## Pendent

### Alta prioritas
1. **Nou GitHub Pages**: Crear repository nou o configurar per servir des de /JocAnys/
2. **Desplegar versio actualizada**: Publicar la versio amb els fixes

### Media prioridade
3. **Temporitzador** (opcional)
4. **Marcador compartit**: Veure classificacio durant partida

### Baixa prioritas
5. **Firestore** (opcional)
6. **Autenticacio** (opcional)
7. **Millores UI**: Animacions, errors