<template>
  <div class="flex">
    <div class="max-w-xs">
      <label for="wallet" class="block text-sm font-medium text-gray-700"
        >Тикер</label
      >
      <div class="mt-1 relative rounded-md shadow-md">
        <input
          @input="upperCase()"
          @keydown.enter="addTicker"
          v-model="ticker"
          type="text"
          name="wallet"
          id="wallet"
          class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
          placeholder="Например DOGE"
        />
      </div>
      <div
        class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
        v-if="this.ticker.length"
      >
        <span
          @click="choiceCoin(c)"
          v-for="(c, idx) in filterCoin"
          :key="idx"
          class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
        >
          {{ c }}
        </span>
      </div>
      <div
        class="text-sm"
        :class="{
          'text-red-600': this.repeatCoin,
          'text-green-500': !this.repeatCoin,
        }"
      >
        {{ message }}
      </div>
    </div>
  </div>
  <button
    @click="addTicker"
    type="button"
    class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
  >
    <!-- Heroicon name: solid/mail -->
    <svg
      class="-ml-0.5 mr-2 h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="#ffffff"
    >
      <path
        d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      ></path>
    </svg>
    Добавить
  </button>
</template>

<script>
import { loadList } from "@/api";
export default {
  props: {
    tickersList: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  emits: {
    "add-ticker": (value) => typeof value === "string",
  },

  data() {
    return {
      message: "",
      ticker: "",
      coinList: [],
      repeatCoin: false,
    };
  },
  beforeMount() {
    this.getList();
  },
  computed: {
    filterCoin() {
      return this.coinList
        .filter((c) => new RegExp(`${this.ticker}`, "g").exec(c))
        .slice(0, 4);
    },
  },
  methods: {
    upperCase() {
      return (this.ticker = this.ticker.toUpperCase());
    },

    async getList() {
      const data = await loadList();
      this.coinList = Object.keys(data);
    },

    addTicker() {
      if (
        this.tickersList.filter((c) => c.name === this.ticker).length === 0 &&
        this.ticker.length > 0
      ) {
        if (this.coinList.includes(this.ticker)) {
          console.log(this.ticker);
          this.repeatCoin = false;

          this.$emit("add-ticker", this.ticker);
          this.message = "Тикер добавлен!";

          this.ticker = "";
        } else {
          this.repeatCoin = true;
          this.message = "Такого тикера нет в списке";
        }
      } else {
        this.repeatCoin = true;
        this.message = "Такой тикер уже добавлен";
      }
    },
    choiceCoin(coin) {
      console.log(coin);
      this.ticker = coin;
      this.addTicker();
    },
    // watch: {
    //   filterCoin() {
    //     this.message = "";
    //   },
    // },
  },
};
</script>
