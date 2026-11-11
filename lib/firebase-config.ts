/**
 * Configuración web de tu proyecto Firebase.
 * Consola de Firebase → ⚙ Configuración del proyecto → General → Tus apps → App web → SDK setup and configuration
 *
 * Estos valores NO son secretos: viajan en el bundle de JavaScript y cualquiera puede verlos.
 * La seguridad no depende de esconderlos, sino de Auth + las reglas @auth de SQL Connect
 * (y, más adelante, App Check).
 *
 * `npm run dev` usa los valores de demo con los emuladores locales;
 * el build de producción usa la configuración web pública del proyecto real.
 */
export const firebaseConfig = process.env.NODE_ENV === "development" ? {
  apiKey: "REEMPLAZAR",
  authDomain: "demo-catalogo.firebaseapp.com",
  projectId: "demo-catalogo",
  appId: "REEMPLAZAR",
} : {
  apiKey: "AIzaSyAINAqTc-KQSdWicmuuOSVwIegK2vPsIO8",
  authDomain: "practica-cicd-micela.firebaseapp.com",
  projectId: "practica-cicd-micela",
  appId: "1:390346504572:web:34ee489a5b23d65c7f8cf9",
};

/** Debe coincidir con dataconnect/dataconnect.yaml y dataconnect/cursos/connector.yaml */
export const sqlConnectConfig = {
  location: "us-east4",
  service: "catalogo",
  connector: "cursos",
};
