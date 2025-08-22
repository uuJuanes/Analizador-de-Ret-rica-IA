# Analizador de Ventas con IA

Una herramienta avanzada diseñada para profesionales de ventas que buscan perfeccionar sus habilidades de comunicación y persuasión. Utilizando el poder de múltiples motores de IA (Google Gemini, DeepSeek, ChatGPT), esta aplicación ofrece un análisis retórico profundo, generación de guiones a medida y un innovador módulo de simulación de ventas (Role-Play) para una práctica realista.

---

## ✨ Características Principales

-   **Análisis Retórico Avanzado**: Evalúa guiones de ventas escritos o hablados basándose en los pilares de la persuasión: **Ethos** (credibilidad), **Pathos** (emoción) y **Logos** (lógica), proporcionando puntuaciones detalladas.

-   **Soporte Multi-IA**: Permite al usuario elegir entre diferentes modelos de lenguaje de última generación:
    -   **Google Gemini**: Integrado de forma nativa. Ideal para análisis de texto y audio, incluyendo métricas de tono. **No requiere configuración de API Key**.
    -   **DeepSeek (via OpenRouter)**: Una alternativa potente para análisis de texto.
    -   **ChatGPT (via OpenRouter)**: El reconocido modelo de OpenAI para un análisis de texto robusto.

-   **Análisis de Audio y Tono (Exclusivo de Gemini)**: Transcribe y analiza archivos de audio grabados o subidos, proporcionando métricas sobre la velocidad del habla (palabras por minuto) y el uso de muletillas.

-   **Generador de Guiones Persuasivos**: Crea borradores de guiones de ventas desde cero, optimizados para la persuasión y adaptados a un producto, puntos clave, tono y canal de comunicación específicos.

-   **Simulación de Ventas Interactiva (Role-Play)**: Un entorno de práctica inmersivo donde los usuarios pueden interactuar con un cliente simulado por la IA. Incluye dos modos:
    -   **✍️ Modo Libre**: El usuario responde al cliente hablando (usando reconocimiento de voz) o escribiendo, permitiendo una práctica fluida y natural.
    -   **🎮 Modo Juego (Opción Múltiple)**: La IA presenta tres posibles respuestas después de cada intervención del cliente. Solo una es la óptima, mientras que las otras dos son "trampas" comunes. El usuario recibe feedback instantáneo sobre su elección, gamificando el aprendizaje.

-   **Feedback Detallado y Accionable**: No solo puntúa, sino que ofrece:
    -   Un **guion mejorado** reescrito por la IA.
    -   **Frases clave** destacadas en el texto original.
    -   **Ejemplos prácticos** con "antes y después".
    -   **Ejercicios personalizados** para fortalecer áreas de mejora.

-   **Historial y Seguimiento de Progreso**: Guarda todos los análisis y simulaciones en el historial local del navegador, permitiendo a los usuarios revisar su progreso y comparar resultados a lo largo del tiempo.

-   **Gamificación**:
    -   Un sistema de **logros** que se desbloquean al alcanzar hitos.
    -   **Estadísticas de usuario** para monitorear la frecuencia de uso, la racha y las puntuaciones más altas.

-   **Exportación de Informes**: Genera y descarga un informe profesional en formato **PDF** con los resultados del análisis.

-   **Autenticación y Personalización**: Integración con Google Sign-In para una experiencia de usuario personalizada.

## 🛠️ Stack Tecnológico

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **Motores de IA**:
    -   `@google/genai` para la API nativa de Google Gemini.
    -   API de OpenRouter para acceder a los modelos de DeepSeek y OpenAI.
-   **Visualización de Datos**: `recharts` para los gráficos de radar.
-   **Generación de PDF**: `jspdf` y `html2canvas`.
-   **APIs del Navegador**:
    -   `Web Speech API (SpeechRecognition)` para el reconocimiento de voz en el Role-Play.
    -   `Web Speech API (SpeechSynthesis)` para la voz del cliente IA.
    -   `LocalStorage` para persistencia de datos (historial, claves, perfil).

## 🚀 Cómo Empezar

Esta aplicación está diseñada para funcionar como un proyecto estático. Puedes ejecutarla simplemente abriendo el archivo `index.html` en un navegador web moderno o sirviéndola desde un servidor web simple.

### Prerrequisitos

1.  Un navegador web moderno (Chrome, Firefox, Edge).
2.  (Opcional) Claves de API de OpenRouter si deseas utilizar DeepSeek o ChatGPT.

### Configuración

Para que la aplicación funcione correctamente, necesitas configurar lo siguiente:

#### 1. Google Client ID (para el inicio de sesión)

La autenticación de usuarios se realiza a través de Google Sign-In. Debes crear tu propio Client ID en la [Consola de Google Cloud](https://console.cloud.google.com/apis/credentials).

Una vez que tengas tu Client ID, reemplaza el marcador de posición en el archivo `App.tsx`:

```tsx
// Dentro de App.tsx, en el useEffect
window.google.accounts.id.initialize({
    // ...
    client_id: 'TU_CLIENT_ID_DE_GOOGLE_AQUÍ.apps.googleusercontent.com', // <--- REEMPLAZA ESTO
    callback: handleLoginSuccess
});
```

**Importante**: Asegúrate de añadir tu dominio (ej. `http://localhost:3000` si estás desarrollando localmente) a los "Orígenes de JavaScript autorizados" en la configuración de tus credenciales en la Consola de Google Cloud.

#### 2. Claves de API de los Modelos de IA (Opcional)

-   **Google Gemini**: ¡No se requiere configuración! La integración nativa funciona sin que necesites añadir una clave.
-   **DeepSeek y ChatGPT**: Para usar estos modelos, debes obtener una clave de API de [OpenRouter](https://openrouter.ai/keys) y añadirla a través del modal de "Ajustes" dentro de la propia aplicación.

Las claves se guardan de forma segura en el `localStorage` de tu navegador y no se envían a ningún servidor externo, excepto para comunicarse directamente con la API de OpenRouter.

## 📁 Estructura del Proyecto

```
/
├── components/         # Componentes reutilizables de React
│   ├── gamification/   # Componentes relacionados con logros y estadísticas
│   ├── icons/          # Iconos SVG como componentes de React
│   └── ...             # Componentes principales (AudioInput, AnalysisResults, etc.)
├── config/             # Configuración de la aplicación (ej. logros)
├── hooks/              # Hooks personalizados de React (ej. useLocalStorage)
├── services/           # Lógica para interactuar con las APIs de IA
├── types/              # Definiciones de tipos de TypeScript
├── App.tsx             # Componente principal de la aplicación
├── index.html          # Punto de entrada HTML
├── index.tsx           # Punto de montaje de React
└── README.md           # Este archivo
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.