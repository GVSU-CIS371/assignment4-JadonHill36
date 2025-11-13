import { createApp } from "vue";
import "./styles/mug.scss";
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import App from "./App.vue";
import { useBeverageStore } from "./stores/beverageStore"; // 👈 import your store

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

const app = createApp(App);
app.use(pinia);

const store = useBeverageStore(); // 👈 create store instance

// ✅ Initialize Firestore data before mounting
store.init().then(() => {
  app.mount("#app");
});
