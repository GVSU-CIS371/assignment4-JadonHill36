import { defineStore } from "pinia";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

interface Beverage {
  name: string;
  base: string;
  creamer: string;
  syrup: string;
  temperature: string;
}

export const COLORS: Record<string, string> = {
  Coffee: "#6F4E37",
  "Black Tea": "#2E1F0E",
  "Green Tea": "#4CAF50",
  Milk: "#F0F8FF",
  Cream: "#FFFACD",
  "Half & Half": "#FAFAD2",
  Vanilla: "#FFEFD5",
  Caramel: "#DAA520",
  Hazelnut: "#6B4423",
  "No Cream": "transparent",
  "No Syrup": "transparent",
};

export const useBeverageStore = defineStore("beverageStore", {
  state: (): {
    bases: string[];
    creamers: string[];
    syrups: string[];
    temperatures: string[];
    currentBase: string;
    currentCreamer: string;
    currentSyrup: string;
    currentTemperature: string;
    beverages: Beverage[];
    newName: string;
  } => ({
    bases: ["Black Tea", "Green Tea", "Coffee"],
    creamers: ["No Cream", "Milk", "Cream", "Half & Half"],
    syrups: ["No Syrup", "Vanilla", "Caramel", "Hazelnut"],
    temperatures: ["Hot", "Cold"],

    currentBase: "Coffee",
    currentCreamer: "No Cream",
    currentSyrup: "No Syrup",
    currentTemperature: "Hot",

    beverages: [],
    newName: "",
  }),

  // ⚙️ Actions
  actions: {
    async init() {
      try {
        // --- Load ingredients ---
        const basesSnap = await getDocs(collection(db, "bases"));
        this.bases = basesSnap.docs.map((doc) => doc.data().name);

        const creamersSnap = await getDocs(collection(db, "creamers"));
        this.creamers = creamersSnap.docs.map((doc) => doc.data().name);

        const syrupsSnap = await getDocs(collection(db, "syrups"));
        this.syrups = syrupsSnap.docs.map((doc) => doc.data().name);

        // --- Load saved beverages ---
        const beveragesSnap = await getDocs(collection(db, "beverages"));
        this.beverages = beveragesSnap.docs.map(
          (doc) => doc.data() as Beverage
        );

        // --- Set defaults ---
        this.currentBase = this.bases[0];
        this.currentCreamer = this.creamers[0];
        this.currentSyrup = this.syrups[0];

        console.log("Firestore data loaded successfully");
      } catch (err) {
        console.error("Error loading Firestore data:", err);
      }
    },

    async makeBeverage() {
      if (!this.newName.trim()) return;

      const newBeverage: Beverage = {
        name: this.newName.trim(),
        base: this.currentBase,
        creamer: this.currentCreamer,
        syrup: this.currentSyrup,
        temperature: this.currentTemperature,
      };

      try {
        await addDoc(collection(db, "beverages"), newBeverage);
        this.beverages.push(newBeverage);
        this.newName = "";
        console.log("Beverage saved to Firestore");
      } catch (err) {
        console.error("Error saving beverage:", err);
      }
    },

    showBeverage(bevName: string) {
      const found = this.beverages.find((b) => b.name === bevName);
      if (found) {
        this.currentBase = found.base;
        this.currentCreamer = found.creamer;
        this.currentSyrup = found.syrup;
        this.currentTemperature = found.temperature;
      }
    },

    // 🔧 Simple setters
    setBase(base: string) {
      this.currentBase = base;
    },
    setCreamer(creamer: string) {
      this.currentCreamer = creamer;
    },
    setSyrup(syrup: string) {
      this.currentSyrup = syrup;
    },
    setTemperature(temp: string) {
      this.currentTemperature = temp;
    },
  },

  getters: {
    dynamicHeights: (state) => {
      const CREAMER_HEIGHT = 20;
      const SYRUP_HEIGHT = 10;
      const hasCreamer = state.currentCreamer !== "No Cream";
      const hasSyrup = state.currentSyrup !== "No Syrup";

      const visibleCreamer = hasCreamer ? CREAMER_HEIGHT : 0;
      const visibleSyrup = hasSyrup ? SYRUP_HEIGHT : 0;
      const baseHeight = 100 - visibleCreamer - visibleSyrup;

      return {
        creamer: `${visibleCreamer}%`,
        syrup: `${visibleSyrup}%`,
        base: `${baseHeight}%`,
        isCreamerVisible: hasCreamer,
        isSyrupVisible: hasSyrup,
      };
    },
  },
});
