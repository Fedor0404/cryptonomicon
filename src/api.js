const API_KEY =
  "52efb0aeace1f59e61a211ff6bc5e1e1bab9b3055b7dadde97cbd62c344960c3";

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";
const NOT_TICKET = "500";

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    MESSAGE: message,
  } = JSON.parse(e.data);

  if (type !== (AGGREGATE_INDEX || NOT_TICKET)) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];

  handlers.forEach((fn) => fn(newPrice, type));
  console.log(handlers);
  console.log(type);
  console.log(currency);
  console.log(message);
});

// export const loadTickers = (tickers) =>
//   fetch(
//     `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(
//       ","
//     )}&tsyms=USD&api_key=${API_KEY}`
//   )
//     .then((r) => r.json())
//     .then((rawData) =>
//       Object.fromEntries(
//         Object.entries(rawData).map(([key, value]) => [key, value.USD])
//       )
//     );

export const loadList = () =>
  fetch(
    `https://min-api.cryptocompare.com/data/blockchain/list?api_key=${API_KEY} `
  )
    .then((r) => r.json())
    .then((data) => data.Data);

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
  // socket.addEventListener(
  //   "message",
  //   (e) => {
  //     const { TYPE: type } = JSON.parse(e.data);
  //     if (type === "500") {
  //       return type;
  //     }
  //   }
  //   // { once: true }
  // );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

// function subscribeToBtcToUsd() {
//   sendToWebSocket({
//     action: "SubAdd",
//     subs: [`5~CCCAGG~BTC~USD`],
//   });
// }

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  // tickersHandlers.set("USD", [...subscribers, cb]);
  // subscribeToBtcToUsd();
  subscribeToTickerOnWs(ticker);
  console.log(tickersHandlers);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};
