<template>
  <div class="container mx-auto flex flex-col items-center p-4">
    <!-- <div
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    > -->
    <!-- <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div> -->
    <div class="container">
      <div class="w-full my-4"></div>
      <section>
        <add-ticker @add-ticker="addTicker" :tickersList="tickers" />
      </section>
      <hr class="w-full border-t border-gray-600 my-4" />
      <template v-if="tickers.length">
        <div>
          <button
            @click="page = page - 1"
            v-if="page > 1"
            class="mx-2 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Назад
          </button>
          <button
            @click="page = page + 1"
            v-if="hasNextPage"
            class="mx-2 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Вперед
          </button>

          <div>
            Фильтр:
            <input
              v-model="filter"
              class="border-solid border- 2 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="(t, ixd) in paginatedTickers"
            :key="ixd"
            @click="select(t)"
            :class="{
              'bg-red-300': t.type !== '5',
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section>
        <view-graph
          @maxGraphElements="onGraphElements"
          :selectedTicker="selectedTicker"
          :useGraph="graph"
        />
      </section>
    </div>
  </div>
  <!-- </div> -->
</template>
<script>
import { subscribeToTicker, unsubscribeFromTicker } from "./api";
import addTicker from "@/components/addTicker.vue";
import viewGraph from "@/components/viewGraph.vue";

export default {
  components: { addTicker, viewGraph },
  name: "App",

  data() {
    return {
      filter: "",
      tickers: [],
      selectedTicker: null,
      page: 1,
      graph: [],
      maxGraphElements: 1,
    };
  },
  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );
    if (windowData.filter) {
      this.filter = windowData.filter;
    }

    if (windowData.page) {
      this.page = windowData.page;
    }
    const tickersData = localStorage.getItem("cryptonomicon-list");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      // this.tickers.push("BTC");
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.name, (newPrice, type) =>
          this.updateTicker(ticker.name, newPrice, type)
        );
      });
    }

    // subscribeToTicker("USD", (newPrice, type) =>
    //   this.updateTicker(USD, newPrice, type)
    // );

    // setInterval(() => this.updateTickers(), 5000);
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.name.includes(this.filter.toUpperCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  methods: {
    onGraphElements(el) {
      this.maxGraphElements = el;
    },
    updateTicker(tickerName, price, type) {
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          if (t === this.selectedTicker) {
            this.graph.push(price);
            while (this.graph.length > this.maxGraphElements) {
              this.graph.shift();
            }
          }
          t.price = price;
          t.type = type;
        });
    },
    formatPrice(price) {
      if (price === "-") {
        return price;
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    addTicker(ticker) {
      const currentTicker = {
        name: ticker,
        price: "-",
        type: "-",
      };

      this.tickers = [...this.tickers, currentTicker];

      this.filter = "";
      subscribeToTicker(currentTicker.name, (newPrice, type) =>
        this.updateTicker(currentTicker.name, newPrice, type)
      );
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
      if (this.selectedTicker == tickerToRemove) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(tickerToRemove.name);
    },
    select(ticker) {
      this.selectedTicker = ticker;
    },
  },
  watch: {
    filter() {
      this.page = 1;
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },

    paginatedTickers() {
      if (this.paginatedTickers.length == 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    tickers() {
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.tickers));
    },
    selectedTicker() {
      this.graph = [];
      this.$nextTick().then(this.calculateMaxGraphElements);
    },
    maxGraphElements() {
      while (this.graph.length > this.maxGraphElements) {
        this.graph.shift();
      }
    },
  },
};
</script>

<style></style>
