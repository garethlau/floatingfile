import React, { createContext, useReducer } from "react";

const initialState = {
	listview: JSON.parse(window.localStorage.getItem("ff-prefs-listview")) || false,
};

const actions = {
	TOGGLE_LISTVIEW: "TOGGLE_LISTVIEW",
};

function reducer(state, action) {
	switch (action.type) {
		case actions.TOGGLE_LISTVIEW:
			return { ...state, listview: action.payload };
		default:
			return state;
	}
}

const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider, actions };
