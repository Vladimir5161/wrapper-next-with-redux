# Redux wrapper for next.js app based on functional components

You can use it to handle store creation and management in your next.js app on both server and client side.

### Main idea
**This package is motivated by next-redux-wrapper package, but has difference in the way it handles store hydration.
It provides you with a way to create a rootReducer and add a HYDRATE action to it with your hydration logic.
Wrapper will create a store for your serverSideProps so you'll be able to use dispatch action on server, and then it will pass
store's state to the client side. 
On client side it will create a new store and pass it to the app or apply hydration if store already exists.
After hydration completes it will pass hydrated flag via context that can be accessed by HydrationContext.
This can be used optionally via useContext react hook.**

## Getting Started

## Compatibility

- **React:** ^18.2.0
- **React DOM:** ^18.2.0
- **Next.js:** ^13.0.0

**This package is compatible with Next.js 13.0.0 and higher to avoid compatibility issues with old version of some libraries, that to not work with react 18**

### Installing

Install the package

```
yarn add wrapper-next-with-redux
```

### Usage

```
Package has 3 main functions:

1) createRootReducer - function that creates rootReducer from passed reducers 
and adds HYDRATE action to it with you hydration logic, that should be passed as a second argument.

2) withReduxWrapper - HOF that creates a wrapper for your serverSideProps, makes store available on server and returns state with props pbject.

3) reduxWrapper - HOC that creates a wrapper for your app, creates a store and passes it to the app or applies hydration if store already exists.

```
**Here is an example of how you can initialize store using createRootReducer method:**
```
const hydrationAction = (state, action) => {
  const { payload } = action;
  const nextState = {
    ...state,
    ...payload,
  };

  if (state.me) {
    nextState.me = state.me;
  }

  return nextState;
};

const createStore = (preloadedState) => {
  return configureStore({
    reducer: createRootReducer(rootReducer, hydrationAction),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false,
        immutableCheck: false,
        serializableCheck: false,
      }).concat(sagaMiddleware),
    preloadedState,
  });
};

export const withRedux = (getServerSidePropsFunc) =>
  withReduxWrapper(getServerSidePropsFunc, createStore);
```
**Usage of redux-saga and redux-persist is completely up to you and depends on you app design. You may use redux-thunk, and not use redux-persist at all**

**Then you can use withRedux method in you components and pages to wrap getServerSideProps:**
```
export const getServerSideProps = withRedux(
  async ({ store, your_other_props(req, res, etc..) }) => {
    dispatch(someMethod));
    store.dispatch(END);
    await store.sagaTask.toPromise();
    const someProps = props_you_want_to_pass_to_component;
    return {
      props: someProps,
    };
  },
);
```

**Then you can use reduxWrapper to wrap your app in _app.js :**
```
reduxWrapper(RootApp, createStore);

where initializeStore is a method you created in the previous step.
```

**Additionally, here is an example how you can configure store with redux-persist**
```
const createNoopStorage = () => ({
  getItem() {
    return Promise.resolve(null);
  },
  setItem(_key, value) {
    return Promise.resolve(value);
  },
  removeItem() {
    return Promise.resolve();
  },
});

const storage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

const persistConfig = {
  key: 'root',
  whitelist: ['me'],
  storage,
};
const createStore = (preloadedState, persistedReducer) => {
  const sagaMiddleware = createSagaMiddleware();
  const _store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false,
        immutableCheck: false,
        serializableCheck: false,
      }).concat(sagaMiddleware),
    preloadedState,
  });
  _store.sagaTask = sagaMiddleware.run(sagas);
  _store._persistor = persistStore(_store);
  return _store;
};

const hydrationAction = (state, action) => {
  const { payload } = action;
  const nextState = {
    ...state,
    ...payload,
  };

  if (state.me) {
    nextState.me = state.me;
  }

  return nextState;
};
const persistedReducer = persistReducer(
  persistConfig,
  createRootReducer(rootReducer, hydrationAction),
);

export const initializeStore = (preloadedState) =>
  createStore(preloadedState, persistedReducer);

export const withRedux = (getServerSidePropsFunc) =>
  withReduxWrapper(getServerSidePropsFunc, initializeStore);
```
